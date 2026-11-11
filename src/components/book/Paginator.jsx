import { useLayoutEffect, useRef, useState, useCallback } from 'react';
import BlockRenderer from './blocks/BlockRenderer';
import { measureLines, splitAtVisible, visibleLength } from './splitText';

/**
 * Paginator — reparte el contenido en páginas midiendo lo que cabe.
 *
 * Renderiza todos los bloques en una caja oculta con las mismas medidas
 * y tipografía que una página real y los agrupa en páginas que nunca
 * desbordan.
 *
 * El texto tiene continuidad: un párrafo que no cabe entero NO se baja
 * a la página siguiente, se parte por la última línea que cabe y sigue
 * arriba de la página siguiente. Así cada página queda llena hasta el
 * borde de la caja, como en un libro impreso. El corte respeta un
 * mínimo de líneas a cada lado (ni huérfanas ni viudas) y nunca cae
 * dentro de una llamada de nota ni de un término de glosario.
 *
 * Reparte por SECCIONES: cada carta es una, y también la galería y el
 * glosario, que llegan como una entrada o una imagen por bloque. Todo
 * el libro se pagina así con la misma regla, midiendo.
 *
 * Cada sección se completa a un número par de páginas, de modo que
 * siempre empieza en página izquierda y la paridad del folio se
 * mantiene en todo el libro.
 *
 * Se recalcula cuando cambia el tamaño de letra o el de la ventana.
 *
 * La medida de la caja NO se toma de una página en pantalla: en la
 * portada no hay ninguna, y medir la propia caja oculta sería morderse
 * la cola. Se monta una página patrón, con la misma estructura y las
 * mismas reglas de estilo que cualquier otra, y de ella se leen el
 * ancho y el alto útiles. Así las medidas siguen viviendo en el CSS y
 * no hay que repetirlas en el código.
 *
 * Props:
 *   sections  [{ blocks, … }] — cartas, galería, glosario…
 *             Cada página devuelta lleva `section`: el índice de la
 *             sección a la que pertenece.
 *   codexWidth  ancho del libro abierto (doble página), en px
 *   codexHeight alto del libro, en px
 *   signal    valor que, al cambiar, fuerza una nueva medición
 *   onPages   callback con las páginas calculadas
 */

/** Bloques cuyo texto puede repartirse entre páginas */
const SPLITTABLE = new Set(['paragraph']);

/** Bloques que no deben quedarse solos al pie de una página */
const HEADING = new Set(['chapter-header', 'section-title', 'chapter-title',
                         'section-head']);

/** Mínimo de líneas de un párrafo a cada lado de un corte */
const MIN_LINES = 2;

/**
 * Holgura, en px, que se deja sin usar al pie de la caja.
 * El navegador redondea las alturas a fracciones de píxel y, sin este
 * margen, una página puede acabar un par de píxeles por debajo del
 * borde y sacar una barra de desplazamiento donde no hace falta.
 */
const SAFETY = 4;

export default function Paginator({ sections, codexWidth, codexHeight, signal, onPages }) {
  const ref   = useRef(null);
  const ruler = useRef(null);
  const [done, setDone] = useState(false);
  const [box,  setBox]  = useState({ w: 0, h: 0 });
  const { w: boxWidth, h: boxHeight } = box;

  // Lista plana de todos los bloques, con su sección de origen
  const flat = [];
  sections.forEach((S, li) => {
    S.blocks.forEach((b, bi) => flat.push({ block: b, li, bi }));
  });

  const measure = useCallback(() => {
    const host = ref.current;
    if (!host || !boxHeight) return;

    const els = Array.from(host.children);

    // ── Medición ─────────────────────────────────────────────────────
    // Se miden POSICIONES, no alturas sumadas: los márgenes de dos
    // bloques seguidos se colapsan en uno (vale el mayor), de modo que
    // sumar alto + márgenes de cada bloque por separado abultaría la
    // cuenta y dejaría las páginas a medio llenar. La distancia real
    // entre dos bloques es la que hay entre ellos en la caja oculta.
    const metrics = els.map((el, i) => {
      const cs = getComputedStyle(el);
      const type = flat[i].block.type;
      return {
        top:    el.offsetTop,
        ink:    el.offsetHeight,
        marginTop: parseFloat(cs.marginTop) || 0,
        lh:     parseFloat(cs.lineHeight) || 0,
        // Solo los bloques de texto corrido se miden línea a línea
        text:   SPLITTABLE.has(type) && flat[i].block.text ? measureLines(el) : null,
      };
    });

    /** Separación real entre el bloque `prev` y el bloque `i` */
    const gapBefore = (i, prev) => (prev < 0
      ? metrics[i].marginTop
      : Math.max(0, metrics[i].top - (metrics[prev].top + metrics[prev].ink)));

    // ── Reparto ──────────────────────────────────────────────────────
    const pages = [];
    let cur  = null;
    let used = 0;      // alto ocupado de la caja
    let prev = -1;     // índice del bloque anterior EN ESTA página

    const open = (li, tone) => {
      cur = { section: li, blocks: [], tone };
      pages.push(cur);
      used = 0;
      prev = -1;
      return cur;
    };
    const avail = () => boxHeight - SAFETY - used;

    flat.forEach((item, i) => {
      const { block } = item;
      const m = metrics[i];

      // La nota completa ocupa su propia página. Si no cabe en una,
      // sigue en la siguiente, también con el tinte de nota.
      if (block.type === 'full-note') {
        for (const part of splitFullNote(els[i], block, boxHeight - SAFETY)) {
          open(item.li, 'note').blocks.push(part);
        }
        cur = null;                    // lo siguiente abre página nueva
        return;
      }

      if (!cur || cur.section !== item.li) open(item.li);

      // Un encabezado no se queda solo al pie: necesita sitio para sí
      // mismo y para el principio de lo que viene detrás — dos líneas
      // si es texto partible, el bloque entero si es indivisible (una
      // imagen de la galería, una entrada del glosario…)
      if (HEADING.has(block.type) && prev >= 0) {
        const n = metrics[i + 1];
        const follow = !n || flat[i + 1].li !== item.li ? 0
          : gapBefore(i + 1, i) + (n.text ? MIN_LINES * n.text.unit : n.ink);
        if (avail() < gapBefore(i, prev) + m.ink + follow) open(item.li);
      }

      // ── Bloque indivisible ──
      if (!m.text) {
        const lead = gapBefore(i, prev);
        if (lead + m.ink > avail() && prev >= 0) open(item.li);
        cur.blocks.push(block);
        used += gapBefore(i, prev) + m.ink;
        prev = i;
        return;
      }

      // ── Bloque de texto: repartir por líneas ──
      const t = m.text;
      const total = t.count;
      let startLine = 0;         // primera línea del trozo que falta colocar
      let source = block.text;   // fuente del trozo que falta colocar
      let consumed = 0;          // caracteres visibles ya colocados
      let first = true;

      // Tope de seguridad: nunca más vueltas que líneas tiene el bloque
      let guard = 0;

      while (guard++ < total + 8) {
        // Lo que se interpone antes del trozo: la separación real con
        // el bloque anterior, o nada si el trozo abre página porque
        // viene partido de la anterior.
        const lead = first ? gapBefore(i, prev) : 0;

        // Alto de un trozo = líneas enteras. Medirlo por la caja del
        // texto se quedaría corto por el interlineado.
        const heightTo = (L) => lead + (L - startLine + 1) * t.unit;

        // última línea que entra en el hueco disponible
        let end = startLine - 1;
        for (let L = startLine; L < total; L++) {
          if (heightTo(L) <= avail()) end = L; else break;
        }

        const place = (text, last, L) => {
          cur.blocks.push(chunk(block, text, first, last));
          used += heightTo(L);
          prev = i;
        };

        // ¿cabe lo que queda, entero?
        if (end >= total - 1) { place(source, true, total - 1); break; }

        // Ni huérfanas ni viudas. Primero se intenta adelantar el corte
        // para que queden al menos dos líneas en la página siguiente:
        // mover el párrafo entero dejaría un hueco en esta, y la
        // continuidad del texto manda.
        if (total - 1 - end < MIN_LINES) end = total - 1 - MIN_LINES;

        // Si así no quedan dos líneas aquí, entonces sí baja entero
        if (end - startLine + 1 < MIN_LINES) {
          if (prev >= 0) { open(item.li); continue; }
          // En página vacía nunca se baja nada: el párrafo es más alto
          // que la caja y se corta por donde se pueda
          end = Math.min(startLine + MIN_LINES - 1, total - 2);
        }

        const cut = splitAtVisible(source, t.starts[end + 1] - consumed);
        if (!cut) { place(source, true, total - 1); break; }

        const [head, tail] = cut;
        place(head, false, end);

        consumed += visibleLength(head) + 1;   // +1 por el espacio del corte
        source = tail;
        startLine = end + 1;
        first = false;
        open(item.li);
      }
    });

    // ── Cada sección, a un número par de páginas ─────────────────────────────────────────────
    // Así toda sección empieza siempre en página izquierda y el folio
    // conserva su paridad: pares a la izquierda, impares a la derecha.
    const even = [];
    let count = 0;
    for (let i = 0; i < pages.length; i++) {
      even.push(pages[i]);
      count++;
      const lastOfSection = !pages[i + 1] || pages[i + 1].section !== pages[i].section;
      if (lastOfSection) {
        if (count % 2 === 1)
          even.push({ section: pages[i].section, blocks: [], blank: true });
        count = 0;
      }
    }

    // En desarrollo se deja a mano el reparto, para poder auditar por
    // qué una página ha quedado como ha quedado.
    if (import.meta.env.DEV) {
      window.__pagination = {
        boxHeight,
        pages: even.map((p, k) => ({
          folio: k + 2, letter: p.section, tone: p.tone, blank: p.blank,
          blocks: p.blocks.map((b) => b.type),
        })),
        blocks: flat.map((f, i) => ({
          i, letter: f.li, type: f.block.type,
          ink: Math.round(metrics[i].ink),
          gap: Math.round(gapBefore(i, i - 1)),
          lines: metrics[i].text ? metrics[i].text.count : null,
          unit:  metrics[i].text ? Math.round(metrics[i].text.unit * 10) / 10 : null,
          lh:    Math.round(metrics[i].lh * 10) / 10,
          splittable: SPLITTABLE.has(f.block.type) && Boolean(f.block.text),
        })),
      };
    }

    onPages(even);
    setDone(true);
  }, [flat.length, boxHeight, boxWidth, onPages]);

  /** Lee de la página patrón el ancho y el alto útiles de la caja */
  const readRuler = useCallback(() => {
    const el = ruler.current?.querySelector('.pg-box');
    if (!el) return;
    const w = el.clientWidth;
    const h = el.clientHeight;
    if (!w || !h) return;
    setBox((b) => (Math.abs(b.w - w) > 1 || Math.abs(b.h - h) > 1 ? { w, h } : b));
  }, []);

  useLayoutEffect(() => {
    setDone(false);
    // dos cuadros para que las fuentes web ya estén aplicadas
    const id = requestAnimationFrame(() => requestAnimationFrame(() => {
      readRuler();          // primero la medida de la página…
      measure();            // …y con ella, el reparto
    }));
    return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signal, codexWidth, codexHeight, boxHeight, boxWidth, sections]);

  if (done) return null;

  return (
    <div className="pg-measure-host" aria-hidden="true">
      {/* Página patrón: misma estructura y mismas reglas que una página
          de verdad. De aquí salen las medidas útiles de la caja. */}
      <div
        ref={ruler}
        className="pg-ruler"
        style={{ width: `${codexWidth || 1080}px`, height: `${codexHeight || 870}px` }}
      >
        <div className="pg pg-l">
          <div className="pg-band pg-band--head" />
          <div className="pg-box" />
          <div className="pg-band pg-band--foot" />
        </div>
      </div>

      {/* Los bloques, al ancho útil de esa caja */}
      <div
        ref={ref}
        className="pg-box pg-measure"
        style={{ width: boxWidth ? `${boxWidth}px` : '100%' }}
      >
        {boxWidth > 0 && flat.map((item, i) => (
          <BlockRenderer key={i} block={item.block} />
        ))}
      </div>
    </div>
  );
}

/**
 * Reparte una nota completa en tantas páginas como necesite.
 *
 * El texto de la nota va a dos columnas, como en el impreso, así que
 * no se mide por alturas: se le da a la caja de columnas el alto de la
 * página y se pregunta al navegador si el texto le cabe en dos
 * columnas. Si se desborda a una tercera, es que no cabe. Con eso se
 * busca cuántos párrafos entran en cada página.
 *
 * La primera página lleva la etiqueta, la ilustración y el título; las
 * siguientes solo la etiqueta, marcada como continuación.
 */
function splitFullNote(el, block, boxHeight) {
  const cols = el?.querySelector('.fnp-cols');
  const paras = (block.blocks || []).filter((b) => b.type === 'note-paragraph');
  const rest  = (block.blocks || []).filter((b) => b.type !== 'note-paragraph');

  if (!cols || paras.length < 2 || el.offsetHeight <= boxHeight) return [block];

  const kids = Array.from(cols.children);
  if (kids.length !== paras.length) return [block];

  const headFirst = cols.offsetTop;                 // etiqueta + imagen + título
  const headCont  = Math.min(headFirst, 44);        // solo la etiqueta
  const saved = { height: cols.style.height, width: cols.style.width };

  /** ¿Caben los párrafos [from, to) en dos columnas de `h` px? */
  const fits = (from, to, h) => {
    kids.forEach((k, j) => { k.style.display = (j >= from && j < to) ? '' : 'none'; });
    cols.style.height = `${Math.max(60, h)}px`;
    return cols.scrollWidth <= cols.clientWidth + 1;
  };

  const parts = [];
  let from = 0;
  let guard = 0;

  while (from < paras.length && guard++ < paras.length + 4) {
    const avail = boxHeight - (parts.length === 0 ? headFirst : headCont);

    // cuántos párrafos entran a partir de `from`
    let to = from + 1;
    while (to < paras.length && fits(from, to + 1, avail)) to++;

    parts.push({
      ...block,
      blocks: parts.length === 0 ? [...rest, ...paras.slice(from, to)]
                                 : paras.slice(from, to),
      cont: parts.length > 0,
      runsOn: to < paras.length,
    });
    from = to;
  }

  // dejar la caja de medición como estaba
  kids.forEach((k) => { k.style.display = ''; });
  cols.style.height = saved.height;
  cols.style.width  = saved.width;

  return parts.length ? parts : [block];
}

/**
 * Un trozo de un párrafo repartido entre páginas.
 *   first  es el principio del párrafo → conserva la capitular
 *   last   es el final del párrafo     → conserva el margen inferior
 */
function chunk(block, text, first, last) {
  if (first && last) return { ...block, text };
  return {
    ...block,
    text,
    dropCap: first ? block.dropCap : false,
    cont: !first,      // viene de la página anterior
    runsOn: !last,     // sigue en la página siguiente
  };
}

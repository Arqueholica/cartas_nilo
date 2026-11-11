/**
 * splitText — medir un párrafo línea a línea y partirlo por donde toque
 *
 * El texto de los datos lleva marcadores ([fn:N], [ht:X], [em:X]) que no
 * existen en lo que se ve en pantalla. Para poder cortar un párrafo por
 * donde el navegador ha terminado la página hace falta traducir entre
 * ambas numeraciones de caracteres. Eso es lo que hace `mapSource`, y
 * sobre ello se construye todo lo demás.
 *
 * La medición se hace UNA sola vez por párrafo, en la caja oculta: de
 * ahí salen las líneas (su altura y su posición) y el carácter en que
 * empieza cada una. Con eso el paginador ya puede repartir el párrafo
 * entre tantas páginas como haga falta sin volver a medir, porque un
 * corte por línea deja la cola con el mismo reparto de líneas que tenía.
 */

const MARK = /\[(fn|ht|em):([^\]]*)\]/g;

/* ════════════════════════════════════════════════════════════════
   FUENTE ↔ TEXTO VISIBLE
   ════════════════════════════════════════════════════════════════ */

/**
 * Relaciona el texto visible con el texto fuente.
 *
 * Devuelve:
 *   visible  lo que se ve en pantalla (sin corchetes ni etiquetas)
 *   map      map[i] = posición en el fuente del carácter visible i
 *   guarded  tramos del fuente que no se pueden partir por dentro
 *            (cada marcador completo, con sus corchetes)
 */
export function mapSource(source) {
  const map = [];
  const guarded = [];
  let visible = '';
  let last = 0;
  let m;

  MARK.lastIndex = 0;
  while ((m = MARK.exec(source)) !== null) {
    for (let k = last; k < m.index; k++) { map.push(k); visible += source[k]; }

    // Los tres marcadores dejan su contenido a la vista: [ht:…] y [em:…]
    // como texto corrido y [fn:N] como cifra en superíndice. Lo que no
    // se puede es partir por dentro de uno.
    const inner = m[2];
    const innerStart = m.index + m[1].length + 2;      // tras «[xx:»
    for (let k = 0; k < inner.length; k++) {
      map.push(innerStart + k);
      visible += inner[k];
    }
    guarded.push([m.index, m.index + m[0].length]);
    last = m.index + m[0].length;
  }
  for (let k = last; k < source.length; k++) { map.push(k); visible += source[k]; }

  return { visible, map, guarded };
}

/**
 * Parte el texto fuente por la línea que empieza en `visibleCut`.
 *
 * El corte cae siempre en un ESPACIO: el anterior a la palabra con que
 * empieza esa línea. Si la línea empezaba con media palabra (división
 * con guion, «ca-ballo»), la palabra entera pasa a la página siguiente.
 * No se corta dentro de la palabra porque la posición que da el
 * navegador en esos puntos no es fiable al carácter. Como el trozo que
 * pasa a la página siguiente puede recomponerse algo distinto, el
 * paginador lo mide de verdad (ver `sliceElement`) en vez de suponerlo.
 *
 * Si el corte cae dentro de un marcador ([em:dos palabras]), el
 * marcador se cierra en la cabeza y se vuelve a abrir en la cola, de
 * modo que la cursiva o el término siguen en las dos páginas.
 *
 * Devuelve { head, tail, headLen, at } —`headLen`, caracteres visibles
 * de la cabeza; `at`, carácter visible en que empieza la cola— o null
 * si no hay un punto de corte válido.
 */
export function splitAtVisible(source, visibleCut) {
  const { visible, map, guarded } = mapSource(source);
  if (visibleCut <= 0 || visibleCut >= visible.length) return null;

  // Principio de la palabra con que empieza la línea…
  let v = visibleCut;
  while (v > 0 && visible[v - 1] !== ' ') v--;
  // …y fin de la cabeza, sin los espacios del corte
  let h = v;
  while (h > 0 && visible[h - 1] === ' ') h--;
  if (h <= 0 || v >= visible.length) return null;

  let headEnd   = map[h - 1] + 1;    // posición del fuente tras la cabeza
  let tailStart = map[v];            // posición del fuente donde empieza la cola
  let closeHead = '';
  let openTail  = '';

  // La cabeza termina dentro de un marcador: cerrarlo (o incluir su
  // corchete si lo que acaba es justo el contenido del marcador)
  const gh = guarded.find(([a, b]) => headEnd > a && headEnd < b);
  if (gh) {
    if (headEnd === gh[1] - 1) headEnd = gh[1];
    else closeHead = ']';
  }

  // La cola empieza dentro de un marcador: abrirlo de nuevo (o tomarlo
  // entero si empieza justo al principio de su contenido)
  const gt = guarded.find(([a, b]) => tailStart > a && tailStart < b);
  if (gt) {
    const kind = source.slice(gt[0] + 1, source.indexOf(':', gt[0]));
    if (tailStart === gt[0] + kind.length + 2) tailStart = gt[0];
    else openTail = `[${kind}:`;
  }

  const head = (source.slice(0, headEnd) + closeHead).trimEnd();
  const tail = (openTail + source.slice(tailStart)).trimStart();
  if (!head || !tail) return null;
  return { head, tail, headLen: h, at: v };
}

/**
 * Copia de un párrafo ya compuesto, recortada a los caracteres visibles
 * [from, to). Se añade a `host` para poder medirla con las mismas reglas
 * que el original. Con ella se mide el alto REAL de un trozo de párrafo,
 * en vez de suponerlo a partir del párrafo entero.
 */
export function sliceElement(el, from, to, host) {
  const c = el.cloneNode(true);
  host.appendChild(c);
  let nodes = textNodesOf(c);
  const len = nodes.reduce((a, n) => a + n.nodeValue.length, 0);
  const range = document.createRange();
  if (to < len && c.lastChild) {
    const at = locate(nodes, to);
    range.setStart(at.node, at.pos);
    range.setEndAfter(c.lastChild);
    range.deleteContents();
  }
  if (from > 0 && c.firstChild) {
    nodes = textNodesOf(c);
    const at = locate(nodes, from);
    range.setStartBefore(c.firstChild);
    range.setEnd(at.node, at.pos);
    range.deleteContents();
  }
  return c;
}

/** Longitud del texto visible de una cadena fuente */
export function visibleLength(source) {
  return mapSource(source).visible.length;
}

/* ════════════════════════════════════════════════════════════════
   MEDICIÓN EN EL DOM
   ════════════════════════════════════════════════════════════════ */

/** Nodos de texto de un elemento, en orden de lectura */
function textNodesOf(el) {
  const out = [];
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = walker.nextNode())) {
    if (n.nodeValue.length) out.push(n);
  }
  return out;
}

/** Posición global de texto → (nodo, posición local) */
function locate(nodes, offset) {
  let acc = 0;
  for (const node of nodes) {
    const len = node.nodeValue.length;
    if (offset < acc + len) return { node, pos: offset - acc };
    acc += len;
  }
  const last = nodes[nodes.length - 1];
  return last ? { node: last, pos: last.nodeValue.length } : { node: null, pos: 0 };
}

/** Altura (relativa a `base`) del carácter que empieza en `offset` */
function charTop(nodes, offset, base) {
  const { node, pos } = locate(nodes, offset);
  if (!node) return Infinity;
  const range = document.createRange();
  // algún carácter colapsado no tiene caja: ensanchar un poco y reintentar
  for (let span = 1; span <= 3; span++) {
    const end = Math.min(pos + span, node.nodeValue.length);
    if (end <= pos) break;
    range.setStart(node, pos);
    range.setEnd(node, end);
    const rc = range.getBoundingClientRect();
    if (rc.height > 0.5) return rc.top - base;
  }
  return Infinity;
}

/**
 * Primer carácter cuya caja empieza a la altura `y` o más abajo.
 * Búsqueda binaria: la altura crece con la posición.
 */
function firstOffsetBelow(nodes, len, y, from, base) {
  let a = from, b = len - 1, ans = len;
  while (a <= b) {
    const m = (a + b) >> 1;
    if (charTop(nodes, m, base) >= y) { ans = m; b = m - 1; }
    else a = m + 1;
  }
  return ans;
}

/**
 * Mide un bloque de texto ya renderizado.
 *
 * Devuelve `null` si tiene una sola línea (no hay nada que partir), y en
 * otro caso:
 *   count   número de líneas
 *   unit    alto de una línea en px
 *   starts  starts[i] = carácter visible en que empieza la línea i
 *   marginTop / marginBottom
 *
 * Las líneas se cuentan por la retícula del interlineado —alto del
 * bloque dividido por la altura de línea—, no agrupando los
 * rectángulos del texto. Agrupar engaña: la capitular es una caja
 * aparte que abarca varias líneas y se cuela como una línea más, y de
 * ahí salen cuentas de altura que no cuadran. La retícula, en cambio,
 * es exacta, y `unit` sale de ella, de modo que la suma de los trozos
 * de un párrafo siempre da su altura real.
 */
export function measureLines(el) {
  const cs = getComputedStyle(el);
  let lh = parseFloat(cs.lineHeight);
  if (!lh || Number.isNaN(lh)) lh = parseFloat(cs.fontSize) * 1.5;
  if (!lh) return null;

  const padTop = parseFloat(cs.paddingTop) || 0;
  const inner = el.clientHeight - padTop - (parseFloat(cs.paddingBottom) || 0);
  const count = Math.max(1, Math.round(inner / lh));
  if (count < 2) return null;

  const unit = inner / count;
  const base = el.getBoundingClientRect().top + padTop;

  const nodes = textNodesOf(el);
  const len = nodes.reduce((a, n) => a + n.nodeValue.length, 0);
  if (!len) return null;

  // Carácter en que empieza cada línea
  const starts = [0];
  for (let i = 1; i < count; i++) {
    const off = firstOffsetBelow(nodes, len, i * unit - unit * 0.4,
                                 starts[i - 1] + 1, base);
    // Si una línea no se puede localizar, el bloque no se parte: el
    // paginador lo tratará como indivisible, con su altura real.
    if (off >= len) return null;
    starts.push(off);
  }

  return {
    count,
    unit,
    lh,
    starts,
    marginTop:    parseFloat(cs.marginTop) || 0,
    marginBottom: parseFloat(cs.marginBottom) || 0,
  };
}

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

/** ¿La posición del fuente cae dentro de un marcador? */
function inGuard(pos, guarded) {
  return guarded.find(([a, b]) => pos > a && pos < b);
}

/**
 * Parte el texto fuente por el carácter visible `visibleCut`.
 *
 * Ajusta el corte al espacio anterior para no cortar una palabra y lo
 * retrasa hasta antes del marcador si cayera dentro de uno, de modo que
 * una llamada de nota nunca queda partida entre dos páginas.
 *
 * Devuelve [cabeza, cola] o null si no hay un punto de corte válido.
 */
export function splitAtVisible(source, visibleCut) {
  const { visible, map, guarded } = mapSource(source);
  if (visibleCut <= 0 || visibleCut >= visible.length) return null;

  // retroceder hasta un espacio del texto visible
  let v = Math.min(visibleCut, visible.length - 1);
  while (v > 0 && visible[v] !== ' ') v--;
  if (v <= 0) return null;

  let pos = map[v];

  // si el corte cae dentro de un marcador, llevarlo justo antes
  let guard = inGuard(pos, guarded);
  while (guard) {
    pos = guard[0];
    while (pos > 0 && source[pos] !== ' ') pos--;
    if (pos <= 0) return null;
    guard = inGuard(pos, guarded);
  }

  const head = source.slice(0, pos).trimEnd();
  const tail = source.slice(pos).trimStart();
  if (!head || !tail) return null;
  return [head, tail];
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

/**
 * pageChrome — cabecera y pie de página
 *
 * Toda página de carta reserva dos franjas de la misma altura: una
 * arriba (la cabecera) y otra abajo (el pie, donde va el folio). El
 * espacio existe siempre, aunque esté vacío, para que el texto empiece
 * y acabe a la misma altura en todo el libro.
 *
 * Qué va en cada franja NO se decide aquí: se declara como dato, en el
 * archivo `chrome.js` del libro. Este módulo solo resuelve esa
 * declaración contra los datos de la página concreta.
 *
 * Cada franja tiene tres ranuras — left, center, right — y cada ranura
 * admite:
 *   · null            → vacía (el espacio se reserva igual)
 *   · 'book.title'    → uno de los tokens de abajo
 *   · 'Texto literal' → cualquier otra cadena se imprime tal cual
 *   · (ctx) => …       → una función, si hiciera falta algo calculado
 *
 * Las páginas izquierdas (verso, folio par) y derechas (recto, folio
 * impar) se declaran por separado, como en la tipografía clásica: lo
 * habitual es el título del libro en el verso y el del capítulo en el
 * recto.
 */

/** Tokens disponibles en las ranuras */
export const CHROME_TOKENS = {
  'book.title':    (c) => c.bookTitle,
  'book.author':   (c) => c.bookAuthor,
  'book.imprint':  (c) => c.bookImprint,
  'chapter.label': (c) => c.chapterLabel,   // «Carta VI»
  'chapter.title': (c) => c.chapterTitle,   // título de la carta
  'chapter.to':    (c) => c.chapterTo,      // «A Louis Bouilhet»
  'chapter.date':  (c) => c.chapterDate,
  'section':       (c) => c.section,        // «Glosario», «Galería»…
  'folio':         (c) => c.folio,
};

const EMPTY = { left: null, center: null, right: null };

function resolveSlot(slot, ctx) {
  if (slot == null || slot === false) return null;
  if (typeof slot === 'function') return slot(ctx) ?? null;
  const token = CHROME_TOKENS[slot];
  const value = token ? token(ctx) : slot;      // si no es token, literal
  return value == null || value === '' ? null : String(value);
}

function resolveBand(band, ctx) {
  const slots = { ...EMPTY, ...(band || {}) };
  const out = {
    left:   resolveSlot(slots.left, ctx),
    center: resolveSlot(slots.center, ctx),
    right:  resolveSlot(slots.right, ctx),
  };
  out.empty = !out.left && !out.center && !out.right;
  return out;
}

/**
 * Resuelve la cabecera y el pie de una página.
 *
 * @param chrome  declaración del libro ({ head, foot })
 * @param side    'left' | 'right' | 'single'
 * @param ctx     datos de la página (título, folio, capítulo…)
 */
export function pageChrome(chrome, side, ctx) {
  const which = side === 'left' ? 'verso' : 'recto';
  const head = chrome?.head?.[which];
  const foot = chrome?.foot?.[which];
  return {
    head: resolveBand(head, ctx),
    foot: resolveBand(foot, ctx),
  };
}

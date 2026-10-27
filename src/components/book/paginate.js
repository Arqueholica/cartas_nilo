/**
 * paginate.js — reparte contenido largo (glosario, galería) en
 * spreads de libro físico, en vez de una sola página con scroll.
 *
 * Cada spread tiene página izquierda y derecha. El contenido se
 * trocea en "páginas" y se emparejan de dos en dos.
 *
 * Estas utilidades son agnósticas del render: solo producen la
 * estructura de datos de spreads que el motor ya sabe pintar.
 */

/**
 * chunk — divide un array en grupos de tamaño `size`
 */
function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}

/**
 * paginateGlossary — reparte las entradas del glosario en spreads.
 *
 * @param entries        array de { term, definition, ref? } (ya ordenado o no)
 * @param opts.perPage   entradas por página (por defecto 8)
 * @param opts.title     título que aparece en la primera página
 * @param opts.bookTitle para la media portada de relleno si hace falta
 * @returns array de spreads { left, right }
 */
export function paginateGlossary(entries, opts = {}) {
  const perPage   = opts.perPage || 8;
  const title     = opts.title || 'Glosario';

  // Por defecto se ordena alfabéticamente; con sorted:false se respeta
  // el orden de entrada (útil cuando ya vienen agrupadas por carta).
  const list = opts.sorted === false
    ? [...entries]
    : [...entries].sort((a, b) =>
        a.term.localeCompare(b.term, 'es', { sensitivity: 'base' }));

  const pages = chunk(list, perPage);

  // Construir bloques de página: la primera lleva el título de sección
  const pageBlocks = pages.map((pageEntries, i) => ({
    blocks: [
      {
        type:       'glossary-page',
        title:      i === 0 ? title : null,   // solo la 1ª página muestra título
        entries:    pageEntries,
        pageLabel:  pages.length > 1 ? `Glosario · ${i + 1}/${pages.length}` : null,
      },
    ],
  }));

  return pairPages(pageBlocks);
}

/**
 * paginateGallery — reparte las imágenes de la galería en spreads.
 *
 * @param items         array de { image, caption, text?, source? }
 * @param opts.perPage  imágenes por página (por defecto 2)
 * @param opts.title    título de sección
 * @returns array de spreads { left, right }
 */
export function paginateGallery(items, opts = {}) {
  const perPage = opts.perPage || 2;
  const title   = opts.title || 'Galería de imágenes';

  const pages = chunk(items, perPage);

  const pageBlocks = pages.map((pageItems, i) => ({
    blocks: [
      {
        type:      'gallery-page',
        title:     i === 0 ? title : null,
        items:     pageItems,
        pageLabel: pages.length > 1 ? `Galería · ${i + 1}/${pages.length}` : null,
      },
    ],
  }));

  return pairPages(pageBlocks);
}

/**
 * pairPages — empareja páginas individuales en spreads (izq/dcha).
 * Si el número de páginas es impar, la última página derecha queda vacía.
 */
function pairPages(pages) {
  const spreads = [];
  for (let i = 0; i < pages.length; i += 2) {
    spreads.push({
      left:  pages[i],
      right: pages[i + 1] || { blocks: [] },  // página derecha vacía si sobra
    });
  }
  return spreads;
}

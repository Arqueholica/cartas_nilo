/**
 * imageSizes — registro de medidas de imagen
 *
 * Los componentes no conocen el libro, así que no importan su índice
 * de medidas: es el libro el que lo registra aquí al cargarse
 * (`registerImageSizes`, en su index.js), y los componentes lo
 * consultan con `imgDims(src)`.
 *
 * `imgDims` devuelve los atributos width y height listos para la
 * etiqueta <img>. Con ellos el navegador conoce la proporción de la
 * imagen antes de descargarla y le reserva el hueco exacto. Eso hace
 * dos cosas:
 *   · el paginador puede medir páginas con ilustraciones aunque las
 *     imágenes de la caja oculta no lleguen a cargarse nunca;
 *   · la página no salta cuando la imagen termina de llegar.
 *
 * El CSS sigue mandando sobre el tamaño final (ancho al 100 %, techo
 * de altura…): los atributos solo aportan la proporción.
 */
const registry = {};

export function registerImageSizes(map) {
  Object.assign(registry, map || {});
}

/** { width, height } para <img>, o {} si no se conoce la imagen */
export function imgDims(src) {
  const s = src && registry[src];
  return s ? { width: s[0], height: s[1] } : {};
}

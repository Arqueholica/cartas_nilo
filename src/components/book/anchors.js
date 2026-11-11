/**
 * anchors — puntos fijos del libro que sobreviven a la repaginación
 *
 * Al cambiar el tamaño de letra o de ventana el libro se repagina y la
 * doble página 12 ya no contiene lo mismo. Por eso los puntos que hay
 * que recordar —dónde está leyendo el lector, dónde está la cinta— no
 * se guardan como número de página sino como ANCLA: el contenido con
 * que empieza esa página, [bloque, carácter].
 *
 * Valores especiales:
 *   COVER  la portada (antes de todo el contenido)
 *   END    la contraportada (después de todo)
 */
export const COVER = [-1, 0];
export const END   = [Number.MAX_SAFE_INTEGER, 0];

/** Compara dos anclas: <0, 0, >0 */
export function compareAnchors(a, b) {
  return a[0] !== b[0] ? a[0] - b[0] : a[1] - b[1];
}

/** Ancla con que empieza una doble página */
export function spreadAnchor(sp) {
  if (!sp) return null;
  if (sp.kind === 'cover') return COVER;
  if (sp.kind === 'back')  return END;
  return sp.left?.anchor || sp.right?.anchor || null;
}

/**
 * Doble página que contiene un ancla: la última que empieza en ella o
 * antes. Devuelve 0 (la portada) si no hay ninguna.
 */
export function spreadForAnchor(spreads, anchor) {
  if (!anchor) return 0;
  let found = 0;
  spreads.forEach((sp, i) => {
    const a = spreadAnchor(sp);
    if (a && compareAnchors(a, anchor) <= 0) found = i;
  });
  return found;
}

/** ¿Es un ancla válida? (para leer lo guardado sin fiarse) */
export function isAnchor(a) {
  return Array.isArray(a) && a.length === 2 && a.every(Number.isFinite);
}

/**
 * parseText — convierte texto con marcadores a elementos React
 *
 * Marcadores soportados:
 *   [fn:N]   → superíndice de nota al margen, clickable
 *   [ht:X]   → término destacado (color acento + negrita cursiva)
 *              · si X existe en el glosario → clicable, salta a su definición
 *              · si no existe → solo resalte visual
 *   [em:X]   → cursiva simple
 *
 * Uso:
 *   parseText("El [ht:khamsin] sopla[fn:6].", { onNoteClick, onTermClick, glossaryTerms })
 *
 * Parámetros de options (todos opcionales):
 *   onNoteClick(n)      → llamado al pulsar un [fn:N]
 *   onTermClick(term)   → llamado al pulsar un [ht:X] que está en el glosario
 *   glossaryTerms       → Set con las palabras que tienen entrada de glosario
 *
 * Agnóstico: en la exportación EPUB, una versión de esta función
 * genera HTML estático (<a epub:type="noteref">, etc.) en lugar de React.
 */

// Normaliza un término para comparar con el glosario:
// minúsculas, sin acentos, sin signos de puntuación al borde.
export function normalizeTerm(term) {
  return term
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')  // quitar diacríticos
    .replace(/[.,;:!?«»"'()]/g, '')   // quitar puntuación
    .trim();
}

export function parseText(text, options = {}) {
  if (!text) return null;

  // Compatibilidad: si se pasa una función directamente, es onNoteClick
  const opts = typeof options === 'function' ? { onNoteClick: options } : options;
  const { onNoteClick, onTermClick, glossaryTerms } = opts;

  const pattern = /\[fn:(\d+)\]|\[ht:([^\]]+)\]|\[em:([^\]]+)\]/g;
  const parts   = [];
  let last      = 0;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));

    if (match[1]) {
      // [fn:N] → superíndice de nota
      const n = match[1];
      parts.push(
        <sup
          key={match.index}
          className="fn"
          data-n={n}
          onClick={() => onNoteClick && onNoteClick(n)}
          title={`Nota ${n}`}
        >
          {n}
        </sup>
      );
    } else if (match[2]) {
      // [ht:X] → término destacado, con enlace a glosario si procede
      const term          = match[2];
      const normalized    = normalizeTerm(term);
      const inGlossary    = glossaryTerms && glossaryTerms.has(normalized);

      if (inGlossary && onTermClick) {
        parts.push(
          <span
            key={match.index}
            className="ht ht-link"
            onClick={() => onTermClick(normalized)}
            title={`Ver «${term}» en el glosario`}
            role="button"
            tabIndex={0}
          >
            {term}
          </span>
        );
      } else {
        parts.push(<span key={match.index} className="ht">{term}</span>);
      }
    } else if (match[3]) {
      // [em:X] → cursiva
      parts.push(<em key={match.index}>{match[3]}</em>);
    }

    last = match.index + match[0].length;
  }

  if (last < text.length) parts.push(text.slice(last));

  return parts.length === 1 && typeof parts[0] === 'string' ? parts[0] : parts;
}

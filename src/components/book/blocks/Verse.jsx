import { parseText } from './parseText';

/**
 * Verse — bloque de cita poética con traducción opcional
 * Props:
 *   text        string con marcadores
 *   translation traducción opcional
 *   textOpts    { onNoteClick, onTermClick, glossaryTerms }
 */
export default function Verse({ text, translation, textOpts, onNoteClick }) {
  const opts = textOpts || { onNoteClick };
  return (
    <div className="verse">
      {parseText(text, opts)}
      {translation && <span className="tr">{translation}</span>}
    </div>
  );
}

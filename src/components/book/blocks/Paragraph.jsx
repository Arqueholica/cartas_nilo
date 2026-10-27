import { parseText } from './parseText';

/**
 * Paragraph — bloque de texto con soporte de marcadores
 * Props:
 *   text       string con marcadores [fn:N], [ht:X], [em:X]
 *   dropCap    boolean — primera letra decorativa
 *   textOpts   { onNoteClick, onTermClick, glossaryTerms }
 *              (también acepta onNoteClick suelto por compatibilidad)
 */
export default function Paragraph({ text, dropCap, textOpts, onNoteClick }) {
  const opts = textOpts || { onNoteClick };
  return (
    <p className={`bt${dropCap ? ' dc' : ''}`}>
      {parseText(text, opts)}
    </p>
  );
}

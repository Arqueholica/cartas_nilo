import { parseText } from './parseText';

/**
 * Paragraph — bloque de texto con soporte de marcadores
 *
 * Props:
 *   text       string con marcadores [fn:N], [ht:X], [em:X]
 *   dropCap    boolean — primera letra decorativa
 *   cont       viene partido de la página anterior
 *   runsOn     sigue en la página siguiente
 *   textOpts   { onNoteClick, onTermClick, glossaryTerms }
 *              (también acepta onNoteClick suelto por compatibilidad)
 *
 * `cont` y `runsOn` los pone el paginador al repartir un párrafo entre
 * páginas. Sirven para que la unión no se note: el trozo que continúa
 * no lleva capitular y el que sigue en la página siguiente justifica
 * también su última línea, porque en realidad no es el final del
 * párrafo.
 */
export default function Paragraph({ text, dropCap, cont, runsOn, textOpts, onNoteClick }) {
  const opts = textOpts || { onNoteClick };
  const cls = ['bt'];
  if (dropCap) cls.push('dc');
  if (cont)    cls.push('bt--cont');
  if (runsOn)  cls.push('bt--runs-on');

  return (
    <p className={cls.join(' ')}>
      {parseText(text, opts)}
    </p>
  );
}

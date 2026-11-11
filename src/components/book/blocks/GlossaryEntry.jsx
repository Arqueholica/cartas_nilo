import { parseText, normalizeTerm } from './parseText';

/**
 * GlossaryEntry — una entrada del glosario
 *
 * Cada entrada es un bloque, de modo que el glosario se reparte en
 * páginas midiendo lo que cabe, igual que el texto de las cartas.
 * Cuando el lector llega desde un término del texto, la entrada se
 * resalta unos segundos.
 *
 * Bloque:
 *   { type: 'glossary-entry', term, definition, origin? }
 *   origin → procedencia («Carta V»)
 */
export default function GlossaryEntry({ term, definition, origin, activeTerm }) {
  const key = normalizeTerm(term);
  const active = activeTerm && activeTerm === key;

  return (
    <dl className={`glossary-entry${active ? ' glossary-entry--active' : ''}`} data-term={key}>
      <dt className="glossary-term">{term}</dt>
      <dd className="glossary-def">{parseText(definition)}</dd>
      {origin && <dd className="glossary-ref">{origin}</dd>}
    </dl>
  );
}

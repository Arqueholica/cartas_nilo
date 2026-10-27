import { useEffect, useRef } from 'react';
import { parseText } from './parseText';

/**
 * Glossary — glosario de términos del libro
 *
 * Lista de "palabra: definición". Las palabras coinciden (normalizadas)
 * con los términos [ht:X] marcados en el texto, de modo que al pulsar
 * un término destacado durante la lectura se puede saltar a su entrada aquí.
 *
 * Uso en los datos del libro:
 * {
 *   type:  'glossary',
 *   title: 'Glosario',
 *   entries: [
 *     { term: 'khamsin',  definition: 'Viento cálido del desierto que sopla en primavera.' },
 *     { term: 'tarbuch',  definition: 'Gorro cilíndrico de fieltro, también llamado fez.' },
 *     { term: 'canga',    definition: 'Embarcación fluvial ligera del Nilo.', ref: 'Carta VI' },
 *   ],
 * }
 *
 * La definición admite marcadores [em:X] para cursivas.
 * El campo `ref` es opcional: indica dónde aparece el término.
 */
export default function Glossary({ title = 'Glosario', entries = [], activeTerm }) {
  const containerRef = useRef(null);

  // Cuando llega un activeTerm (salto desde el texto), hacer scroll a él
  useEffect(() => {
    if (!activeTerm || !containerRef.current) return;
    const el = containerRef.current.querySelector(`[data-term="${activeTerm}"]`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('glossary-entry--active');
      const t = setTimeout(() => el.classList.remove('glossary-entry--active'), 2600);
      return () => clearTimeout(t);
    }
  }, [activeTerm]);

  // Ordenar alfabéticamente por término
  const sorted = [...entries].sort((a, b) =>
    a.term.localeCompare(b.term, 'es', { sensitivity: 'base' })
  );

  return (
    <section className="glossary" ref={containerRef}>
      <h2 className="glossary-title">{title}</h2>
      <dl className="glossary-list">
        {sorted.map((entry, i) => {
          const normalized = entry.term
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .trim();
          return (
            <div className="glossary-entry" key={i} data-term={normalized}>
              <dt className="glossary-term">{entry.term}</dt>
              <dd className="glossary-def">
                {parseText(entry.definition)}
                {entry.ref && <span className="glossary-ref"> · {entry.ref}</span>}
              </dd>
            </div>
          );
        })}
      </dl>
    </section>
  );
}

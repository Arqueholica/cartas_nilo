import { useEffect, useRef } from 'react';
import { parseText } from './parseText';

/**
 * GlossaryPage — una página de glosario (formato libro físico)
 *
 * A diferencia de Glossary (scroll continuo), esto es una sola
 * página con un número fijo de entradas. La paginación la hace
 * paginate.js repartiendo entradas en varias páginas.
 *
 * Props:
 *   title      título de sección (solo en la 1ª página)
 *   entries    entradas de ESTA página
 *   pageLabel  etiqueta "Glosario · 2/3"
 *   activeTerm término a resaltar (salto desde el texto)
 *   onReturn   callback del botón "volver a la página"
 */
export default function GlossaryPage({ title, entries = [], pageLabel,
                                       activeTerm, onReturn }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!activeTerm || !ref.current) return;
    const el = ref.current.querySelector(`[data-term="${activeTerm}"]`);
    if (el) {
      el.classList.add('glossary-entry--active');
      const t = setTimeout(() => el.classList.remove('glossary-entry--active'), 2600);
      return () => clearTimeout(t);
    }
  }, [activeTerm]);

  return (
    <section className="glossary glossary--paged" ref={ref}>
      {title && <h2 className="glossary-title">{title}</h2>}

      {onReturn && (
        <button className="return-btn" onClick={onReturn}>
          ← Volver a la lectura
        </button>
      )}

      <dl className="glossary-list">
        {entries.map((entry, i) => {
          const normalized = entry.term
            .toLowerCase().normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '').trim();
          return (
            <div className="glossary-entry" key={i} data-term={normalized}>
              <dt className="glossary-term">{entry.term}</dt>
              <dd className="glossary-def">
                {parseText(entry.definition)}
              </dd>
              {entry.ref && <span className="glossary-ref">{entry.ref}</span>}
            </div>
          );
        })}
      </dl>

      {pageLabel && <span className="section-page-label">{pageLabel}</span>}
    </section>
  );
}

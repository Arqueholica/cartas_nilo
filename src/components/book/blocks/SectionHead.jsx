/**
 * SectionHead — apertura de una sección de final de libro
 *
 * El título de la sección (Galería, Glosario…). Es un bloque más: el
 * paginador lo mide y no lo deja solo al pie de una página.
 *
 * El botón de volver a la lectura NO va aquí sino en la barra
 * superior, donde está disponible en todas las páginas de la sección
 * (se puede llegar a cualquiera desde un término del texto) y no altera
 * la medida de la página.
 *
 * Bloque:
 *   { type: 'section-head', kind: 'glossary' | 'gallery', title }
 */
export default function SectionHead({ title, kind }) {
  return (
    <header className={`section-head section-head--${kind || 'plain'}`}>
      <h2 className="section-head-title">{title}</h2>
    </header>
  );
}

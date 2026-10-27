/**
 * Page — una página del libro
 *
 * Estructura fija, igual en todas las páginas:
 *   .pg      → la hoja
 *     .pg-box → la caja de texto (medidas constantes; el contenido nunca
 *               la desborda porque el Paginator reparte por lo que cabe)
 *     .pn     → el folio, siempre a la misma altura
 *
 * Solo las ilustraciones con su nota integrada pueden sobresalir de la
 * caja, mediante la clase .bleed que aplica el propio bloque.
 */
import BlockRenderer from './blocks/BlockRenderer';
import Cover         from './blocks/Cover';

function HalfTitle({ bookTitle }) {
  return (
    <div className="pg-halftitle">
      <div className="ht-orn">❧</div>
      <div className="ht-book">{bookTitle}</div>
      <div className="ht-orn2">— ✦ —</div>
    </div>
  );
}

function EndPage({ author, series, label }) {
  return (
    <div className="pg-end">
      <div>
        <div className="pg-end-orn">❧</div>
        <p className="pg-end-author">{author}</p>
        <p className="pg-end-series"><em>{series}</em></p>
        <p className="pg-end-label">{label}</p>
      </div>
    </div>
  );
}

export default function Page({ side, data, onNoteClick, onLightbox, onStart,
                               onTermClick, glossaryTerms, activeTerm, onReturn }) {
  const sideClass = side === 'left' ? 'pg-l' : side === 'single' ? 'pg-s' : 'pg-r';

  if (!data) return <div className={`pg ${sideClass} pg-blank`} />;

  if (data.type === 'halftitle')
    return <div className={`pg ${sideClass}`}><HalfTitle {...data} /></div>;

  if (data.type === 'cover' || data.type === 'cover-page')
    return (
      <div className={`pg ${sideClass} pg-cover`}>
        <Cover {...data} onStart={onStart} onLightbox={onLightbox} />
      </div>
    );

  if (data.type === 'end-page')
    return <div className={`pg ${sideClass}`}><EndPage {...data} /></div>;

  const folio = data.folio;
  const tone  = data.tone === 'note' ? ' pg--note' : '';

  return (
    <div className={`pg ${sideClass}${tone}`}>
      <div className="pg-box">
        {(data.blocks || []).map((block, i) => (
          <BlockRenderer
            key={i}
            block={block}
            onNoteClick={onNoteClick}
            onLightbox={onLightbox}
            onTermClick={onTermClick}
            glossaryTerms={glossaryTerms}
            activeTerm={activeTerm}
            onReturn={side === 'left' || side === 'single' ? onReturn : null}
          />
        ))}
      </div>
      {folio && <span className="pn">{folio}</span>}
    </div>
  );
}

/**
 * Page — una página del libro
 *
 * Estructura fija, igual en todas las páginas:
 *   .pg                 → la hoja
 *     .pg-band--head    → cabecera: franja reservada, con tres ranuras
 *     .pg-box           → la caja de texto (medidas constantes; el
 *                         contenido nunca la desborda porque el
 *                         Paginator reparte por lo que cabe)
 *     .pg-band--foot    → pie: la misma franja, con el folio
 *
 * Las dos franjas tienen la misma altura y existen siempre, aunque
 * estén vacías: así el texto empieza y acaba a la misma altura en todo
 * el libro. Lo que se imprime en cada ranura se declara como dato, en
 * el `chrome.js` del libro.
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

/**
 * Band — cabecera o pie.
 * El espacio se reserva siempre; la línea de filete solo aparece
 * cuando hay texto que separar del cuerpo.
 */
function Band({ kind, band }) {
  const data = band || { left: null, center: null, right: null, empty: true };
  return (
    <div className={`pg-band pg-band--${kind}${data.empty ? ' is-empty' : ''}`}>
      <span className="pg-slot pg-slot--l">{data.left}</span>
      <span className="pg-slot pg-slot--c">{data.center}</span>
      <span className="pg-slot pg-slot--r">{data.right}</span>
    </div>
  );
}

export default function Page({ side, data, onNoteClick, onLightbox, onStart,
                               onTermClick, glossaryTerms, activeTerm, onReturn }) {
  const sideClass = side === 'left' ? 'pg-l' : side === 'single' ? 'pg-s' : 'pg-r';

  if (!data) return <div className={`pg ${sideClass} pg-blank`} />;

  if (data.type === 'halftitle')
    return <div className={`pg ${sideClass}`}><HalfTitle {...data} /></div>;

  // La portada no se pagina nunca, pero mide igual que cualquier página
  if (data.type === 'cover' || data.type === 'cover-page')
    return (
      <div className={`pg ${sideClass} pg-cover`}>
        <Cover {...data} onStart={onStart} onLightbox={onLightbox} />
      </div>
    );

  if (data.type === 'end-page')
    return <div className={`pg ${sideClass}`}><EndPage {...data} /></div>;

  const tone   = data.tone === 'note' ? ' pg--note' : '';
  const chrome = data.chrome || {};

  return (
    <div className={`pg ${sideClass}${tone}`}>
      <Band kind="head" band={chrome.head} />

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

      <Band kind="foot" band={chrome.foot} />
    </div>
  );
}

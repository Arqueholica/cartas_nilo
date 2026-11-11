/**
 * Spread — una vista del libro.
 *
 * Tres formas:
 *   · doble página (pantallas anchas en horizontal)
 *   · página sola (`solo`): una página de texto por vista, en móvil,
 *     tableta en vertical y móvil en horizontal
 *   · página única (`single`): portada y contraportada, centradas y
 *     sin lomo
 */
import Page from './Page';

export default function Spread({ data, active, onNoteClick, onLightbox, onStart,
                                 onTermClick, glossaryTerms, activeTerm, onReturn }) {
  if (!active) return null;

  const shared = { onNoteClick, onLightbox, onStart, onTermClick,
                   glossaryTerms, activeTerm, onReturn };

  if (data.single) {
    return (
      <div className="spread spread--single active">
        <Page side="single" data={data.page} {...shared} />
      </div>
    );
  }

  if (data.solo) {
    return (
      <div className="spread spread--single spread--solo active">
        <Page side="solo" data={data.left} {...shared} />
      </div>
    );
  }

  return (
    <div className="spread active">
      <Page side="left"  data={data.left}  {...shared} />
      <Page side="right" data={data.right} {...shared} />
    </div>
  );
}

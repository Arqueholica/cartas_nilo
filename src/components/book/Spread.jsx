/**
 * Spread — una vista del libro.
 *
 * Dos formas:
 *   · doble página (lo habitual)
 *   · página única (portada y contraportada), centrada y sin lomo
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

  return (
    <div className="spread active">
      <Page side="left"  data={data.left}  {...shared} />
      <Page side="right" data={data.right} {...shared} />
    </div>
  );
}

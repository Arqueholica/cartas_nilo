/**
 * Sidebar — índice de navegación (overlay sobre el libro)
 * Muestra: portada, secciones/cartas y secciones finales
 * (galería, glosario) pasadas por props.
 */
export default function Sidebar({ letters, spread, onGoTo, open, onClose,
                                  hasNotes, extraSections = [], bookTitle = 'Noticias desde El Nilo',
                                  bookAuthor = 'Gustave Flaubert' }) {
  return (
    <>
      <div className={`overlay-bg${open ? ' open' : ''}`} onClick={onClose} />

      <nav className={`nav-strip${open ? ' open' : ''}`}>
        <div className="ns-head">
          <div className="ns-head-txt">
            <h2>{bookTitle}</h2>
            <small>{bookAuthor}</small>
          </div>
          <button className="ns-x" onClick={onClose}>&times;</button>
        </div>

        <div className="ns-items">
          {/* Portada */}
          <div
            className={`ns-item${spread === 0 ? ' on' : ''}`}
            onClick={() => { onGoTo(0); onClose(); }}
          >
            Portada
            <span className="ns-pencil">{hasNotes(0) ? '✏' : ''}</span>
          </div>

          {/* Cartas / secciones */}
          {letters.map((letter, i) => {
            const sp = letter.sp ?? (i + 1);
            return (
              <div
                key={letter.id}
                className={`ns-item${spread === sp ? ' on' : ''}`}
                onClick={() => { onGoTo(sp); onClose(); }}
                title={letter.date || ''}
              >
                <span className="ns-item-label">
                  Carta {letter.number} · {letter.title}
                </span>
                <span className="ns-pencil">{hasNotes(sp) ? '✏' : ''}</span>
              </div>
            );
          })}

          {/* Secciones finales: galería, glosario */}
          {extraSections.length > 0 && <div className="ns-divider" />}
          {extraSections.map((sec) => (
            <div
              key={sec.sp}
              className={`ns-item ns-item--extra${spread === sec.sp ? ' on' : ''}`}
              onClick={() => { onGoTo(sec.sp); onClose(); }}
            >
              {sec.label}
            </div>
          ))}
        </div>
      </nav>
    </>
  );
}

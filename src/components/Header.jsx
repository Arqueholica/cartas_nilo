import ReadingOptions from './ReadingOptions';

/**
 * Header — barra superior.
 * Sin estado propio: recibe los callbacks y los invoca.
 *
 *   izquierda  índice · marcador · (volver a la lectura)
 *   centro     dónde está el lector
 *   derecha    opciones de lectura · pantalla completa
 *
 * Tema, tamaño de letra, modo del marcador, animaciones y sonido viven
 * en el panel «Opciones de lectura» (botón «Aa»).
 *
 * El botón del marcador depende del modo:
 *   manual      pone o quita la cinta en la doble página visible
 *   automático  la cinta se mueve sola; el botón abre las opciones para
 *               poder cambiar de modo
 *
 * `onReturn` solo llega en la galería y el glosario, cuando se ha
 * entrado desde la lectura: muestra el botón para volver a ella desde
 * cualquier página de esas secciones, no solo desde la primera.
 */
export default function Header({ spread, total, label,
                                 onMenuOpen, onFullscreen,
                                 bookmarkMode, onBookmark, bookmarked, onReturn,
                                 optionsOpen, onOptionsToggle, onOptionsClose,
                                 prefs, onSet, onFont, soundReady }) {
  const center = label ? `${label} · ${spread + 1}/${total}`
                       : `${spread + 1} / ${total}`;

  const isAuto = bookmarkMode === 'auto';
  const bookmarkTitle = isAuto
    ? 'Marcador automático: la cinta sigue tu lectura. Pulsa para cambiar de modo.'
    : bookmarked ? 'Quitar la cinta de esta página' : 'Poner la cinta en esta página';

  return (
    <header className="bar">
      <div className="bar-l">
        <button className="btn icon-btn" onClick={onMenuOpen} title="Índice" aria-label="Índice">
          <svg viewBox="0 0 24 24">
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
          </svg>
        </button>
        <div className="sep" />
        <button
          className={`btn icon-btn bm-btn${bookmarked ? ' on' : ''}${isAuto ? ' bm-btn--auto' : ''}`}
          onClick={isAuto ? onOptionsToggle : onBookmark}
          title={bookmarkTitle}
          aria-label={bookmarkTitle}
          aria-pressed={isAuto ? undefined : bookmarked}
        >
          <svg viewBox="0 0 24 24">
            <path d="M17 3H7a2 2 0 00-2 2v16l7-3 7 3V5a2 2 0 00-2-2z" />
          </svg>
          {isAuto && <span className="bm-auto" aria-hidden="true">A</span>}
        </button>
        {onReturn && (
          <>
            <div className="sep" />
            <button className="btn bar-return" onClick={onReturn}
                    title="Volver a la página que estabas leyendo">
              ← Volver a la lectura
            </button>
          </>
        )}
      </div>

      <div className="bar-c">{center}</div>

      <div className="bar-r">
        <div className="ro-anchor">
          <button
            className={`btn ro-trigger${optionsOpen ? ' on' : ''}`}
            onClick={onOptionsToggle}
            title="Opciones de lectura"
            aria-label="Opciones de lectura"
            aria-expanded={optionsOpen}
            aria-haspopup="dialog"
          >
            <span className="ro-trigger-a">A</span><span className="ro-trigger-b">a</span>
          </button>
          <ReadingOptions
            open={optionsOpen}
            onClose={onOptionsClose}
            prefs={prefs}
            onSet={onSet}
            onFont={onFont}
            soundReady={soundReady}
          />
        </div>
        <div className="sep" />
        <button className="btn icon-btn" onClick={onFullscreen}
                title="Pantalla completa" aria-label="Pantalla completa">
          <svg viewBox="0 0 16 16">
            <path d="M0 0h5v2H2v3H0V0zm0 11h2v3h3v2H0v-5zm16 5h-5v-2h3v-3h2v5zm0-11h-2V2h-3V0h5z" />
          </svg>
        </button>
      </div>
    </header>
  );
}

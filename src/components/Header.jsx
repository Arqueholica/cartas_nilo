/**
 * Header — barra superior.
 * Sin estado propio: recibe los callbacks y los invoca.
 */
export default function Header({ spread, total, theme, label,
                                 onMenuOpen, onFontUp, onFontDown,
                                 onThemeChange, onFullscreen,
                                 onBookmark, bookmarked }) {
  const center = label ? `${label} · ${spread + 1}/${total}`
                       : `${spread + 1} / ${total}`;

  return (
    <header className="bar">
      <div className="bar-l">
        <button className="btn icon-btn" onClick={onMenuOpen} title="Índice">
          <svg viewBox="0 0 24 24">
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
          </svg>
        </button>
        <div className="sep" />
        <button
          className={`btn icon-btn${bookmarked ? ' on' : ''}`}
          onClick={onBookmark}
          title={bookmarked ? 'Quitar marcador' : 'Poner marcador aquí'}
        >
          <svg viewBox="0 0 24 24">
            <path d="M17 3H7a2 2 0 00-2 2v16l7-3 7 3V5a2 2 0 00-2-2z" />
          </svg>
        </button>
      </div>

      <div className="bar-c">{center}</div>

      <div className="bar-r">
        <div className="fsz">
          <button className="btn" onClick={onFontDown}>A−</button>
          <button className="btn" onClick={onFontUp}>A+</button>
        </div>
        <div className="sep" />
        <div className="dots">
          {['sepia', 'light', 'dark'].map((t) => (
            <div
              key={t}
              className={`dot${theme === t ? ' on' : ''}`}
              data-t={t}
              title={t}
              onClick={() => onThemeChange(t)}
            />
          ))}
        </div>
        <div className="sep" />
        <button className="btn icon-btn" onClick={onFullscreen}
                title="Pantalla completa">
          <svg viewBox="0 0 16 16">
            <path d="M0 0h5v2H2v3H0V0zm0 11h2v3h3v2H0v-5zm16 5h-5v-2h3v-3h2v5zm0-11h-2V2h-3V0h5z" />
          </svg>
        </button>
      </div>
    </header>
  );
}

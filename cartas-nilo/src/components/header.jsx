import React from "react";
import AmbientAudio from "./book/AmbientAudio";

const Header = ({
    spread,
    total,
    onToggleToc,
    onToggleReader,
    onFontUp,
    onFontDown,
    onThemeChange,
    theme
}) => {

    const getPageLabel = () => {
        if (spread === 0) return "Portada";

        const left = spread * 2 - 1;
        const right = spread * 2;
        const totalPages = (total - 1) * 2;

        return `${left}–${right} / ${totalPages}`;
    };

    return (
        <header className="bar">
            {/* LEFT */}
            <div className="bar-l">
                <button className="btn" onClick={onToggleToc} title="Índice">
                    <svg viewBox="0 0 24 24">
                        <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
                    </svg>
                </button>

                <button className="btn" onClick={onToggleReader} title="Mis notas">
                    <svg viewBox="0 0 24 24">
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                    </svg>
                    <span>Mis notas</span>
                </button>
            </div>

            {/* CENTER */}
            <div className="bar-c">
                <span className="pg-ind">{getPageLabel()}</span>
            </div>

            {/* RIGHT */}

            <div className="bar-r">
                <AmbientAudio />
                <div className="fsz">
                    <button className="btn" onClick={onFontDown}>A−</button>
                    <button className="btn" onClick={onFontUp}>A+</button>
                </div>

                <div className="dots">
                    <div
                        className={`dot ${theme === "sepia" ? "on" : ""}`}
                        onClick={() => onThemeChange("sepia")}
                        title="Sepia"
                    />
                    <div
                        className={`dot ${theme === "light" ? "on" : ""}`}
                        onClick={() => onThemeChange("light")}
                        title="Claro"
                    />
                    <div
                        className={`dot ${theme === "dark" ? "on" : ""}`}
                        onClick={() => onThemeChange("dark")}
                        title="Oscuro"
                    />
                </div>
            </div>
        </header>
    );
};

export default Header;
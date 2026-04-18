function Header() {
    return (
        <header>
            <div class="bar-l">
                <button class="btn" id="tocBtn" title="Índice">
                    <svg viewBox="0 0 24 24"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" /></svg>
                </button>
                <button class="btn" id="readerBtn" title="Mis notas">
                    <svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" /></svg>
                    <span>Mis notas</span>
                </button>
            </div>
            <div class="bar-c">
                <span class="pg-ind" id="pgInd">Portada</span>
            </div>
            <div class="bar-r">
                <div class="fsz">
                    <button class="btn" id="fontDn">A−</button>
                    <button class="btn" id="fontUp">A+</button>
                </div>
                <div class="dots">
                    <div class="dot on" data-t="sepia" title="Sepia"></div>
                    <div class="dot" data-t="light" title="Claro"></div>
                    <div class="dot" data-t="dark" title="Oscuro"></div>
                </div>
            </div>
        </header>
    )
}

export default Header
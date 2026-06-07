import Spread from "./spread";
import Page from "./page";
import InlineNote from "./InlineNote";
import NotesPanel from "../NotesPanel";
import { useNotes } from "../NotesContext";
import { letterContent } from "../../data/letterContent";

/**
 * Componente principal del Libro.
 * Renderiza de forma dinámica y declarativa los pliegos (Spreads) y páginas (Pages)
 * a partir de la estructura de datos en `letterContent.js`.
 */
const Book = ({ spread, flipping, flipDirection, next, prev, readerOpen }) => {
    const { highlightNote } = useNotes();

    // Gestor de clics en las llamadas de notas al pie
    const handleSupClick = (e) => {
        const sup = e.target.closest("sup.fn");
        if (sup) {
            highlightNote(parseInt(sup.dataset.n, 10));
        }
    };

    /**
     * Renderizador dinámico de páginas según su tipo (portadilla, portada, contenido o fin).
     */
    const renderPage = (side, pageData) => {
        if (!pageData) return null;

        switch (pageData.type) {
            case "halftitle":
                return (
                    <Page side={side} className="pg-halftitle">
                        <div className="ht-orn">{pageData.ornament}</div>
                        <div className="ht-book">{pageData.bookTitle}</div>
                        <div className="ht-orn2">{pageData.divider}</div>
                    </Page>
                );

            case "cover":
                return (
                    <Page side={side}>
                        <div className="cover">
                            <div className="orn">{pageData.ornament}</div>
                            <div className="bk">{pageData.bookTitle}</div>
                            <div className="ct">{pageData.subtitle}</div>
                            <div className="num">{pageData.number}</div>
                            <div className="dv">{pageData.dedication}</div>
                            <div className="lc">{pageData.location}</div>
                            <div className="au">{pageData.author}</div>
                            <div className="o2">{pageData.divider}</div>
                            <div className="go" id="startRead" onClick={next}>
                                {pageData.buttonText}
                            </div>
                        </div>
                    </Page>
                );

            case "end":
                return (
                    <Page side={side} className="pg-end">
                        <div>
                            <div
                                style={{
                                    color: "var(--accent)",
                                    fontSize: "2.2rem",
                                    marginBottom: "18px",
                                    opacity: 0.4
                                }}
                            >
                                {pageData.content.ornament}
                            </div>
                            <p style={{ marginBottom: "6px" }}>
                                {pageData.content.author}
                            </p>
                            <p
                                style={{
                                    fontSize: ".82rem",
                                    color: "var(--text-muted)",
                                    marginBottom: "16px",
                                    fontStyle: "normal"
                                }}
                            >
                                <em>{pageData.content.bookTitle}</em>
                            </p>
                            <p
                                style={{
                                    fontFamily: "var(--font-ui)",
                                    fontSize: ".68rem",
                                    color: "var(--text-muted)",
                                    letterSpacing: "1px",
                                    textTransform: "uppercase"
                                }}
                            >
                                {pageData.content.date}
                            </p>
                        </div>
                    </Page>
                );

            case "content":
            default:
                return (
                    <Page side={side} className={pageData.className || ""}>
                        {pageData.header && (
                            <div className="hdr">
                                <p className="sub">{pageData.header.sub}</p>
                                <h1>{pageData.header.title}</h1>
                                <p className="ded">{pageData.header.dedication}</p>
                                <p className="loc">{pageData.header.location}</p>
                            </div>
                        )}

                        {pageData.blocks.map((block, idx) => {
                            switch (block.type) {
                                case "paragraph":
                                    return (
                                        <p
                                            key={idx}
                                            className={`bt ${block.className || ""}`}
                                            dangerouslySetInnerHTML={{ __html: block.text }}
                                        />
                                    );
                                case "verse":
                                    return (
                                        <div key={idx} className="verse">
                                            <span dangerouslySetInnerHTML={{ __html: block.text }} />
                                            <span className="tr">{block.translation}</span>
                                        </div>
                                    );
                                case "inlineNote":
                                    return (
                                        <InlineNote
                                            key={idx}
                                            title={block.title}
                                            layout={block.layout}
                                            images={block.images}
                                            caption={block.caption}
                                        />
                                    );
                                case "divider":
                                    return (
                                        <div key={idx} className="divider">
                                            {block.text}
                                        </div>
                                    );
                                case "footer":
                                    return (
                                        <p key={idx} style={block.style}>
                                            {block.text}
                                        </p>
                                    );
                                default:
                                    return null;
                            }
                        })}

                        {pageData.pageNumber && (
                            <span className="pn">{pageData.pageNumber}</span>
                        )}
                    </Page>
                );
        }
    };

    return (
        <div className={`shell ${readerOpen ? "rp-open" : ""}`} id="shell" onClick={handleSupClick}>
            <button
                type="button"
                className={`nav nav-p ${spread === 0 ? "off" : ""}`}
                onClick={prev}
            >
                ←
            </button>
            <div className="codex" id="codex">
                {/* Lomo (Spine) */}
                <div className="spine" />

                {/* Panel de notas al pie */}
                <NotesPanel spread={spread} />

                {/* Renderizar pliegos dinámicamente */}
                {letterContent.map((spreadData, idx) => (
                    <Spread
                        key={idx}
                        active={spread === idx}
                        flipping={flipping}
                        direction={flipDirection}
                        left={renderPage("left", spreadData.left)}
                        right={renderPage("right", spreadData.right)}
                    />
                ))}
            </div>
            <button
                type="button"
                className={`nav nav-n ${spread === letterContent.length - 1 ? "off" : ""}`}
                style={readerOpen ? { right: "calc(var(--reader-w) + 8px)" } : {}}
                onClick={next}
            >
                →
            </button>
        </div>
    );
};

export default Book;
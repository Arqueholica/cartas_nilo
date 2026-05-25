import { useEffect, useRef } from "react";
import { FN, spreadFN } from "../data/footnotes";
import { useNotes } from "./NotesContext";

export default function NotesPanel({ spread }) {
    const { open, setOpen, highlighted, setHighlighted } = useNotes();
    const scrollRef = useRef(null);

    const [left, right] = spreadFN[spread] || [[], []];
    const notes = [...left, ...right];

    // Scroll al item resaltado cada vez que cambia
    useEffect(() => {
        if (!highlighted || !scrollRef.current) return;
        const item = scrollRef.current.querySelector(`.np-item[data-n="${highlighted}"]`);
        if (item) {
            item.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    }, [highlighted]);

    // Cerrar panel de notas cuando cambia el spread (pasar página)
    useEffect(() => {
        setOpen(false);
    }, [spread, setOpen]);

    // Cerrar panel de notas al hacer clic fuera del panel y tabulador
    useEffect(() => {
        if (!open) return;
        const handleOutsideClick = (e) => {
            if (
                !e.target.closest(".notes-pull") &&
                !e.target.closest(".notes-tab") &&
                !e.target.closest("sup.fn")
            ) {
                setOpen(false);
            }
        };
        document.addEventListener("click", handleOutsideClick);
        return () => document.removeEventListener("click", handleOutsideClick);
    }, [open, setOpen]);

    // Limpiar el resaltado al interactuar o desplazarse manualmente
    const handleUserScroll = () => {
        if (highlighted) {
            setHighlighted(null);
        }
    };

    if (!notes.length) return null;

    return (
        <div className="notes-zone" id="notesZone">
            {/* TAB */}
            <div
                className={`notes-tab ${open ? "open" : ""}`}
                id="notesTab"
                onClick={() => setOpen(!open)}
            >
                Notas
            </div>

            {/* PANEL */}
            <div className={`notes-pull ${open ? "open" : ""}`} id="notesPull">
                <div className="np-head">
                    <h3>Notas</h3>
                    <button className="np-x" id="npX" onClick={() => setOpen(false)}>×</button>
                </div>

                <div
                    className={`np-scroll ${highlighted ? "focusing" : ""}`}
                    id="npScroll"
                    ref={scrollRef}
                    onWheel={handleUserScroll}
                    onTouchMove={handleUserScroll}
                >
                    {notes.map((n) => (
                        <div
                            key={n}
                            className={`np-item ${highlighted === n ? "hl" : ""}`}
                            data-n={n}
                        >
                            <span className="np-num">{n}</span>
                            <p
                                className="np-text"
                                dangerouslySetInnerHTML={{ __html: FN[n] }}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

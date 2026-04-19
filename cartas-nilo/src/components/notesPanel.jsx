import { FN, spreadFN } from "../data/footnotes";

export default function NotesPanel({ spread }) {
    const [open, setOpen] = useState(false);

    const [left, right] = spreadFN[spread] || [[], []];
    const notes = [...left, ...right];

    if (!notes.length) return null;

    return (
        <div className="notes-zone">
            {/* TAB */}
            <div
                className={`notes-tab ${open ? "open" : ""}`}
                onClick={() => setOpen(!open)}
            >
                NOTAS
            </div>

            {/* PANEL */}
            <div className={`notes-pull ${open ? "open" : ""}`}>
                <div className="np-head">
                    <h3>Notas</h3>
                    <button onClick={() => setOpen(false)}>×</button>
                </div>

                <div className="np-scroll">
                    {notes.map((n, i) => (
                        <div key={n} className="np-item">
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
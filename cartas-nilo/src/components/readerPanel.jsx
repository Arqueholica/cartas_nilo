import { useEffect, useRef } from "react";

const toRoman = (n) => {
    const vals = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
    const rom = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I'];
    let s = '';
    for (let i = 0; i < vals.length; i++) {
        while (n >= vals[i]) {
            s += rom[i];
            n -= vals[i];
        }
    }
    return s;
};

const ReaderPanel = ({ spread, open, onClose, notes = {}, setNotes }) => {
    const key = "s" + spread;
    const currentNotes = notes[key] || [];
    const prevLength = useRef(currentNotes.length);

    // Auto-focus last textarea when a note is added
    useEffect(() => {
        if (currentNotes.length > prevLength.current) {
            setTimeout(() => {
                const tas = document.querySelectorAll(".rn-ta");
                if (tas.length) {
                    tas[tas.length - 1].focus();
                }
            }, 50);
        }
        prevLength.current = currentNotes.length;
    }, [currentNotes.length]);

    const addNote = () => {
        const now = new Date();
        const ts = now.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) +
                   ' ' + now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

        const updated = {
            ...notes,
            [key]: [...currentNotes, { text: "", time: ts }]
        };

        setNotes(updated);
    };

    const updateNote = (i, text) => {
        const updatedList = [...currentNotes];
        updatedList[i].text = text;

        setNotes({
            ...notes,
            [key]: updatedList
        });
    };

    const deleteNote = (i) => {
        const updatedList = currentNotes.filter((_, idx) => idx !== i);

        const updated = { ...notes };
        if (updatedList.length) {
            updated[key] = updatedList;
        } else {
            delete updated[key];
        }

        setNotes(updated);
    };

    const getLabel = () => {
        if (spread === 0) return "Portada";
        return `Páginas ${spread * 2 - 1}–${spread * 2}`;
    };

    return (
        <div className={`reader-panel ${open ? "open" : ""}`}>
            <div className="rp-head">
                <h3>✏️ Mis notas de lectura</h3>
                <button className="rp-x" onClick={onClose}>&times;</button>
            </div>

            <div className="rp-body">
                <div className="rn-pg">{getLabel()}</div>

                {currentNotes.map((n, i) => (
                    <div key={i} className="rn-entry">
                        <div className="rn-top">
                            <span className="rn-num">{toRoman(i + 1)}</span>
                            <span className="rn-time">{n.time}</span>
                            <button className="rn-del" onClick={() => deleteNote(i)}>×</button>
                        </div>

                        <textarea
                            className="rn-ta"
                            value={n.text}
                            onChange={(e) => updateNote(i, e.target.value)}
                        />
                    </div>
                ))}

                <button className="rn-add" onClick={addNote}>
                    + Añadir nota {toRoman(currentNotes.length + 1)}
                </button>
            </div>
        </div>
    );
};

export default ReaderPanel;
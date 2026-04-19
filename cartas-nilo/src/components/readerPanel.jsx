import { useEffect, useState } from "react";

const STORAGE_KEY = "cartaVI_reader_notes";

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

const ReaderPanel = ({ spread, open, onClose }) => {
    const [notes, setNotes] = useState({});

    // ---- LOAD ----
    useEffect(() => {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) setNotes(JSON.parse(raw));
    }, []);

    // ---- SAVE ----
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    }, [notes]);

    const key = "s" + spread;
    const currentNotes = notes[key] || [];

    const addNote = () => {
        const now = new Date();
        const ts =
            now.toLocaleDateString("es-ES") + " " +
            now.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });

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
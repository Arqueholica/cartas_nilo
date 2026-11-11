import { useRef, useEffect, useState } from 'react';
import NoteBody from './book/blocks/NoteBody';

/**
 * NotesPanel — notas al margen de la doble página actual.
 *
 * Al pulsar una llamada de nota en el texto, el panel se abre, se
 * desplaza hasta esa nota y la resalta mientras difumina las demás
 * durante unos segundos.
 *
 * Las remisiones («véase la nota 11 de la Carta V») se despliegan en el
 * sitio: la nota remitida aparece justo debajo, sangrada y con tinte
 * propio, sin sacar al lector de donde está.
 *
 * En pantallas en vertical el panel se presenta como una hoja que sube
 * desde abajo (lo decide el CSS con data-layout y data-orientation): se
 * cierra tocando fuera o deslizando su cabecera hacia abajo.
 *
 * (Las notas del lector están desactivadas por ahora.)
 */
export default function NotesPanel({ open, onClose, footnotes, spreadNotes,
                                     cartaLabel = '', highlightNote, hidden,
                                     allFootnotes = {} }) {
  const scrollRef = useRef(null);
  const [openRefs, setOpenRefs] = useState({});

  const notes = [...new Set([...(spreadNotes || [])])];

  // Enfocar la nota pulsada
  useEffect(() => {
    if (!highlightNote || !open) return;
    const t = setTimeout(() => {
      const el = scrollRef.current?.querySelector(`[data-note="${highlightNote}"]`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 120);
    return () => clearTimeout(t);
  }, [highlightNote, open]);

  // Al cambiar de doble página, replegar las remisiones
  useEffect(() => { setOpenRefs({}); }, [spreadNotes]);

  // En vertical el panel es una hoja inferior: deslizar su cabecera hacia
  // abajo la cierra
  const sheetY = useRef(null);
  const onSheetStart = (e) => { sheetY.current = e.changedTouches[0].clientY; };
  const onSheetEnd = (e) => {
    if (sheetY.current !== null && e.changedTouches[0].clientY - sheetY.current > 50) onClose(false);
    sheetY.current = null;
  };

  const toggleRef = (key) =>
    setOpenRefs((prev) => ({ ...prev, [key]: !prev[key] }));

  /** Texto de una nota remitida: clave «V-11» */
  const resolveRef = (key) => {
    const [carta, num] = key.split('-');
    const note = allFootnotes?.[carta]?.[num];
    if (!note) return null;
    return { carta, num, text: typeof note === 'string' ? note : note.text };
  };

  if (hidden) return null;

  const focusing = Boolean(highlightNote);

  return (
    <>
      <div className="ns-pull-tab" onClick={() => onClose(!open)}>Notas</div>

      {/* Fondo de la hoja inferior (solo en vertical): tocarlo la cierra */}
      <div className={`notes-backdrop${open ? ' open' : ''}`} onClick={() => onClose(false)} />

      <aside className={`notes-col${open ? ' open' : ''}`}>
        <div className="nc-head" onTouchStart={onSheetStart} onTouchEnd={onSheetEnd}>
          <span className="nc-title">
            Notas al margen
            {cartaLabel && <small className="nc-sub"> · {cartaLabel}</small>}
          </span>
          <button className="nc-x" onClick={() => onClose(false)}>&times;</button>
        </div>

        <div className={`nc-scroll${focusing ? ' focusing' : ''}`} ref={scrollRef}>
          {notes.length ? notes.map((n, i) => {
            const note = footnotes?.[n];
            if (!note) return null;
            const body = typeof note === 'string' ? note : (note.text || '');
            const hl = String(highlightNote) === String(n);

            // Remisiones citadas por esta nota y actualmente desplegadas
            const shown = Object.keys(openRefs)
              .filter((k) => openRefs[k] && body.includes(` ${k.split('-')[1]} de la Carta ${k.split('-')[0]}`))
              .map(resolveRef)
              .filter(Boolean);

            return (
              <div
                key={n}
                data-note={n}
                className={`mn-item${hl ? ' hl' : ''}`}
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                <span className="mn-num">{n}</span>
                {note.inPrint === false && (
                  <span className="mn-only-digital"
                        title="No incluida en la edición impresa">
                    solo digital
                  </span>
                )}

                <NoteBody text={body} onToggleRef={toggleRef} />

                {shown.map((r) => (
                  <div className="xref-note" key={`${r.carta}-${r.num}`}>
                    <span className="xref-note-head">
                      Carta {r.carta} · nota {r.num}
                    </span>
                    <NoteBody text={r.text} onToggleRef={toggleRef} />
                  </div>
                ))}

                {note.image && (
                  <figure className="mn-fig">
                    <img src={note.image} alt={note.caption || ''} loading="lazy" />
                    {note.caption && <figcaption>{note.caption}</figcaption>}
                  </figure>
                )}
              </div>
            );
          }) : (
            <p className="nc-empty">Sin notas al margen en estas páginas.</p>
          )}
        </div>
      </aside>
    </>
  );
}

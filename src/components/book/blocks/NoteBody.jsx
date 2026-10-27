/**
 * NoteBody — texto de una nota al margen.
 *
 * Además de los marcadores habituales ([em:…] y [ht:…]), reconoce las
 * remisiones del tipo «véase la nota 11 de la Carta V» y las convierte
 * en un enlace que despliega esa nota ahí mismo, sin mover al lector
 * de donde está.
 */

// «Véase la nota 11 de la Carta V», «véase nota 2 de la Carta III»…
const XREF = /v[ée]ase(?:\s+(?:la|en\s+la))?\s+nota\s+(\d+)\s+de\s+la\s+carta\s+([IVXLC]+)/gi;

/** Parte un texto plano en fragmentos, aislando las remisiones */
function splitXrefs(text, keyBase, onToggle) {
  const out = [];
  let last = 0;
  let m;
  XREF.lastIndex = 0;
  while ((m = XREF.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const num = m[1];
    const carta = m[2].toUpperCase();
    out.push(
      <button
        key={`${keyBase}-x${m.index}`}
        className="xref"
        onClick={() => onToggle(`${carta}-${num}`)}
        title={`Ver la nota ${num} de la Carta ${carta}`}
      >
        {m[0]}
      </button>
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export default function NoteBody({ text, onToggleRef }) {
  if (!text) return null;

  const nodes = [];
  const pattern = /\[(em|ht):([^\]]*)\]/g;
  let last = 0;
  let m;
  let i = 0;

  while ((m = pattern.exec(text)) !== null) {
    if (m.index > last) {
      nodes.push(...splitXrefs(text.slice(last, m.index), `p${i++}`, onToggleRef));
    }
    const inner = splitXrefs(m[2], `m${i++}`, onToggleRef);
    nodes.push(
      m[1] === 'em'
        ? <em key={`e${m.index}`}>{inner}</em>
        : <strong key={`h${m.index}`} className="ht">{inner}</strong>
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) {
    nodes.push(...splitXrefs(text.slice(last), `p${i++}`, onToggleRef));
  }

  return <p className="mn-text">{nodes}</p>;
}

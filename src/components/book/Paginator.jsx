import { useLayoutEffect, useRef, useState, useCallback } from 'react';
import BlockRenderer from './blocks/BlockRenderer';

/**
 * Paginator — reparte el contenido en páginas midiendo lo que cabe.
 *
 * Renderiza todos los bloques en una caja oculta con las mismas medidas
 * y tipografía que una página real, mide la altura de cada uno y los
 * agrupa en páginas que nunca desbordan.
 *
 * Se recalcula cuando cambia el tamaño de letra o el de la ventana, de
 * modo que el texto siempre queda dentro de la caja.
 *
 * Props:
 *   letters   [{ id, number, blocks, footnotes, … }]
 *   boxWidth  ancho útil de la caja de texto, en px
 *   boxHeight alto útil de la caja de texto, en px
 *   signal    valor que, al cambiar, fuerza una nueva medición
 *   onPages   callback con las páginas calculadas
 */
export default function Paginator({ letters, boxWidth, boxHeight, signal, onPages }) {
  const ref = useRef(null);
  const [done, setDone] = useState(false);

  // Lista plana de todos los bloques, con su carta de origen
  const flat = [];
  letters.forEach((L, li) => {
    L.blocks.forEach((b, bi) => flat.push({ block: b, li, bi }));
  });

  const measure = useCallback(() => {
    const host = ref.current;
    if (!host || !boxHeight) return;

    const els = Array.from(host.children);
    const heights = els.map((el) => {
      const cs = getComputedStyle(el);
      return el.offsetHeight +
             parseFloat(cs.marginTop || 0) +
             parseFloat(cs.marginBottom || 0);
    });

    const pages = [];
    let cur = null;
    let used = 0;

    const newPage = (li, tone) => {
      cur = { letterIndex: li, blocks: [], tone };
      pages.push(cur);
      used = 0;
      return cur;
    };

    flat.forEach((item, i) => {
      const h = heights[i] || 0;
      const isNotePage = item.block.type === 'full-note';
      const sameLetter = cur && cur.letterIndex === item.li;

      if (isNotePage) {
        // La nota completa ocupa una página para ella sola
        newPage(item.li, 'note').blocks.push(item.block);
        cur = null;            // lo siguiente abre página nueva
        return;
      }

      if (!sameLetter || cur === null) {
        newPage(item.li);
      } else if (used > 0 && used + h > boxHeight) {
        newPage(item.li);
      }

      cur.blocks.push(item.block);
      used += h;
    });

    onPages(pages);
    setDone(true);
  }, [flat.length, boxHeight, boxWidth, onPages]);

  useLayoutEffect(() => {
    setDone(false);
    // dos cuadros para que las fuentes web ya estén aplicadas
    const id = requestAnimationFrame(() => requestAnimationFrame(measure));
    return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signal, boxHeight, boxWidth, letters]);

  if (done) return null;

  return (
    <div className="pg-measure-host" aria-hidden="true">
      <div
        ref={ref}
        className="pg-box pg-measure"
        style={{ width: boxWidth ? `${boxWidth}px` : '100%' }}
      >
        {flat.map((item, i) => (
          <BlockRenderer key={i} block={item.block} />
        ))}
      </div>
    </div>
  );
}

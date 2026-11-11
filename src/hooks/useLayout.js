import { useState, useEffect } from 'react';

/**
 * useLayout — cómo se presenta el libro en esta pantalla
 *
 * Decide la vista por el ESPACIO disponible, no por el tipo de aparato,
 * y la orientación forma parte de la decisión:
 *
 *   doble página  horizontal, con ancho y alto suficientes para que cada
 *                 página se lea cómoda (ordenador, tableta en horizontal)
 *   página única  todo lo demás: móvil y tableta en vertical, móvil en
 *                 horizontal (demasiado bajo para dos páginas)
 *
 * Además informa de la orientación y del tipo de puntero (dedo o ratón),
 * porque cambian cómo se navega: con el dedo se pasa página tocando los
 * bordes o deslizando, y las flechas sobran.
 *
 * Los tres datos se publican como atributos de <html>, para que el CSS
 * use la misma decisión que el código en vez de repetirla con sus
 * propios cortes:
 *   data-layout="spread | single"
 *   data-orientation="landscape | portrait"
 *   data-pointer="fine | coarse"
 */

/** Umbrales de la doble página, en px de ventana */
export const SPREAD_MIN = { width: 900, height: 520 };

function read() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const orientation = w > h ? 'landscape' : 'portrait';
  const layout = orientation === 'landscape'
    && w >= SPREAD_MIN.width && h >= SPREAD_MIN.height ? 'spread' : 'single';
  let pointer = 'fine';
  try { if (window.matchMedia('(pointer: coarse)').matches) pointer = 'coarse'; } catch { /* sin matchMedia */ }
  return { layout, orientation, pointer };
}

function publish(s) {
  const d = document.documentElement.dataset;
  d.layout = s.layout;
  d.orientation = s.orientation;
  d.pointer = s.pointer;
}

export function useLayout() {
  // Se publica ya en el primer render, para que el CSS no parpadee
  const [state, setState] = useState(() => { const s = read(); publish(s); return s; });

  useEffect(() => {
    const update = () => setState((s) => {
      const n = read();
      return n.layout === s.layout && n.orientation === s.orientation
        && n.pointer === s.pointer ? s : n;
    });
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    let mq;
    try {
      mq = window.matchMedia('(pointer: coarse)');
      mq.addEventListener?.('change', update);
    } catch { /* sin matchMedia */ }
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
      mq?.removeEventListener?.('change', update);
    };
  }, []);

  useEffect(() => { publish(state); }, [state]);

  return state;
}

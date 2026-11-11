/**
 * Book — orquestador del libro
 * Recibe los spreads del archivo de datos y gestiona:
 *   · qué spread es visible
 *   · la animación de flip
 *   · el lightbox de imágenes
 *   · la apertura del panel de notas al margen
 */
import { useState } from 'react';
import Spread    from './Spread';

/** Fracción del ancho de la página que funciona como borde táctil */
const EDGE = 0.25;
import Lightbox  from '../Lightbox';

export default function Book({ spreads, spread, flipping, flipDirection,
                                next, prev, onNoteClick,
                                onTermClick, glossaryTerms, activeTerm, onReturn,
                                ribbon, ribbonHere, onRibbonClick }) {
  const [lb, setLb] = useState({ open: false, src: '', caption: '' });

  const openLightbox  = (src, caption) => setLb({ open: true, src, caption });

  // Una sola página a la vista: portada, colofón o página sola
  const oneUp = Boolean(spreads[spread]?.single || spreads[spread]?.solo);

  /* Con el dedo se pasa página tocando el borde de la página, como en
     los lectores de libros electrónicos: el cuarto izquierdo retrocede,
     el cuarto derecho avanza. No cuenta si se toca algo que ya hace algo
     (una llamada de nota, un término, una nota integrada, una imagen,
     la cinta…) ni si se está seleccionando texto. Con ratón no se usa:
     ahí están las flechas. */
  const onTap = (e) => {
    if (document.documentElement.dataset.pointer !== 'coarse') return;
    if (e.target.closest('a, button, input, sup, img, [role="button"], .inl, .ribbon, .ht-link, .fnp-fig, .gallery-img-wrap')) return;
    if (String(window.getSelection?.() || '').length) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    if (x < EDGE) prev();
    else if (x > 1 - EDGE) next();
  };
  const closeLightbox = () => setLb({ open: false, src: '', caption: '' });

  return (
    <div className="shell" id="shell">
      {/* Flecha izquierda */}
      <button
        className={`nav nav-p${spread === 0 ? ' off' : ''}`}
        onClick={prev}
        aria-label="Página anterior"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="2.5">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      {/* Libro */}
      <div className={`codex${oneUp ? ' codex--single' : ''}`} id="codex" onClick={onTap}>
        {!oneUp && <div className="spine" />}

        {/* Capa de flip animado */}
        <div className={`flip-layer${flipping ? ` flipping${flipDirection === 'backward' ? '-back' : ''}` : ''}`}
             id="flipLayer">
          <div className="flip-front" />
          <div className="flip-back" />
        </div>
        <div className="under-shadow" />

        {/* Cinta del marcador: nace del lomo y cae entre las dos páginas */}
        {ribbon !== null && !spreads[spread]?.single && (
          <button
            className={`ribbon${ribbonHere ? ' ribbon--here' : ''}`}
            onClick={onRibbonClick}
            title={ribbonHere ? 'Estás en tu marcador' : 'Ir al marcador'}
            aria-label="Marcador de lectura"
          >
            <span className="ribbon-tail" />
          </button>
        )}

        {/* Spreads — solo el activo se renderiza */}
        {spreads.map((spreadData, i) => (
          <Spread
            key={i}
            data={spreadData}
            active={i === spread}
            onNoteClick={onNoteClick}
            onLightbox={openLightbox}
            onStart={() => next()}   // botón "Comenzar lectura" en la portada
            onTermClick={onTermClick}
            glossaryTerms={glossaryTerms}
            activeTerm={activeTerm}
            onReturn={onReturn}
          />
        ))}
      </div>

      {/* Flecha derecha */}
      <button
        className={`nav nav-n${spread === spreads.length - 1 ? ' off' : ''}`}
        onClick={next}
        aria-label="Página siguiente"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="2.5">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      {/* Lightbox */}
      <Lightbox {...lb} onClose={closeLightbox} />
    </div>
  );
}

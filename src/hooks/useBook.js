/**
 * useBook — gestión de navegación del libro
 * Encapsula: spread actual, flip, teclado, swipe táctil
 * Diseñado para ser agnóstico del contenido.
 *
 * Opciones (las fija el lector en «Opciones de lectura»):
 *   animate  pasar página con animación (si no, el cambio es inmediato)
 *   sound    sonido al pasar página (requiere /audio/page-turn.mp3)
 *
 * `jumpTo` cambia de doble página sin animación ni sonido: lo usa el
 * lector para recolocarse cuando el libro se repagina (al cambiar el
 * tamaño de letra o de ventana), sin que parezca que se ha pasado página.
 */
import { useState, useCallback, useEffect, useRef } from 'react';

export function useBook(totalSpreads, { animate = true, sound = false } = {}) {
  const [spread, setSpread]           = useState(0);
  const [flipping, setFlipping]       = useState(false);
  const [flipDirection, setFlipDir]   = useState(null);
  const flipAudio                     = useRef(null);

  // Precargar sonido de pasar página (solo si el lector lo quiere)
  useEffect(() => {
    if (!sound) return undefined;
    const audio = new Audio('/audio/page-turn.mp3');
    audio.preload = 'auto';
    audio.volume  = 0.15;
    flipAudio.current = audio;
    return () => { audio.pause(); flipAudio.current = null; };
  }, [sound]);

  const playFlip = useCallback(() => {
    const audio = flipAudio.current;
    if (!audio) return;
    const clone = audio.cloneNode();
    clone.volume = audio.volume;
    clone.play().catch(() => { audio.currentTime = 0; audio.play().catch(() => {}); });
  }, []);

  const goTo = useCallback((idx) => {
    if (flipping || idx === spread || idx < 0 || idx >= totalSpreads) return;
    if (sound) playFlip();
    if (!animate) { setSpread(idx); return; }
    setFlipping(true);
    setFlipDir(idx > spread ? 'forward' : 'backward');
    setTimeout(() => {
      setSpread(idx);
      setFlipping(false);
      setFlipDir(null);
    }, 900);
  }, [spread, flipping, totalSpreads, playFlip, animate, sound]);

  const jumpTo = useCallback((idx) => {
    if (idx < 0 || idx >= totalSpreads) return;
    setSpread(idx);
  }, [totalSpreads]);

  const next = useCallback(() => goTo(spread + 1), [goTo, spread]);
  const prev = useCallback(() => goTo(spread - 1), [goTo, spread]);

  // Teclado
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); next(); }
      if (e.key === 'ArrowLeft')                   { e.preventDefault(); prev(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next, prev]);

  // Swipe táctil
  useEffect(() => {
    let tx = 0, ty = 0;
    const onStart = (e) => { tx = e.changedTouches[0].screenX; ty = e.changedTouches[0].screenY; };
    const onEnd   = (e) => {
      const dx = e.changedTouches[0].screenX - tx;
      const dy = e.changedTouches[0].screenY - ty;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) dx < 0 ? next() : prev();
    };
    const el = document.getElementById('shell');
    el?.addEventListener('touchstart', onStart, { passive: true });
    el?.addEventListener('touchend',   onEnd,   { passive: true });
    return () => {
      el?.removeEventListener('touchstart', onStart);
      el?.removeEventListener('touchend',   onEnd);
    };
  }, [next, prev]);

  return { spread, flipping, flipDirection, goTo, jumpTo, next, prev };
}

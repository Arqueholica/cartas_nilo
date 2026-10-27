import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * useBookmark — memoria del punto de lectura
 *
 * Dos mecanismos complementarios:
 *   · automático: guarda siempre la última página leída y, al volver,
 *     ofrece retomarla
 *   · manual: una cinta que el lector coloca en un punto concreto
 *
 * Se guarda por libro, de modo que cada título recuerda el suyo.
 */
const KEY = 'linotipo_bookmarks_v1';

function load() {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}'); }
  catch { return {}; }
}

function save(data) {
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch {}
}

export function useBookmark(bookSlug, spread, totalSpreads) {
  const [ribbon, setRibbon]   = useState(null);   // marca manual
  const [resume, setResume]   = useState(null);   // oferta de retomar
  const loaded                = useRef(false);

  // Al abrir: leer lo guardado y proponer retomar
  useEffect(() => {
    const all = load()[bookSlug] || {};
    setRibbon(typeof all.ribbon === 'number' ? all.ribbon : null);
    if (typeof all.last === 'number' && all.last > 0) setResume(all.last);
    loaded.current = true;
  }, [bookSlug]);

  // Guardar la última página leída, una vez cargado
  useEffect(() => {
    if (!loaded.current) return;
    const all = load();
    all[bookSlug] = { ...(all[bookSlug] || {}), last: spread };
    save(all);
  }, [bookSlug, spread]);

  const toggleRibbon = useCallback(() => {
    setRibbon((prev) => {
      const next = prev === spread ? null : spread;
      const all = load();
      all[bookSlug] = { ...(all[bookSlug] || {}), ribbon: next };
      save(all);
      return next;
    });
  }, [bookSlug, spread]);

  const dismissResume = useCallback(() => setResume(null), []);

  const hasRibbonHere = ribbon === spread;

  return { ribbon, hasRibbonHere, toggleRibbon, resume, dismissResume };
}

import { useState, useEffect, useCallback, useRef } from 'react';
import { spreadAnchor, spreadForAnchor, isAnchor } from '../components/book/anchors';

/**
 * useBookmark — la cinta del marcador
 *
 * Dos modos, a elección del lector en «Opciones de lectura»:
 *   · automático (por defecto): la cinta sigue la lectura y queda
 *     siempre en la última página leída
 *   · manual: la cinta solo está donde el lector la pone
 *
 * En los dos modos, al volver al libro se ofrece continuar desde la
 * cinta.
 *
 * La cinta sigue la LECTURA, no las consultas: visitar el glosario o
 * la galería no la mueve. Desde allí, la cinta asoma entre las páginas
 * y lleva de vuelta al texto con un clic.
 *
 * Las dos posiciones se guardan por libro y como anclas de contenido,
 * no como número de página, de modo que siguen siendo válidas aunque el
 * libro se repagine al cambiar el tamaño de letra o de ventana. Se
 * conservan ambas: cambiar de modo no borra la cinta manual.
 *
 * @param bookSlug  identificador del libro
 * @param o.mode       'auto' | 'manual'
 * @param o.spreads    secuencia de dobles páginas
 * @param o.spread     doble página visible
 * @param o.ready      el libro ya está paginado
 * @param o.isReading  la doble página visible es texto (una carta)
 */
const KEY = 'linotipo_bookmarks_v2';

function load() {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}'); }
  catch { return {}; }
}

function save(slug, data) {
  try {
    const all = load();
    all[slug] = { ...(all[slug] || {}), ...data };
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch { /* modo privado o sin espacio: el marcador dura la sesión */ }
}

export function useBookmark(bookSlug, { mode, spreads, spread, ready, isReading }) {
  const stored = useRef(null);
  if (stored.current === null) {
    const s = load()[bookSlug] || {};
    stored.current = {
      manual: isAnchor(s.manual) ? s.manual : null,
      auto:   isAnchor(s.auto)   ? s.auto   : null,
    };
  }

  const [manual, setManual] = useState(stored.current.manual);
  const [auto,   setAuto]   = useState(stored.current.auto);

  // Oferta de continuar: se decide con lo que había guardado al abrir
  const resumeAnchor = useRef(mode === 'auto' ? stored.current.auto : stored.current.manual);
  const [resumeOpen, setResumeOpen] = useState(Boolean(resumeAnchor.current));

  // Automático: la cinta sigue la lectura (solo páginas de texto)
  useEffect(() => {
    if (!ready || !isReading) return;
    const a = spreadAnchor(spreads[spread]);
    if (!a) return;
    setAuto(a);
    save(bookSlug, { auto: a });
  }, [ready, isReading, spread, spreads, bookSlug]);

  // Si el lector empieza a leer por su cuenta, la oferta sobra
  useEffect(() => {
    if (ready && isReading) setResumeOpen(false);
  }, [ready, isReading]);

  const ribbonAnchor = mode === 'auto' ? auto : manual;
  const ribbon = ready && ribbonAnchor ? spreadForAnchor(spreads, ribbonAnchor) : null;
  const hasRibbonHere = ribbon !== null && ribbon === spread;

  /** Modo manual: poner o quitar la cinta en la doble página visible */
  const toggleRibbon = useCallback(() => {
    if (mode !== 'manual') return;
    const here = spreadAnchor(spreads[spread]);
    const sp = spreads[spread];
    if (!here || sp?.single) return;            // ni portada ni colofón
    const next = hasRibbonHere ? null : here;
    setManual(next);
    save(bookSlug, { manual: next });
  }, [mode, spreads, spread, hasRibbonHere, bookSlug]);

  const resumeSpread = ready && resumeAnchor.current
    ? spreadForAnchor(spreads, resumeAnchor.current) : null;
  const resume = resumeOpen && resumeSpread > 0 && resumeSpread !== spread
    ? resumeSpread : null;

  const dismissResume = useCallback(() => setResumeOpen(false), []);

  return { ribbon, hasRibbonHere, toggleRibbon, resume, dismissResume };
}

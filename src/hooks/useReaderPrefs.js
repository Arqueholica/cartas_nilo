import { useState, useEffect, useCallback } from 'react';

/**
 * useReaderPrefs — opciones de lectura del lector
 *
 * Todo lo que el lector ajusta en «Opciones de lectura» vive aquí y se
 * guarda en su navegador, de modo que al volver encuentra el libro
 * como lo dejó. Son preferencias de la persona, no del libro: valen
 * para todos los títulos.
 *
 *   theme         'sepia' | 'light' | 'dark'
 *   fontStep      pasos sobre el cuerpo de letra base (0 = el del diseño)
 *   bookmarkMode  'auto'   la cinta sigue la lectura
 *                 'manual' la cinta solo está donde el lector la pone
 *   animations    pasar página con animación
 *   sound         sonidos (pasar página; más adelante, ambiente)
 *
 * Cuando haya cuentas de usuario, este es el único sitio que tendrá que
 * leer y escribir en la nube en vez de en el navegador.
 */
const KEY = 'linotipo_prefs_v1';

/** Límites del tamaño de letra, en pasos de 1 px sobre la base */
export const FONT_STEPS = { min: -2, max: 4 };

const reducedMotion = () => {
  try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; }
  catch { return false; }
};

const DEFAULTS = {
  theme:        'sepia',
  fontStep:     0,
  bookmarkMode: 'auto',
  // Si el sistema pide reducir el movimiento, se respeta de entrada
  animations:   !reducedMotion(),
  sound:        false,
};

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '{}');
    return { ...DEFAULTS, ...raw };
  } catch {
    return { ...DEFAULTS };
  }
}

export function useReaderPrefs() {
  const [prefs, setPrefs] = useState(load);

  // Guardar cada cambio
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(prefs)); } catch { /* modo privado */ }
  }, [prefs]);

  // Tema
  useEffect(() => { document.body.dataset.theme = prefs.theme; }, [prefs.theme]);

  // Tamaño de letra: pasos sobre la base del diseño, que a su vez cambia
  // con el ancho de pantalla (ver --font-size-base en el CSS)
  useEffect(() => {
    const root = document.documentElement.style;
    if (prefs.fontStep) root.fontSize = `calc(var(--font-size-base) + ${prefs.fontStep}px)`;
    else root.removeProperty('font-size');
  }, [prefs.fontStep]);

  const set = useCallback((key, value) => {
    setPrefs((p) => (p[key] === value ? p : { ...p, [key]: value }));
  }, []);

  const stepFont = useCallback((delta) => {
    setPrefs((p) => {
      const next = Math.min(FONT_STEPS.max, Math.max(FONT_STEPS.min, p.fontStep + delta));
      return next === p.fontStep ? p : { ...p, fontStep: next };
    });
  }, []);

  return { prefs, set, stepFont };
}

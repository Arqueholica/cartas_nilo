import { useEffect, useRef } from 'react';
import { FONT_STEPS } from '../hooks/useReaderPrefs';

/**
 * ReadingOptions — panel «Opciones de lectura»
 *
 * Reúne todo lo que el lector puede ajustar: tema, tamaño de letra,
 * modo del marcador, animaciones y sonido. Se abre desde el botón «Aa»
 * de la barra superior y se cierra al pulsar fuera o con Escape.
 *
 * No tiene estado propio: lee y escribe las preferencias de
 * useReaderPrefs. Añadir una opción nueva es añadir una fila aquí y una
 * clave en ese hook.
 *
 * Props:
 *   open, onClose
 *   prefs      preferencias actuales
 *   onSet      (clave, valor)
 *   onFont     (±1)
 *   soundReady hay sonidos en el libro (si no, la opción sale como
 *              «próximamente»)
 */
const THEMES = [
  { id: 'sepia', label: 'Sepia' },
  { id: 'light', label: 'Claro' },
  { id: 'dark',  label: 'Oscuro' },
];

const MODES = [
  { id: 'auto',   label: 'Automático',
    hint: 'La cinta sigue tu lectura y queda en la última página que has leído.' },
  { id: 'manual', label: 'Manual',
    hint: 'La cinta solo está donde tú la pones, con el botón del marcador.' },
];

function Switch({ on, onChange, disabled, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      disabled={disabled}
      className={`ro-switch${on ? ' on' : ''}`}
      onClick={() => onChange(!on)}
    >
      <span className="ro-switch-knob" />
    </button>
  );
}

export default function ReadingOptions({ open, onClose, prefs, onSet, onFont, soundReady }) {
  const ref = useRef(null);

  // Cerrar al pulsar fuera o con Escape
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)
          && !e.target.closest('.ro-trigger')) onClose();
    };
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const steps = [];
  for (let s = FONT_STEPS.min; s <= FONT_STEPS.max; s++) steps.push(s);
  const mode = MODES.find((m) => m.id === prefs.bookmarkMode) || MODES[0];

  return (
    <div className="ro-panel" ref={ref} role="dialog" aria-label="Opciones de lectura">
      <div className="ro-title">Opciones de lectura</div>

      {/* Tema */}
      <div className="ro-row">
        <span className="ro-label">Tema</span>
        <div className="ro-themes" role="radiogroup" aria-label="Tema">
          {THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              role="radio"
              aria-checked={prefs.theme === t.id}
              className={`ro-theme${prefs.theme === t.id ? ' on' : ''}`}
              onClick={() => onSet('theme', t.id)}
            >
              <span className="ro-swatch" data-t={t.id} />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tamaño de letra */}
      <div className="ro-row">
        <span className="ro-label">Tamaño de letra</span>
        <div className="ro-font">
          <button type="button" className="ro-font-btn" onClick={() => onFont(-1)}
                  disabled={prefs.fontStep <= FONT_STEPS.min} aria-label="Letra más pequeña">
            A−
          </button>
          <div className="ro-ticks" aria-hidden="true">
            {steps.map((s) => (
              <span key={s} className={`ro-tick${s <= prefs.fontStep ? ' on' : ''}${s === 0 ? ' base' : ''}`} />
            ))}
          </div>
          <button type="button" className="ro-font-btn ro-font-btn--big" onClick={() => onFont(1)}
                  disabled={prefs.fontStep >= FONT_STEPS.max} aria-label="Letra más grande">
            A+
          </button>
        </div>
      </div>

      {/* Marcador */}
      <div className="ro-row ro-row--stack">
        <span className="ro-label">Marcador</span>
        <div className="ro-seg" role="radiogroup" aria-label="Modo del marcador">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              role="radio"
              aria-checked={prefs.bookmarkMode === m.id}
              className={`ro-seg-btn${prefs.bookmarkMode === m.id ? ' on' : ''}`}
              onClick={() => onSet('bookmarkMode', m.id)}
            >
              {m.label}
            </button>
          ))}
        </div>
        <p className="ro-hint">{mode.hint}</p>
      </div>

      <div className="ro-sep" />

      {/* Animaciones */}
      <div className="ro-row">
        <span className="ro-label">
          Animaciones
          <small>Pasar página con movimiento</small>
        </span>
        <Switch on={prefs.animations} onChange={(v) => onSet('animations', v)} label="Animaciones" />
      </div>

      {/* Sonido */}
      <div className={`ro-row${soundReady ? '' : ' ro-row--soon'}`}>
        <span className="ro-label">
          Sonido
          <small>{soundReady ? 'Al pasar página' : 'Próximamente'}</small>
        </span>
        <Switch on={soundReady && prefs.sound} onChange={(v) => onSet('sound', v)}
                disabled={!soundReady} label="Sonido" />
      </div>
    </div>
  );
}

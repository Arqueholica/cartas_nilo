/**
 * ImageSequenceBlock — animación por fotogramas
 *
 * Dos modos:
 *   · gif/webp: un único archivo animado (más simple de producir)
 *   · frames:   array de imágenes individuales con fps controlado
 *               (mayor calidad, menor tamaño de archivo)
 *
 * Uso con WebP animado (recomendado):
 * {
 *   type:    'image-sequence',
 *   src:     'assets/animations/barco-nilo.webp',
 *   caption: 'El paso por las cataratas, secuencia animada.',
 * }
 *
 * Uso con frames individuales:
 * {
 *   type:    'image-sequence',
 *   frames:  ['assets/frames/barco-001.jpg', 'assets/frames/barco-002.jpg', ...],
 *   fps:     12,
 *   loop:    true,
 *   caption: '...',
 * }
 */
import { useState, useEffect, useRef } from 'react';

export default function ImageSequenceBlock({ src, frames, fps = 12, loop = true, caption }) {
  // Modo 1: archivo único (GIF o WebP animado)
  if (src && !frames) {
    return (
      <div className="media-block image-sequence-block">
        <img src={src} alt={caption || ''} loading="lazy" style={{ width:'100%', borderRadius:'4px' }} />
        {caption && <p className="media-caption">{caption}</p>}
      </div>
    );
  }

  // Modo 2: frames individuales
  return <FramePlayer frames={frames || []} fps={fps} loop={loop} caption={caption} />;
}

function FramePlayer({ frames, fps, loop, caption }) {
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(true);
  const intervalRef           = useRef(null);

  useEffect(() => {
    if (!playing) { clearInterval(intervalRef.current); return; }
    intervalRef.current = setInterval(() => {
      setCurrent(i => {
        if (i >= frames.length - 1) {
          if (!loop) { setPlaying(false); return i; }
          return 0;
        }
        return i + 1;
      });
    }, 1000 / fps);
    return () => clearInterval(intervalRef.current);
  }, [playing, fps, loop, frames.length]);

  if (!frames.length) return null;

  return (
    <div className="media-block image-sequence-block">
      <div className="isb-container" onClick={() => setPlaying(p => !p)}>
        <img src={frames[current]} alt={caption || `Frame ${current + 1}`} loading="lazy" />
        <div className="isb-overlay">
          {playing ? null : <span className="isb-paused">▶</span>}
        </div>
        <div className="isb-counter">{current + 1} / {frames.length}</div>
      </div>
      {caption && <p className="media-caption">{caption}</p>}
    </div>
  );
}

import { useEffect, useRef } from 'react';
import { parseText } from './parseText';
import BlockRenderer from './BlockRenderer';

/**
 * Cover — portada del libro (siempre la primera página, individual)
 *
 * A diferencia de la portada antigua (campos fijos), esta admite una
 * composición libre de bloques: título grande, texto, imagen de fondo,
 * audio que arranca al abrir, animación Lottie, ornamentos… todo
 * combinable según el libro.
 *
 * Dos modos, combinables:
 *   · Campos rápidos: series, title, subtitle, author... (portada clásica)
 *   · blocks[]: cualquier bloque del sistema (imagen, audio, lottie, texto)
 *
 * Uso simple (equivalente a la portada actual):
 * {
 *   type:   'cover',
 *   series: 'Noticias desde El Nilo',
 *   label:  'Carta',
 *   number: 'VI',
 *   dedication: 'A Louis Bouilhet',
 *   author: 'Gustave Flaubert',
 * }
 *
 * Uso enriquecido:
 * {
 *   type:  'cover',
 *   background: '/images/portada-fondo.jpg',   // imagen de fondo opcional
 *   ambientAudio: '/assets/audio/nilo-noche.mp3', // sonido al abrir (opcional)
 *   blocks: [
 *     { type: 'cover-ornament', symbol: '❧ ❧ ❧' },
 *     { type: 'cover-title', text: 'Noticias desde El Nilo' },
 *     { type: 'cover-number', text: 'VI' },
 *     { type: 'lottie', src: '/assets/animations/nilo.json', loop: true },
 *     { type: 'paragraph', text: 'A bordo de nuestra canga...' },
 *   ],
 * }
 */
export default function Cover({
  // campos rápidos (portada clásica)
  series, label, number, title, subtitle, dedication, location, author,
  // composición libre
  blocks, background, ambientAudio,
  // acción
  onStart, onLightbox, hideStart,
}) {
  const audioRef = useRef(null);

  // Audio ambiental: se prepara pero NO arranca solo (los navegadores
  // bloquean autoplay con sonido); arranca en el primer gesto del usuario.
  useEffect(() => {
    if (!ambientAudio) return;
    const audio = new Audio(ambientAudio);
    audio.loop   = true;
    audio.volume = 0.4;
    audioRef.current = audio;

    const startOnGesture = () => {
      audio.play().catch(() => {});
      window.removeEventListener('pointerdown', startOnGesture);
    };
    window.addEventListener('pointerdown', startOnGesture);

    return () => {
      window.removeEventListener('pointerdown', startOnGesture);
      audio.pause();
      audioRef.current = null;
    };
  }, [ambientAudio]);

  const style = background
    ? { backgroundImage: `linear-gradient(var(--cover-overlay, rgba(0,0,0,.15)), var(--cover-overlay, rgba(0,0,0,.15))), url(${background})`,
        backgroundSize: 'cover', backgroundPosition: 'center' }
    : undefined;

  // Modo composición libre
  if (Array.isArray(blocks) && blocks.length) {
    return (
      <div className="cover cover--rich" style={style}>
        {blocks.map((block, i) => {
          // Bloques específicos de portada
          if (block.type === 'cover-ornament')
            return <div className="orn" key={i}>{block.symbol || '❧ ❧ ❧'}</div>;
          if (block.type === 'cover-title')
            return <div className="ct cover-main-title" key={i}>{block.text}</div>;
          if (block.type === 'cover-number')
            return <div className="num" key={i}>{block.text}</div>;
          if (block.type === 'cover-series')
            return <div className="bk" key={i}>{block.text}</div>;
          if (block.type === 'cover-author')
            return <div className="au" key={i}>{block.text}</div>;
          if (block.type === 'cover-line')
            return <div className="lc" key={i}>{parseText(block.text)}</div>;
          if (block.type === 'cover-image')
            return (
              <div className="cover-img" key={i}>
                <img src={block.src} alt={block.caption || ''} />
              </div>
            );
          if (block.type === 'cover-imprint')
            return <div className="cover-imprint" key={i}>{block.text}</div>;
          // Cualquier otro bloque del sistema (audio, lottie…)
          return (
            <div className="cover-block" key={i}>
              <BlockRenderer block={block} onLightbox={onLightbox} />
            </div>
          );
        })}
        {!hideStart && <div className="go" onClick={onStart}>Comenzar lectura →</div>}
      </div>
    );
  }

  // Modo campos rápidos (portada clásica, compatibilidad total)
  return (
    <div className="cover" style={style}>
      <div className="orn">❧ ❧ ❧</div>
      {series && <div className="bk">{series}</div>}
      {label  && <div className="ct">{label}</div>}
      {number && <div className="num">{number}</div>}
      {title  && <div className="ct">{title}</div>}
      {subtitle  && <div className="dv">{subtitle}</div>}
      {dedication && <div className="dv">{dedication}</div>}
      {location   && <div className="lc">{location}</div>}
      {author && <div className="au">{author}</div>}
      <div className="o2">— ✦ —</div>
      <div className="go" onClick={onStart}>Comenzar lectura →</div>
    </div>
  );
}

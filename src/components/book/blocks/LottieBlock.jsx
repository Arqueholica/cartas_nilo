/**
 * LottieBlock — animaciones vectoriales Lottie
 * Exportadas desde After Effects (plugin Bodymovin) o desde LottieFiles.com
 *
 * Ideal para: ilustraciones animadas, infografías, transiciones decorativas,
 * mapas animados, timelines visuales.
 *
 * Uso en spreads.js:
 * {
 *   type:     'lottie',
 *   src:      'assets/animations/mapa-ruta-nilo.json',
 *   caption:  'Ruta del viaje de Flaubert por el Nilo, 1849-1851.',
 *   autoplay: true,
 *   loop:     false,
 *   speed:    1.0,
 * }
 */
import { useRef } from 'react';
import { Player, Controls } from '@lottiefiles/react-lottie-player';

export default function LottieBlock({ src, caption, autoplay = true, loop = false, speed = 1 }) {
  const playerRef = useRef(null);

  return (
    <div className="media-block lottie-block">
      <Player
        ref={playerRef}
        src={src}
        autoplay={autoplay}
        loop={loop}
        speed={speed}
        style={{
          width:      '100%',
          background: 'transparent',
        }}
      >
        {/* Controles visibles solo en desarrollo */}
        {import.meta.env.DEV && (
          <Controls
            visible
            buttons={['play', 'repeat', 'frame', 'debug']}
          />
        )}
      </Player>
      {caption && <p className="media-caption">{caption}</p>}
    </div>
  );
}

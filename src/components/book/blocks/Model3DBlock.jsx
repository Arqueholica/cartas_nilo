/**
 * Model3DBlock — visualizador de objetos 3D interactivos
 * Usa @google/model-viewer (Web Component estable, soportado en todos los navegadores)
 *
 * Funcionalidades:
 *   · Rotar con el dedo / ratón
 *   · Zoom
 *   · Auto-rotación opcional
 *   · AR en dispositivos compatibles (iOS/Android)
 *   · Hotspots: puntos de información sobre el modelo
 *
 * Uso en spreads.js:
 * {
 *   type:       'model-3d',
 *   src:        'assets/models/canga-egipcia.glb',
 *   poster:     'assets/images/canga-poster.jpg',
 *   caption:    'Réplica digital de una canga del siglo XIX.',
 *   autoRotate: true,
 *   ar:         true,
 *   hotspots: [
 *     { slot: 'hotspot-1', position: '0.5 1.2 0', normal: '0 1 0',
 *       label: 'Vela principal' },
 *   ]
 * }
 */
import { useRef } from 'react';

// @google/model-viewer se registra como Web Component al importarlo
import '@google/model-viewer';

export default function Model3DBlock({ src, poster, caption, autoRotate, ar, hotspots }) {
  const mvRef = useRef(null);

  // El propio componente ya se carga de forma diferida (lazy) desde
  // BlockRenderer, así que el import estático de arriba basta.

  return (
    <div className="media-block model3d-block">
      <model-viewer
        ref={mvRef}
        src={src}
        poster={poster}
        alt={caption || 'Modelo 3D interactivo'}
        auto-rotate={autoRotate ? '' : undefined}
        camera-controls
        ar={ar ? '' : undefined}
        ar-modes="webxr scene-viewer quick-look"
        loading="lazy"
        style={{
          width:           '100%',
          height:          '320px',
          background:      'var(--bg-page-alt)',
          borderRadius:    '4px',
          '--poster-color':'transparent',
        }}
      >
        {/* Hotspots de información */}
        {(hotspots || []).map((h) => (
          <button
            key={h.slot}
            slot={h.slot}
            className="model3d-hotspot"
            data-position={h.position}
            data-normal={h.normal}
          >
            <span className="model3d-hotspot-label">{h.label}</span>
          </button>
        ))}

        {/* Botón de AR */}
        {ar && (
          <button slot="ar-button" className="model3d-ar-btn">
            Ver en tu espacio ↗
          </button>
        )}

        {/* Indicador de carga */}
        <div slot="progress-bar" className="model3d-loading">
          <div className="model3d-loading-bar" />
        </div>
      </model-viewer>
      {caption && <p className="media-caption">{caption}</p>}
    </div>
  );
}

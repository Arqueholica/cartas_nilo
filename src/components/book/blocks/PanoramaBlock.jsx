/**
 * PanoramaBlock — fotografía 360° navegable
 * Para imágenes equirrecangulares (las que genera cualquier cámara 360°)
 *
 * Uso en spreads.js:
 * {
 *   type:    'panorama',
 *   src:     'assets/panoramas/piramides-giza.jpg',
 *   caption: 'Vista panorámica de las pirámides de Guiza, 1850.',
 *   pitch:   0,    // ángulo vertical inicial (grados)
 *   yaw:     0,    // ángulo horizontal inicial (grados)
 *   hfov:    100,  // campo de visión horizontal
 * }
 */
import { useEffect, useRef } from 'react';
import 'pannellum/build/pannellum.css';

export default function PanoramaBlock({ src, caption, pitch = 0, yaw = 0, hfov = 100 }) {
  const containerRef = useRef(null);
  const viewerRef    = useRef(null);

  useEffect(() => {
    let pannellum;

    import('pannellum').then((module) => {
      pannellum = module.default || module;
      if (!containerRef.current || viewerRef.current) return;

      viewerRef.current = pannellum.viewer(containerRef.current, {
        type:          'equirectangular',
        panorama:      src,
        autoLoad:      true,
        autoRotate:    -2,
        compass:       false,
        showControls:  true,
        mouseZoom:     true,
        pitch,
        yaw,
        hfov,
        strings: {
          loadButtonLabel: 'Cargar panorama',
          loadingLabel:    'Cargando…',
          bylineLabel:     '',
        },
      });
    });

    return () => {
      viewerRef.current?.destroy();
      viewerRef.current = null;
    };
  }, [src, pitch, yaw, hfov]);

  return (
    <div className="media-block panorama-block">
      <div ref={containerRef} className="panorama-container" />
      {caption && <p className="media-caption">{caption}</p>}
    </div>
  );
}

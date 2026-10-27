/**
 * VideoBlock — reproductor de vídeo embebido en el libro
 *
 * Características:
 *   · Controles propios estilizados con la paleta del libro
 *   · Poster (miniatura) mientras no se reproduce
 *   · Soporte de subtítulos .vtt (opcional)
 *   · Lightbox: el vídeo puede abrirse a pantalla completa
 *   · Loop y autoplay opcionales
 *
 * Especificaciones de producción: ver GUIA_PRODUCCION.md
 *
 * Uso en spreads.js:
 * {
 *   type:     'video',
 *   src:      'assets/video/ceremonia-doseh.mp4',
 *   poster:   'assets/images/doseh-poster.jpg',
 *   caption:  'La ceremonia del Doseh, El Cairo, 1850.',
 *   subtitles:'assets/subtitles/doseh-es.vtt',  // opcional
 *   loop:     false,
 *   autoplay: false,
 * }
 */
import { useRef, useState } from 'react';

export default function VideoBlock({ src, poster, caption, subtitles, loop, autoplay }) {
  const videoRef            = useRef(null);
  const progressRef         = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [expanded, setExpanded] = useState(false);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    playing ? v.pause() : v.play();
    setPlaying(!playing);
  };

  const onTimeUpdate = () => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    setProgress(v.currentTime / v.duration);
  };

  const onLoadedMetadata = () => {
    setDuration(videoRef.current?.duration || 0);
  };

  const onProgressClick = (e) => {
    const rect = progressRef.current.getBoundingClientRect();
    const pct  = (e.clientX - rect.left) / rect.width;
    if (videoRef.current) videoRef.current.currentTime = pct * duration;
  };

  const fmt = (s) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`media-block video-block${expanded ? ' expanded' : ''}`}>
      <div className="vb-container" onClick={expanded ? undefined : togglePlay}>
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          loop={loop}
          autoPlay={autoplay}
          playsInline
          onTimeUpdate={onTimeUpdate}
          onLoadedMetadata={onLoadedMetadata}
          onEnded={() => setPlaying(false)}
          onClick={(e) => e.stopPropagation()}
        >
          {subtitles && (
            <track kind="subtitles" src={subtitles} srcLang="es" label="Español" default />
          )}
        </video>

        {/* Overlay de play cuando está pausado */}
        {!playing && (
          <div className="vb-play-overlay" onClick={togglePlay}>
            <div className="vb-play-btn">▶</div>
          </div>
        )}

        {/* Botón expandir */}
        <button
          className="vb-expand"
          onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
          title={expanded ? 'Reducir' : 'Ampliar'}
        >
          {expanded ? '⤡' : '⤢'}
        </button>
      </div>

      {/* Barra de controles */}
      <div className="vb-controls">
        <button className="vb-ctrl-btn" onClick={togglePlay}>
          {playing ? '⏸' : '▶'}
        </button>
        <div
          className="vb-progress"
          ref={progressRef}
          onClick={onProgressClick}
        >
          <div className="vb-progress-fill" style={{ width: `${progress * 100}%` }} />
        </div>
        <span className="vb-time">
          {fmt(duration * progress)} / {fmt(duration)}
        </span>
      </div>

      {caption && <p className="media-caption">{caption}</p>}
    </div>
  );
}

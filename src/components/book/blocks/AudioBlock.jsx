/**
 * AudioBlock — reproductor de audio embebido en el libro
 * Para: música de época, lecturas, ambient, entrevistas
 *
 * Uso en spreads.js:
 * {
 *   type:    'audio',
 *   src:     'assets/audio/musica-cairo-1850.mp3',
 *   title:   'Música callejera de El Cairo, siglo XIX',
 *   caption: 'Grabación de campo realizada por investigadores del CNRS, 1910.',
 * }
 */
import { useRef, useState, useEffect } from 'react';

export default function AudioBlock({ src, title, caption }) {
  const audioRef            = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    playing ? a.pause() : a.play();
    setPlaying(!playing);
  };

  const onTimeUpdate = () => {
    const a = audioRef.current;
    if (a?.duration) setProgress(a.currentTime / a.duration);
  };

  const seek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct  = (e.clientX - rect.left) / rect.width;
    if (audioRef.current) {
      audioRef.current.currentTime = pct * duration;
      setProgress(pct);
    }
  };

  const fmt = (s) => {
    if (!s || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    return `${m}:${Math.floor(s % 60).toString().padStart(2, '0')}`;
  };

  return (
    <div className="media-block audio-block">
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
        onEnded={() => setPlaying(false)}
      />
      <div className="ab-inner">
        <button className="ab-play" onClick={toggle} aria-label={playing ? 'Pausar' : 'Reproducir'}>
          {playing ? '⏸' : '▶'}
        </button>
        <div className="ab-info">
          {title && <span className="ab-title">{title}</span>}
          <div className="ab-progress" onClick={seek}>
            <div className="ab-fill" style={{ width: `${progress * 100}%` }} />
          </div>
          <span className="ab-time">{fmt(duration * progress)} / {fmt(duration)}</span>
        </div>
        <div className="ab-icon">♪</div>
      </div>
      {caption && <p className="media-caption">{caption}</p>}
    </div>
  );
}

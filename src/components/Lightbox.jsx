import { useEffect } from 'react';

export default function Lightbox({ open, src, caption, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="lb open" onClick={onClose}>
      <button className="lb-x" onClick={onClose}>&times;</button>
      <img
        src={src} alt={caption}
        onClick={(e) => e.stopPropagation()}
      />
      {caption && <p className="lb-cap">{caption}</p>}
    </div>
  );
}

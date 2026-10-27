import { useState } from 'react';
import { parseText } from './parseText';

/**
 * InlineNote — nota integrada colapsable con imagen(es)
 * Props:
 *   title    string (puede tener marcadores [em:X])
 *   image    string — ruta a una imagen
 *   images   array  — rutas a varias imágenes (galería)
 *   caption  string (puede tener marcadores)
 *   gallery  boolean — muestra las imágenes en fila horizontal
 *   onLightbox función(src, caption)
 */
export default function InlineNote({ title, image, images, caption, gallery, onLightbox }) {
  const [open, setOpen] = useState(false);
  const allImages = images || (image ? [image] : []);

  return (
    <div className={`inl${open ? ' open' : ''}`}>
      <button className="inl-tog" onClick={() => setOpen(!open)}>
        <span className="inl-arr" />
        {parseText(title)}
      </button>
      <div className="inl-body">
        {gallery ? (
          <div className="igal">
            {allImages.map((src, i) => (
              <img
                key={i} src={src} alt={`${title} ${i + 1}`} loading="lazy"
                onClick={() => onLightbox?.(src, caption)}
              />
            ))}
          </div>
        ) : (
          allImages.map((src, i) => (
            <div key={i} className="iw" onClick={() => onLightbox?.(src, caption)}>
              <img src={src} alt={title} loading="lazy" />
              <span className="zi">⤢</span>
            </div>
          ))
        )}
        {caption && <p className="cap">{parseText(caption)}</p>}
      </div>
    </div>
  );
}

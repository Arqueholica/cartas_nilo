import { parseText } from './parseText';
import { imgDims } from '../imageSizes';

/**
 * GalleryItem — una imagen de la galería, con su pie y su texto
 *
 * Cada imagen es un bloque, de modo que la galería se reparte en
 * páginas midiendo lo que cabe. La imagen lleva su ancho y su alto
 * reales (imgDims) para que su hueco se conozca antes de descargarla.
 *
 * Bloque:
 *   { type: 'gallery-item', image, caption?, text?, origin? }
 */
export default function GalleryItem({ image, caption, text, origin, source, onLightbox }) {
  return (
    <figure className="gallery-item">
      <div className="gallery-img-wrap" onClick={() => onLightbox?.(image, caption)}>
        <img src={image} {...imgDims(image)} alt={caption || ''} loading="lazy" />
        <span className="gallery-zoom">⤢</span>
      </div>
      {caption && <figcaption className="gallery-caption">{parseText(caption)}</figcaption>}
      {text && <p className="gallery-text">{parseText(text)}</p>}
      {(origin || source) && <span className="gallery-source">{origin || source}</span>}
    </figure>
  );
}

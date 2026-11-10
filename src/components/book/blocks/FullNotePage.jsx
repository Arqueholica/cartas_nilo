import { parseText } from './parseText';

/**
 * FullNotePage — nota completa que ocupa una página entera.
 *
 * Es una página más del corpus: el lector pasa página y la encuentra
 * desplegada. Se distingue por un tinte propio del tema y por el texto
 * a dos columnas, como en la edición impresa.
 *
 * Datos (los mismos que generaba el bloque plegable):
 * {
 *   type:  'full-note',
 *   title: 'La ceremonia del Doseh',
 *   blocks: [
 *     { type: 'note-image',     src, caption },
 *     { type: 'note-paragraph', text },
 *   ],
 * }
 */
export default function FullNotePage({ title, blocks = [], cont, runsOn, onLightbox }) {
  const images = blocks.filter((b) => b.type === 'note-image');
  const paras  = blocks.filter((b) => b.type === 'note-paragraph');

  return (
    <article className={`fnp${cont ? ' fnp--cont' : ''}`}>
      <span className="fnp-tag">{cont ? 'Nota · continúa' : 'Nota'}</span>

      {images.map((img, i) => (
        <figure className="fnp-fig" key={i}>
          <img
            src={img.src}
            alt={img.caption || title || ''}
            loading="lazy"
            onClick={() => onLightbox?.(img.src, img.caption)}
          />
          {img.caption && (
            <figcaption className="fnp-cap">{parseText(img.caption)}</figcaption>
          )}
        </figure>
      ))}

      {title && <h2 className="fnp-title">{title}</h2>}

      <div className="fnp-cols">
        {paras.map((p, i) => (
          <p className="fnp-text" key={i}>{parseText(p.text)}</p>
        ))}
      </div>
    </article>
  );
}

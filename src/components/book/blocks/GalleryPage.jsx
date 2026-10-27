import { parseText } from './parseText';

/**
 * GalleryPage — una página de galería (formato libro físico)
 *
 * Una sola página con pocas imágenes (2 por defecto). La paginación
 * la hace paginate.js. Incluye botón para volver a la lectura.
 *
 * Props:
 *   title      título de sección (solo en la 1ª página)
 *   items      imágenes de ESTA página
 *   pageLabel  etiqueta "Galería · 2/4"
 *   onReturn   callback del botón "volver a la página"
 *   onLightbox abrir imagen ampliada
 */
export default function GalleryPage({ title, items = [], pageLabel,
                                      onReturn, onLightbox }) {
  return (
    <section className="gallery gallery--paged">
      {title && <h2 className="gallery-title">{title}</h2>}

      {onReturn && (
        <button className="return-btn" onClick={onReturn}>
          ← Volver a la lectura
        </button>
      )}

      <div className="gallery-grid gallery-grid--paged">
        {items.map((item, i) => (
          <figure className="gallery-item" key={i}>
            <div
              className="gallery-img-wrap"
              onClick={() => onLightbox?.(item.image, item.caption)}
            >
              <img src={item.image} alt={item.caption || ''} loading="lazy" />
              <span className="gallery-zoom">⤢</span>
            </div>
            {item.caption && (
              <figcaption className="gallery-caption">{parseText(item.caption)}</figcaption>
            )}
            {item.text && <p className="gallery-text">{parseText(item.text)}</p>}
            {(item.ref || item.source) &&
              <span className="gallery-source">{item.ref || item.source}</span>}
          </figure>
        ))}
      </div>

      {pageLabel && <span className="section-page-label">{pageLabel}</span>}
    </section>
  );
}

import { parseText } from './parseText';

/**
 * Gallery — galería de imágenes del libro (siempre al final)
 *
 * Reúne dos fuentes:
 *   1. Las imágenes que ya aparecieron en el libro (recopiladas
 *      automáticamente de las inline-note, full-note, etc.)
 *   2. Imágenes "extra" declaradas expresamente para la galería,
 *      que pueden llevar su propio texto.
 *
 * La recopilación automática la hace la utilidad collectBookImages()
 * (más abajo), que se ejecuta al montar el libro. Este componente
 * solo pinta lo que recibe.
 *
 * Uso en los datos del libro:
 * {
 *   type:  'gallery',
 *   title: 'Galería de imágenes',
 *   includeFromBook: true,      // recopilar las imágenes ya usadas
 *   extras: [                   // imágenes adicionales solo de galería
 *     {
 *       image:   '/images/retrato-flaubert.jpg',
 *       caption: 'Retrato de Gustave Flaubert, por Eugène Giraud.',
 *       text:    'Texto opcional más largo sobre esta imagen extra.',
 *     },
 *   ],
 * }
 */
export default function Gallery({ title = 'Galería de imágenes', items = [], onLightbox }) {
  if (!items.length) {
    return (
      <section className="gallery">
        <h2 className="gallery-title">{title}</h2>
        <p className="gallery-empty">No hay imágenes en este libro.</p>
      </section>
    );
  }

  return (
    <section className="gallery">
      <h2 className="gallery-title">{title}</h2>
      <div className="gallery-grid">
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
              <figcaption className="gallery-caption">
                {parseText(item.caption)}
              </figcaption>
            )}
            {item.text && (
              <p className="gallery-text">{parseText(item.text)}</p>
            )}
            {item.source && (
              <span className="gallery-source">{item.source}</span>
            )}
          </figure>
        ))}
      </div>
    </section>
  );
}

/**
 * collectBookImages — recorre todos los spreads de un libro y
 * extrae cada imagen con su descripción, para alimentar la galería.
 *
 * Recopila imágenes de estos tipos de bloque:
 *   · inline-note  (image o images[])
 *   · full-note    (sub-bloques note-image)
 *   · image        (bloque de imagen simple, si existe)
 *
 * Devuelve un array de { image, caption, source } sin duplicados.
 */
export function collectBookImages(spreads) {
  const found = [];
  const seen  = new Set();

  const push = (image, caption, source) => {
    if (!image || seen.has(image)) return;
    seen.add(image);
    found.push({ image, caption: caption || '', source: source || '' });
  };

  const scanBlocks = (blocks = []) => {
    for (const block of blocks) {
      switch (block.type) {
        case 'inline-note':
          if (block.image) push(block.image, block.caption);
          if (Array.isArray(block.images)) {
            block.images.forEach(img => push(img, block.caption));
          }
          break;
        case 'full-note':
          (block.blocks || []).forEach(sub => {
            if (sub.type === 'note-image') push(sub.src, sub.caption);
          });
          break;
        case 'image':
          push(block.src, block.caption);
          break;
        default:
          break;
      }
    }
  };

  const scanPage = (page) => {
    if (!page) return;
    if (Array.isArray(page.blocks)) scanBlocks(page.blocks);
  };

  for (const spread of spreads) {
    scanPage(spread.left);
    scanPage(spread.right);
  }

  return found;
}

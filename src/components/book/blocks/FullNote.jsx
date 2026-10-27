import { useState } from 'react';
import { parseText } from './parseText';

/**
 * FullNote — nota completa expandible que desplaza el texto
 * El contenido interno usa sub-bloques: note-paragraph, note-image
 */
export default function FullNote({ trigger, title, blocks, onLightbox }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`nota-completa${open ? ' open' : ''}`}>
      <button className="nc-trigger" onClick={() => setOpen(!open)}>
        <span className="nc-icon">📄</span>
        {trigger}
        <span className="nc-arr-ic" />
      </button>
      <div className="nc-body">
        <div className="nc-content">
          {title && <h3 className="nc-title">{title}</h3>}
          {(blocks || []).map((block, i) => {
            if (block.type === 'note-paragraph') {
              return <p key={i} className="nc-text">{parseText(block.text)}</p>;
            }
            if (block.type === 'note-image') {
              return (
                <div key={i}>
                  <img
                    className="nc-img" src={block.src} alt={block.caption}
                    onClick={() => onLightbox?.(block.src, block.caption)}
                  />
                  {block.caption && (
                    <p className="nc-img-cap">{parseText(block.caption)}</p>
                  )}
                </div>
              );
            }
            return null;
          })}
          <button className="nc-close-btn" onClick={() => setOpen(false)}>
            ↑ Cerrar nota completa
          </button>
        </div>
      </div>
    </div>
  );
}

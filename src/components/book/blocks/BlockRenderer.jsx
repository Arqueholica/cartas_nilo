/**
 * BlockRenderer — el switch central de tipos de bloque
 *
 * Para añadir un tipo nuevo:
 *   1. Crear el componente en esta carpeta
 *   2. Añadir el import aquí
 *   3. Añadir el case en el switch
 *   Nada más cambia en el resto del proyecto.
 *
 * Tipos disponibles:
 *
 *   TEXTO
 *   ─────
 *   paragraph        Párrafo con marcadores [fn:N] [ht:X] [em:X]
 *   verse            Cita poética con traducción
 *   chapter-header   Cabecera de carta o capítulo
 *   divider          Separador decorativo
 *   end-note         Nota de cierre ("Fin de la Carta VI")
 *
 *   NOTAS EDITORIALES
 *   ──────────────────
 *   inline-note      Nota integrada colapsable con imagen(es)
 *   full-note        Nota completa expandible con texto largo
 *
 *   MULTIMEDIA
 *   ───────────
 *   video            Vídeo MP4 con controles propios
 *   audio            Audio MP3/OGG con player estilizado
 *   model-3d         Objeto 3D interactivo (.glb)
 *   lottie           Animación vectorial Lottie (.json)
 *   panorama         Fotografía 360° equirrectangular (.jpg)
 *   image-sequence   GIF / WebP animado / secuencia de frames
 */
import Paragraph       from './Paragraph';
import Verse           from './Verse';
import ChapterHeader   from './ChapterHeader';
import InlineNote      from './InlineNote';
import FullNote        from './FullNote';
import FullNotePage    from './FullNotePage';
import Glossary        from './Glossary';
import Gallery         from './Gallery';
import GlossaryPage    from './GlossaryPage';
import GalleryPage     from './GalleryPage';

// Multimedia — carga diferida (lazy) para no penalizar
// el tiempo de carga inicial del libro
import { lazy, Suspense } from 'react';
const VideoBlock         = lazy(() => import('./VideoBlock'));
const AudioBlock         = lazy(() => import('./AudioBlock'));
const Model3DBlock       = lazy(() => import('./Model3DBlock'));
const LottieBlock        = lazy(() => import('./LottieBlock'));
const PanoramaBlock      = lazy(() => import('./PanoramaBlock'));
const ImageSequenceBlock = lazy(() => import('./ImageSequenceBlock'));

// Spinner compartido para los bloques multimedia mientras cargan
function MediaLoader() {
  return (
    <div className="media-loading">
      <span className="media-loading-dot">·</span>
      <span className="media-loading-dot">·</span>
      <span className="media-loading-dot">·</span>
    </div>
  );
}

export default function BlockRenderer({ block, onNoteClick, onLightbox,
                                        onTermClick, glossaryTerms, activeTerm,
                                        onReturn }) {
  const { type, ...props } = block;

  // Opciones de parseo de texto compartidas (notas + glosario)
  const textOpts = { onNoteClick, onTermClick, glossaryTerms };

  switch (type) {

    // ── Texto ──────────────────────────────────────────────────────────────
    case 'paragraph':
      return <Paragraph {...props} textOpts={textOpts} />;

    case 'verse':
      return <Verse {...props} textOpts={textOpts} />;

    case 'image':
      return (
        <figure className="image-block" onClick={() => onLightbox?.(props.src, props.caption)}>
          <img src={props.src} alt={props.caption || ''} loading="lazy" />
          {props.caption && <figcaption className="image-caption">{props.caption}</figcaption>}
        </figure>
      );

    case 'section-title':
      return <h2 className="section-title">{props.text}</h2>;

    case 'chapter-title':
      return <h1 className="chapter-title-solo">{props.text}</h1>;

    case 'dedication':
      return <p className="hdr-ded-solo">{props.text}</p>;

    case 'chapter-header':
      return <ChapterHeader {...props} textOpts={textOpts} />;

    case 'divider':
      return (
        <div className="divider">
          {props.style === 'ornament' ? '❧ ❧ ❧' : '— ✦ —'}
        </div>
      );

    case 'end-note':
      return (
        <p style={{ textAlign:'center', fontFamily:'var(--font-ui)',
                    fontSize:'.72rem', color:'var(--text-muted)', marginTop:'.5em' }}>
          {props.text}
        </p>
      );

    // ── Notas editoriales ──────────────────────────────────────────────────
    case 'inline-note':
      return <InlineNote {...props} onLightbox={onLightbox} />;

    case 'full-note':
      // Ocupa su propia página: siempre desplegada, con tinte propio
      return <FullNotePage {...props} onLightbox={onLightbox} />;

    // ── Multimedia ─────────────────────────────────────────────────────────
    case 'video':
      return (
        <Suspense fallback={<MediaLoader />}>
          <VideoBlock {...props} />
        </Suspense>
      );

    case 'audio':
      return (
        <Suspense fallback={<MediaLoader />}>
          <AudioBlock {...props} />
        </Suspense>
      );

    case 'model-3d':
      return (
        <Suspense fallback={<MediaLoader />}>
          <Model3DBlock {...props} />
        </Suspense>
      );

    case 'lottie':
      return (
        <Suspense fallback={<MediaLoader />}>
          <LottieBlock {...props} />
        </Suspense>
      );

    case 'panorama':
      return (
        <Suspense fallback={<MediaLoader />}>
          <PanoramaBlock {...props} />
        </Suspense>
      );

    case 'image-sequence':
      return (
        <Suspense fallback={<MediaLoader />}>
          <ImageSequenceBlock {...props} />
        </Suspense>
      );

    // ── Secciones finales ──────────────────────────────────────────────────
    case 'glossary':
      return <Glossary {...props} activeTerm={activeTerm} />;

    case 'gallery':
      return <Gallery {...props} onLightbox={onLightbox} />;

    case 'glossary-page':
      return <GlossaryPage {...props} activeTerm={activeTerm} onReturn={onReturn} />;

    case 'gallery-page':
      return <GalleryPage {...props} onLightbox={onLightbox} onReturn={onReturn} />;

    // ── Desconocido ────────────────────────────────────────────────────────
    default:
      if (import.meta.env.DEV) {
        console.warn(`BlockRenderer: tipo desconocido "${type}"`, props);
        return (
          <div style={{ border:'2px dashed #c44', padding:'8px',
                        fontFamily:'monospace', fontSize:'12px', color:'#c44' }}>
            Tipo desconocido: <strong>{type}</strong>
          </div>
        );
      }
      return null;
  }
}

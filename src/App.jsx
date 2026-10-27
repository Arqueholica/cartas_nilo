/**
 * App — lector de «Noticias desde El Nilo»
 *
 * Secuencia del libro:
 *   portada (página única) → 10 cartas → galería → glosario
 *   → contraportada (página única)
 *
 * Las páginas de las cartas se calculan en tiempo real midiendo lo que
 * cabe en la caja de texto, de modo que el texto nunca la desborda,
 * aunque se cambie el cuerpo de letra o el tamaño de la ventana.
 */
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

import {
  bookMeta, cartas, letters, coverPage, backCoverPage,
  galleryItems, glossaryFlat, notesIn, allFootnotes,
} from './data/books/flaubert-cartas/index';

import { useBook }     from './hooks/useBook';
import { useBookmark } from './hooks/useBookmark';

import Header     from './components/Header';
import Sidebar    from './components/Sidebar';
import Book       from './components/book/Book';
import NotesPanel from './components/NotesPanel';
import Paginator  from './components/book/Paginator';

import { normalizeTerm } from './components/book/blocks/parseText';
import { paginateGlossary, paginateGallery } from './components/book/paginate';

const BOOK_SLUG = 'flaubert-cartas';
const FOCUS_MS  = 5000;   // cuánto dura el enfoque de una nota

export default function App() {
  /* ── Medidas de la caja de texto ── */
  const [box, setBox]       = useState({ w: 0, h: 0 });
  const [fontStep, setFont] = useState(0);
  const [pages, setPages]   = useState(null);

  useEffect(() => {
    const measure = () => {
      const el = document.querySelector('.pg-box');
      if (el) {
        const r = el.getBoundingClientRect();
        setBox((b) => (Math.abs(b.w - r.width) > 1 || Math.abs(b.h - r.height) > 1
          ? { w: r.width, h: r.height } : b));
      } else {
        // antes del primer render: estimar a partir del contenedor
        const codex = document.querySelector('.codex');
        if (codex) {
          const r = codex.getBoundingClientRect();
          setBox({ w: r.width / 2 - 60, h: r.height - 90 });
        }
      }
    };
    measure();
    window.addEventListener('resize', measure);
    const t = setTimeout(measure, 300);
    return () => { window.removeEventListener('resize', measure); clearTimeout(t); };
  }, [fontStep]);

  /* ── Secciones finales, ya paginadas por cantidad ── */
  const tail = useMemo(() => {
    const gallery = paginateGallery(galleryItems, {
      perPage: 2, title: 'Galería de imágenes',
    }).map((s) => ({ ...s, kind: 'gallery' }));
    const gloss = paginateGlossary(glossaryFlat, {
      perPage: 6, title: 'Glosario', sorted: false,
    }).map((s) => ({ ...s, kind: 'glossary' }));
    return { gallery, gloss };
  }, []);

  /* ── Secuencia completa de vistas ── */
  const { spreads, galleryStart, glossaryStart, letterStart } = useMemo(() => {
    const all = [{ single: true, kind: 'cover', page: coverPage }];
    const starts = {};

    if (pages) {
      // numeración correlativa propia (independiente del PDF impreso)
      pages.forEach((pg, k) => { pg.folio = String(k + 1); });

      // agrupar las páginas calculadas en dobles páginas, por carta
      let i = 0;
      while (i < pages.length) {
        const li = pages[i].letterIndex;
        if (starts[letters[li].id] === undefined) starts[letters[li].id] = all.length;
        const left  = pages[i];
        const right = (pages[i + 1] && pages[i + 1].letterIndex === li)
          ? pages[i + 1] : null;
        all.push({
          kind: 'letter',
          carta: letters[li].number,
          cartaId: letters[li].id,
          footnotes: letters[li].footnotes,
          left,
          right: right || { blocks: [] },
          spreadNotes: [...notesIn(left.blocks), ...notesIn(right?.blocks)],
        });
        i += right ? 2 : 1;
      }
    }

    const gStart = all.length;
    all.push(...tail.gallery);
    const xStart = all.length;
    all.push(...tail.gloss);
    all.push({ single: true, kind: 'back', page: backCoverPage });

    return { spreads: all, galleryStart: gStart, glossaryStart: xStart,
             letterStart: starts };
  }, [pages, tail]);

  /* ── Términos con entrada de glosario ── */
  const glossaryTerms = useMemo(() => {
    const set = new Set();
    glossaryFlat.forEach((e) => set.add(normalizeTerm(e.term)));
    return set;
  }, []);

  const { spread, flipping, flipDirection, goTo, next, prev } =
    useBook(spreads.length);

  const [theme,         setTheme]         = useState('sepia');
  const [navOpen,       setNavOpen]       = useState(false);
  const [notesOpen,     setNotesOpen]     = useState(false);
  const [highlightNote, setHighlightNote] = useState(null);
  const [activeTerm,    setActiveTerm]    = useState(null);

  const returnToRef = useRef(0);
  const current = spreads[spread] || {};

  const { hasRibbonHere, toggleRibbon, ribbon, resume, dismissResume } =
    useBookmark(BOOK_SLUG, spread, spreads.length);

  useEffect(() => { document.body.dataset.theme = theme; }, [theme]);

  const toggleFS = useCallback(() => {
    if (!document.fullscreenElement)
      document.documentElement.requestFullscreen().catch(() => {});
    else document.exitFullscreen().catch(() => {});
  }, []);

  /* Pulsar una llamada de nota: abrir el panel y enfocarla 5 s */
  const handleNoteClick = useCallback((n) => {
    setHighlightNote(String(n));
    setNotesOpen(true);
    setTimeout(() => setHighlightNote(null), FOCUS_MS);
  }, []);

  const handleTermClick = useCallback((term) => {
    returnToRef.current = spread;
    setActiveTerm(term);
    goTo(glossaryStart);
    setTimeout(() => setActiveTerm(null), 3000);
  }, [goTo, glossaryStart, spread]);

  const handleReturn = useCallback(() => {
    goTo(returnToRef.current || 0);
  }, [goTo]);

  const goToSection = useCallback((target) => {
    if (spread < galleryStart) returnToRef.current = spread;
    goTo(target);
  }, [goTo, spread, galleryStart]);

  useEffect(() => {
    setHighlightNote(null);
    setNotesOpen(false);
  }, [spread]);

  const changeFont = (delta) => {
    const root = document.documentElement;
    const cur  = parseInt(getComputedStyle(root).fontSize);
    root.style.fontSize = Math.min(22, Math.max(12, cur + delta)) + 'px';
    setFont((n) => n + delta);
  };

  const pageLabel =
    current.kind === 'cover'    ? 'Portada'
  : current.kind === 'back'     ? 'Colofón'
  : current.kind === 'gallery'  ? 'Galería'
  : current.kind === 'glossary' ? 'Glosario'
  : `Carta ${current.carta || ''}`;

  return (
    <>
      <Header
        spread={spread}
        total={spreads.length}
        label={pageLabel}
        theme={theme}
        onMenuOpen={() => setNavOpen(true)}
        onFontUp={() => changeFont(1)}
        onFontDown={() => changeFont(-1)}
        onThemeChange={setTheme}
        onFullscreen={toggleFS}
        onBookmark={toggleRibbon}
        bookmarked={hasRibbonHere}
      />

      <Sidebar
        letters={cartas.map((c) => ({ ...c, sp: letterStart[c.id] }))}
        spread={spread}
        onGoTo={goToSection}
        open={navOpen}
        onClose={() => setNavOpen(false)}
        hasNotes={() => false}
        bookTitle={bookMeta.title}
        bookAuthor={bookMeta.author}
        extraSections={[
          { label: 'Galería de imágenes', sp: galleryStart },
          { label: 'Glosario',            sp: glossaryStart },
        ]}
      />

      <div className="main-layout">
        <Book
          spreads={spreads}
          spread={spread}
          flipping={flipping}
          flipDirection={flipDirection}
          next={next}
          prev={prev}
          onNoteClick={handleNoteClick}
          onTermClick={handleTermClick}
          glossaryTerms={glossaryTerms}
          activeTerm={activeTerm}
          onReturn={handleReturn}
          ribbon={ribbon}
          ribbonHere={hasRibbonHere}
          onRibbonClick={() => ribbon !== null && goTo(ribbon)}
        />
      </div>

      {/* Oferta de retomar la lectura */}
      {resume !== null && resume !== spread && (
        <div className="resume-bar">
          <span>Dejaste la lectura en la página {resume + 1}.</span>
          <button className="btn" onClick={() => { goTo(resume); dismissResume(); }}>
            Continuar
          </button>
          <button className="btn btn-ghost" onClick={dismissResume}>
            Empezar de nuevo
          </button>
        </div>
      )}

      <NotesPanel
        open={notesOpen}
        onClose={(v) => setNotesOpen(typeof v === 'boolean' ? v : !notesOpen)}
        footnotes={current.footnotes || {}}
        spreadNotes={current.spreadNotes || []}
        cartaLabel={current.carta ? `Carta ${current.carta}` : ''}
        highlightNote={highlightNote}
        hidden={Boolean(current.single)}
        allFootnotes={allFootnotes}
      />

      {/* Medición oculta que reparte el texto en páginas */}
      <Paginator
        letters={letters}
        boxWidth={box.w}
        boxHeight={box.h}
        signal={`${box.w}x${box.h}`}
        onPages={setPages}
      />
    </>
  );
}

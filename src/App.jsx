/**
 * App — lector de «Noticias desde El Nilo»
 *
 * Secuencia del libro:
 *   portada (página única) → 10 cartas → galería → glosario
 *   → contraportada (página única)
 *
 * Todas las páginas —cartas, galería y glosario— se calculan en tiempo
 * real midiendo lo que cabe en la caja de texto, de modo que nada la
 * desborda, aunque se cambie el cuerpo de letra o el tamaño de la
 * ventana.
 */
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

import {
  bookMeta, cartas, letters, coverPage, backCoverPage,
  backMatter, glossaryFlat, notesIn, allFootnotes,
} from './data/books/flaubert-cartas/index';

import { useBook }     from './hooks/useBook';
import { useBookmark } from './hooks/useBookmark';
import { useReaderPrefs } from './hooks/useReaderPrefs';

import Header     from './components/Header';
import Sidebar    from './components/Sidebar';
import Book       from './components/book/Book';
import NotesPanel from './components/NotesPanel';
import Paginator  from './components/book/Paginator';

import { normalizeTerm } from './components/book/blocks/parseText';
import { pageChrome } from './components/book/pageChrome';
import { spreadAnchor, spreadForAnchor, COVER } from './components/book/anchors';
import { chrome }     from './data/books/flaubert-cartas/chrome';

const BOOK_SLUG = 'flaubert-cartas';

// El libro aún no trae sonidos (falta /audio/page-turn.mp3). Cuando
// lleguen, basta con ponerlo a true: el interruptor de «Opciones de
// lectura» se activa y el paso de página suena si el lector lo quiere.
const SOUND_READY = false;

/** Folio visible de una doble página (el de la izquierda, o el de la derecha) */
const folioOf = (sp) => sp?.left?.folio || sp?.right?.folio || '';
const FOCUS_MS  = 5000;   // cuánto dura el enfoque de una nota

export default function App() {
  /* ── Medidas de la caja de texto ── */
  const [box, setBox]       = useState({ w: 0, h: 0 });
  const [pages, setPages]   = useState(null);

  /* ── Opciones de lectura (tema, letra, marcador, animaciones…) ── */
  const { prefs, set: setPref, stepFont } = useReaderPrefs();
  const fontStep = prefs.fontStep;
  const [optionsOpen, setOptionsOpen] = useState(false);

  // Solo se mide el libro abierto. De ahí saca el paginador la caja de
  // texto, montando una página patrón: así no hay que repetir en el
  // código los márgenes y las franjas que ya están en el CSS, ni
  // depender de que haya una página a la vista (en la portada no hay).
  useEffect(() => {
    const measure = () => {
      const codex = document.querySelector('.codex');
      if (!codex) return;
      const r = codex.getBoundingClientRect();
      setBox((b) => (Math.abs(b.w - r.width) > 1 || Math.abs(b.h - r.height) > 1
        ? { w: r.width, h: r.height } : b));
    };
    measure();
    window.addEventListener('resize', measure);
    const t = setTimeout(measure, 300);
    return () => { window.removeEventListener('resize', measure); clearTimeout(t); };
  }, [fontStep]);

  /* ── Secciones que se paginan midiendo: cartas, galería, glosario ──
     Todo el libro pasa por el mismo paginador. La galería y el glosario
     llegan con una imagen o una entrada por bloque, así que se reparten
     por lo que cabe, igual que el texto de las cartas. */
  const sections = useMemo(() => [
    ...letters.map((L) => ({ kind: 'letter', ...L })),
    ...backMatter,
  ], []);

  /* ── Secuencia completa de vistas ── */
  const { spreads, sectionStart, termSpread } = useMemo(() => {
    const all = [{ single: true, kind: 'cover', page: coverPage }];
    const starts = {};
    const terms  = {};

    if (pages) {
      // Numeración propia, independiente de la del PDF impreso.
      // La portada es la página 1 pero NUNCA se pagina, así que el libro
      // empieza en la 2. El paginador completa cada sección a un número
      // par de páginas, de modo que la paridad se conserva: pares a la
      // izquierda (verso), impares a la derecha (recto). Las páginas en
      // blanco cuentan, pero no se paginan.
      pages.forEach((pg, k) => {
        pg.folio = pg.blank ? null : String(k + 2);
      });

      // Páginas con contenido de cada sección, para «Glosario · 2/5»
      const totals = {};
      pages.forEach((pg) => {
        if (!pg.blank) totals[pg.section] = (totals[pg.section] || 0) + 1;
      });
      const seen = {};

      // Datos de cabecera y pie de una página
      const ctxFor = (S, pg) => {
        if (S.kind === 'letter') return {
          bookTitle:    bookMeta.title,
          bookAuthor:   bookMeta.author,
          bookImprint:  bookMeta.imprint,
          chapterLabel: `Carta ${S.number}`,
          chapterTitle: S.title,       // en estas cartas, el destinatario
          chapterTo:    S.title,
          chapterDate:  S.date,
          folio:        pg.folio,
        };
        const n = pg.blank ? null : (seen[pg.section] = (seen[pg.section] || 0) + 1);
        const total = totals[pg.section];
        return {
          bookTitle:   bookMeta.title,
          bookAuthor:  bookMeta.author,
          bookImprint: bookMeta.imprint,
          section:     n ? (total > 1 ? `${S.label} · ${n}/${total}` : S.label) : null,
          folio:       pg.folio,
        };
      };

      // Agrupar las páginas en dobles páginas, por sección
      let i = 0;
      while (i < pages.length) {
        const si = pages[i].section;
        const S  = sections[si];
        const key = S.id;
        if (starts[key] === undefined) starts[key] = all.length;

        const left  = pages[i];
        const right = (pages[i + 1] && pages[i + 1].section === si) ? pages[i + 1] : null;

        // Cabecera y pie: las cartas usan la declaración general; la
        // galería y el glosario, la de final de libro.
        const decl = S.kind === 'letter' ? chrome : (chrome.backMatter || chrome);
        left.chrome = pageChrome(decl, 'left', ctxFor(S, left));
        if (right) right.chrome = pageChrome(decl, 'right', ctxFor(S, right));
        left.kind = S.kind;
        if (right) right.kind = S.kind;

        const view = all.length;
        if (S.kind === 'glossary') {
          for (const pg of [left, right]) {
            for (const blk of pg?.blocks || []) {
              if (blk.type === 'glossary-entry') terms[normalizeTerm(blk.term)] = view;
            }
          }
        }

        all.push(S.kind === 'letter' ? {
          kind: 'letter',
          carta: S.number,
          cartaId: S.id,
          footnotes: S.footnotes,
          left,
          right: right || { blocks: [] },
          spreadNotes: [...notesIn(left.blocks), ...notesIn(right?.blocks)],
        } : {
          kind: S.kind,
          left,
          right: right || { blocks: [] },
        });
        i += right ? 2 : 1;
      }
    }

    all.push({ single: true, kind: 'back', page: backCoverPage });

    return { spreads: all, sectionStart: starts, termSpread: terms };
  }, [pages, sections]);

  const galleryStart  = sectionStart.galeria;
  const glossaryStart = sectionStart.glosario;

  /* ── Términos con entrada de glosario ── */
  const glossaryTerms = useMemo(() => {
    const set = new Set();
    glossaryFlat.forEach((e) => set.add(normalizeTerm(e.term)));
    return set;
  }, []);

  const { spread, flipping, flipDirection, goTo, jumpTo, next, prev } =
    useBook(spreads.length, { animate: prefs.animations, sound: prefs.sound && SOUND_READY });

  /* ── Mantener el sitio al repaginar ──
     Al cambiar el tamaño de letra o de ventana el libro se repagina y la
     doble página N ya no contiene lo mismo. Se recuerda el ANCLA de lo
     que se está leyendo y, tras repaginar, se salta sin animación a la
     doble página que la contiene. Mientras se recoloca no se actualiza
     el ancla, para que cambios sucesivos no la vayan desplazando. */
  const posRef     = useRef(COVER);
  const restoring  = useRef(false);
  useEffect(() => {
    if (restoring.current) { restoring.current = false; return; }
    posRef.current = spreadAnchor(spreads[spread]) || posRef.current;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spread]);
  useEffect(() => {
    const target = spreadForAnchor(spreads, posRef.current);
    if (target !== spread) { restoring.current = true; jumpTo(target); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spreads]);

  const [navOpen,       setNavOpen]       = useState(false);
  const [notesOpen,     setNotesOpen]     = useState(false);
  const [highlightNote, setHighlightNote] = useState(null);
  const [activeTerm,    setActiveTerm]    = useState(null);

  // Punto de lectura al que vuelve «Volver a la lectura» (como ancla)
  const returnToRef = useRef(null);
  const [hasReturn, setHasReturn] = useState(false);
  const current = spreads[spread] || {};

  const { hasRibbonHere, toggleRibbon, ribbon, resume, dismissResume } =
    useBookmark(BOOK_SLUG, {
      mode:      prefs.bookmarkMode,
      spreads,
      spread,
      ready:     Boolean(pages),
      isReading: current.kind === 'letter',
    });

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

  // Pulsar un término del texto: ir a la doble página del glosario
  // donde está SU entrada (no a la primera del glosario) y resaltarla
  const handleTermClick = useCallback((term) => {
    const target = termSpread[term] ?? glossaryStart;
    if (target === undefined) return;
    returnToRef.current = spreadAnchor(spreads[spread]);
    setHasReturn(true);
    setActiveTerm(term);
    goTo(target);
    setTimeout(() => setActiveTerm(null), 3000);
  }, [goTo, glossaryStart, termSpread, spread, spreads]);

  const handleReturn = useCallback(() => {
    goTo(spreadForAnchor(spreads, returnToRef.current));
  }, [goTo, spreads]);

  const goToSection = useCallback((target) => {
    if (current.kind === 'letter') {
      returnToRef.current = spreadAnchor(spreads[spread]);
      setHasReturn(true);
    }
    goTo(target);
  }, [goTo, spread, spreads, current.kind]);

  useEffect(() => {
    setHighlightNote(null);
    setNotesOpen(false);
  }, [spread]);


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
        onMenuOpen={() => setNavOpen(true)}
        onFullscreen={toggleFS}
        bookmarkMode={prefs.bookmarkMode}
        onBookmark={toggleRibbon}
        bookmarked={hasRibbonHere}
        optionsOpen={optionsOpen}
        onOptionsToggle={() => setOptionsOpen((o) => !o)}
        onOptionsClose={() => setOptionsOpen(false)}
        prefs={prefs}
        onSet={setPref}
        onFont={stepFont}
        soundReady={SOUND_READY}
        onReturn={(current.kind === 'gallery' || current.kind === 'glossary')
          && hasReturn ? handleReturn : null}
      />

      <Sidebar
        letters={cartas.map((c) => ({ ...c, sp: sectionStart[c.id] }))}
        spread={spread}
        onGoTo={goToSection}
        open={navOpen}
        onClose={() => setNavOpen(false)}
        hasNotes={() => false}
        bookTitle={bookMeta.title}
        bookAuthor={bookMeta.author}
        extraSections={[
          ...backMatter.map((S) => ({ label: S.label, sp: sectionStart[S.id] })),
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
      {resume !== null && (
        <div className="resume-bar" role="status">
          <span className="resume-ribbon" aria-hidden="true" />
          <span>
            Tu marcador está en la página {folioOf(spreads[resume])}
            {spreads[resume]?.carta ? ` · Carta ${spreads[resume].carta}` : ''}.
          </span>
          <button className="btn" onClick={() => { goTo(resume); dismissResume(); }}>
            Continuar
          </button>
          <button className="btn btn-ghost" onClick={dismissResume}>
            Empezar desde el principio
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
        sections={sections}
        codexWidth={box.w}
        codexHeight={box.h}
        signal={`${box.w}x${box.h}x${fontStep}`}
        onPages={setPages}
      />
    </>
  );
}

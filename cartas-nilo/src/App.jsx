import { useState, useEffect, useCallback } from "react";
import './App.css';
import Header from './components/header';
import Sidebar from './components/sidebar';
import ReaderPanel from './components/readerPanel';
import Book from './components/book/book';
import { NotesProvider } from "./components/NotesContext";

// Hooks personalizados
import { useAudio } from "./hooks/useAudio";
import { useKeyboard } from "./hooks/useKeyboard";
import { useSwipe } from "./hooks/useSwipe";

/**
 * Controlador principal de la aplicación React "Cartas del Nilo".
 * Coordina el estado general del pliego activo, temas, notas del lector,
 * barra de herramientas y vincula la navegación por gestos/teclado usando hooks modulares.
 */
function App() {
  const [spread, setSpread] = useState(0);
  const [flipping, setFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState(null);
  const [theme, setTheme] = useState("sepia");
  const [tocOpen, setTocOpen] = useState(false);
  const [readerOpen, setReaderOpen] = useState(false);

  const TOTAL = 7;

  // ---- PERSISTENCIA DE NOTAS DEL LECTOR ----
  const [notes, setNotes] = useState(() => {
    try {
      const raw = localStorage.getItem("cartaVI_reader_notes");
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem("cartaVI_reader_notes", JSON.stringify(notes));
  }, [notes]);

  // ---- REPRODUCIR SONIDO AL HOJEAR ----
  const playFlip = useAudio("/audio/49053354-page-turn-305789.mp3", 0.1);

  // ---- NAVEGACIÓN ENTRE PLIEGOS ----
  const goTo = useCallback((idx) => {
    if (flipping) return;
    if (idx < 0 || idx >= TOTAL) return;
    if (idx === spread) return;

    setFlipping(true);

    const direction = idx > spread ? "forward" : "backward";
    setFlipDirection(direction);

    setTimeout(() => {
      setSpread(idx);
      setFlipping(false);
    }, 900);
  }, [spread, flipping]);

  const next = useCallback(() => {
    playFlip();
    goTo(spread + 1);
  }, [playFlip, goTo, spread]);

  const prev = useCallback(() => {
    playFlip();
    goTo(spread - 1);
  }, [playFlip, goTo, spread]);

  // ---- VINCULACIÓN DE NAVEGACIÓN MODULAR ----
  useKeyboard(next, prev);
  useSwipe("shell", next, prev);

  // ---- ACCIONES DE INTERFAZ ----
  const toggleToc = () => {
    setTocOpen(prev => !prev);
  };

  const toggleReader = () => {
    setReaderOpen(prev => !prev);
  };

  const changeFont = (delta) => {
    const root = document.documentElement;
    const current = parseInt(getComputedStyle(root).fontSize);
    root.style.fontSize = (current + delta) + "px";
  };

  // ---- APLICACIÓN DEL TEMA VISUAL ----
  useEffect(() => {
    document.body.dataset.theme = theme;
  }, [theme]);

  return (
    <NotesProvider>
      <Header
        spread={spread}
        total={TOTAL}
        onToggleToc={toggleToc}
        onToggleReader={toggleReader}
        onFontUp={() => changeFont(1)}
        onFontDown={() => changeFont(-1)}
        onThemeChange={setTheme}
        theme={theme}
      />

      <Sidebar
        spread={spread}
        goTo={goTo}
        tocOpen={tocOpen}
        toggleToc={toggleToc}
        notes={notes}
      />

      <ReaderPanel
        spread={spread}
        open={readerOpen}
        onClose={() => setReaderOpen(false)}
        notes={notes}
        setNotes={setNotes}
      />

      <Book
        spread={spread}
        flipping={flipping}
        flipDirection={flipDirection}
        next={next}
        prev={prev}
        readerOpen={readerOpen}
      />
    </NotesProvider>
  );
}

export default App;

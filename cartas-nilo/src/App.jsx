import { useState, useEffect, useRef, useCallback } from "react";
import './App.css';
import Header from './components/header';
import Sidebar from './components/sidebar';
import ReaderPanel from './components/readerPanel';
import Book from './components/book/book';

function App() {

  const [spread, setSpread] = useState(0);
  const [flipping, setFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState(null);
  const [theme, setTheme] = useState("sepia");
  const [tocOpen, setTocOpen] = useState(false);
  const [readerOpen, setReaderOpen] = useState(false);
  const flipAudio = useRef(null);

  const TOTAL = 7;

  // ---- AUDIO ----
  useEffect(() => {
    const audio = new Audio("/audio/49053354-page-turn-305789.mp3");
    audio.preload = "auto";
    audio.volume = 0.1;
    flipAudio.current = audio;

    return () => {
      audio.pause();
      flipAudio.current = null;
    };
  }, []);

  const playFlip = useCallback(() => {
    const audio = flipAudio.current;
    if (!audio) return;

    // Clonar el audio para permitir solapamiento si se pasa rápido
    const clone = audio.cloneNode();
    clone.volume = audio.volume;
    clone.play().catch((err) => {
      // Fallback: intentar reproducir el original
      audio.currentTime = 0;
      audio.play().catch(() => { });
    });
  }, []);

  // ---- NAVIGATION ----
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

  // ---- UI ACTIONS ----
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

  // ---- ⌨️ TECLADO ----
  useEffect(() => {
    const handleKey = (e) => {
      if (e.target.tagName === "TEXTAREA") return;

      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        next();
      }

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [next, prev]);  // ← dependencias correctas

  // ---- 📱 SWIPE ----
  useEffect(() => {
    let touchX = 0;
    let touchY = 0;

    const handleStart = (e) => {
      touchX = e.changedTouches[0].screenX;
      touchY = e.changedTouches[0].screenY;
    };

    const handleEnd = (e) => {
      const dx = e.changedTouches[0].screenX - touchX;
      const dy = e.changedTouches[0].screenY - touchY;

      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
        dx < 0 ? next() : prev();
      }
    };

    const el = document.getElementById("shell");

    el?.addEventListener("touchstart", handleStart);
    el?.addEventListener("touchend", handleEnd);

    return () => {
      el?.removeEventListener("touchstart", handleStart);
      el?.removeEventListener("touchend", handleEnd);
    };
  }, [next, prev]);  // ← dependencias correctas

  // ---- THEME ----
  useEffect(() => {
    document.body.dataset.theme = theme;
  }, [theme]);

  return (
    <>
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
      />

      <ReaderPanel
        spread={spread}
        open={readerOpen}
        onClose={() => setReaderOpen(false)}
      />

      <Book
        spread={spread}
        flipping={flipping}
        flipDirection={flipDirection}
        next={next}
        prev={prev}
      />
    </>
  );
}

export default App;

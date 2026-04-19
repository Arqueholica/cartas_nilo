import { useState, useEffect } from "react";
import './App.css';
import Header from './components/header';
import Sidebar from './components/sidebar';
import ReaderPanel from './components/readerPanel';

function App() {

  const [spread, setSpread] = useState(0);
  const [flipping, setFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState(null);
  const [theme, setTheme] = useState("sepia");
  const [tocOpen, setTocOpen] = useState(false);
  const [readerOpen, setReaderOpen] = useState(false);

  const TOTAL = 7;

  // ---- NAVIGATION ----
  const goTo = (idx) => {
    if (idx < 0 || idx >= TOTAL) return;
    if (idx === spread) return;

    setFlipping(true);

    const direction = idx > spread ? 'forward' : 'backward';
    setFlipDirection(direction);

    setTimeout(() => {
      setSpread(idx);
      setFlipping(false);
    }, 900);
  };

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
    </>
  );
}

export default App;
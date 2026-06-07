import { createContext, useContext, useState, useRef, useCallback, useEffect } from "react";

const NotesContext = createContext(null);

export function NotesProvider({ children }) {
    const [open, setOpen] = useState(false);
    const [highlighted, setHighlighted] = useState(null);
    const hlTimer = useRef(null);
    const openRef = useRef(open);

    // Keep openRef in sync with open state
    useEffect(() => {
        openRef.current = open;
    }, [open]);

    // Intercept setOpen to safely reset highlighted note and clear timers when closing the panel,
    // avoiding cascading renders inside useEffect hooks.
    const safeSetOpen = useCallback((val) => {
        setOpen((prev) => {
            const nextVal = typeof val === "function" ? val(prev) : val;
            if (!nextVal) {
                setHighlighted(null);
                if (hlTimer.current) {
                    clearTimeout(hlTimer.current);
                }
            }
            return nextVal;
        });
    }, []);

    const highlightNote = useCallback((num) => {
        const wasOpen = openRef.current;
        setOpen(true);
        setHighlighted(null); // reset para que el efecto dispare aunque sea el mismo número
        if (hlTimer.current) {
            clearTimeout(hlTimer.current);
        }
        
        // Delay matching ver1.0 (50ms if open, 420ms if closed)
        const delay = wasOpen ? 50 : 420;
        
        setTimeout(() => {
            setHighlighted(num);
            hlTimer.current = setTimeout(() => setHighlighted(null), 4000); // 4 seconds like ver1.0
        }, delay);
    }, []);

    const [lightbox, setLightbox] = useState({ open: false, src: "", caption: "" });

    const openLightbox = useCallback((src, caption) => {
        setLightbox({ open: true, src, caption });
    }, []);

    const closeLightbox = useCallback(() => {
        setLightbox((prev) => ({ ...prev, open: false }));
    }, []);

    return (
        <NotesContext.Provider value={{ 
            open, 
            setOpen: safeSetOpen, 
            highlighted, 
            setHighlighted, 
            highlightNote,
            lightbox,
            openLightbox,
            closeLightbox
        }}>
            {children}
        </NotesContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useNotes() {
    return useContext(NotesContext);
}

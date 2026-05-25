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

    // Clear highlighted when closed
    useEffect(() => {
        if (!open) {
            setHighlighted(null);
            clearTimeout(hlTimer.current);
        }
    }, [open]);

    const highlightNote = useCallback((num) => {
        const wasOpen = openRef.current;
        setOpen(true);
        setHighlighted(null); // reset para que el efecto dispare aunque sea el mismo número
        clearTimeout(hlTimer.current);
        
        // Delay matching ver1.0 (50ms if open, 420ms if closed)
        const delay = wasOpen ? 50 : 420;
        
        setTimeout(() => {
            setHighlighted(num);
            hlTimer.current = setTimeout(() => setHighlighted(null), 4000); // 4 seconds like ver1.0
        }, delay);
    }, []);

    return (
        <NotesContext.Provider value={{ open, setOpen, highlighted, setHighlighted, highlightNote }}>
            {children}
        </NotesContext.Provider>
    );
}

export function useNotes() {
    return useContext(NotesContext);
}

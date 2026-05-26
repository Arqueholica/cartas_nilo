import { useEffect } from "react";

/**
 * Hook para detectar gestos de deslizamiento táctil (swipe) horizontal
 * en un elemento específico del DOM.
 * 
 * @param {string} elementId ID del elemento que recibirá los eventos táctiles
 * @param {Function} onSwipeLeft Acción al deslizar hacia la izquierda (página siguiente)
 * @param {Function} onSwipeRight Acción al deslizar hacia la derecha (página anterior)
 */
export function useSwipe(elementId, onSwipeLeft, onSwipeRight) {
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

            // Detectar si el deslizamiento fue predominantemente horizontal
            // y si superó el umbral mínimo de 50 píxeles
            if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
                if (dx < 0) {
                    onSwipeLeft();
                } else {
                    onSwipeRight();
                }
            }
        };

        const el = document.getElementById(elementId);
        if (!el) return;

        el.addEventListener("touchstart", handleStart, { passive: true });
        el.addEventListener("touchend", handleEnd, { passive: true });

        return () => {
            el.removeEventListener("touchstart", handleStart);
            el.removeEventListener("touchend", handleEnd);
        };
    }, [elementId, onSwipeLeft, onSwipeRight]);
}

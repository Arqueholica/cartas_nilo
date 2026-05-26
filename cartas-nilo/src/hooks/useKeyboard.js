import { useEffect } from "react";

/**
 * Hook para manejar la navegación por teclado (flechas y espacio)
 * de forma segura, ignorando eventos en áreas de entrada de texto.
 * 
 * @param {Function} onNext Acción al presionar flecha derecha o espacio
 * @param {Function} onPrev Acción al presionar flecha izquierda
 */
export function useKeyboard(onNext, onPrev) {
    useEffect(() => {
        const handleKey = (e) => {
            // Ignorar si el usuario está escribiendo en campos de texto o notas
            if (
                e.target.tagName === "TEXTAREA" || 
                e.target.tagName === "INPUT" ||
                e.target.isContentEditable
            ) {
                return;
            }

            if (e.key === "ArrowRight" || e.key === " ") {
                e.preventDefault();
                onNext();
            }

            if (e.key === "ArrowLeft") {
                e.preventDefault();
                onPrev();
            }
        };

        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [onNext, onPrev]);
}

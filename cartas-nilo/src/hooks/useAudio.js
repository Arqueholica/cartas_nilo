import { useEffect, useRef, useCallback } from "react";

/**
 * Hook personalizado para manejar la reproducción de un efecto de sonido
 * con soporte para precarga y solapamiento rápido (clonación).
 * 
 * @param {string} src Ruta del archivo de audio
 * @param {number} volume Volumen inicial (de 0.0 a 1.0)
 * @returns {Function} Función para reproducir el audio
 */
export function useAudio(src, volume = 0.1) {
    const audioRef = useRef(null);

    useEffect(() => {
        const audio = new Audio(src);
        audio.preload = "auto";
        audio.volume = volume;
        audioRef.current = audio;

        return () => {
            audio.pause();
            audioRef.current = null;
        };
    }, [src, volume]);

    const play = useCallback(() => {
        const audio = audioRef.current;
        if (!audio) return;

        try {
            // Clonar el audio para permitir solapamiento si se pasa rápido
            const clone = audio.cloneNode();
            clone.volume = audio.volume;
            clone.play().catch(() => {
                // Fallback: intentar reproducir el original
                audio.currentTime = 0;
                audio.play().catch(() => {});
            });
        } catch {
            // Fallback general en caso de error del DOM
            audio.currentTime = 0;
            audio.play().catch(() => {});
        }
    }, []);

    return play;
}

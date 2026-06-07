import { useNotes } from "../NotesContext";
import { useEffect } from "react";

/**
 * Componente Lightbox para ampliación de imágenes a pantalla completa.
 * Lee su estado del NotesContext y provee cierre interactivo.
 */
const Lightbox = () => {
    const { lightbox, closeLightbox } = useNotes();

    // Cerrar con Escape
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape" && lightbox.open) {
                closeLightbox();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [lightbox.open, closeLightbox]);

    const handleBgClick = (e) => {
        // Cerrar si se hace clic en el fondo o en el botón de cerrar
        if (e.target.id === "lb" || e.target.classList.contains("lb-x")) {
            closeLightbox();
        }
    };

    return (
        <div 
            className={`lb ${lightbox.open ? "open" : ""}`} 
            id="lb" 
            onClick={handleBgClick}
        >
            <button className="lb-x" onClick={closeLightbox}>&times;</button>
            <img id="lbImg" src={lightbox.src} alt={lightbox.caption || ""} />
            <p className="lb-cap" dangerouslySetInnerHTML={{ __html: lightbox.caption || "" }} />
        </div>
    );
};

export default Lightbox;

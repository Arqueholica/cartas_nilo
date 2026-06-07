import { useState } from "react";
import { useNotes } from "../NotesContext";

/**
 * Componente modular InlineNote.
 * Muestra una nota desplegable que puede contener imágenes y textos.
 * Soporta tres distribuciones (layout):
 * - "single": Una única imagen principal con pie de foto y zoom.
 * - "individual": Varias imágenes independientes, cada una con su pie de foto y zoom.
 * - "gallery": Una galería de miniaturas horizontales con un pie de foto común.
 */
const InlineNote = ({ title, layout = "single", images = [], caption }) => {
    const [open, setOpen] = useState(false);
    const { openLightbox } = useNotes();

    return (
        <div className={`inl ${open ? "open" : ""}`}>
            <button className="inl-tog" onClick={() => setOpen(!open)}>
                <span className="inl-arr"></span>
                <span dangerouslySetInnerHTML={{ __html: title }} />
            </button>

            <div className="inl-body">
                {layout === "single" && images.length > 0 && (
                    <div>
                        <div className="iw" onClick={() => openLightbox(images[0].src, images[0].caption)}>
                            <img src={images[0].src} alt={images[0].alt || ""} loading="lazy" />
                            <span className="zi">⤢</span>
                        </div>
                        {images[0].caption && (
                            <p className="cap" dangerouslySetInnerHTML={{ __html: images[0].caption }} />
                        )}
                    </div>
                )}

                {layout === "individual" && images.length > 0 && (
                    <div>
                        {images.map((imgData, idx) => (
                            <div key={idx} style={{ marginBottom: idx < images.length - 1 ? "10px" : "0" }}>
                                <div className="iw" onClick={() => openLightbox(imgData.src, imgData.caption)}>
                                    <img src={imgData.src} alt={imgData.alt || ""} loading="lazy" />
                                    <span className="zi">⤢</span>
                                </div>
                                {imgData.caption && (
                                    <p className="cap" dangerouslySetInnerHTML={{ __html: imgData.caption }} />
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {layout === "gallery" && images.length > 0 && (
                    <div>
                        <div className="igal">
                            {images.map((imgData, idx) => (
                                <img
                                    key={idx}
                                    src={imgData.src}
                                    alt={imgData.alt || ""}
                                    loading="lazy"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        openLightbox(imgData.src, imgData.alt);
                                    }}
                                />
                            ))}
                        </div>
                        {caption && (
                            <p className="cap" dangerouslySetInnerHTML={{ __html: caption }} />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default InlineNote;

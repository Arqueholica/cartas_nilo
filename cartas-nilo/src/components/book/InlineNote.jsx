import { useState } from "react";

const InlineNote = ({ title, children, caption, img }) => {
    const [open, setOpen] = useState(false);

    const images = img ? (Array.isArray(img) ? img : [img]) : [];
    const multiple = images.length > 1;

    return (
        <div className={`inl ${open ? "open" : ""}`}>
            <button className="inl-tog" onClick={() => setOpen(!open)}>
                <span className="inl-arr"></span>
                {title}
            </button>

            <div className="inl-body">
                {images.length > 0 && (
                    multiple ? (
                        <div className="igal-stack">
                            {images.map((src, i) => (
                                <img key={i} src={src} alt={`${title} — imagen ${i + 1}`} loading="lazy" />
                            ))}
                        </div>
                    ) : (
                        <div className="iw">
                            <img src={images[0]} alt={title} loading="lazy" />
                            <span className="zi">⤢</span>
                        </div>
                    )
                )}

                {children}

                {caption && <p className="cap">{caption}</p>}
            </div>
        </div>
    );
};

export default InlineNote;

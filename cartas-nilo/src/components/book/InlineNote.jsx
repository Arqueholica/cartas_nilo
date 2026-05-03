import { useState } from "react";

const InlineNote = ({ title, children, caption, img }) => {
    const [open, setOpen] = useState(false);

    return (
        <div className={`inl ${open ? "open" : ""}`}>
            <button className="inl-tog" onClick={() => setOpen(!open)}>
                <span className="inl-arr"></span>
                {title}
            </button>

            <div className="inl-body">
                {img && (
                    <div className="iw">
                        <img src={img} alt={title} loading="lazy" />
                        <span className="zi">⤢</span>
                    </div>
                )}

                {children}

                {caption && <p className="cap">{caption}</p>}
            </div>
        </div>
    );
};

export default InlineNote;
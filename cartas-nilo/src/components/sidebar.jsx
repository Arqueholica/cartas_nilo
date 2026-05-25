const Sidebar = ({ spread, goTo, tocOpen, toggleToc, notes }) => {

    const items = [
        { title: "Portada", sp: 0, page: "i" },
        { title: "Apertura · Noticias de Ruan", sp: 1, page: "1–2" },
        { title: "El khamsin · Medinet El-Fayum", sp: 2, page: "3–4" },
        { title: "Djebel El-Teir · En Quena", sp: 3, page: "5–6" },
        { title: "Ruchiuk-Hanem · La noche", sp: 4, page: "7–8" },
        { title: "Tebas · Las cataratas", sp: 5, page: "9–10" },
        { title: "Despedida y P.S.", sp: 6, page: "11" }
    ];

    return (
        <>
            {/* BACKDROP */}
            <div
                className={`toc-bg ${tocOpen ? "open" : ""}`}
                onClick={toggleToc}
            />

            {/* SIDEBAR */}
            <nav className={`toc-side ${tocOpen ? "open" : ""}`}>
                <div className="toc-hd">
                    <h2>Índice</h2>
                    <small>Noticias desde El Nilo · Gustave Flaubert</small>
                    <button className="toc-x" onClick={toggleToc}>
                        &times;
                    </button>
                </div>

                <ul className="toc-ul">
                    {items.map(item => (
                        <li
                            key={item.sp}
                            className={`toc-li ${spread === item.sp ? "on" : ""}`}
                            onClick={() => {
                                goTo(item.sp);
                                toggleToc(); // cerrar al navegar
                            }}
                        >
                            {item.title}
                            <span className="toc-pencil">
                                {notes["s" + item.sp]?.length ? "✏️" : ""}
                            </span>
                            <span className="toc-pg">{item.page}</span>
                        </li>
                    ))}
                </ul>
            </nav>
        </>
    );
};

export default Sidebar;
/**
 * Componente modular de Página para el libro interactivo.
 * Soporta alineación izquierda/derecha, clases de estilo extendidas y estilos inline.
 */
const Page = ({ side = "right", className = "", style = {}, children }) => {
    return (
        <div 
            className={`pg ${side === "left" ? "pg-l" : "pg-r"} ${className}`}
            style={style}
        >
            {children}
        </div>
    );
};

export default Page;
const Spread = ({ active, flipping, direction, left, right }) => {
    return (
        <div
            className={`spread 
        ${active ? "active" : ""} 
        ${flipping ? `flipping-${direction}` : ""}`}
        >
            {left}
            {right}
        </div>
    );
};

export default Spread;
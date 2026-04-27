const Page = ({ side = "right", children }) => {
    return (
        <div className={`pg ${side === "left" ? "pg-l" : "pg-r"}`}>
            {children}
        </div>
    );
};

export default Page;
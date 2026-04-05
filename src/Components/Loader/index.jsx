import React from "react";

function Loader() {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="h-[90px] w-[90px] animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
    );
}

export default Loader;

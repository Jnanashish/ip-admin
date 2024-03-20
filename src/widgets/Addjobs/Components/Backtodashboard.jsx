import React from "react";
import { useNavigate } from "react-router-dom";

function Backtodashboard() {
    const navigate = useNavigate();

    const handleBack = () => {
        navigate("/admin");
    };

    return (
        <div
            onClick={() => handleBack()}
            style={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
            }}
        >
            <img style={{ width: "30px", marginRight: "10px" }} src="https://img.icons8.com/ios-filled/100/null/circled-left-2.png" alt="back button" />
            <h3>Back to dashboard</h3>
        </div>
    );
}

export default Backtodashboard;

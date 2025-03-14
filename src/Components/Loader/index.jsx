import React from "react";
import { CircularProgress } from "@mui/material";

function Loader() {
    const customStyle = {
        overlayContainer : {
            height: "100vh",
            width: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.2)",
            zIndex: "2",
            position: "fixed",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            top: "0px",
            marginLeft: "-40px",
        }
    }
    return (
        <div style={customStyle.overlayContainer}>
            <CircularProgress size={90} color="primary" />
        </div>
    );
}

export default Loader;

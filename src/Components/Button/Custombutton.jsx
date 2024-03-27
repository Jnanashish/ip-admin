import React from "react";
import { Button } from "@mui/material";

function Custombutton(props) {
    const { size, disableElevation, fullWidth, label, variant, endIcon, disabled, style, startIcon, className } = props;
    return (
        <div>
            <Button
                size={!!size ? size : "medium"}
                disableElevation={!!disableElevation ? disableElevation : true}
                className={!!className ? className : {}}
                fullWidth={!!fullWidth ? fullWidth : true}
                disabled={!!disabled ? disabled : false}
                onClick={() => props.onClick()}
                variant={!!variant ? variant : "contained"}
                endIcon={!!endIcon ? endIcon : ""}
                startIcon={!!startIcon ? startIcon : ""}
                style={!!style ? style : {}}
            >
                {label}
            </Button>
        </div>
    );
}

export default Custombutton;

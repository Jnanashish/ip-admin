import React from "react";
import { Button } from "@mui/material";
import styles from "./custom.module.scss";

function Custombutton(props) {
    const { size, disableElevation, fullWidth, label, variant, endIcon, disabled, style } = props;
    return (
        <div>
            <Button
                size={!!size ? size : "medium"}
                disableElevation={!!disableElevation ? disableElevation : true}
                // className={styles.btn}
                fullWidth={!!fullWidth ? fullWidth : true}
                disabled={!!disabled ? disabled : false}
                onClick={() => props.onClick()}
                variant={!!variant ? variant : "contained"}
                endIcon={!!endIcon ? endIcon : ""}
                style={!!style ? style : {}}
            >
                {label}
            </Button>
        </div>
    );
}

export default Custombutton;

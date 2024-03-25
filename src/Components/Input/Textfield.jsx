import React from "react";
import { TextField, MenuItem } from "@mui/material";

const CustomTextField = (props) => {
    const { label, value, type, size, disabled, error, multiline, rows } = props;
    return (
        <>
            {type !== "select" && (
                <TextField
                    size={!!size ? size : "Normal"}
                    margin="normal"
                    fullWidth={!!props.fullWidth ? true : ""}
                    label={label}
                    value={value}
                    onChange={(e) => props.onChange(e.target.value)}
                    sx={!!props.sx ? props.sx : {}}
                    InputProps={!!props.InputProps ? props.InputProps : {}}
                    onBlur={!!props.onBlur ? (e) => props.onBlur(e.target.value) : () => {}}
                    disabled={disabled ? disabled : false}
                    error={error ? error : false}
                    className={!!props.className ? props.className : ""}
                    style={{ backgroundColor: "#FFF", borderRadius: "8px" }}
                    multiline={!!multiline ? multiline : false}
                    rows={!!rows ? rows : 1}
                />
            )}
            {type === "select" && (
                <TextField
                    select
                    size="Normal"
                    margin="normal"
                    fullWidth={!!props.fullWidth ? true : ""}
                    label={label}
                    value={value}
                    onChange={(e) => props.onChange(e.target.value)}
                    sx={!!props.sx ? props.sx : {}}
                    InputProps={!!props.InputProps ? props.InputProps : {}}
                    disabled={disabled ? disabled : false}
                    style={{ backgroundColor: "#FFF", borderRadius: "8px" }}
                >
                    {props?.optionData.map((option) => (
                        <MenuItem key={option} value={option}>
                            {option}
                        </MenuItem>
                    ))}
                </TextField>
            )}
        </>
    );
};

export default CustomTextField;

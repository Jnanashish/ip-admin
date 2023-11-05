import React from "react";
import {
    TextField,
    Button,
    IconButton,
    FormGroup,
    Switch,
    FormControlLabel,
    Divider,
    InputAdornment,
    MenuItem,
} from "@mui/material";

const CustomTextField = (props) => {
    const { label, value, type, size, disabled, error } = props;
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
                    onBlur={(e) => props.onBlur(e.target.value)}
                    disabled={disabled ? disabled : false}
                    error={error ? error : false}
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

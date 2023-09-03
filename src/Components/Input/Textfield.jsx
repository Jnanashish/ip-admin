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
    const { label, value, type, size } = props;
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

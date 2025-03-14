import React from "react";
import PropTypes from "prop-types";
import { TextField, MenuItem } from "@mui/material";

/**
 * CustomTextField - A standardized text field component using Material UI
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} props.label - Input label
 * @param {string|number} props.value - Input value
 * @param {string} props.type - Input type (text, select, etc.)
 * @param {string} props.size - Input size (small, medium, large)
 * @param {boolean} props.disabled - Whether input is disabled
 * @param {boolean} props.error - Whether input has an error
 * @param {boolean} props.multiline - Whether input is multiline
 * @param {number} props.rows - Number of rows for multiline input
 * @param {boolean} props.fullWidth - Whether input should take full width
 * @param {Object} props.sx - Custom styles for the TextField
 * @param {Object} props.InputProps - Props for the Input component
 * @param {Function} props.onChange - Change handler
 * @param {Function} props.onBlur - Blur handler
 * @param {Function} props.onFocus - Focus handler
 * @param {Function} props.onKeyUp - KeyUp handler
 * @param {string} props.className - Additional CSS class
 * @param {Array} props.optionData - Options for select input
 * @returns {React.ReactElement} CustomTextField component
 */
const CustomTextField = ({
    label,
    value,
    type,
    size = "medium",
    disabled = false,
    error = false,
    multiline = false,
    rows = 1,
    fullWidth = false,
    sx = {},
    InputProps = {},
    onChange,
    onBlur,
    onFocus,
    onKeyUp,
    className = "",
    optionData = []
}) => {
    // Common props for both text and select inputs
    const commonProps = {
        size: size,
        margin: "normal",
        fullWidth: fullWidth ? true : false,
        label: label,
        value: value,
        onChange: (e) => onChange(e.target.value),
        sx: sx,
        InputProps: InputProps,
        disabled: disabled,
        error: error,
        className: className,
        style: { backgroundColor: "#FFF", borderRadius: "8px" }
    };

    // Handle optional event handlers
    if (onBlur) commonProps.onBlur = (e) => onBlur(e.target.value);
    if (onFocus) commonProps.onFocus = (e) => onFocus(e.target.value);
    if (onKeyUp) commonProps.onKeyUp = (e) => onKeyUp(e.target.value);

    // Render select input
    if (type === "select") {
        return (
            <TextField
                {...commonProps}
                select
            >
                {optionData.map((option) => (
                    <MenuItem key={option} value={option}>
                        {option}
                    </MenuItem>
                ))}
            </TextField>
        );
    }

    // Render text input
    return (
        <TextField
            {...commonProps}
            multiline={multiline}
            rows={rows}
            type={type || "text"}
        />
    );
};

CustomTextField.propTypes = {
    label: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    type: PropTypes.string,
    size: PropTypes.oneOf(["small", "medium", "large"]),
    disabled: PropTypes.bool,
    error: PropTypes.bool,
    multiline: PropTypes.bool,
    rows: PropTypes.number,
    fullWidth: PropTypes.bool,
    sx: PropTypes.object,
    InputProps: PropTypes.object,
    onChange: PropTypes.func.isRequired,
    onBlur: PropTypes.func,
    onFocus: PropTypes.func,
    onKeyUp: PropTypes.func,
    className: PropTypes.string,
    optionData: PropTypes.array
};

export default CustomTextField;

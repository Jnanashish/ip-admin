import React from "react";
import PropTypes from "prop-types";
import { Button } from "@mui/material";

/**
 * Custombutton - A standardized button component using Material UI
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} props.label - Button label
 * @param {string} props.variant - Button variant (contained, outlined, text)
 * @param {string} props.size - Button size (small, medium, large)
 * @param {boolean} props.disabled - Whether button is disabled
 * @param {boolean} props.fullWidth - Whether button should take full width
 * @param {boolean} props.disableElevation - Whether to disable button elevation
 * @param {React.ReactNode} props.startIcon - Icon to display before label
 * @param {React.ReactNode} props.endIcon - Icon to display after label
 * @param {Function} props.onClick - Click handler
 * @param {Object} props.style - Custom inline styles
 * @param {string} props.className - Additional CSS class
 * @returns {React.ReactElement} Custombutton component
 */
const Custombutton = ({
    label,
    variant = "contained",
    size = "medium",
    disabled = false,
    fullWidth = true,
    disableElevation = true,
    startIcon,
    endIcon,
    onClick,
    style = {},
    className = ""
}) => {
    return (
        <Button
            size={size}
            disableElevation={disableElevation}
            className={className}
            fullWidth={fullWidth}
            disabled={disabled}
            onClick={onClick}
            variant={variant}
            endIcon={endIcon || null}
            startIcon={startIcon || null}
            style={style}
        >
            {label}
        </Button>
    );
};

Custombutton.propTypes = {
    label: PropTypes.string.isRequired,
    variant: PropTypes.oneOf(["contained", "outlined", "text"]),
    size: PropTypes.oneOf(["small", "medium", "large"]),
    disabled: PropTypes.bool,
    fullWidth: PropTypes.bool,
    disableElevation: PropTypes.bool,
    startIcon: PropTypes.node,
    endIcon: PropTypes.node,
    onClick: PropTypes.func.isRequired,
    style: PropTypes.object,
    className: PropTypes.string
};

export default Custombutton;

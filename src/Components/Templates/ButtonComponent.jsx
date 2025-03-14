import React from 'react';
import PropTypes from 'prop-types';
import { CircularProgress } from '@mui/material';

/**
 * ButtonComponent - A standardized template for button components
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} props.label - Button label
 * @param {string} props.variant - Button variant
 * @param {string} props.color - Button color
 * @param {string} props.size - Button size
 * @param {Function} props.onClick - Click handler
 * @param {boolean} props.disabled - Whether button is disabled
 * @param {boolean} props.isLoading - Whether button is in loading state
 * @param {React.ReactNode} props.startIcon - Icon to display before label
 * @param {React.ReactNode} props.endIcon - Icon to display after label
 * @param {string} props.type - Button type
 * @param {string} props.className - Additional CSS class
 * @returns {React.ReactElement} Button component
 */
const ButtonComponent = ({
  label,
  variant = 'contained',
  color = 'primary',
  size = 'medium',
  onClick,
  disabled = false,
  isLoading = false,
  startIcon,
  endIcon,
  type = 'button',
  className = ''
}) => {
  // Determine button classes based on props
  const buttonClasses = [
    'standard-button',
    `variant-${variant}`,
    `color-${color}`,
    `size-${size}`,
    className
  ].filter(Boolean).join(' ');
  
  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
    >
      {isLoading && (
        <CircularProgress 
          size={size === 'small' ? 16 : size === 'large' ? 24 : 20}
          className="button-loader"
        />
      )}
      
      {!isLoading && startIcon && (
        <span className="button-start-icon">{startIcon}</span>
      )}
      
      <span className="button-label">{label}</span>
      
      {!isLoading && endIcon && (
        <span className="button-end-icon">{endIcon}</span>
      )}
    </button>
  );
};

ButtonComponent.propTypes = {
  label: PropTypes.string.isRequired,
  variant: PropTypes.oneOf(['contained', 'outlined', 'text']),
  color: PropTypes.oneOf(['primary', 'secondary', 'success', 'error', 'warning', 'info']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  isLoading: PropTypes.bool,
  startIcon: PropTypes.node,
  endIcon: PropTypes.node,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  className: PropTypes.string
};

export default ButtonComponent; 
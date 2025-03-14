import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';

/**
 * InputComponent - A standardized template for input field components
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} props.id - Input ID
 * @param {string} props.name - Input name
 * @param {string} props.label - Input label
 * @param {string} props.type - Input type
 * @param {string} props.value - Input value
 * @param {Function} props.onChange - Change handler
 * @param {Function} props.onBlur - Blur handler
 * @param {Function} props.onFocus - Focus handler
 * @param {string} props.placeholder - Input placeholder
 * @param {boolean} props.required - Whether input is required
 * @param {boolean} props.disabled - Whether input is disabled
 * @param {boolean} props.readOnly - Whether input is read-only
 * @param {string} props.error - Error message
 * @param {string} props.helperText - Helper text
 * @param {Array} props.options - Options for select inputs
 * @param {string} props.className - Additional CSS class
 * @returns {React.ReactElement} Input component
 */
const InputComponent = ({
  id,
  name,
  label,
  type = 'text',
  value = '',
  onChange,
  onBlur,
  onFocus,
  placeholder = '',
  required = false,
  disabled = false,
  readOnly = false,
  error = '',
  helperText = '',
  options = [],
  className = ''
}) => {
  // State for internal value management
  const [inputValue, setInputValue] = useState(value);
  
  // Update internal value when prop changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);
  
  // Handle input change
  const handleChange = useCallback((e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    if (onChange) {
      onChange(newValue, name);
    }
  }, [onChange, name]);
  
  // Handle input blur
  const handleBlur = useCallback((e) => {
    if (onBlur) {
      onBlur(e.target.value, name);
    }
  }, [onBlur, name]);
  
  // Handle input focus
  const handleFocus = useCallback((e) => {
    if (onFocus) {
      onFocus(e.target.value, name);
    }
  }, [onFocus, name]);
  
  // Render different input types
  const renderInput = () => {
    const commonProps = {
      id,
      name,
      value: inputValue,
      onChange: handleChange,
      onBlur: handleBlur,
      onFocus: handleFocus,
      placeholder,
      disabled,
      readOnly,
      required,
      'aria-invalid': !!error,
      'aria-describedby': `${id}-helper ${id}-error`
    };
    
    switch (type) {
      case 'textarea':
        return (
          <textarea
            {...commonProps}
            className={`standard-textarea ${error ? 'error' : ''} ${className}`}
            rows={5}
          />
        );
        
      case 'select':
        return (
          <select
            {...commonProps}
            className={`standard-select ${error ? 'error' : ''} ${className}`}
          >
            <option value="">Select an option</option>
            {options.map((option) => (
              <option key={option.value || option} value={option.value || option}>
                {option.label || option}
              </option>
            ))}
          </select>
        );
        
      case 'checkbox':
        return (
          <input
            {...commonProps}
            type="checkbox"
            checked={!!inputValue}
            className={`standard-checkbox ${className}`}
          />
        );
        
      case 'radio':
        return (
          <div className="standard-radio-group">
            {options.map((option) => (
              <label key={option.value || option} className="standard-radio-label">
                <input
                  type="radio"
                  name={name}
                  value={option.value || option}
                  checked={inputValue === (option.value || option)}
                  onChange={handleChange}
                  disabled={disabled}
                  className="standard-radio"
                />
                {option.label || option}
              </label>
            ))}
          </div>
        );
        
      default:
        return (
          <input
            {...commonProps}
            type={type}
            className={`standard-input ${error ? 'error' : ''} ${className}`}
          />
        );
    }
  };
  
  return (
    <div className="standard-form-field">
      {label && (
        <label htmlFor={id} className="standard-label">
          {label}
          {required && <span className="standard-required">*</span>}
        </label>
      )}
      
      {renderInput()}
      
      {helperText && (
        <div id={`${id}-helper`} className="standard-helper-text">
          {helperText}
        </div>
      )}
      
      {error && (
        <div id={`${id}-error`} className="standard-error-text">
          {error}
        </div>
      )}
    </div>
  );
};

InputComponent.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  type: PropTypes.oneOf([
    'text', 'password', 'email', 'number', 'tel', 'url', 'date', 
    'datetime-local', 'time', 'month', 'week', 'color', 'file',
    'textarea', 'select', 'checkbox', 'radio'
  ]),
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.bool
  ]),
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  onFocus: PropTypes.func,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  readOnly: PropTypes.bool,
  error: PropTypes.string,
  helperText: PropTypes.string,
  options: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        label: PropTypes.string.isRequired
      })
    ])
  ),
  className: PropTypes.string
};

export default InputComponent; 
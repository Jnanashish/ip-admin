import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';

/**
 * FormComponent - A standardized template for form components
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} props.title - Form title
 * @param {Object} props.initialData - Initial form data
 * @param {Function} props.onSubmit - Form submission handler
 * @param {boolean} props.isLoading - Loading state
 * @param {Object} props.validationRules - Form validation rules
 * @param {React.ReactNode} props.children - Form fields
 * @returns {React.ReactElement} Form component
 */
const FormComponent = ({
  title,
  initialData = {},
  onSubmit,
  isLoading = false,
  validationRules = {},
  children
}) => {
  // State management
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [isDirty, setIsDirty] = useState(false);

  // Reset form when initialData changes
  useEffect(() => {
    setFormData(initialData);
    setErrors({});
    setIsDirty(false);
  }, [initialData]);

  // Handle input change
  const handleChange = useCallback((field, value) => {
    setFormData(prevData => ({
      ...prevData,
      [field]: value
    }));
    setIsDirty(true);
    
    // Clear field error when value changes
    if (errors[field]) {
      setErrors(prevErrors => ({
        ...prevErrors,
        [field]: null
      }));
    }
  }, [errors]);

  // Validate form
  const validateForm = useCallback(() => {
    const newErrors = {};
    let isValid = true;

    // Apply validation rules
    Object.entries(validationRules).forEach(([field, rules]) => {
      if (rules.required && !formData[field]) {
        newErrors[field] = `${field} is required`;
        isValid = false;
      }
      
      if (rules.minLength && formData[field]?.length < rules.minLength) {
        newErrors[field] = `${field} must be at least ${rules.minLength} characters`;
        isValid = false;
      }
      
      if (rules.pattern && !rules.pattern.test(formData[field])) {
        newErrors[field] = `${field} format is invalid`;
        isValid = false;
      }
      
      if (rules.custom && typeof rules.custom === 'function') {
        const customError = rules.custom(formData[field], formData);
        if (customError) {
          newErrors[field] = customError;
          isValid = false;
        }
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [formData, validationRules]);

  // Handle form submission
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  }, [formData, onSubmit, validateForm]);

  // Render children with injected props
  const renderChildren = () => {
    return React.Children.map(children, child => {
      if (React.isValidElement(child)) {
        return React.cloneElement(child, {
          formData,
          handleChange,
          errors
        });
      }
      return child;
    });
  };

  return (
    <div className="standard-form-container">
      {title && <h2 className="standard-form-title">{title}</h2>}
      
      <form onSubmit={handleSubmit} className="standard-form">
        {renderChildren()}
        
        <div className="standard-form-actions">
          <button 
            type="submit" 
            className="standard-button primary" 
            disabled={isLoading || (!isDirty && !Object.keys(initialData).length)}
          >
            {isLoading ? 'Processing...' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  );
};

FormComponent.propTypes = {
  title: PropTypes.string,
  initialData: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  validationRules: PropTypes.object,
  children: PropTypes.node
};

export default FormComponent; 
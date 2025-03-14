import React from 'react';
import PropTypes from 'prop-types';

/**
 * CardComponent - A standardized template for card/detail components
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} props.title - Card title
 * @param {Object} props.data - Card data
 * @param {Array} props.fields - Fields to display
 * @param {Function} props.onEdit - Function called when edit button is clicked
 * @param {Function} props.onDelete - Function called when delete button is clicked
 * @param {React.ReactNode} props.actions - Additional action buttons
 * @param {React.ReactNode} props.footer - Footer content
 * @param {string} props.className - Additional CSS class
 * @returns {React.ReactElement} Card component
 */
const CardComponent = ({
  title,
  data = {},
  fields = [],
  onEdit,
  onDelete,
  actions,
  footer,
  className = ''
}) => {
  // Format field value based on type
  const formatValue = (value, type) => {
    if (value === undefined || value === null) {
      return 'N/A';
    }

    switch (type) {
      case 'date':
        return new Date(value).toLocaleDateString();
      case 'datetime':
        return new Date(value).toLocaleString();
      case 'boolean':
        return value ? 'Yes' : 'No';
      case 'array':
        return Array.isArray(value) ? value.join(', ') : value;
      case 'html':
        return <div dangerouslySetInnerHTML={{ __html: value }} />;
      case 'image':
        return <img src={value} alt={title} className="standard-card-image" />;
      default:
        return value;
    }
  };

  return (
    <div className={`standard-card ${className}`}>
      {title && (
        <div className="standard-card-header">
          <h3 className="standard-card-title">{title}</h3>
          
          <div className="standard-card-actions">
            {onEdit && (
              <button 
                onClick={onEdit} 
                className="standard-button edit"
                aria-label="Edit"
              >
                Edit
              </button>
            )}
            
            {onDelete && (
              <button 
                onClick={onDelete} 
                className="standard-button delete"
                aria-label="Delete"
              >
                Delete
              </button>
            )}
            
            {actions}
          </div>
        </div>
      )}
      
      <div className="standard-card-content">
        {fields.map(field => (
          <div key={field.key} className="standard-card-field">
            <div className="standard-card-field-label">
              {field.label}:
            </div>
            <div className="standard-card-field-value">
              {formatValue(data[field.key], field.type)}
            </div>
          </div>
        ))}
      </div>
      
      {footer && (
        <div className="standard-card-footer">
          {footer}
        </div>
      )}
    </div>
  );
};

CardComponent.propTypes = {
  title: PropTypes.string,
  data: PropTypes.object,
  fields: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      type: PropTypes.oneOf(['text', 'date', 'datetime', 'boolean', 'array', 'html', 'image'])
    })
  ),
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  actions: PropTypes.node,
  footer: PropTypes.node,
  className: PropTypes.string
};

export default CardComponent; 
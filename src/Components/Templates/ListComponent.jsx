import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { CircularProgress } from '@mui/material';

/**
 * ListComponent - A standardized template for list components
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} props.title - List title
 * @param {Array} props.data - List data
 * @param {Function} props.fetchData - Function to fetch data
 * @param {boolean} props.isLoading - Loading state
 * @param {Function} props.renderItem - Function to render each item
 * @param {Function} props.filterData - Function to filter data
 * @param {Function} props.onItemSelect - Function called when an item is selected
 * @param {Object} props.emptyState - Empty state configuration
 * @returns {React.ReactElement} List component
 */
const ListComponent = ({
  title,
  data = [],
  fetchData,
  isLoading = false,
  renderItem,
  filterData,
  onItemSelect,
  emptyState = { message: 'No items found', icon: null }
}) => {
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Fetch data on mount
  useEffect(() => {
    if (fetchData) {
      fetchData();
    }
  }, [fetchData]);

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm.trim() || !filterData) {
      return data;
    }
    return filterData(data, searchTerm);
  }, [data, searchTerm, filterData]);

  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, page, itemsPerPage]);

  // Handle item selection
  const handleItemSelect = useCallback((item) => {
    setSelectedItems(prev => {
      const isSelected = prev.some(selectedItem => 
        selectedItem._id === item._id || selectedItem.id === item.id
      );
      
      const newSelection = isSelected
        ? prev.filter(selectedItem => 
            selectedItem._id !== item._id && selectedItem.id !== item.id
          )
        : [...prev, item];
      
      if (onItemSelect) {
        onItemSelect(newSelection);
      }
      
      return newSelection;
    });
  }, [onItemSelect]);

  // Handle search
  const handleSearch = useCallback((e) => {
    setSearchTerm(e.target.value);
    setPage(1); // Reset to first page when searching
  }, []);

  // Handle pagination
  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
  }, []);

  // Check if an item is selected
  const isItemSelected = useCallback((item) => {
    return selectedItems.some(selectedItem => 
      selectedItem._id === item._id || selectedItem.id === item.id
    );
  }, [selectedItems]);

  return (
    <div className="standard-list-container">
      {title && <h2 className="standard-list-title">{title}</h2>}
      
      <div className="standard-list-header">
        <div className="standard-list-search">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={handleSearch}
            className="standard-search-input"
          />
        </div>
        
        <div className="standard-list-actions">
          {selectedItems.length > 0 && (
            <div className="standard-selection-info">
              {selectedItems.length} item(s) selected
            </div>
          )}
        </div>
      </div>
      
      {isLoading ? (
        <div className="standard-list-loading">
          <CircularProgress size={40} />
        </div>
      ) : paginatedData.length > 0 ? (
        <div className="standard-list-content">
          {paginatedData.map((item, index) => (
            <div 
              key={item._id || item.id || index}
              className={`standard-list-item ${isItemSelected(item) ? 'selected' : ''}`}
              onClick={() => handleItemSelect(item)}
            >
              {renderItem(item, isItemSelected(item))}
            </div>
          ))}
        </div>
      ) : (
        <div className="standard-list-empty">
          {emptyState.icon}
          <p>{emptyState.message}</p>
        </div>
      )}
      
      {filteredData.length > itemsPerPage && (
        <div className="standard-list-pagination">
          <button
            disabled={page === 1}
            onClick={() => handlePageChange(page - 1)}
            className="standard-pagination-button"
          >
            Previous
          </button>
          
          <span className="standard-pagination-info">
            Page {page} of {Math.ceil(filteredData.length / itemsPerPage)}
          </span>
          
          <button
            disabled={page === Math.ceil(filteredData.length / itemsPerPage)}
            onClick={() => handlePageChange(page + 1)}
            className="standard-pagination-button"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

ListComponent.propTypes = {
  title: PropTypes.string,
  data: PropTypes.array,
  fetchData: PropTypes.func,
  isLoading: PropTypes.bool,
  renderItem: PropTypes.func.isRequired,
  filterData: PropTypes.func,
  onItemSelect: PropTypes.func,
  emptyState: PropTypes.shape({
    message: PropTypes.string,
    icon: PropTypes.node
  })
};

export default ListComponent; 
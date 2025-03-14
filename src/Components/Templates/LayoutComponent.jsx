import React from 'react';
import PropTypes from 'prop-types';

/**
 * LayoutComponent - A standardized template for layout components
 * 
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.header - Header content
 * @param {React.ReactNode} props.sidebar - Sidebar content
 * @param {React.ReactNode} props.children - Main content
 * @param {React.ReactNode} props.footer - Footer content
 * @param {boolean} props.sidebarOpen - Whether sidebar is open
 * @param {Function} props.toggleSidebar - Function to toggle sidebar
 * @param {string} props.className - Additional CSS class
 * @returns {React.ReactElement} Layout component
 */
const LayoutComponent = ({
  header,
  sidebar,
  children,
  footer,
  sidebarOpen = true,
  toggleSidebar,
  className = ''
}) => {
  return (
    <div className={`standard-layout ${className}`}>
      {header && (
        <header className="standard-layout-header">
          {header}
        </header>
      )}
      
      <div className="standard-layout-body">
        {sidebar && (
          <aside className={`standard-layout-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
            {toggleSidebar && (
              <button 
                onClick={toggleSidebar}
                className="standard-sidebar-toggle"
                aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
              >
                {sidebarOpen ? '←' : '→'}
              </button>
            )}
            {sidebar}
          </aside>
        )}
        
        <main className="standard-layout-content">
          {children}
        </main>
      </div>
      
      {footer && (
        <footer className="standard-layout-footer">
          {footer}
        </footer>
      )}
    </div>
  );
};

LayoutComponent.propTypes = {
  header: PropTypes.node,
  sidebar: PropTypes.node,
  children: PropTypes.node,
  footer: PropTypes.node,
  sidebarOpen: PropTypes.bool,
  toggleSidebar: PropTypes.func,
  className: PropTypes.string
};

export default LayoutComponent; 
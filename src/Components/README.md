# Components

This directory contains reusable components used throughout the application. All components follow standardized patterns defined in the Templates directory.

## Component Structure

Each component should follow this structure:

```
ComponentName/
├── index.js                 # Export file
├── ComponentName.jsx        # Component implementation
├── componentname.module.scss # Component styles
└── README.md                # Component documentation (optional)
```

## Naming Conventions

- **Component Files**: Use PascalCase (e.g., `ComponentName.jsx`)
- **Style Files**: Use lowercase with `.module.scss` extension (e.g., `componentname.module.scss`)
- **Index Files**: Use `index.js` to export the component
- **Component Names**: Use PascalCase for component names (e.g., `ComponentName`)
- **Props**: Use camelCase for props (e.g., `onClick`, `isDisabled`)
- **Event Handlers**: Use `handle` prefix for internal handlers and `on` prefix for props (e.g., `handleClick`, `onChange`)

## Component Templates

All components should be based on the templates defined in the `Templates` directory. These templates provide standardized patterns for:

- Form components
- List components
- Card components
- Layout components
- Input components
- Button components

See the [Templates README](./Templates/README.md) for more information.

## Best Practices

1. **Use Functional Components**: Always use functional components with hooks instead of class components.
2. **Document Components**: Use JSDoc comments to document your components.
3. **Validate Props**: Use PropTypes to validate component props.
4. **Performance Optimization**: Use React hooks like `useCallback` and `useMemo` for performance-sensitive operations.
5. **Consistent Styling**: Use SCSS modules for styling and follow the patterns in the templates.
6. **Accessibility**: Ensure components are accessible by using semantic HTML and ARIA attributes.
7. **Testing**: Write tests for components using Jest and React Testing Library.

## Example Component

```jsx
import React from 'react';
import PropTypes from 'prop-types';
import styles from './example.module.scss';

/**
 * Example - A standardized example component
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} props.title - Component title
 * @param {React.ReactNode} props.children - Component children
 * @returns {React.ReactElement} Example component
 */
const Example = ({
  title,
  children
}) => {
  return (
    <div className={styles.example}>
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
};

Example.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node
};

export default Example;
``` 
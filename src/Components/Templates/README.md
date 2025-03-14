# Component Templates

This directory contains standardized component templates that should be used as the foundation for building new components in the application.

## Purpose

The purpose of these templates is to:

1. **Ensure Consistency**: Maintain consistent component structure, prop handling, and behavior across the application.
2. **Reduce Duplication**: Avoid duplicating common component logic and structure.
3. **Improve Maintainability**: Make it easier to update and maintain components by following standard patterns.
4. **Enhance Developer Experience**: Provide clear patterns for new developers to follow.

## Available Templates

### FormComponent

A standardized template for form components with built-in validation, error handling, and submission logic.

```jsx
import { FormComponent } from '../Components/Templates';

const MyForm = () => {
  const handleSubmit = (formData) => {
    console.log('Form submitted:', formData);
  };

  const validationRules = {
    name: { required: true, minLength: 3 },
    email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ }
  };

  return (
    <FormComponent
      title="My Form"
      initialData={{ name: '', email: '' }}
      onSubmit={handleSubmit}
      validationRules={validationRules}
    >
      {/* Form fields go here */}
    </FormComponent>
  );
};
```

### ListComponent

A standardized template for list components with built-in search, pagination, and selection functionality.

```jsx
import { ListComponent } from '../Components/Templates';

const MyList = () => {
  const data = [/* array of items */];
  
  const renderItem = (item, isSelected) => (
    <div>
      <h3>{item.title}</h3>
      <p>{item.description}</p>
    </div>
  );
  
  const filterData = (data, searchTerm) => {
    return data.filter(item => 
      item.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };
  
  return (
    <ListComponent
      title="My List"
      data={data}
      renderItem={renderItem}
      filterData={filterData}
      onItemSelect={(selectedItems) => console.log('Selected:', selectedItems)}
    />
  );
};
```

### CardComponent

A standardized template for card/detail components with consistent layout and actions.

```jsx
import { CardComponent } from '../Components/Templates';

const MyCard = () => {
  const data = {
    title: 'Card Title',
    description: 'Card description',
    date: '2023-01-01',
    status: true,
    tags: ['tag1', 'tag2']
  };
  
  const fields = [
    { key: 'description', label: 'Description', type: 'text' },
    { key: 'date', label: 'Date', type: 'date' },
    { key: 'status', label: 'Active', type: 'boolean' },
    { key: 'tags', label: 'Tags', type: 'array' }
  ];
  
  return (
    <CardComponent
      title={data.title}
      data={data}
      fields={fields}
      onEdit={() => console.log('Edit clicked')}
      onDelete={() => console.log('Delete clicked')}
    />
  );
};
```

### LayoutComponent

A standardized template for layout components with header, sidebar, content, and footer sections.

```jsx
import { LayoutComponent } from '../Components/Templates';

const MyLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  return (
    <LayoutComponent
      header={<div>Header Content</div>}
      sidebar={<div>Sidebar Content</div>}
      footer={<div>Footer Content</div>}
      sidebarOpen={sidebarOpen}
      toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
    >
      {children}
    </LayoutComponent>
  );
};
```

### InputComponent

A standardized template for input field components with consistent styling and behavior.

```jsx
import { InputComponent } from '../Components/Templates';

const MyInput = () => {
  const [value, setValue] = useState('');
  
  return (
    <InputComponent
      id="my-input"
      name="myInput"
      label="My Input"
      type="text"
      value={value}
      onChange={(newValue) => setValue(newValue)}
      placeholder="Enter a value"
      required
      helperText="This is a helper text"
    />
  );
};
```

### ButtonComponent

A standardized template for button components with consistent styling and behavior.

```jsx
import { ButtonComponent } from '../Components/Templates';
import SaveIcon from '@mui/icons-material/Save';

const MyButton = () => {
  return (
    <ButtonComponent
      label="Save"
      variant="contained"
      color="primary"
      onClick={() => console.log('Button clicked')}
      startIcon={<SaveIcon />}
    />
  );
};
```

## Styling

All templates come with standardized styles defined in `templates.module.scss`. These styles should be imported and extended by component-specific styles.

## Best Practices

1. **Use Templates as Base**: Always extend from these templates rather than creating components from scratch.
2. **Maintain Prop Consistency**: Follow the prop naming conventions established in the templates.
3. **Document Components**: Add JSDoc comments to document your components, following the pattern in the templates.
4. **Validate Props**: Use PropTypes to validate component props, following the pattern in the templates.
5. **Performance Optimization**: Use React hooks like `useCallback` and `useMemo` for performance-sensitive operations, following the pattern in the templates. 
# Component Library Architecture - Interactive Components

**Linear Project**: MVP Revenue Foundation  
**Issue**: BUI-97 - Interactive Component Architecture  
**Date**: May 4, 2025  
**Session Type**: Planning

## 1. Executive Summary

This document outlines the architecture and implementation plan for the interactive components of the Component Library Foundation. Building on the visual component architecture established in the previous planning session, this document focuses on components that respond to user input, manage state, and drive user interactions across the platform.

The interactive component architecture addresses critical user interaction patterns required for the Buildappswith platform, particularly focusing on the booking flow, profile editing, marketplace filtering, and other key interaction points identified in PRD 3.1. The architecture leverages Magic UI Pro components where appropriate, while establishing consistent patterns for state management, form validation, accessibility, and animation.

By implementing this architecture, we will establish a robust foundation for all interactive elements of the platform, ensuring consistency, accessibility, and a high-quality user experience across all touchpoints.

## 2. Interactive Component Architecture Overview

### 2.1 Architectural Principles

The interactive component architecture follows the same core principles established for visual components, with additional emphasis on:

1. **Accessibility First**: All interactive components must be fully accessible, supporting keyboard navigation, screen readers, and other assistive technologies
2. **Progressive Enhancement**: Components should work without JavaScript where possible, with enhanced functionality added when available
3. **Consistent Interaction Patterns**: User interactions should follow consistent patterns across the platform
4. **Robust State Management**: Clear patterns for managing component and form state
5. **Comprehensive Validation**: Consistent approach to validation and error handling
6. **Responsive Interactions**: Components must work equally well on mobile and desktop devices
7. **Performance Optimization**: Interactive components should minimize re-renders and optimize for performance

### 2.2 Component Organization Structure

The interactive components follow the domain-driven structure established in the visual component architecture:

```
/components
├── [domain]/                 # Domain-specific components
│   ├── ui/                   # Domain-specific UI components
│   │   ├── [component].tsx   # Individual components
│   │   └── index.ts          # Barrel exports
│   ├── [component].tsx       # Domain-specific components
│   └── index.ts              # Barrel exports
├── ui/                       # Shared UI components
│   ├── core/                 # Foundational UI components
│   │   ├── [component].tsx   # Individual components
│   │   └── index.ts          # Barrel exports
│   ├── composite/            # Composed UI components
│   │   ├── [component].tsx   # Individual components
│   │   └── index.ts          # Barrel exports
│   ├── form/                 # Form components
│   │   ├── [component].tsx   # Individual form components
│   │   └── index.ts          # Barrel exports
│   ├── navigation/           # Navigation components
│   │   ├── [component].tsx   # Individual navigation components
│   │   └── index.ts          # Barrel exports
│   ├── overlay/              # Modal and dialog components
│   │   ├── [component].tsx   # Individual overlay components
│   │   └── index.ts          # Barrel exports
│   └── index.ts              # Barrel exports
└── providers/                # Context providers
```

### 2.3 Interactive Component Categories

The interactive components are organized into the following categories:

1. **Form Components**: Inputs, select fields, checkboxes, radio buttons, switches, etc.
2. **Overlay Components**: Modals, dialogs, popovers, tooltips, etc.
3. **Navigation Components**: Tabs, accordions, dropdowns, menus, etc.
4. **Feedback Components**: Alerts, toasts, progress indicators, etc.
5. **Selection Components**: Date pickers, time selectors, color pickers, etc.
6. **Action Components**: Buttons, links, icon buttons, floating action buttons, etc.
7. **Table Components**: Tables, data grids, sortable columns, pagination, etc.

### 2.4 Client vs. Server Component Division

The architecture establishes clear patterns for determining when components should be client vs. server components:

**Server Components**:
- Static presentation components
- Components that don't need interactivity
- Components that primarily fetch and display data
- Layout components without client-side state

**Client Components**:
- Components that manage state
- Interactive form elements
- Components with event handlers
- Components using browser APIs
- Components using hooks

All interactive components should follow the "use client" directive at the component level, not at the file level, to enable selective hydration.

```tsx
// Example component with "use client" directive
'use client';

import { useState } from 'react';

export function InteractiveComponent({ initialValue = 0 }) {
  const [value, setValue] = useState(initialValue);

  const handleIncrement = () => {
    setValue(value + 1);
  };

  return (
    <div>
      <p>Value: {value}</p>
      <button onClick={handleIncrement}>Increment</button>
    </div>
  );
}
```

## 3. State Management Approach

### 3.1 Component State Management Patterns

The architecture establishes the following patterns for state management:

1. **Local Component State**:
   - For simple, component-specific state
   - Implemented using React's `useState` hook
   - Isolated to the specific component

```tsx
function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
```

2. **Derived State**:
   - For state calculated from props or other state
   - Implemented using `useMemo` for performance optimization
   - Recalculated only when dependencies change

```tsx
function FilteredList({ items, filter }) {
  const filteredItems = useMemo(() => {
    return items.filter(item => item.includes(filter));
  }, [items, filter]);
  
  return (
    <ul>
      {filteredItems.map(item => <li key={item}>{item}</li>)}
    </ul>
  );
}
```

3. **Lifting State Up**:
   - For state shared between sibling components
   - State managed by parent component and passed down as props
   - Changes communicated through callback props

```tsx
function Parent() {
  const [selectedItem, setSelectedItem] = useState(null);
  
  return (
    <div>
      <ItemList onSelect={setSelectedItem} />
      <ItemDetail item={selectedItem} />
    </div>
  );
}
```

4. **Context for Scoped State**:
   - For state shared across component trees
   - Implemented using React Context API
   - State providers placed at appropriate levels in the component tree

```tsx
const ThemeContext = createContext('light');

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

function ThemedButton() {
  const { theme } = useContext(ThemeContext);
  
  return (
    <button className={`btn btn-${theme}`}>
      Themed Button
    </button>
  );
}
```

5. **Custom Hooks for Complex State**:
   - For reusable state logic across components
   - Encapsulates state management in a custom hook
   - Provides a clean interface for state interactions

```tsx
function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue);
  
  const increment = () => setCount(count + 1);
  const decrement = () => setCount(count - 1);
  const reset = () => setCount(initialValue);
  
  return { count, increment, decrement, reset };
}

function Counter() {
  const { count, increment, decrement, reset } = useCounter(0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}
```

### 3.2 Form State Management

For managing form state, the architecture establishes the following approach:

1. **Form Library Selection**:
   - Use react-hook-form for form state management
   - Provides a lightweight, performant solution for managing form state
   - Supports validation, error handling, and form submission

2. **Validation Integration**:
   - Integrate Zod for schema validation
   - Define validation schemas for form data
   - Validate form data against schemas before submission

3. **Form State Structure**:

```tsx
// Example form state with react-hook-form and Zod
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Define validation schema
const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['client', 'builder', 'admin']),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the terms and conditions' }),
  }),
});

// Use form hook with schema validation
function RegistrationForm() {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'client',
      password: '',
      acceptTerms: false,
    },
  });
  
  const onSubmit = (data) => {
    // Handle form submission
    console.log(data);
  };
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  );
}
```

4. **Form Component Integration**:
   - Create form-specific wrappers around base components
   - Connect form components to react-hook-form
   - Implement consistent error display and validation feedback

```tsx
// Example form field component
function FormField({
  name,
  label,
  form,
  type = 'text',
  ...props
}) {
  return (
    <div className="form-field">
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        type={type}
        {...form.register(name)}
        aria-invalid={form.formState.errors[name] ? 'true' : 'false'}
        {...props}
      />
      {form.formState.errors[name] && (
        <p className="error">{form.formState.errors[name].message}</p>
      )}
    </div>
  );
}
```

### 3.3 Component Communication Patterns

The architecture establishes these patterns for component communication:

1. **Props for Parent-Child Communication**:
   - Pass data and callbacks from parent to child components
   - Use props for configuration and event handling
   - Maintain clear prop interfaces with TypeScript

2. **Context for Deep Component Trees**:
   - Use React Context for sharing state across deep component trees
   - Create domain-specific contexts for different concerns
   - Provide clear interfaces for context consumers

3. **Event-Based Communication**:
   - Use callback props for component events
   - Follow consistent naming conventions (onEvent, handleEvent)
   - Ensure proper typing for event handlers

4. **Custom Event Bus (for Complex Cases)**:
   - For complex communication between unrelated components
   - Implement using a publish-subscribe pattern
   - Use sparingly and document thoroughly

```tsx
// Example custom event bus
type EventCallback = (data: any) => void;

class EventBus {
  private events: Record<string, EventCallback[]> = {};

  subscribe(event: string, callback: EventCallback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
    
    // Return unsubscribe function
    return () => this.unsubscribe(event, callback);
  }

  unsubscribe(event: string, callback: EventCallback) {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    }
  }

  publish(event: string, data: any) {
    if (this.events[event]) {
      this.events[event].forEach(callback => callback(data));
    }
  }
}

export const eventBus = new EventBus();
```

## 4. Form Component Architecture

### 4.1 Form Component Hierarchy

The form component architecture establishes a hierarchical structure:

1. **FormProvider**: Top-level component for form state management
   - Handles form state, validation, and submission
   - Provides form context to child components
   - Connects to react-hook-form

2. **FormField**: Base component for all form inputs
   - Handles layout, labels, help text, and error messages
   - Forwards props to the appropriate input component
   - Connects to form state via react-hook-form

3. **Input Components**: Specific input types
   - Text, number, email, password inputs
   - Select, radio, checkbox components
   - Specialized inputs (date, time, color, etc.)

```tsx
// Example form component hierarchy
function Form({ onSubmit, children, ...props }) {
  return (
    <form onSubmit={onSubmit} {...props}>
      {children}
    </form>
  );
}

Form.Field = function FormField({ label, name, error, children }) {
  return (
    <div className="form-field">
      {label && <label htmlFor={name}>{label}</label>}
      {children}
      {error && <p className="error">{error}</p>}
    </div>
  );
};

Form.Input = function FormInput({ type = 'text', ...props }) {
  return <input type={type} {...props} />;
};

Form.Select = function FormSelect({ options, ...props }) {
  return (
    <select {...props}>
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

// Additional form components...
```

### 4.2 Form Validation Architecture

The form validation architecture follows these principles:

1. **Schema-Based Validation**:
   - Use Zod for defining validation schemas
   - Create domain-specific schemas for different form types
   - Reuse validation logic across forms

2. **Validation Timing**:
   - Validate on form submission (always)
   - Validate on field blur (optional)
   - Validate on field change (configurable)

3. **Error Display**:
   - Show field-level errors inline with inputs
   - Show form-level errors at the top of the form
   - Use consistent error styling and messaging

4. **Advanced Validation**:
   - Support asynchronous validation (API checks)
   - Support cross-field validation (password confirmation)
   - Support conditional validation (based on other field values)

```tsx
// Example of advanced form validation
const userFormSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});
```

### 4.3 Form Component Variants

The form architecture includes the following component variants:

1. **Basic Inputs**:
   - Text Input: Single-line text entry
   - Textarea: Multi-line text entry
   - Number Input: Numeric entry with controls
   - Password Input: Masked text entry with show/hide toggle
   - Email Input: Text input with email validation
   - Search Input: Text input with search icon and clear button

2. **Selection Components**:
   - Select: Dropdown selection from a list of options
   - MultiSelect: Multiple selection from a list of options
   - Radio Group: Single selection from a list with radio buttons
   - Checkbox Group: Multiple selection with checkboxes
   - Switch: Toggle for boolean values
   - Segmented Control: Visual selection between options

3. **Specialized Inputs**:
   - Date Picker: Calendar-based date selection
   - Time Picker: Time selection with hour/minute controls
   - Color Picker: Visual color selection
   - File Upload: File selection and upload
   - Phone Input: Phone number entry with formatting
   - Currency Input: Monetary value entry with currency symbol

```tsx
// Example specialized input component
function DatePicker({
  value,
  onChange,
  min,
  max,
  ...props
}) {
  // Implementation details
  return (
    <div className="date-picker">
      <input
        type="date"
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        {...props}
      />
      {/* Calendar popover component */}
    </div>
  );
}
```

### 4.4 Form Layout Components

The form architecture includes components for form layout:

1. **Form Section**: Grouping related form fields
   - Includes section title and description
   - Can be collapsible or always expanded
   - Can have conditional visibility

2. **Form Row**: Horizontal arrangement of form fields
   - Responsive layout that adapts to screen size
   - Configurable column widths
   - Alignment options

3. **Form Grid**: Grid-based form layout
   - Responsive grid for complex form layouts
   - Control over field placement and sizing
   - Consistent spacing and alignment

4. **Form Actions**: Container for form submission buttons
   - Consistent placement of primary and secondary actions
   - Responsive layout for different screen sizes
   - Support for loading states

```tsx
// Example form layout components
function FormSection({ title, description, children }) {
  return (
    <section className="form-section">
      {title && <h3 className="section-title">{title}</h3>}
      {description && <p className="section-description">{description}</p>}
      <div className="section-content">{children}</div>
    </section>
  );
}

function FormRow({ children, columns = children.length }) {
  return (
    <div className={`form-row cols-${columns}`}>
      {children}
    </div>
  );
}

function FormActions({ primaryAction, secondaryAction, align = 'right' }) {
  return (
    <div className={`form-actions align-${align}`}>
      {secondaryAction}
      {primaryAction}
    </div>
  );
}
```

## 5. Modal and Dialog Components

### 5.1 Modal Component Architecture

The modal architecture follows these principles:

1. **Portal-Based Rendering**:
   - Render modals outside the normal DOM hierarchy
   - Use React's createPortal for mounting modals
   - Ensure modals appear above other content

2. **Focus Management**:
   - Trap focus within the modal when open
   - Return focus to trigger element when closed
   - Support keyboard navigation within the modal

3. **Accessibility Considerations**:
   - Use appropriate ARIA roles and attributes
   - Support keyboard interaction (Escape to close)
   - Announce modal opening to screen readers

4. **Animation and Transitions**:
   - Smooth open/close animations
   - Configurable animation timing
   - Support for different animation styles

```tsx
// Example modal component
'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

function Modal({
  isOpen,
  onClose,
  title,
  children,
  ...props
}) {
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);
  
  // Store previously focused element
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement;
      
      // Focus the modal when opened
      if (modalRef.current) {
        modalRef.current.focus();
      }
      
      // Disable body scrolling
      document.body.style.overflow = 'hidden';
      
      return () => {
        // Restore focus and scrolling when closed
        if (previousFocusRef.current) {
          previousFocusRef.current.focus();
        }
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);
  
  // Handle Escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);
  
  // Handle outside click
  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };
  
  // Modal content
  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="modal-backdrop"
          onClick={handleBackdropClick}
          aria-modal="true"
          role="dialog"
          aria-labelledby={title ? 'modal-title' : undefined}
        >
          <motion.div
            ref={modalRef}
            className="modal"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            tabIndex={-1}
            {...props}
          >
            {title && (
              <div className="modal-header">
                <h2 id="modal-title" className="modal-title">{title}</h2>
                <button 
                  className="modal-close"
                  onClick={onClose}
                  aria-label="Close"
                >
                  &times;
                </button>
              </div>
            )}
            <div className="modal-body">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
  
  // Use portal for rendering
  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : null;
}
```

### 5.2 Dialog Component Variants

The architecture includes the following dialog variants:

1. **Standard Modal**: Full-featured modal dialog
   - Header with title and close button
   - Body content area
   - Optional footer with action buttons
   - Backdrop overlay with click-to-close

2. **Alert Dialog**: For important messages requiring confirmation
   - Center-positioned with emphasis styling
   - Clear action buttons (Confirm/Cancel)
   - Cannot be dismissed by clicking outside
   - Focus on confirm action button

3. **Drawer**: Side-sliding panel
   - Can slide from any edge (left, right, top, bottom)
   - Optional header and footer
   - Can be resizable
   - Suitable for complex forms or detailed content

4. **Popover**: Smaller contextual dialog
   - Positioned relative to a trigger element
   - Arrow pointing to the trigger
   - Dismissible by clicking outside
   - Suitable for contextual actions or information

5. **Toast**: Temporary notification
   - Appears briefly and auto-dismisses
   - Can be positioned in any corner
   - Different variants for success, error, warning, info
   - Optional action button

```tsx
// Example dialog variants
function AlertDialog({ isOpen, onClose, title, message, onConfirm }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      className="alert-dialog"
    >
      <p>{message}</p>
      <div className="alert-actions">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button variant="primary" onClick={onConfirm}>Confirm</Button>
      </div>
    </Modal>
  );
}

function Drawer({
  isOpen,
  onClose,
  position = 'right',
  width = '300px',
  children,
  ...props
}) {
  // Implementation details
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className={`drawer drawer-${position}`}
      style={{ 
        width: position === 'left' || position === 'right' ? width : '100%',
        height: position === 'top' || position === 'bottom' ? width : '100%',
      }}
      {...props}
    >
      {children}
    </Modal>
  );
}
```

### 5.3 Dialog State Management

Dialog state is managed using these patterns:

1. **Local Component State**:
   - For simple dialogs managed by a single component
   - Using React's useState hook for open/close state
   - Component-specific implementation

```tsx
function DialogExample() {
  const [isOpen, setIsOpen] = useState(false);
  
  const openDialog = () => setIsOpen(true);
  const closeDialog = () => setIsOpen(false);
  
  return (
    <>
      <Button onClick={openDialog}>Open Dialog</Button>
      <Modal isOpen={isOpen} onClose={closeDialog}>
        Dialog content
      </Modal>
    </>
  );
}
```

2. **Dialog Context**:
   - For application-wide dialog management
   - Managing multiple dialog types
   - Centralized dialog state management

```tsx
const DialogContext = createContext(null);

function DialogProvider({ children }) {
  const [dialogs, setDialogs] = useState({});
  
  const openDialog = (id, props) => {
    setDialogs(prev => ({
      ...prev,
      [id]: { isOpen: true, props },
    }));
  };
  
  const closeDialog = (id) => {
    setDialogs(prev => ({
      ...prev,
      [id]: { ...prev[id], isOpen: false },
    }));
  };
  
  return (
    <DialogContext.Provider value={{ openDialog, closeDialog, dialogs }}>
      {children}
      {/* Render modal components */}
    </DialogContext.Provider>
  );
}

function useDialog() {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return context;
}
```

3. **Custom Hook for Complex Dialogs**:
   - For dialogs with complex state or behavior
   - Encapsulates dialog-specific logic
   - Provides a clean interface for dialog interactions

```tsx
function useFormDialog(initialForm, onSubmit) {
  const [isOpen, setIsOpen] = useState(false);
  const [formState, setFormState] = useState(initialForm);
  
  const openDialog = () => setIsOpen(true);
  const closeDialog = () => {
    setIsOpen(false);
    setFormState(initialForm);
  };
  
  const handleSubmit = () => {
    onSubmit(formState);
    closeDialog();
  };
  
  const handleChange = (field, value) => {
    setFormState(prev => ({
      ...prev,
      [field]: value,
    }));
  };
  
  return {
    isOpen,
    formState,
    openDialog,
    closeDialog,
    handleSubmit,
    handleChange,
  };
}
```

## 6. Navigation and Menu Components

### 6.1 Navigation Component Architecture

The navigation architecture includes the following components:

1. **Tabs**: Horizontal navigation for page sections
   - Tab list with clickable tabs
   - Tab panels for content
   - Support for controlled and uncontrolled usage
   - Keyboard navigation support

```tsx
function Tabs({ defaultValue, value, onChange, children }) {
  const [selectedTab, setSelectedTab] = useState(defaultValue);
  
  // Handle controlled component case
  const currentValue = value !== undefined ? value : selectedTab;
  
  const handleTabClick = (tabValue) => {
    if (value === undefined) {
      setSelectedTab(tabValue);
    }
    onChange?.(tabValue);
  };
  
  // Filter out Tab and TabPanel children
  const tabs = Children.toArray(children).filter(
    child => child.type === Tabs.Tab
  );
  
  const panels = Children.toArray(children).filter(
    child => child.type === Tabs.TabPanel
  );
  
  return (
    <div className="tabs">
      <div role="tablist" className="tab-list">
        {tabs.map((tab, index) => {
          const tabValue = tab.props.value;
          const isSelected = currentValue === tabValue;
          
          return cloneElement(tab, {
            key: tabValue,
            isSelected,
            onClick: () => handleTabClick(tabValue),
            id: `tab-${tabValue}`,
            'aria-controls': `panel-${tabValue}`,
            'aria-selected': isSelected,
            tabIndex: isSelected ? 0 : -1,
          });
        })}
      </div>
      <div className="tab-panels">
        {panels.map(panel => {
          const panelValue = panel.props.value;
          const isSelected = currentValue === panelValue;
          
          return isSelected
            ? cloneElement(panel, {
                key: panelValue,
                id: `panel-${panelValue}`,
                'aria-labelledby': `tab-${panelValue}`,
              })
            : null;
        })}
      </div>
    </div>
  );
}

Tabs.Tab = function Tab({ isSelected, children, ...props }) {
  return (
    <button
      role="tab"
      className={`tab ${isSelected ? 'active' : ''}`}
      {...props}
    >
      {children}
    </button>
  );
};

Tabs.TabPanel = function TabPanel({ children, ...props }) {
  return (
    <div role="tabpanel" className="tab-panel" {...props}>
      {children}
    </div>
  );
};
```

2. **Accordion**: Expandable vertical sections
   - Collapsible sections with headers and content
   - Support for single or multiple expanded sections
   - Smooth animation for expanding/collapsing
   - Accessibility-compliant with ARIA attributes

3. **Dropdown Menu**: Contextual menu options
   - Trigger element with dropdown content
   - Support for nested menu items
   - Keyboard navigation for menu items
   - Automatic positioning based on available space

4. **Breadcrumbs**: Hierarchical navigation path
   - Path segments with separators
   - Current location indicator
   - Dynamic path generation
   - Responsive design with truncation for small screens

5. **Pagination**: Navigation between pages of content
   - Page number buttons
   - Previous/Next buttons
   - Current page indicator
   - Configurable page count and visible page range

### 6.2 Menu Component Variants

The architecture includes the following menu variants:

1. **Dropdown Menu**: Context menu triggered by a button
   - Overlay with menu items
   - Support for icons, labels, and keyboard shortcuts
   - Submenu support
   - Positioning options

2. **Context Menu**: Menu triggered by right-click
   - Dynamic positioning at cursor location
   - Context-sensitive menu items
   - Keyboard accessibility

3. **Command Menu**: Keyboard-driven command palette
   - Searchable commands
   - Keyboard shortcut display
   - Categories and grouping
   - Recently used commands

4. **Navigation Menu**: Primary application navigation
   - Support for hierarchical navigation
   - Mobile-responsive design
   - Active state indication
   - Icon and label support

```tsx
// Example dropdown menu component
function DropdownMenu({
  trigger,
  items,
  placement = 'bottom-start',
  ...props
}) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const triggerRef = useRef(null);
  
  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);
  
  // Handle click outside to close menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isOpen &&
        menuRef.current &&
        triggerRef.current &&
        !menuRef.current.contains(event.target) &&
        !triggerRef.current.contains(event.target)
      ) {
        closeMenu();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);
  
  return (
    <div className="dropdown-menu-container">
      <div ref={triggerRef} onClick={toggleMenu}>
        {trigger}
      </div>
      
      {isOpen && (
        <div
          ref={menuRef}
          className={`dropdown-menu placement-${placement}`}
          role="menu"
          {...props}
        >
          {items.map((item, index) => (
            <div
              key={index}
              className="dropdown-item"
              role="menuitem"
              onClick={() => {
                item.onClick?.();
                closeMenu();
              }}
            >
              {item.icon && <span className="item-icon">{item.icon}</span>}
              <span className="item-label">{item.label}</span>
              {item.shortcut && <span className="item-shortcut">{item.shortcut}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### 6.3 Mobile Navigation Considerations

The navigation architecture includes specific considerations for mobile:

1. **Responsive Adaptation**:
   - Tabs can collapse to dropdown on small screens
   - Automatic conversion of desktop navigation patterns to mobile-friendly alternatives

2. **Touch Optimization**:
   - Larger touch targets for mobile users
   - Swipe gestures for common navigation actions
   - Reduced hover states in favor of active/pressed states

3. **Mobile-Specific Components**:
   - Bottom navigation bar for mobile
   - Slide-out drawer navigation
   - Full-screen modal navigation

4. **Performance Considerations**:
   - Reduced animation complexity on mobile
   - Lazy loading of off-screen content
   - Optimized rendering for low-powered devices

```tsx
// Example responsive navigation component
function ResponsiveNavigation({ items }) {
  const [isMobile, setIsMobile] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  // Check if mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Toggle drawer
  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);
  
  // Mobile view
  if (isMobile) {
    return (
      <>
        <button 
          className="mobile-menu-button"
          onClick={toggleDrawer}
          aria-label="Toggle menu"
        >
          Menu
        </button>
        
        <Drawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          position="left"
        >
          <nav className="mobile-navigation">
            {items.map(item => (
              <a 
                key={item.href} 
                href={item.href}
                className="nav-item"
                onClick={() => setIsDrawerOpen(false)}
              >
                {item.icon && <span className="nav-icon">{item.icon}</span>}
                <span className="nav-label">{item.label}</span>
              </a>
            ))}
          </nav>
        </Drawer>
      </>
    );
  }
  
  // Desktop view
  return (
    <nav className="desktop-navigation">
      {items.map(item => (
        <a 
          key={item.href} 
          href={item.href}
          className="nav-item"
        >
          {item.icon && <span className="nav-icon">{item.icon}</span>}
          <span className="nav-label">{item.label}</span>
        </a>
      ))}
    </nav>
  );
}
```

## 7. Animation and Transition Framework

### 7.1 Animation Principles

The animation framework follows these principles:

1. **Purpose-Driven Animation**:
   - Animations should serve a functional purpose
   - Enhance user understanding of state changes
   - Guide attention to important elements
   - Provide feedback for user actions

2. **Consistency**:
   - Consistent timing and easing across the platform
   - Similar actions have similar animations
   - Establish a visual language with animations

3. **Performance Optimization**:
   - Use GPU-accelerated properties (transform, opacity)
   - Avoid layout thrashing
   - Respect user preferences for reduced motion

4. **Accessibility**:
   - Honor reduced motion preferences
   - Provide alternatives for users who prefer less animation
   - Ensure animations don't cause issues for photosensitive users

### 7.2 Animation Library Integration

The animation framework is built on Framer Motion:

1. **Core Animation Utilities**:
   - Component wrappers for animated elements
   - Reusable animation presets
   - Transition timing functions
   - Reduced motion handling

2. **Stagger Animations**:
   - Coordinated animations across multiple elements
   - Sequential reveals for lists
   - Consistent timing with configurable delays

3. **Page Transitions**:
   - Smooth transitions between pages
   - Persistent elements across route changes
   - Coordinated entry and exit animations

```tsx
// Example animation utilities
import { motion } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';

// Animation presets
const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const slideIn = {
  initial: { x: -20, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: 20, opacity: 0 },
};

const scale = {
  initial: { scale: 0.95, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.95, opacity: 0 },
};

// Transition presets
const defaultTransition = {
  duration: 0.3,
  ease: [0.4, 0, 0.2, 1],
};

const springTransition = {
  type: 'spring',
  stiffness: 400,
  damping: 30,
};

// Animated component
function Animated({
  children,
  animation = fadeIn,
  transition = defaultTransition,
  ...props
}) {
  const prefersReducedMotion = useReducedMotion();
  
  // Respect reduced motion preference
  if (prefersReducedMotion) {
    return <>{children}</>;
  }
  
  return (
    <motion.div
      initial={animation.initial}
      animate={animation.animate}
      exit={animation.exit}
      transition={transition}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Staggered animation for lists
function AnimatedList({ children, staggerDelay = 0.05, ...props }) {
  const prefersReducedMotion = useReducedMotion();
  
  // Respect reduced motion preference
  if (prefersReducedMotion) {
    return <>{children}</>;
  }
  
  return (
    <motion.div {...props}>
      {Children.map(children, (child, index) => (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.3,
            delay: index * staggerDelay,
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}
```

### 7.3 Component-Specific Animations

The animation framework includes specific animations for interactive components:

1. **Button Animations**:
   - Hover effects with scale or glow
   - Click feedback with scale or ripple
   - Loading state spinners or progress indicators

2. **Form Field Animations**:
   - Label floating on focus/input
   - Validation feedback animations
   - Error shake animation for invalid input

3. **Modal Animations**:
   - Entry/exit animations (fade, scale, slide)
   - Backdrop fade
   - Attention-focusing animation for alerts

4. **List Item Animations**:
   - Staggered entry for list items
   - Reordering animations for sorted lists
   - Removal animations for deleted items

5. **Page Transition Animations**:
   - Page entry/exit animations
   - Content reveal animations
   - Persistent element handling

```tsx
// Example button animation component
function AnimatedButton({ 
  children,
  isLoading,
  variant = 'primary',
  ...props
}) {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <motion.button
      className={`button button-${variant}`}
      whileHover={
        prefersReducedMotion 
          ? {} 
          : { scale: 1.02 }
      }
      whileTap={
        prefersReducedMotion 
          ? {} 
          : { scale: 0.98 }
      }
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <span className="loading-spinner" />
          <span className="sr-only">Loading</span>
        </>
      ) : (
        children
      )}
    </motion.button>
  );
}

// Example form field animation
function AnimatedFormField({
  label,
  value,
  error,
  ...props
}) {
  const prefersReducedMotion = useReducedMotion();
  const hasValue = value !== undefined && value !== '';
  
  return (
    <div className="form-field">
      <motion.label
        animate={{
          y: hasValue ? -20 : 0,
          scale: hasValue ? 0.8 : 1,
          color: error ? '#e11d48' : hasValue ? '#1e40af' : '#71717a',
        }}
        transition={
          prefersReducedMotion
            ? { duration: 0 }
            : { duration: 0.2 }
        }
      >
        {label}
      </motion.label>
      <input value={value} {...props} />
      {error && (
        <motion.div
          className="error-message"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          {error}
        </motion.div>
      )}
    </div>
  );
}
```

### 7.4 Adaptive Animation Based on User Preferences

Building on the hyper-personalisation-opportunities.md document, the animation framework includes adaptive animation capabilities:

1. **Expertise-Based Adaptation**:
   - Explorer: Simpler, more instructive animations
   - Practitioner: Standard animations with moderate complexity
   - Expert: Rich animations with more sophisticated effects

2. **Device-Based Adaptation**:
   - Detect device capabilities and adjust animation complexity
   - Optimize for performance on lower-end devices
   - Enhance animations on capable devices

3. **Preference-Based Adaptation**:
   - User-configurable animation preferences
   - Presets for different animation levels
   - Remember preferences across sessions

```tsx
// Example adaptive animation hook
function useAdaptiveAnimation(componentType) {
  const { userPersonalization } = usePersonalization();
  const prefersReducedMotion = useReducedMotion();
  
  // Get animation level from user preferences
  const animationLevel = userPersonalization.preferences.animationLevel || 'standard';
  
  // Device capability detection
  const [deviceCapability, setDeviceCapability] = useState('high');
  
  useEffect(() => {
    // Simple heuristic based on device memory and processor cores
    const memory = navigator.deviceMemory || 4; // Default to 4GB if not available
    const cores = navigator.hardwareConcurrency || 4; // Default to 4 cores
    
    if (memory <= 2 || cores <= 2) {
      setDeviceCapability('low');
    } else if (memory <= 4 || cores <= 4) {
      setDeviceCapability('medium');
    } else {
      setDeviceCapability('high');
    }
  }, []);
  
  // Create animation configuration
  const config = useMemo(() => {
    // Base configuration
    const baseConfig = {
      transitions: !prefersReducedMotion,
      duration: 0.3,
      effects: true,
      advanced: false,
    };
    
    // Adjust based on animation level
    switch (animationLevel) {
      case 'reduced':
        return {
          ...baseConfig,
          duration: 0.2,
          effects: false,
        };
      case 'standard':
        return baseConfig;
      case 'enhanced':
        return {
          ...baseConfig,
          duration: 0.4,
          advanced: true,
        };
      default:
        return baseConfig;
    }
  }, [animationLevel, prefersReducedMotion]);
  
  // Get component-specific animation variants
  const variants = useMemo(() => {
    // Base animations for all components
    const baseVariants = {
      initial: config.transitions ? { opacity: 0 } : {},
      animate: config.transitions ? { opacity: 1 } : {},
      exit: config.transitions ? { opacity: 0 } : {},
    };
    
    // Component-specific animations
    switch (componentType) {
      case 'card':
        return {
          initial: config.transitions ? { ...baseVariants.initial, y: 20, scale: 0.98 } : {},
          animate: config.transitions ? { 
            ...baseVariants.animate, 
            y: 0, 
            scale: 1,
            transition: {
              duration: config.duration,
              ease: config.advanced ? [0.6, -0.05, 0.01, 0.99] : 'easeInOut',
              staggerChildren: config.advanced ? 0.1 : 0
            }
          } : {},
          exit: config.transitions ? { ...baseVariants.exit, y: -20, scale: 0.98 } : {},
        };
      
      case 'modal':
        return {
          initial: config.transitions ? { ...baseVariants.initial, scale: config.effects ? 0.9 : 1 } : {},
          animate: config.transitions ? { 
            ...baseVariants.animate, 
            scale: 1,
            transition: {
              duration: config.duration,
              ease: config.advanced ? [0.6, -0.05, 0.01, 0.99] : 'easeInOut',
            }
          } : {},
          exit: config.transitions ? { 
            ...baseVariants.exit, 
            scale: config.effects ? 0.9 : 1,
          } : {},
        };
      
      // Additional component-specific animations
      
      default:
        return baseVariants;
    }
  }, [componentType, config]);
  
  return {
    config,
    variants,
    hasAnimations: config.transitions,
  };
}
```

## 8. Implementation Plan

### 8.1 Implementation Phases

The implementation will follow these phases:

1. **Phase 1: Foundation Components** (Week 1)
   - Set up interactive component architecture
   - Implement core UI interactive components
   - Establish state management patterns
   - Create animation framework foundation

2. **Phase 2: Form Components** (Weeks 2-3)
   - Implement form component hierarchy
   - Create form validation architecture
   - Develop core form inputs
   - Build specialized form components

3. **Phase 3: Modal and Navigation** (Weeks 4-5)
   - Implement modal component architecture
   - Create dialog variants
   - Develop navigation components
   - Build menu system components

4. **Phase 4: Enhanced Interactions** (Weeks 6-7)
   - Implement advanced animations
   - Create interactive data components
   - Develop specialized input types
   - Build complex interaction patterns

5. **Phase 5: Integration and Testing** (Week 8)
   - Integrate with visual components
   - Implement comprehensive testing
   - Create documentation and examples
   - Conduct accessibility audits

### 8.2 Component Implementation Priorities

Implementation will prioritize components in this order:

1. **Critical Path Components**:
   - Form components for booking flow
   - Modal components for user interactions
   - Navigation for marketplace filtering
   - Interactive elements for profile editing

2. **Supporting Components**:
   - Feedback components for user notifications
   - Selection components for dates and times
   - Table components for data display
   - Animation framework for transitions

3. **Enhancement Components**:
   - Advanced form validations
   - Complex selection interfaces
   - Specialized input types
   - Advanced animation effects

### 8.3 Linear Issue Structure

The work has been organized in Linear with the following structure:

- **Parent Issue**: [BUI-89: Component Library Foundation](https://linear.app/buildappswith/issue/BUI-89/component-library-foundation)
  - **Child Issues**:
    - [BUI-97: Interactive Component Architecture](https://linear.app/buildappswith/issue/BUI-97/interactive-component-architecture)
    - [BUI-98: Form Component Implementation](https://linear.app/buildappswith/issue/BUI-98/form-component-implementation)
    - [BUI-99: Modal and Dialog Components](https://linear.app/buildappswith/issue/BUI-99/modal-and-dialog-components)
    - [BUI-100: Navigation and Menu Components](https://linear.app/buildappswith/issue/BUI-100/navigation-and-menu-components)
    - [BUI-101: Interactive State Management](https://linear.app/buildappswith/issue/BUI-101/interactive-state-management)
    - [BUI-102: Animation and Transition Framework](https://linear.app/buildappswith/issue/BUI-102/animation-and-transition-framework)

## 9. Testing Strategy

### 9.1 Testing Approach

Interactive component testing will follow these approaches:

1. **Unit Testing**:
   - Test individual component functionality
   - Verify component props and behaviors
   - Test state changes and user interactions
   - Verify accessibility attributes

2. **Integration Testing**:
   - Test component interactions
   - Verify form submission flows
   - Test modal and navigation interactions
   - Verify accessibility in component combinations

3. **User Event Testing**:
   - Simulate user interactions (click, type, etc.)
   - Verify component responses to user events
   - Test keyboard navigation and interactions
   - Verify focus management

4. **Accessibility Testing**:
   - Verify keyboard accessibility
   - Test screen reader compatibility
   - Check color contrast and focus visibility
   - Verify ARIA attributes and roles

### 9.2 Testing Tools

Recommended testing tools for interactive components:

1. **Vitest**: Fast testing framework for unit and integration tests
2. **React Testing Library**: Component testing with user-centric approach
3. **user-event**: Simulate realistic user interactions
4. **axe-core**: Automated accessibility testing
5. **jest-axe**: Integration of axe with Jest for accessibility tests
6. **@testing-library/jest-dom**: Custom matchers for DOM testing

```tsx
// Example form component test
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormField } from '../FormField';

describe('FormField', () => {
  it('renders with label and input', () => {
    render(<FormField name="test" label="Test Label" />);
    
    expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });
  
  it('shows error message when provided', () => {
    render(
      <FormField 
        name="test" 
        label="Test Label" 
        error="This field is required" 
      />
    );
    
    expect(screen.getByText('This field is required')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });
  
  it('calls onChange handler when typing', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    
    render(
      <FormField 
        name="test" 
        label="Test Label" 
        onChange={handleChange} 
      />
    );
    
    const input = screen.getByRole('textbox');
    await user.type(input, 'Hello');
    
    expect(handleChange).toHaveBeenCalledTimes(5);
  });
  
  it('is accessible', async () => {
    const { container } = render(
      <FormField 
        name="test" 
        label="Test Label" 
        required
      />
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

### 9.3 Test Scenarios for Interactive Components

The testing strategy includes specific test scenarios for interactive components:

1. **Form Components**:
   - Input validation with valid/invalid data
   - Form submission with complete/incomplete data
   - Error message display and accessibility
   - Focus management and keyboard navigation

2. **Modal Components**:
   - Modal opening and closing
   - Focus trapping within modal
   - Keyboard interactions (Escape to close, Tab navigation)
   - Screen reader announcements

3. **Navigation Components**:
   - Tab selection and content display
   - Accordion expansion and collapse
   - Dropdown menu opening and item selection
   - Keyboard navigation through menu items

4. **Animation Components**:
   - Animation rendering and completion
   - Reduced motion preference handling
   - Transition between component states
   - Animation performance testing

## 10. Risks and Mitigations

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Form validation complexity exceeds estimates | Medium | High | Start with core validation patterns, expand progressively |
| Accessibility requirements increase development time | High | Medium | Implement accessibility from the start, use established patterns |
| Performance issues with complex animations | Medium | Medium | Use performance-optimized animation approaches, test on lower-end devices |
| Mobile interaction challenges | Medium | High | Design with mobile-first mindset, test extensively on mobile devices |
| State management complexity | Medium | High | Use established patterns, create clear documentation, review regularly |
| Integration challenges with Magic UI Pro | Medium | Medium | Create adapter components where needed, document limitations |
| Cross-browser compatibility issues | Medium | Low | Use feature detection, provide fallbacks, test across browsers |
| Form library integration complexities | Low | Medium | Create minimal integration first, expand gradually |

## 11. Conclusion

This interactive component architecture provides a comprehensive foundation for implementing the user interactions needed for the Buildappswith platform. By establishing consistent patterns for form components, modals, navigation, and animations, we create a cohesive and accessible user experience across the platform.

The architecture is designed to support the critical interaction points identified in PRD 3.1, particularly focusing on the booking flow, profile editing, and marketplace filtering. The implementation plan provides a clear roadmap for developing these components in a prioritized manner, with a focus on accessibility, performance, and user experience.

With both the visual component architecture (from the previous session) and this interactive component architecture, we now have a complete plan for implementing the component library foundation. This will enable rapid development of the platform's interfaces while maintaining consistency, quality, and accessibility.

## 12. Next Steps

1. Begin implementation of core interactive components
2. Establish form component architecture with validation
3. Create modal and dialog component implementations
4. Develop animation framework for transitions
5. Implement navigation and menu components
6. Create documentation and usage examples
7. Develop comprehensive test suite

---

Document prepared for BUI-97 by Claude, with approval from Liam Jons.

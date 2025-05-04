# Admin UI Components

This directory contains UI components specific to the administrative functionality of the Buildappswith platform. These components are designed for use within the admin domain and follow the Component Style Guide patterns.

## Component Types

The admin UI components are specialized versions of general UI components, tailored for administrative use cases:

1. **Layout Components**: Specialized layout components for admin interfaces
   - `admin-card.tsx`: Card component for admin interface items
   - `settings-panel.tsx`: Panel for managing system settings

2. **Form Components**: Form elements designed for administrative data entry
   - `admin-input.tsx`: Specialized input component for admin forms
   - `admin-select.tsx`: Dropdown selection component for admin interfaces

3. **Visualization Components**: Components for displaying administrative data
   - `stats-display.tsx`: Component for visualizing system statistics
   - `user-table.tsx`: Component for displaying user data in tabular format

## Usage

Import admin UI components using the barrel exports:

```typescript
// Import admin UI components
import { AdminCard, SettingsPanel } from "@/components/admin/ui";
```

## Best Practices

- Use consistent styling patterns across admin UI components
- Implement proper accessibility features for all components
- Support responsive layouts for different device sizes
- Follow the Component Style Guide for naming and organization
- Use client components only when necessary for interactivity

# Admin Components

This directory contains components specific to the administrative functionality of the Buildappswith platform. These components follow the domain-first organization pattern established in the folder structure reorganization.

## Directory Structure

```
/admin
├── ui/                   # Admin-specific UI components
│   ├── [component].tsx   # Individual UI components
│   └── index.ts          # Barrel exports
├── [component].tsx       # Admin domain components
└── index.ts              # Barrel exports
```

## Component Categories

The admin components are organized into the following categories:

1. **Core Admin Components**: Components used for administrative functions such as user management, configuration, and system settings
   - `admin-nav.tsx`: Navigation component for the admin interface
   - `session-type-form.tsx`: Form for managing session types

2. **UI Components**: Admin-specific UI components in the `/ui` directory
   - `admin-card.tsx`: Card component for admin interface items
   - `settings-panel.tsx`: Panel for managing system settings

## Usage

Import admin components using the barrel exports:

```typescript
// Import from the admin domain
import { AdminNav, SessionTypeForm } from "@/components/admin";

// Import admin-specific UI components
import { AdminCard, SettingsPanel } from "@/components/admin/ui";
```

## Integration

These components are primarily used in the `/app/(platform)/admin` directory and related API routes. They implement the administrative functionality outlined in PRD 3.1, with a focus on platform management and configuration.

## Best Practices

- Use server components for data-heavy administrative views
- Implement client components for interactive elements
- Follow the Component Style Guide for consistent patterns
- Use proper authentication and authorization for admin functionality

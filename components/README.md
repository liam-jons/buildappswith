# Components Directory

This directory contains all the React components used throughout the Buildappswith platform. The organization follows a domain-driven approach with clear separation of concerns.

## Directory Structure

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
│   └── index.ts              # Barrel exports
└── providers/                # Context providers
    ├── [provider].tsx        # Individual providers
    └── index.ts              # Barrel exports
```

## Core Domains

Components are organized into these primary domains:

1. **auth** - Authentication and user management components
2. **marketplace** - Builder discovery and marketplace components
3. **profile** - User profile management components
4. **scheduling** - Booking and availability management components
5. **payment** - Payment processing and transaction components
6. **admin** - Administrative interface components
7. **trust** - Trust architecture and validation components
8. **community** - Community and knowledge sharing components
9. **learning** - Educational components and learning paths

## UI Component Hierarchy

UI components follow a clear hierarchy:

1. **Core Components**: Foundational building blocks (buttons, inputs, cards)
2. **Composite Components**: Combinations of core components for common patterns
3. **Domain-Specific Components**: Specialized components for specific domains

## Usage Guidelines

### Importing Components

Always import components using barrel exports:

```typescript
// Good - Use barrel exports
import { Button, Card } from "@/components/ui";
import { ValidationTierBadge } from "@/components/trust";

// Avoid - Don't import directly from component files
import { Button } from "@/components/ui/button";
import { ValidationTierBadge } from "@/components/trust/ui/validation-tier-badge";
```

### Component Organization

When creating new components:

1. **Place in the correct domain directory**
   - Domain-specific UI components go in `/[domain]/ui/`
   - Domain logic components go in `/[domain]/`
   - Shared UI components go in `/ui/core/` or `/ui/composite/`

2. **Use appropriate naming conventions**
   - Component files: `kebab-case.tsx`
   - Component names: `PascalCase`
   - Export names: match component names

3. **Include appropriate documentation**
   - JSDoc comments for component purpose and props
   - Usage examples where appropriate
   - Notes on any significant implementation details

4. **Add to barrel exports**
   - Export from appropriate index.ts file
   - Use named exports for clarity

## Component Types

### Server Components

Server components render on the server and are the default component type. They:
- Don't use client-side hooks or state
- Don't include event handlers
- Fetch data on the server
- Have no "use client" directive

### Client Components

Client components include the "use client" directive and can:
- Use React hooks like useState and useEffect
- Include event handlers
- Access browser APIs
- Update after the initial render

## Magic UI Components

The Buildappswith platform uses Magic UI components for enhanced visual effects:

- Import from the `magicui` directory
- Always respect reduced motion preferences
- Provide static alternatives for users with motion sensitivity
- Keep animations subtle and purposeful

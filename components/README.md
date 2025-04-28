# Components Directory

This directory contains all the React components used throughout the Buildappswith platform. The organization follows a domain-driven approach with clear separation of concerns.

## Directory Structure

```
/components
├── [domain]/         # Domain-specific components
│   ├── ui/           # Domain-specific UI components
│   │   └── index.ts  # Barrel exports
│   └── index.ts      # Barrel exports
├── ui/               # Shared UI components
│   ├── core/         # Foundational UI components (mostly shadcn/ui)
│   ├── composite/    # Composed UI components reused across domains
│   └── index.ts      # Barrel exports
├── providers/        # Context providers
└── [global components] # Root level components used across the app
```

## Organization Principles

1. **Domain-First Organization**: Components are primarily organized by domain/feature
2. **UI Component Hierarchy**: 
   - Core UI (buttons, inputs, etc.)
   - Composite UI (combinations of core components)
   - Domain-specific UI (specialized for a particular domain)
3. **Feature Colocation**: Components specific to a feature are kept together
4. **Barrel Exports**: Index files are used to simplify imports
5. **Component Isolation**: Components minimize dependencies on other domains

## Naming Conventions

- Component files: `kebab-case.tsx`
- Component names: `PascalCase`
- Directory names: `kebab-case`
- Barrel exports: `index.ts`

## Import Standards

Always import from barrel files when possible:

```typescript
// Good ✅
import { Button } from "@/components/ui";
import { BuilderCard } from "@/components/marketplace";

// Avoid ❌
import { Button } from "@/components/ui/button";
import { BuilderCard } from "@/components/marketplace/builder-card";
```

For domain-specific UI components, import from the domain barrel:

```typescript
// Good ✅
import { ValidationTierBadge } from "@/components/profile";

// Avoid ❌
import { ValidationTierBadge } from "@/components/profile/ui/validation-tier-badge";
```

## Adding New Components

1. Determine the appropriate domain for your component
2. Create the component in the appropriate directory
3. Export the component from the relevant index.ts file
4. Use the appropriate naming conventions

## Component Documentation

Each component should include:

- "use client" directive if the component uses client-side features
- JSDoc comments explaining the component's purpose
- Properly typed props using TypeScript interfaces
- Comments for complex logic

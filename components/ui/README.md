# UI Components

This directory contains UI components used throughout the Buildappswith platform.

## Directory Structure

```
/ui
├── core/          # Foundational UI components (mostly shadcn/ui)
├── composite/     # Composed UI components reused across domains
└── index.ts       # Barrel exports
```

## Component Categories

### Core Components

Core components are foundational UI elements that serve as building blocks. They are usually:
- Simple, atomic components with a single responsibility
- Highly reusable across the entire application
- Based on shadcn/ui components for consistency

Examples: Button, Input, Card, Alert, Dialog

### Composite Components

Composite components combine multiple core components to create more complex UI elements:
- Composed of multiple core components
- Still domain-agnostic enough to be used across the application
- More specialized than core components but not tied to specific business logic

Examples: SearchBar, Pagination, DataTable, FilterGroup

## Import Standards

Always import from barrel files:

```typescript
// Good ✅
import { Button, Card } from "@/components/ui";
// or
import { Button } from "@/components/ui/core";

// Avoid ❌
import { Button } from "@/components/ui/button";
```

## Naming Conventions

- Component files: `kebab-case.tsx`
- Component names: `PascalCase`

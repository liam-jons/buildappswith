# Custom React Hooks

This directory contains all custom React hooks used throughout the Buildappswith platform. The organization follows a domain-driven approach with clear separation of concerns.

## Directory Structure

```
/hooks
├── [domain]/                # Domain-specific hooks
│   ├── use-[hook-name].ts   # Individual hooks
│   └── index.ts             # Barrel exports
├── use-[hook-name].ts       # Global hooks
└── index.ts                 # Barrel exports for global hooks
```

## Organization Principles

1. **Domain-First Organization**: Hooks are primarily organized by domain/feature
2. **Naming Convention**: All hooks follow the `useKebabCase` naming pattern
3. **Barrel Exports**: Index files are used to simplify imports
4. **Isolation**: Hooks minimize dependencies on other domains

## Domain-Specific Hooks

Each domain has its own directory containing hooks specific to that domain:

- **admin**: Admin-related hooks
- **auth**: Authentication and authorization hooks
- **community**: Community-related hooks
- **learning**: Educational content hooks
- **marketplace**: Builder discovery and marketplace hooks
- **payment**: Payment processing hooks
- **profile**: User profile hooks
- **scheduling**: Booking and availability hooks
- **trust**: Trust architecture hooks

## Usage

Always import hooks using barrel exports for clarity and maintainability:

```typescript
// Good - Use barrel exports
import { useAuth } from "@/hooks/auth";
import { useProfile } from "@/hooks/profile";

// Avoid - Don't import directly from hook files
import { useAuth } from "@/hooks/auth/use-auth";
```

## Creating New Hooks

When creating a new hook:

1. Determine the appropriate domain for your hook
2. Create the hook in the domain directory following the naming convention
3. Export the hook from the domain's index.ts file
4. Document the hook's purpose, parameters, and return values
5. Include usage examples in JSDoc comments

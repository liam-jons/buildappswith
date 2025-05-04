# Marketplace UI Components

This directory contains UI components specific to the marketplace domain of the Buildappswith platform. These components are designed to be used exclusively within the marketplace context.

## Directory Structure

```
/ui
├── [component].tsx  # Individual UI components
└── index.ts        # Barrel exports for UI components
```

## Purpose

The UI components in this directory:

- Are specific to the marketplace domain
- Implement specialized UI elements for marketplace functionality
- Follow consistent design patterns
- Provide reusable elements for marketplace views

## Implementation Guidelines

- Create specialized UI components for marketplace-specific needs
- Keep components focused on single responsibilities
- Implement both server and client components as appropriate
- Use consistent props interfaces and naming conventions
- Document component usage with descriptive comments

## Usage Example

Import UI components through the barrel exports:

```typescript
import { FilterPanel, SortControls } from "@/components/marketplace/ui";

export function MarketplacePage() {
  return (
    <div>
      <FilterPanel />
      <SortControls />
      {/* Other marketplace content */}
    </div>
  );
}
```

## Integration

These UI components integrate with:
- Core UI components from `/components/ui`
- Marketplace domain logic from `/lib/marketplace`
- Trust indicators from the trust domain
- Scheduling components for availability visualization
# Marketplace Components

This directory contains components related to the marketplace functionality of the Buildappswith platform. The marketplace is a key feature that allows users to discover builders and their services.

## Directory Structure

```
/marketplace
├── ui/               # Marketplace-specific UI components
│   ├── [component].tsx  # Individual UI components
│   └── index.ts      # Barrel exports for UI components
├── [component].tsx   # Marketplace-specific components
└── index.ts          # Barrel exports for all marketplace components
```

## Key Components

- `BuilderCard`: Displays a builder profile card in the marketplace listing
- `BuilderImage`: Handles the image display for builder profiles

## Usage Guidelines

### Importing Components

Always import components using the barrel exports:

```typescript
// Good - Use barrel exports
import { BuilderCard, BuilderImage } from "@/components/marketplace";
import { MarketplaceSpecificUI } from "@/components/marketplace/ui";

// Avoid - Don't import directly from component files
import { BuilderCard } from "@/components/marketplace/builder-card";
```

### Component Organization

- UI components specific to the marketplace domain should be placed in the `ui` subdirectory
- Components that are used only within marketplace pages should be placed in this directory
- Components that might be reused across domains should be evaluated for placement in a more general location

## Integration with Other Domains

The marketplace components integrate with:

- Profile domain for detailed builder information
- Scheduling domain for session availability
- Trust domain for validation tier indicators
- Payment domain for session pricing

## Styling

Marketplace components use Tailwind CSS for styling with the following considerations:

- Responsive design for all screen sizes
- Consistent color schemes matching the platform design system
- Accessibility compliance for all interactive elements
# Trust Components

This directory contains components related to the trust architecture of the Buildappswith platform.

## Directory Structure

```
/trust
├── ui/                   # Trust-specific UI components
│   ├── validation-tier-badge.tsx   # Badge showing builder validation tier
│   └── index.ts                    # Barrel exports
└── index.ts              # Main barrel exports
```

## Core Components

### Validation Tier Badge

The `ValidationTierBadge` component visually represents a builder's validation tier within the platform's trust architecture. It uses color-coding and styling to indicate the level of verification a builder has achieved.

```typescript
import { ValidationTierBadge } from "@/components/trust";

// Usage
<ValidationTierBadge tier={3} size="md" />
```

#### Props

- `tier`: Number from 1-5 representing the builder's validation tier
- `size`: Size of the badge (`"sm"`, `"md"`, or `"lg"`)
- `showTooltip`: Whether to show an explanation tooltip on hover
- `className`: Additional classes to apply to the badge

## Integration Points

The trust components integrate with:

- **Profile Domain**: For displaying validation information on builder profiles
- **Marketplace Domain**: For showing trust indicators in builder listings
- **Admin Domain**: For managing validation tiers during the verification process

## Trust Architecture Overview

The trust architecture in Buildappswith follows a multi-dimensional approach:

1. **Validation Tiers**: Five levels of verification, from basic to comprehensive
2. **Outcome Verification**: Verification of concrete outcomes and results
3. **Client Testimonials**: Feedback from previous clients
4. **Community Validation**: Recognition from the broader community

Each dimension is represented through appropriate visual components to help users understand the trust level of builders on the platform.

## Adding New Components

When adding new trust-related components:

1. Follow the established naming pattern: `[component-name].tsx`
2. Place domain-specific UI components in the `/trust/ui/` directory
3. Export the component from both the UI index.ts and the main index.ts
4. Include comprehensive documentation and typing
5. Integrate with the broader trust architecture as appropriate

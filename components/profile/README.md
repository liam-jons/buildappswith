# Profile Components

This directory contains all components related to profile management and display within the Buildappswith platform. The profile domain follows a domain-first organization pattern with dedicated UI components.

## Directory Structure

```
/profile
├── ui/                     # Profile-specific UI components
│   ├── validation-tier-badge.tsx  # Trust validation badge component
│   ├── [other UI components]      # Additional UI components
│   └── index.ts            # Barrel exports for UI components
├── [domain components]     # Profile domain components
└── index.ts                # Barrel exports for all profile components
```

## Component Types

### Core Profile Components

- **BuilderProfile**: Displays a builder's profile with trust architecture
- **ClientProfile**: Displays a client's profile with booking history
- **ProfileEditor**: Allows users to edit their profile information
- **PortfolioGallery**: Showcases builder's projects and applications
- **RoleBadges**: Displays user roles (Builder, Client, Admin)

### Profile UI Components

- **ValidationTierBadge**: Visual representation of builder's trust validation level
- **SuccessMetricsDashboard**: Displays builder's success metrics and statistics
- **AppShowcase**: Showcases individual portfolio projects

## Usage Guidelines

### Import Pattern

Always import components using the barrel exports:

```typescript
// Preferred: Use barrel exports
import { BuilderProfile, ClientProfile } from "@/components/profile";
import { ValidationTierBadge } from "@/components/profile/ui";

// Avoid: Don't import directly from component files
import { BuilderProfile } from "@/components/profile/builder-profile";
```

### Server vs. Client Components

Profile components follow these patterns:

- Server components fetch their own data where possible
- Client components use the `"use client"` directive
- Complex interactions use client components
- Pure display uses server components

## Integration with Other Domains

Profile components integrate with:

- **Trust Domain**: For validation tier calculation and display
- **Marketplace Domain**: For builder discovery and display
- **Booking Domain**: For session type display and scheduling
- **Payment Domain**: For transaction history and financial metrics

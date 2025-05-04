# Visualized Folder Structure

This document provides a visual representation of the Buildappswith platform's folder structure, helping developers understand the organization of the codebase at a glance.

## Root Directory Structure

```
/
├── app/                     # Next.js App Router pages
│   ├── (auth)/              # Authentication routes
│   │   ├── login/           # Login page
│   │   ├── signup/          # Signup page
│   │   └── ...              # Other auth pages
│   ├── (marketing)/         # Marketing pages
│   │   ├── about/           # About page
│   │   ├── contact/         # Contact page
│   │   └── ...              # Other marketing pages
│   ├── (platform)/          # Platform pages
│   │   ├── dashboard/       # Role-based dashboard
│   │   ├── profile/         # Unified profile system
│   │   ├── booking/         # Booking functionality
│   │   ├── payment/         # Payment processing
│   │   ├── marketplace/     # Marketplace functionality
│   │   ├── community/       # Community functionality
│   │   ├── learning/        # Learning experience
│   │   ├── admin/           # Admin functionality
│   │   └── trust/           # Trust architecture
│   └── api/                 # API routes
│       ├── admin/           # Admin API routes
│       ├── auth/            # Auth API routes
│       ├── marketplace/     # Marketplace API routes
│       ├── scheduling/      # Scheduling API routes
│       ├── payment/         # Payment API routes
│       ├── webhooks/        # Webhook handling
│       └── ...              # Other API routes
├── components/              # Shared components
│   ├── admin/               # Admin domain components
│   │   ├── ui/              # Admin-specific UI components
│   │   │   ├── admin-card.tsx       # Admin card component
│   │   │   ├── settings-panel.tsx   # Settings panel component
│   │   │   └── index.ts    # Barrel exports
│   │   ├── user-list.tsx   # User list component
│   │   ├── system-status.tsx # System status component
│   │   └── index.ts        # Barrel exports
│   ├── auth/                # Auth domain components
│   │   ├── ui/              # Auth-specific UI components
│   │   │   ├── login-form.tsx       # Login form component
│   │   │   ├── signup-form.tsx      # Signup form component
│   │   │   └── index.ts    # Barrel exports
│   │   ├── auth-card.tsx   # Auth card component
│   │   ├── role-gate.tsx   # Role authorization component
│   │   └── index.ts        # Barrel exports
│   ├── community/           # Community domain components
│   │   ├── ui/              # Community-specific UI components
│   │   │   ├── discussion-card.tsx  # Discussion card component
│   │   │   ├── comment-box.tsx      # Comment box component
│   │   │   └── index.ts    # Barrel exports
│   │   ├── discussion-list.tsx # Discussion list component
│   │   ├── knowledge-base.tsx  # Knowledge base component
│   │   └── index.ts        # Barrel exports
│   ├── dashboard/           # Dashboard domain components
│   │   ├── ui/              # Dashboard-specific UI components
│   │   │   ├── stat-card.tsx        # Stat card component
│   │   │   ├── activity-feed.tsx    # Activity feed component
│   │   │   └── index.ts    # Barrel exports
│   │   ├── dashboard-header.tsx # Dashboard header component
│   │   ├── welcome-message.tsx  # Welcome message component
│   │   └── index.ts        # Barrel exports
│   ├── learning/            # Learning domain components
│   │   ├── ui/              # Learning-specific UI components
│   │   │   ├── timeline-item.tsx    # Timeline item component
│   │   │   ├── capability-card.tsx  # Capability card component
│   │   │   └── index.ts    # Barrel exports
│   │   ├── timeline.tsx    # Timeline component
│   │   ├── learning-path-card.tsx # Learning path card component
│   │   └── index.ts        # Barrel exports
│   ├── marketplace/         # Marketplace domain components
│   │   ├── ui/              # Marketplace-specific UI components
│   │   │   ├── filter-panel.tsx     # Filter panel component
│   │   │   ├── sort-options.tsx     # Sort options component
│   │   │   └── index.ts    # Barrel exports
│   │   ├── builder-card.tsx # Builder card component
│   │   ├── builder-grid.tsx # Builder grid component
│   │   └── index.ts        # Barrel exports
│   ├── payment/             # Payment domain components
│   │   ├── ui/              # Payment-specific UI components
│   │   │   ├── pricing-card.tsx     # Pricing card component
│   │   │   ├── payment-method-selector.tsx # Payment method selector
│   │   │   └── index.ts    # Barrel exports
│   │   ├── payment-summary.tsx # Payment summary component
│   │   ├── invoice-details.tsx # Invoice details component
│   │   └── index.ts        # Barrel exports
│   ├── profile/             # Profile domain components
│   │   ├── ui/              # Profile-specific UI components
│   │   │   ├── profile-image.tsx    # Profile image component
│   │   │   ├── profile-tabs.tsx     # Profile tabs component
│   │   │   └── index.ts    # Barrel exports
│   │   ├── profile-header.tsx # Profile header component
│   │   ├── account-settings.tsx # Account settings component
│   │   └── index.ts        # Barrel exports
│   ├── scheduling/          # Scheduling domain components
│   │   ├── ui/              # Scheduling-specific UI components
│   │   │   ├── time-slot-picker.tsx # Time slot picker component
│   │   │   ├── session-type-card.tsx # Session type card component
│   │   │   └── index.ts    # Barrel exports
│   │   ├── booking-calendar.tsx # Booking calendar component
│   │   ├── session-type-selector.tsx # Session type selector
│   │   └── index.ts        # Barrel exports
│   ├── trust/               # Trust domain components
│   │   ├── ui/              # Trust-specific UI components
│   │   │   ├── validation-tier-badge.tsx # Validation tier badge
│   │   │   ├── trust-indicators.tsx # Trust indicators component
│   │   │   └── index.ts    # Barrel exports
│   │   ├── outcome-verification.tsx # Outcome verification component
│   │   ├── capability-validation.tsx # Capability validation component
│   │   └── index.ts        # Barrel exports
│   ├── ui/                  # Shared UI components
│   │   ├── core/            # Foundational UI components
│   │   │   ├── button.tsx  # Button component
│   │   │   ├── card.tsx    # Card component
│   │   │   ├── input.tsx   # Input component
│   │   │   └── index.ts    # Barrel exports
│   │   ├── composite/      # Composed UI components
│   │   │   ├── page-header.tsx    # Page header component
│   │   │   ├── data-table.tsx     # Data table component
│   │   │   └── index.ts    # Barrel exports
│   │   └── index.ts        # Barrel exports
│   └── providers/           # Context providers
│       ├── theme-provider.tsx # Theme provider
│       ├── auth-provider.tsx  # Auth provider
│       └── index.ts        # Barrel exports
├── hooks/                   # Custom React hooks
│   ├── admin/               # Admin domain hooks
│   │   ├── use-admin-data.ts # Admin data hook
│   │   └── index.ts        # Barrel exports
│   ├── auth/                # Auth domain hooks
│   │   ├── use-auth.ts     # Auth hook
│   │   ├── use-is-admin.ts # Admin role check hook
│   │   └── index.ts        # Barrel exports
│   ├── community/           # Community domain hooks
│   │   ├── use-discussions.ts # Discussions hook
│   │   └── index.ts        # Barrel exports
│   ├── learning/            # Learning domain hooks
│   │   ├── use-learning-progress.ts # Learning progress hook
│   │   └── index.ts        # Barrel exports
│   ├── marketplace/         # Marketplace domain hooks
│   │   ├── use-marketplace-filters.ts # Marketplace filters hook
│   │   └── index.ts        # Barrel exports
│   ├── payment/             # Payment domain hooks
│   │   ├── use-checkout.ts # Checkout hook
│   │   └── index.ts        # Barrel exports
│   ├── profile/             # Profile domain hooks
│   │   ├── use-profile.ts  # Profile hook
│   │   └── index.ts        # Barrel exports
│   ├── scheduling/          # Scheduling domain hooks
│   │   ├── use-booking.ts  # Booking hook
│   │   └── index.ts        # Barrel exports
│   ├── trust/               # Trust domain hooks
│   │   ├── use-trust-metrics.ts # Trust metrics hook
│   │   └── index.ts        # Barrel exports
│   ├── use-form.ts          # Form hook (global)
│   ├── use-media-query.ts   # Media query hook (global)
│   └── index.ts             # Barrel exports
├── lib/                     # Non-React code
│   ├── admin/               # Admin domain business logic
│   │   ├── actions.ts      # Server actions
│   │   ├── api.ts          # API client functions
│   │   ├── schemas.ts      # Zod schemas
│   │   ├── types.ts        # TypeScript types
│   │   ├── utils.ts        # Domain utilities
│   │   └── index.ts        # Barrel exports
│   ├── auth/                # Auth domain business logic
│   │   ├── actions.ts      # Server actions
│   │   ├── api.ts          # API client functions
│   │   ├── schemas.ts      # Zod schemas
│   │   ├── types.ts        # TypeScript types
│   │   ├── utils.ts        # Domain utilities
│   │   └── index.ts        # Barrel exports
│   ├── community/           # Community domain business logic
│   │   ├── actions.ts      # Server actions
│   │   ├── api.ts          # API client functions
│   │   ├── schemas.ts      # Zod schemas
│   │   ├── types.ts        # TypeScript types
│   │   ├── utils.ts        # Domain utilities
│   │   └── index.ts        # Barrel exports
│   ├── learning/            # Learning domain business logic
│   │   ├── actions.ts      # Server actions
│   │   ├── api.ts          # API client functions
│   │   ├── schemas.ts      # Zod schemas
│   │   ├── types.ts        # TypeScript types
│   │   ├── utils.ts        # Domain utilities
│   │   └── index.ts        # Barrel exports
│   ├── marketplace/         # Marketplace domain business logic
│   │   ├── actions.ts      # Server actions
│   │   ├── api.ts          # API client functions
│   │   ├── schemas.ts      # Zod schemas
│   │   ├── types.ts        # TypeScript types
│   │   ├── utils.ts        # Domain utilities
│   │   └── index.ts        # Barrel exports
│   ├── payment/             # Payment domain business logic
│   │   ├── actions.ts      # Server actions
│   │   ├── api.ts          # API client functions
│   │   ├── schemas.ts      # Zod schemas
│   │   ├── types.ts        # TypeScript types
│   │   ├── utils.ts        # Domain utilities
│   │   └── index.ts        # Barrel exports
│   ├── profile/             # Profile domain business logic
│   │   ├── actions.ts      # Server actions
│   │   ├── api.ts          # API client functions
│   │   ├── schemas.ts      # Zod schemas
│   │   ├── types.ts        # TypeScript types
│   │   ├── utils.ts        # Domain utilities
│   │   └── index.ts        # Barrel exports
│   ├── scheduling/          # Scheduling domain business logic
│   │   ├── actions.ts      # Server actions
│   │   ├── api.ts          # API client functions
│   │   ├── schemas.ts      # Zod schemas
│   │   ├── types.ts        # TypeScript types
│   │   ├── utils.ts        # Domain utilities
│   │   └── index.ts        # Barrel exports
│   ├── trust/               # Trust domain business logic
│   │   ├── actions.ts      # Server actions
│   │   ├── api.ts          # API client functions
│   │   ├── schemas.ts      # Zod schemas
│   │   ├── types.ts        # TypeScript types
│   │   ├── utils.ts        # Domain utilities
│   │   └── index.ts        # Barrel exports
│   ├── utils/               # Shared utilities
│   │   ├── cn.ts           # Class name utility
│   │   ├── date-utils.ts   # Date utilities
│   │   ├── validation.ts   # Validation utilities
│   │   └── index.ts        # Barrel exports
│   ├── constants/           # Global constants
│   │   ├── routes.ts       # Route constants
│   │   ├── config.ts       # Application config
│   │   └── index.ts        # Barrel exports
│   ├── db.ts                # Database connection
│   ├── logger.ts            # Logging utility
│   └── types.ts             # Shared TypeScript types
├── public/                  # Static assets
├── styles/                  # Global styles
└── types/                   # Global TypeScript types
```

## Domain-Specific View

Below is a view that shows the folder structure for a single domain (marketplace) across all major directories:

### Marketplace Domain

```
/marketplace domain
├── app/(platform)/marketplace/        # Marketplace pages
│   ├── page.tsx                       # Main marketplace listing page
│   ├── [id]/                          # Builder profile pages
│   │   └── page.tsx                   # Builder profile page
│   └── search/                        # Search result pages
│       └── page.tsx                   # Search results page
├── app/api/marketplace/               # Marketplace API routes
│   ├── builders/                      # Builder data endpoints
│   │   └── route.ts                   # Builders API route
│   ├── search/                        # Search endpoints
│   │   └── route.ts                   # Search API route
│   └── categories/                    # Category endpoints
│       └── route.ts                   # Categories API route
├── components/marketplace/            # Marketplace components
│   ├── ui/                            # Marketplace-specific UI
│   │   ├── filter-panel.tsx           # Filter panel component
│   │   ├── sort-options.tsx           # Sort options component
│   │   └── index.ts                   # Barrel exports
│   ├── builder-card.tsx               # Builder card component
│   ├── builder-grid.tsx               # Builder grid component
│   ├── search-bar.tsx                 # Search bar component
│   └── index.ts                       # Barrel exports
├── hooks/marketplace/                 # Marketplace hooks
│   ├── use-marketplace-filters.ts     # Filters hook
│   ├── use-builder-search.ts          # Search hook
│   └── index.ts                       # Barrel exports
└── lib/marketplace/                   # Marketplace business logic
    ├── actions.ts                     # Server actions
    ├── api.ts                         # API client functions
    ├── schemas.ts                     # Zod schemas
    ├── types.ts                       # TypeScript types
    ├── utils.ts                       # Domain utilities
    └── index.ts                       # Barrel exports
```

## Component Type View

This view shows how components of different types are organized:

### Server vs. Client Components

```
/components organization by type
├── Server Components (default)        # Rendered on the server
│   ├── profile/profile-header.tsx     # Profile header component
│   ├── marketplace/builder-grid.tsx   # Builder grid component
│   ├── scheduling/booking-calendar.tsx # Booking calendar
│   └── ...                            # Other server components
└── Client Components                  # Rendered on the client
    ├── profile/ui/profile-tabs.tsx    # Interactive tabs
    ├── marketplace/ui/filter-panel.tsx # Interactive filters
    ├── scheduling/ui/time-slot-picker.tsx # Interactive picker
    └── ...                            # Other client components
```

### Core vs. Domain-Specific Components

```
/components organization by specificity
├── Core UI Components                 # Shared across domains
│   ├── ui/core/button.tsx             # Button component
│   ├── ui/core/card.tsx               # Card component
│   ├── ui/core/input.tsx              # Input component
│   └── ...                            # Other core UI components
├── Composite UI Components            # Composed from core components
│   ├── ui/composite/page-header.tsx   # Page header component
│   ├── ui/composite/data-table.tsx    # Data table component
│   └── ...                            # Other composite components
└── Domain-Specific Components         # Specific to a domain
    ├── marketplace/builder-card.tsx   # Marketplace-specific
    ├── scheduling/session-type-selector.tsx # Scheduling-specific
    ├── trust/validation-tier-badge.tsx # Trust-specific
    └── ...                            # Other domain-specific components
```

## Barrel Export Pattern

All domains use barrel exports to simplify imports:

```
// Domain barrel export
// components/marketplace/index.ts
export * from "./builder-card";
export * from "./builder-grid";
export * from "./search-bar";
export * from "./ui";

// Domain UI barrel export
// components/marketplace/ui/index.ts
export * from "./filter-panel";
export * from "./sort-options";

// Usage in components
import { BuilderCard, BuilderGrid } from "@/components/marketplace";
import { Button, Card } from "@/components/ui";
```

## Navigating the Folder Structure

When working with the codebase, keep these guidelines in mind:

1. **Domain-First Navigation**: First identify which domain you're working with
2. **Component Types**: Server components at the root, client components in the ui/ subdirectory
3. **Business Logic**: Look in lib/[domain] for business logic, actions, and types
4. **API Routes**: API endpoints are in app/api/[domain]
5. **Pages**: Application pages are in app/(platform)/[domain]

## Conclusion

This document provides a visual representation of the Buildappswith platform's folder structure. The domain-first organization creates clear boundaries between different parts of the application while enabling effective integration through well-defined interfaces. This structure supports the empowerment platform vision outlined in PRD 3.1 by creating a maintainable, scalable codebase that can evolve over time.
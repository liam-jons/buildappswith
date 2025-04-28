# Changelog

All notable changes to this project will be documented in this file.

## [1.0.139] - 2025-04-28

### Added
- Created comprehensive authentication flow diagrams in CLERK_AUTHENTICATION_FLOW.mermaid
- Added detailed sequence diagrams for auth flows in CLERK_AUTH_SEQUENCE_DIAGRAMS.mermaid
- Created detailed authentication testing guide in CLERK_AUTHENTICATION_TESTING_GUIDE.md
- Added cleanup recommendation list in CLERK_AUTHENTICATION_CLEANUP_LIST.md
- Created post-launch enhancement recommendations in CLERK_FUTURE_RECOMMENDATIONS.md
- Added research on Clerk best practices, webhooks security, and UI customization options

### Changed
- Updated authentication documentation to reflect current implementation
- Organized authentication documentation for better maintainability

## [1.0.138] - 2025-04-28

### Added
- Implemented custom client-side authentication hooks in `/lib/auth/clerk-hooks.ts`
- Added role-based hooks: `useHasRole`, `useIsAdmin`, `useIsBuilder`, `useIsClient`
- Added enhanced authentication hooks: `useAuth`, `useUser`, `useSignOut`, `useAuthStatus`
- Created comprehensive hook documentation in CLERK_HOOKS_IMPLEMENTATION.md
- Updated site-header.tsx to use custom hooks for better role-based access control

### Changed
- Updated `/lib/auth/hooks.ts` to export custom hooks from `clerk-hooks.ts`
- Standardized authentication approach across client-side components
- Improved type safety with the `ExtendedUser` interface
- Simplified user transformation logic by centralizing in hooks

## [1.0.137] - 2025-04-28

### Fixed
- Updated test utilities to use Clerk authentication instead of NextAuth
- Fixed test-utils.tsx and vitest-utils.tsx to use ClerkProvider instead of SessionProvider
- Updated mock user data to match Clerk's user format for consistent testing
- Created comprehensive CLERK_TEST_UTILITIES.md documentation for authentication testing
- Ensured consistent testing approach across Jest and Vitest environments

## [1.0.136] - 2025-04-28

### Changed
- Completed authentication cleanup by removing legacy NextAuth code
- Updated `/lib/auth/index.ts` to directly export Clerk functionality
- Updated `/lib/auth/hooks.ts` to directly export Clerk hooks
- Enhanced warning in `/lib/auth/auth.ts` with clear removal timeline
- Created comprehensive authentication cleanup documentation

## [1.0.135] - 2025-04-28

### Added
- Completed Stripe payment system implementation and validation
- Created comprehensive future recommendations for Stripe integration post-launch
- Added STRIPE_FUTURE_RECOMMENDATIONS.md with built-in Stripe functionality research
- Added STRIPE_IMPLEMENTATION_COMPLETED.md documenting successful implementation
- Moved completed Stripe implementation plan documentation to engineering folder

## [1.0.134] - 2025-04-28

### Changed
- Refactored all Stripe API routes to use centralized stripe-server.ts utility
- Implemented proper authentication and authorization in all Stripe API routes
- Enhanced error handling with consistent format across all payment endpoints
- Added comprehensive logging for Stripe operations with detailed context
- Improved webhook handler to use centralized event processing
- Added validation to ensure users can only view their own payment sessions
- Updated session retrieval endpoint to fetch actual booking data

## [1.0.133] - 2025-04-28

### Added
- Added idempotency key support to Stripe payment integration
- Added enhanced error handling with StripeClientErrorType classification
- Added improved error visualization in booking form with better UX
- Created unified completeBookingWithPayment function for streamlined integration
- Added comprehensive documentation in STRIPE_CLIENT_INTEGRATION_UPDATES.md
- Created STRIPE_SERVER_IMPLEMENTATION.md documenting the server-side integration
- Added STRIPE_DOCUMENTATION_GUIDE.md to organize Stripe documentation

### Fixed
- Fixed incorrect API route references in stripe-client.ts
- Updated booking form to use proper payment flow with Stripe
- Corrected error handling in payment submission process

### Changed
- Reorganized Stripe documentation for better maintainability

## [1.0.132] - 2025-04-28

### Added
- Created import standardization scripts to update component imports
- Added `standardize-imports.sh` script for automating import updates
- Added comprehensive documentation on import standards in COMPONENT_STYLE_GUIDE.md
- Added IMPORT_STANDARDIZATION.md guide explaining the barrel export pattern
- Added new script to package.json: `pnpm standardize-imports`

### Changed
- Standardized component imports to use barrel exports 
- Updated barrel export files to use relative paths
- Fixed UI core barrel exports to reference local components
- Implemented comprehensive documentation on import patterns

## [Unreleased]

### Changed
- Identified 105 potentially unused components for removal (40% of total components)
- Created comprehensive codebase cleanup strategy in docs/architecture/decisions
- Analyzed navigation structure to determine critical pages for preservation
- Categorized unused components into logical groups for systematic removal
- Improved unused component percentage from 45% to 36%

## [1.0.131] - 2025-04-28

### Added
- Created comprehensive folder structure standardization plan based on domain-first organization
- Established directory scaffolding for new component organization
- Set up barrel exports for simplified imports across the codebase
- Created extensive documentation including folder structure guide and component README
- Moved core UI components to their new locations

## [1.0.130] - 2025-04-28

### Removed
- Cleaned up unused UI components to improve codebase maintainability
- Removed unused MagicUI components: animated-beam.tsx, sphere-mask.tsx
- Removed unused landing components: hero-visualization.tsx, animated-beam-section.tsx
- Removed unused marketplace components: featured-builder-card.tsx
- Removed unused UI components: collapsible.tsx, sheet.tsx, skeleton.tsx
- Removed general UI components: error-boundary.tsx, site-banner.tsx
- Created backup copies in docs/cleanup-records for future reference
- Implemented phased cleanup approach documented in architecture decisions

## [1.0.129] - 2025-04-27

### Added
- Implemented client-side booking calendar for scheduling sessions with builders
- Created TimeSlotsSelector component for displaying available time slots by time of day
- Added SessionTypeSelector component for presenting available session types
- Implemented BookingForm component for collecting booking details
- Added API route for creating and fetching bookings
- Created dedicated booking page at /book/[builderId]
- Integrated booking system with existing availability management
- Ensured proper timezone handling for international bookings
- Added authentication integration for booking requests
- Implemented accessibility features in all new components (WCAG 2.1 AA compliant)

## [1.0.128] - 2025-04-27

### Added
- Implemented comprehensive availability management system for builders
- Created database models for AvailabilityRule, AvailabilityException, and ExceptionTimeSlot
- Implemented time slot generation algorithm considering rules, exceptions, and bookings
- Created API routes for managing availability rules, exceptions, time slots, and settings
- Built UI components for weekly availability and exceptions management
- Added scheduling settings management with timezone support
- Added a dedicated availability management page in profile settings
- Updated documentation with comprehensive coverage of the new system

## See [CHANGELOG_ARCHIVE.md](./CHANGELOG_ARCHIVE.md) for older entries
# Changelog

All notable changes to this project will be documented in this file.

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

## [1.0.102] - 2025-04-26

### Added
- Implemented Structurizr for architecture documentation using the C4 model
- Created comprehensive C4 model with System Context and Container diagrams
- Added detailed ARCHITECTURE.md to document the architectural approach
- Created Architecture Decision Records (ADRs) for structurizr implementation and Clerk migration
- Added documentation on C4 model principles and Structurizr usage
- Created ARCHITECTURE_CHANGELOG.md for tracking architecture-specific changes
- Implemented local Structurizr Lite setup with Docker Compose

## [1.0.101] - 2025-04-26

### Fixed
- Resolved "mockImplementationOnce is not a function" TypeScript errors in middleware tests
- Implemented proper typing with Vitest's built-in MockInstance type for Clerk authentication mocks
- Added `configureMockAuth` helper function to simplify test setup and properly handle mock typing
- Updated all middleware tests to use the new approach
- Added comprehensive documentation in `docs/middleware-mock-investigation/COMPREHENSIVE_SOLUTION.md`
- Marked middleware testing issues as resolved in MIDDLEWARE_TESTING_BACKLOG.md

## [1.0.100] - 2025-04-26

### Fixed
- Fixed "Cannot read properties of undefined (reading 'length')" error in Datadog dashboard creation script
- Switched from using Datadog API model classes to plain JavaScript objects for dashboard definition
- Matched widget structure exactly with exported Datadog UI dashboard JSON format
- Enhanced dashboard with component test performance and detailed note sections
- Updated metric names to use proper "buildappswith" prefix for all metrics
- Added comprehensive test metrics organized by logical sections
- Improved error handling and debugging output in dashboard creation script

### Fixed
- Fixed widget structure in Datadog dashboard creation to match exported dashboard JSON
- Implemented exact structure from successful Datadog UI export to resolve type validation errors
- Added proper widget IDs to align with Datadog API expectations
- Restructured request format for query_value and timeseries widgets
- Fixed group widgets to include proper widget array structure
- Simplified dashboard to use minimal set of widgets for initial validation
- Updated script version number to 1.0.4 for better tracking

## See [CHANGELOG_ARCHIVE.md](./CHANGELOG_ARCHIVE.md) for older entries
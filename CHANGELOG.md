# Changelog

All notable changes to this project will be documented in this file.

## [1.0.54] - 2025-04-23

### Fixed
- Fixed build-time prerendering errors in `/builder-profile/liam-jons` page
- Properly converted builder profile page to server component for better SEO
- Implemented correct static generation pattern with `generateStaticParams` for builder profiles
- Created comprehensive build-time fallback data to prevent "undefined" errors
- Added proper Suspense boundaries and error handling for improved user experience
- Separated client-side interactive elements for better React architecture
- Leveraged existing BuilderProfile component for more consistent UI

## [1.0.45] - 2025-04-23

### Fixed
- Fixed type error in session-type-form.tsx component with Zod validation schema
- Updated form resolver configuration to ensure consistent types between schema and form values
- Added proper type casting to fix zodResolver compatibility issues

## [1.0.44] - 2025-04-23

### Fixed
- Updated RouteParams interface to support Next.js 15.3.1 API routes with Promise-based params
- Fixed type error in session-types API routes regarding incorrect params type
- Improved compatibility with Next.js 15.3.1 route handler type expectations


## [1.0.40] - 2025-04-23

### Added
- Created database seeding script for Liam Jons profile with ADHD focus
- Implemented session type management system with JSON storage
- Added builder profile utility for consistent profile loading
- Created data directory for storing session type definitions

### Changed
- Enhanced builder profile page to load data from database
- Updated booking page to use dynamic session types
- Improved error handling for missing database records
- Implemented fallback data for profile when database records are not found

### Fixed
- Resolved profile data inconsistency between frontend and database
- Fixed session type mapping in booking system
- Implemented proper error handling for database queries

## [1.0.39] - 2025-04-23

### Added
- Implemented permanent redirects from /liam to /builder-profile/liam-jons
- Added session parameter handling for improved booking flow

### Changed
- Consolidated Liam Jons profile by merging marketing and platform implementations
- Enhanced profile with four-tab navigation: Builder Profile, ADHD Focus, Sessions, and Founder Story

## [1.0.38] - 2025-04-23

### Fixed
- Updated Prisma schema references from `role` to `roles` throughout the codebase
- Fixed type errors in user role fields in multiple files:
  - app/api/dev/seed-users/route.ts
  - app/api/profiles/builder/route.ts
  - lib/services/builder-profile-service.ts
  - lib/services/builder-service.ts
  - scripts/seed-data/create-dummy-profiles.ts
  - scripts/seed-data/create-profiles.ts
- Improved compatibility with Prisma 6.6.0 schema updates
- Fixed build errors caused by schema changes

## [1.0.33] - 2025-04-23

### Added
- Created comprehensive App Showcase component for displaying builder-created applications
- Developed API endpoints for app management (fetch, create, update, delete)
- Added Role Badges component to display multiple user roles and founder status
- Implemented dedicated Liam Jons profile page with ADHD focus content
- Added tabbed interface to builder profiles for better content organization

### Changed
- Enhanced BuilderProfile component to display multi-role badges
- Updated profile data structure to include apps and role information
- Improved profile client component to fetch both profile and app data
- Fixed Particles component type error (ease property)

### Fixed
- Fixed type error in Particles component by updating ease property type
- Enhanced error handling for missing app data or profile images
- Implemented proper loading states for all profile components

## [1.0.32] - 2025-04-23

### Added
- Enhanced profile system to support multi-role functionality (Admin + Builder)
- Created comprehensive builder profile page for Liam Jons as founder
- Added App Showcase component for displaying builder-created applications
- Implemented tabbed interface to show both builder and founder information
- Added ADHD specialization focus flag to builder profiles
- Created database migration for supporting multi-role users and app showcase

### Changed
- Updated Prisma schema to support multiple roles per user
- Added founder flag to User model for identifying platform founders
- Enhanced BuilderProfile model with ADHD specialization flag
- Implemented graceful fallbacks for missing profile images

## [1.0.31] - 2025-04-22

### Fixed
- Resolved all ESLint errors related to unescaped entities in marketing and legal pages:
  - Fixed 14 unescaped quotes and apostrophes in FAQ page
  - Fixed unescaped apostrophe in Privacy Policy page
  - Fixed unescaped quotes in Terms of Service page
  - Fixed unescaped quotes in Weekly Sessions page
- Improved overall code quality and compliance with React JSX standards
- Ensured consistent entity escaping across all newly created pages

## [1.0.27] - 2025-04-22

### Added
- Created Privacy Policy page with GDPR-compliant placeholder content
- Created Terms of Service page with UK-compliant placeholder content
- Created FAQ page with common questions and answers
- Created Weekly Sessions page showcasing regular learning events

## [1.0.26] - 2025-04-22

### Added
- Created new "Toolkit" page with comprehensive AI tools organized by category
- Enhanced "How it Works" page with detailed sections on joining the AI marketplace

### Fixed
- Updated navigation links to direct users to appropriate pages
- Fixed ESLint errors related to unescaped entities

## [1.0.25] - 2025-04-22

### Changed
- Updated UI components to enhance accessibility
- Improved mobile navigation experience

## [1.0.24] - 2025-04-22

### Fixed
- Resolved server-side rendering issues with authentication components
- Fixed layout issues in marketplace preview cards

## [1.0.23] - 2025-04-22

### Added
- Implemented initial builder profile structure
- Added session booking functionality framework

## [1.0.22] - 2025-04-21

### Fixed
- Fixed useSearchParams Suspense boundary error in the /login page
- Updated all instances of UserAuthForm to use SuspenseUserAuthForm wrapper

## [1.0.21] - 2025-04-21

### Fixed
- Fixed useSearchParams Suspense boundary error by creating a SuspenseUserAuthForm wrapper component
- Updated signin and signup pages to use the new component wrapped in Suspense
- Ensured proper handling of search parameters during static site generation

## [1.0.20] - 2025-04-21

### Fixed
- Fixed Vitest configuration by correcting the import path for defineConfig
- Properly configured triple-slash directive in vitest.config.ts

## [1.0.19] - 2025-04-21

### Fixed
- Fixed Vitest configuration error by creating dedicated types directory and declaration file
- Simplified vitest.config.ts by removing redundant triple-slash directive
- Added basic test verification file to ensure Vitest works properly

## [1.0.18] - 2025-04-20

### Fixed
- Fixed ProfileProvider context error in portfolio page by implementing ProfileProvider at the platform layout level for better scalability
- Fixed useSearchParams Suspense boundary error in user-auth-form component by wrapping it with React Suspense
- Created SearchParamsFallback component to handle loading states for useSearchParams

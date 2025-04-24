# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Planned
- Admin dashboard capabilities for user management
- Enhanced multi-tenant support through Clerk's organization features

## [1.0.64] - 2025-04-24

### Added
- Implemented webhook handler for Clerk user events in `/app/api/webhooks/clerk/route.ts`
- Created database migration to ensure clerkId field is properly defined
- Developed clean database reset and migration script (`scripts/reset-database-for-clerk.js`)
- Added Content Security Policy headers for Clerk in middleware.ts

### Changed
- Updated Clerk integration to use clean database approach without user migration
- Enhanced middleware to skip CSRF verification for Clerk webhooks
- Enhanced error handling in webhooks with comprehensive logging
- Incrementally updated package.json version from 1.0.63 to 1.0.64

## [1.0.63] - 2025-04-24

### Added
- Added Clerk-based AuthProvider component replacement
- Updated user-auth-form component to use Clerk's authentication directly
- Created detailed comments explaining component behavior

### Changed
- Updated site-header.tsx to use Clerk authentication directly instead of compatibility layer
- Migrated all remaining client components from NextAuth to Clerk
- Incrementally updated dependencies by removing NextAuth packages
- Archived legacy NextAuth files to /archived/nextauth-legacy/ directory

### Removed
- Removed NextAuth dependencies (@auth/prisma-adapter, next-auth)
- Marked legacy NextAuth files for removal in a future version

## [1.0.62] - 2025-04-24

### Added
- Created Clerk client hooks implementation compatible with NextAuth API in `/lib/auth/clerk-hooks.ts`
- Added backward compatibility layer to smoothly transition components

### Changed
- Updated package.json version from 1.0.61 to 1.0.62
- Modified auth hooks to use Clerk's authentication system
- Implemented Clerk's sign-in and sign-out methods with compatible API

### Fixed
- Fixed critical authentication issue: "useSession must be wrapped in a <SessionProvider />" error
- Resolved client-side components incompatibility with NextAuth
- Prevented need for component-level changes by maintaining API compatibility

## [1.0.61] - 2025-04-24

### Changed
- Updated package.json version from 1.0.60 to 1.0.61
- Completed migration of remaining API routes from NextAuth to Clerk:
  - Migrated `/api/scheduling/availability/rules` to use Clerk authentication
  - Migrated `/api/scheduling/profiles/client/[id]` to use Clerk authentication
  - Migrated `/api/admin/builders/prototype` to use Clerk's admin authentication
  - Migrated `/api/admin/session-types` and related routes to use Clerk's admin authentication
- Enhanced error handling with Sentry integration in all migrated routes

### Improved
- Standardized admin route protection with withAdmin middleware
- Used proper role verification in scheduling API routes
- Followed consistent error handling patterns across all routes

## [1.0.60] - 2025-04-24

### Added
- Added Sentry error tracking to all migrated API routes

### Changed
- Updated package.json version from 1.0.59 to 1.0.60
- Migrated critical API routes from NextAuth to Clerk:
  - Migrated `/api/scheduling/bookings/[id]` to use Clerk authentication
  - Migrated `/api/checkout/session` to use Clerk authentication
  - Migrated `/api/scheduling/session-types` and `/api/scheduling/session-types/[id]` to use Clerk
  - Migrated `/api/apps/[builderId]` and `/api/apps/edit/[id]` to use Clerk
- Enhanced error handling in all migrated routes with Sentry integration

### Fixed
- Fixed context parameter handling in Clerk authentication for routes with URL parameters
- Standardized error handling approach in all migrated routes

## [1.0.59] - 2025-04-24

### Added
- Created authentication test page at `/test/auth` for verifying Clerk authentication flows
- Added corresponding API route `/api/test/auth` for testing backend authentication
- Implemented Postman collection for API testing
- Created comprehensive documentation for authentication migration in `/docs/engineering`
- Added detailed migration plan for remaining auth routes

### Changed
- Updated package.json version from 1.0.58 to 1.0.59
- Migrated scheduling API routes to use new Clerk auth helpers
- Migrated admin API routes to use new auth middleware
- Enhanced error handling with Sentry integration in API routes
- Updated Content Security Policy to support Clerk authentication scripts

### Fixed
- Resolved authentication inconsistencies between API routes
- Fixed Content Security Policy to allow Clerk scripts and resources
- Standardized error handling approach across authentication middleware

## [1.0.58] - 2025-04-24

### Added
- Migrated authentication system from NextAuth.js to Clerk
- Added Clerk SDK and configuration
- Created ClerkProvider component for application-wide auth
- Implemented standardized auth helpers for API routes
- Created auth middleware for protecting routes
- Updated database schema to support Clerk user IDs
- Created AUTHENTICATION_MIGRATION.md documentation

### Changed
- Replaced SessionProvider with ClerkProvider
- Updated login and signup pages to use Clerk components
- Replaced NextAuth auth() with Clerk's currentUser() in API routes
- Enhanced middleware with combined auth and API protection
- Updated builder profile API route to use new auth helpers

## [1.0.57] - 2025-04-24

### Added
- Completed comprehensive code review
- Created detailed authentication migration plan
- Added AUTHENTICATION_MIGRATION.md documentation
- Identified key areas for security and scalability improvements

## [1.0.55] - 2025-04-23

### Added
- Added SVG logos for all partner companies in the "Trusted By" section of the landing page
- Created logos directory in public folder for storing SVG assets
- Implemented consistent styling for all partner logos
- Replaced text placeholders with proper SVG logos for Anthropic, Lovable, Perplexity, Vercel, Supabase, and Neon

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
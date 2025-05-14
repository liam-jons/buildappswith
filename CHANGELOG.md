# Changelog

## [Unreleased]

### Changed
- Unified header components across the platform - removed separate MarketingHeader in favor of a single SiteHeader
- Created architectural decision record for header unification
- Updated documentation to reflect header consolidation
- Simplified component structure by eliminating redundant header implementations
- Identified 202 potentially unused components for removal (76% of total components)
- Created comprehensive codebase cleanup strategy in docs/architecture/analysis
- Generated detailed component usage analysis to support cleanup efforts
- Added domain-based organization of unused components for systematic removal
- Enhanced unused components analyzer script for more accurate detection


All notable changes to this project will be documented in this file.

## [1.0.142] - 2025-04-29

### Added
- Created comprehensive API documentation for Admin API, Apps API, and Test API in docs/api/
- Added API_ARCHITECTURE_DIAGRAM.md with Mermaid diagrams for API architecture visualization
- Updated API_OVERVIEW.md to include all API domains
- Updated API README.md with comprehensive domain listing
- Added role-based access control diagram for API endpoints
- Added authentication flow diagram for API requests
- Added request/response flow diagram for API processing
- Added integration diagram for external services

## [1.0.141] - 2025-04-29

### Added
- Created API architecture documentation in /docs/architecture/documentation/API_ARCHITECTURE.md
- Added API implementation guide in /docs/engineering/API_IMPLEMENTATION_GUIDE.md
- Integrated API documentation references into central documentation structure
- Added C4 model integration for API architecture

## [1.0.140] - 2025-04-29

### Added
- Created comprehensive API documentation structure in docs/api/
- Added API_OVERVIEW.md with detailed architecture and authentication information
- Created domain-specific API documentation for Stripe, Scheduling, Marketplace, and Webhooks
- Added detailed endpoint documentation with request/response examples
- Created consistent API documentation format for future expansion
- Documented error handling patterns across API domains
- Added testing guidelines for API endpoints

### Added
- Created enhanced unused code analyzer script with improved detection accuracy
- Added support for barrel exports and modern import patterns in analyzer
- Created comprehensive documentation in UNUSED_CODE_ANALYZER_GUIDE.md
- Added domain-based classification of unused components for systematic cleanup
- Added multiple output formats (Markdown, HTML, JSON, Mermaid) for analysis reports
- Added interactive backup mode for safely moving unused components
- Added new npm scripts: arch:unused:enhanced, arch:unused:fix, arch:unused:verbose

### Fixed
- Resolved false positives in unused component detection
- Fixed Next.js system file detection (pages, layouts, routes)
- Improved JSX usage detection with support for kebab-case variants
- Enhanced detection of API route usage

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

## See [CHANGELOG_ARCHIVE.md](./CHANGELOG_ARCHIVE.md) for older entries

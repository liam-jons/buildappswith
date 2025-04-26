# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

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

## [1.0.99] - 2025-04-25

### Fixed
- Resolved "missing required property 'layout_type'" error in Datadog dashboard creation
- Completely restructured dashboard creation to match the exact format from the Datadog UI
- Changed widget structure to use standard `definition` property with `type` field
- Added proper request structure for query_value and timeseries widgets
- Removed the wrapping of dashboard content in a top-level `definition` property
- Updated documentation to reflect the correct dashboard API structure
- Aligned our implementation with the official Datadog-generated dashboard format

## [1.0.98] - 2025-04-25

### Fixed
- Implemented combined approach to fix Datadog dashboard creation issues
- Wrapped dashboard content in a top-level `definition` property as required by API client
- Maintained type-specific widget definition properties (`group_definition`, `note_definition`, etc.)
- Improved script structure to match Datadog API client expectations
- Renamed `generateDashboardDefinition` to `generateDashboardContent` for clarity

## [1.0.97] - 2025-04-25

### Fixed
- Updated dashboard creation script to use type-specific definition properties
- Changed widget structure from generic `definition` property to type-specific properties (`group_definition`, `note_definition`, etc.)
- Improved dashboard creation process to match Datadog API requirements
- Fixed "doesn't match any type from AlertGraphWidgetDefinition,AlertValueWidgetDefinition,..." error
- Updated source code comments to clearly document the widget structure change

## [1.0.96] - 2025-04-25

### Fixed
- Resolved "missing required property 'definition'" error in dashboard creation script
- Changed widget structure to use type-specific definition properties (e.g., `group_definition` instead of `definition` with `type: 'group'`)
- Updated widget structure for note, query_value, and timeseries widgets
- Enhanced documentation with correct widget definition property naming conventions
- Improved error handling with better request diagnostic logging
- Updated DATADOG_DASHBOARD.md with detailed examples of proper widget structure

## [1.0.95] - 2025-04-25

### Fixed
- Added required widget-specific properties to resolve Datadog schema validation errors
- Implemented required `aggregator` property for `query_value` widgets
- Added required `style` configuration for `timeseries` widgets
- Updated documentation with comprehensive list of valid widget definition types
- Enhanced widget example documentation to include all required properties

## [1.0.94] - 2025-04-25

### Added
- Created API-based Datadog dashboard creation script to replace JSON import approach
- Implemented comprehensive test visualization dashboard with key metrics
- Added dedicated documentation in docs/DATADOG_DASHBOARD.md
- Enhanced GitHub Actions workflow to create/update dashboards after test runs

### Fixed
- Resolved "missing required property 'definition'" error in dashboard creation
- Fixed JSON structure compatibility issues with Datadog API
- Improved error handling with detailed diagnostic messages
- Added automatic installation of required dependencies

### Planned
- Admin dashboard capabilities for user management
- Enhanced multi-tenant support through Clerk's organization features

## [1.0.88] - 2025-04-25

### Fixed
- Fixed environment variable loading in Datadog test visualization setup script
- Implemented proper environment variable merging from multiple .env files
- Added fallback for directly set environment variables
- Improved error handling for missing Datadog credentials

### Added
- Created GitHub Actions workflow for CI/CD integration with Datadog
- Implemented verification script for confirming proper metrics collection
- Added automatic .env.example creation with required Datadog variables
- Enhanced Vitest configuration with custom reporter for Datadog integration
- Updated TESTING_FRAMEWORK.md with detailed Datadog setup instructions

## [1.0.84] - 2025-04-25

### Added
- Implemented comprehensive test visualization infrastructure with Datadog integration
- Created test result directory structure for organized output
- Added Datadog agent configuration for test metric collection
- Implemented test-specific dashboard configuration for result visualization
- Created setup script for Datadog test visualization integration
- Added detailed testing framework documentation in docs/TESTING_FRAMEWORK.md

### Changed
- Updated Vitest configuration to output results in Datadog-compatible format
- Enhanced package.json with Datadog-specific test scripts
- Added coverage report output to test-results directory
- Improved test organization for better visualization in Datadog

## [1.0.83] - 2025-04-25

### Fixed
- Simplified Clerk authentication mock implementation to be more stable
- Rolled back complex mock implementation causing cascading test failures
- Maintained clear separation between mock declaration and implementation
- Removed unnecessary type helpers to reduce complexity

## [1.0.82] - 2025-04-25

### Fixed
- Added explicit vi.mock call to middleware integration tests
- Enhanced mock typing with vi.mocked() to ensure TypeScript recognizes mock methods
- Updated file version numbers for consistency
- Fixed remaining type errors in middleware tests

## [1.0.81] - 2025-04-25

### Fixed
- Resolved the "mockImplementationOnce is not a function" error in middleware tests
- Improved Clerk mock implementation to properly support method chaining
- Applied best practice for vi.fn() mocks by creating mock functions first, then setting implementations
- Updated middleware test documentation with the new approach

## [1.0.80] - 2025-04-25

### Fixed
- Fixed type errors in middleware tests with improved mock implementation
- Enhanced Clerk mocks to properly support method chaining (mockImplementationOnce, mockReturnValue, etc.)
- Standardized mock structure for better test reliability
- Added type guard for mockable functions to improve TypeScript type checking

## [1.0.79] - 2025-04-25

### Added
- Implemented manual module mocking approach for Clerk authentication
- Created dedicated `__mocks__/@clerk/nextjs.ts` for centralized mock definitions
- Enhanced test reliability by isolating mocks from hoisting issues

### Changed
- Updated factory and integration tests to use the central mock approach
- Simplified test implementation by removing inline mock definitions
- Improved test maintainability with clearer separation of concerns

### Fixed
- Resolved module initialization errors in middleware tests
- Fixed "Cannot access before initialization" errors with `vi.mock`
- Improved test reliability through consistent mock patterns

## [1.0.77] - 2025-04-25

### Fixed
- Exported `mergeConfigs` function from config.ts to fix test imports
- Updated integration tests to handle Next.js 15.3.1 redirect behavior (307 vs 302)
- Improved authentication mocking in middleware tests
- Enhanced performance test stability with flexible timing assertions
- Fixed middleware test execution flow issues

### In Progress
- Addressing remaining API protection flow test issues
- Improving rate limiting test behavior
- Fixing status code expectations in integration tests

## [1.0.76] - 2025-04-25

### Fixed
- Exported `mergeConfigs` function from config.ts to fix test imports
- Updated integration tests to expect 307 redirect status code (Next.js 15.3.1 behavior) instead of 302
- Fixed authentication mocking in factory tests to properly handle auth state
- Improved performance test stability with more flexible timing expectations
- Enhanced authentication test utilities to work with header-based auth state testing

## [1.0.75] - 2025-04-25

### Added
- Implemented comprehensive middleware integration tests
- Added configuration validation to ensure middleware is correctly configured
- Created performance monitoring for middleware execution
- Added statistics collection for middleware component performance
- Implemented performance headers for response timing visibility in development

### Changed
- Enhanced middleware factory to validate configuration before execution
- Improved error messages for middleware configuration issues
- Refactored middleware components to support performance tracking
- Updated test suite for new validation and performance features

### Fixed
- Added validation to prevent runtime errors from middleware misconfiguration
- Enhanced middleware testing to cover interaction between components
- Improved diagnostic capabilities through performance monitoring
- Fixed Vitest configuration to use CommonJS format for compatibility

## [1.0.74] - 2025-04-25

### Added
- Implemented configuration-driven middleware approach with factory pattern
- Created modular middleware architecture with separate responsibility components
- Added centralized configuration with environment-specific overrides (development, production, test)
- Created comprehensive test suite for middleware components
- Added middleware testing script `test:middleware`

### Changed
- Refactored middleware.ts to use the configuration-driven approach
- Separated API protection, legacy routes, and authentication middleware into modular components
- Improved security header management through configuration
- Enhanced readability and maintainability of middleware code

### Fixed
- Improved testability of middleware functions
- Enhanced configuration flexibility across different environments
- Standardized error handling in middleware components

## [1.0.73] - 2025-04-25

### Changed
- Consolidated multiple middleware files into a single unified implementation
- Enhanced Content Security Policy headers for Clerk to ensure proper script loading
- Improved security by adding comprehensive CSP headers to all responses
- Added proper handling of legacy NextAuth routes during migration period
- Integrated explicit routes from configuration rather than importing from external file
- Ensured proper security headers for both API and non-API routes

### Fixed
- Resolved Clerk authentication script loading issues in production
- Fixed potential confusion about which middleware file is active
- Addressed CSP header configuration to properly allow Clerk domains
- Fixed CSRF protection to properly handle webhook endpoints

## [1.0.71] - 2025-04-25

### Added
- Created authentication tests for marketplace components
- Implemented MarketplacePage component tests with different user roles
- Added BuilderCard component tests for both authenticated and unauthenticated users
- Created admin-specific marketplace features tests for builder management
- Implemented integration tests for marketplace component interactions
- Added new test:auth:marketplace script for running marketplace auth tests

### Changed
- Expanded test:auth script to include all marketplace authentication tests
- Enhanced testing coverage for role-based access control
- Maintained WCAG 2.1 AA compliance in all test implementations
- Structured tests to verify proper access restrictions for admin features

## [1.0.70] - 2025-04-25

### Added
- Implemented comprehensive authentication tests for application components
- Added BuilderProfileClient component tests with authentication scenarios
- Created tests for ProtectedRoute component with role-based access control
- Implemented tests for AdminDashboardLayout with role-based restrictions
- Added examples of testing components with different user roles
- Updated TESTING_GUIDE.md with real-world auth testing examples

### Changed
- Expanded authentication testing to cover marketplace components
- Updated test scripts for auth component testing
- Enhanced documentation with detailed examples of auth testing patterns
- Maintained WCAG 2.1 AA compliance in all tests

## See [CHANGELOG_ARCHIVE.md](./CHANGELOG_ARCHIVE.md) for older entries
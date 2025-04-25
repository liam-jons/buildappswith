# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Planned
- Admin dashboard capabilities for user management
- Enhanced multi-tenant support through Clerk's organization features

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

## [1.0.69] - 2025-04-25

### Added
- Implemented enhanced authentication testing utilities
- Created mock user data for different roles (client, builder, admin, multiRole)
- Added comprehensive authentication test providers
- Created example tests for protected components with role-based content
- Added API route protection tests
- Updated testing documentation with authentication testing patterns

### Changed
- Enhanced testing capabilities with role-based authentication testing
- Added test:auth script for running authentication-specific tests
- Updated TESTING_GUIDE.md with authentication testing examples
- Maintained WCAG 2.1 AA compliance in all testing utilities

## [1.0.68] - 2025-04-25

### Added
- Implemented basic testing framework with Jest
- Created test utilities for rendering components and testing forms
- Added test verification utilities to ensure testing infrastructure works correctly
- Established pattern for testing React components with testing-library
- Created example test cases for basic component rendering and form interaction

### Fixed
- Resolved Clerk authentication testing configuration
- Simplified test utilities to make them compatible with Jest
- Created standardized approach to component testing with proper provider wrapping
- Fixed fireEvent-based form testing to handle input changes correctly

### Changed
- Updated package.json test scripts for better organization:
  - Added dedicated test:verify and test:form scripts
  - Added test:all script for running all unit tests
- Enhanced jest.setup.js with Clerk authentication mocks
- Maintained WCAG 2.1 AA compliance in all testing utilities

## [1.0.67] - 2025-04-24

### Fixed
- Fixed Promise-based headers() handling in NextAuth legacy route handler
- Updated API routes to consistently use NextResponse.json() instead of new Response()
- Standardized error responses across Clerk webhook handler
- Enhanced header handling for Next.js 15.3.1 compatibility

## See [CHANGELOG_ARCHIVE.md](./CHANGELOG_ARCHIVE.md) for older entries
# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

## [1.0.127] - 2025-04-27

### Changed
- Completed Phase 2 of codebase cleanup: Authentication System
- Removed legacy NextAuth components that were no longer in use
- Deleted redundant auth provider component from `/components/auth/auth-provider.tsx`
- Removed unused auth utility files: `auth-utils.ts`, `auth/auth-utils.ts`, `auth/auth-config.ts`
- Eliminated redundant authentication components: `login-button.tsx` and `user-profile.tsx`
- Deleted unnecessary hook forwarding file `auth/hooks.ts`
- Removed legacy context provider in `contexts/auth/auth-provider.tsx`
- Created cleanup documentation and implementation plan
- Updated package.json version to reflect changes

## [1.0.124] - 2025-04-27

### Changed
- Modernized `lib/stripe/stripe-server.ts` component to resolve technical debt issues
- Implemented standardized error handling with StripeErrorType enum and StripeOperationResult interface
- Enhanced TypeScript typing with comprehensive interface definitions
- Added consistent error handling pattern with standardized response format
- Implemented proper error categorization and logging with detailed context
- Added new utility methods: getCheckoutSession and createRefund
- Created comprehensive test suite with proper mocking approach
- Enhanced documentation with detailed JSDoc comments
- Updated package.json and DECISIONS.md to reflect architectural decisions

## [1.0.123] - 2025-04-27

### Changed
- Modernized `builder-image.tsx` component to resolve technical debt issues
- Replaced custom implementation with Radix UI Avatar component integration
- Enhanced image accessibility with proper ARIA attributes and screen reader support
- Implemented modern loading state handling with smooth transitions
- Added proper image size optimization with Next.js 15.3.1 best practices
- Implemented class-variance-authority (cva) for consistent styling patterns
- Created comprehensive test suite for the BuilderImage component
- Updated architecture-utils.ts to recognize version 1.0.123 as non-legacy

## See [CHANGELOG_DAILY_2025-04-26.md](./CHANGELOG_DAILY_2025-04-26.md) for yesterday's changes
## See [CHANGELOG_ARCHIVE.md](./CHANGELOG_ARCHIVE.md) for older entries
# Changelog

All notable changes to this project will be documented in this file.

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



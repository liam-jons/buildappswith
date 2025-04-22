# Changelog

All notable changes to this project will be documented in this file.

## [1.0.26] - 2025-04-22

### Fixed
- Fixed additional ESLint error in How it works page by escaping the last remaining apostrophe

## [1.0.25] - 2025-04-22

### Fixed
- Fixed ESLint errors in How it works page by properly escaping apostrophes and quotes

## [1.0.24] - 2025-04-22

### Added
- Created new "Toolkit" page with comprehensive AI tools recommendations organized by category
- Added detailed sections to "How it works" page including content about joining the AI marketplace

### Changed
- Updated navigation links in site-header.tsx to direct users to appropriate pages:
  - "Learn how to benefit instantly from AI" now directs to the Toolkit page
  - "Learn to build a business with AI" now directs to the Marketplace page
  - "Teach others how to benefit from AI" now directs to the How it works page
- Enhanced "How it works" page with a structured layout including mission, process, and marketplace sections
- Improved navigation flow for better user experience

## [1.0.23] - 2025-04-22

### Fixed
- Updated the API navigation endpoint to match the updated navigation links
- Fixed 404 errors when clicking on navigation items by ensuring consistent paths between the frontend and API

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



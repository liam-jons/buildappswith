# Changelog

All notable changes to this project will be documented in this file.

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



# Architecture Changelog

This document tracks significant architectural changes to the Buildappswith platform.

## [v1.0.106] - 2025-04-26

### Added
- Created local ts-node installation for architecture extraction scripts
- Added explicit dependency management with separate package.json for architecture tools
- Implemented direct binary path references to ensure correct ts-node execution

### Changed
- Improved installation script to consistently install required dependencies
- Updated extraction scripts to use locally installed ts-node directly
- Enhanced error handling for missing module scenarios

### Fixed
- Resolved "MODULE_NOT_FOUND" error for ts-node
- Fixed inconsistent module resolution in extraction scripts
- Addressed potential compatibility issues between different Node.js versions

### Future Plans
- Add CI/CD integration for automatic architecture extraction
- Implement architecture metrics dashboard
- Add dependency history tracking to monitor architectural evolution

## [v1.0.105] - 2025-04-26

### Added
- Local dependency installation mechanism for architecture extraction
- Support for running architecture scripts with isolated dependencies
- Bash wrapper scripts for consistent execution

### Changed
- Switched from npm to pnpm for all architecture extraction operations
- Enhanced installation script to handle pnpm store version compatibility
- Updated extraction scripts to handle store version mismatches
- Modified script execution to work with either global or local dependencies

### Fixed
- Resolved "Cannot read properties of null (reading 'matches')" npm error
- Fixed pnpm store version compatibility issues
- Improved reliability of architecture extraction across environments

### Future Plans
- Add CI/CD integration for automatic architecture extraction
- Implement architecture metrics dashboard
- Add dependency history tracking to monitor architectural evolution

## [v1.0.104] - 2025-04-26

### Added
- Created direct TypeScript compiler API-based architecture extraction
- Added HTML report generation for architecture documentation
- Added automated Structurizr setup and configuration
- Implemented authentication flow diagram generation

### Changed
- Removed dependency on structurizr-typescript package
- Enhanced technical debt visualization with dedicated reports
- Improved Mermaid diagram generation for better visualization
- Updated installation script to use only required dependencies

### Deprecated
- None

### Removed
- Removed structurizr-typescript dependency

### Future Plans
- Add CI/CD integration for automatic architecture extraction
- Implement architecture metrics dashboard
- Add dependency history tracking to monitor architectural evolution

## [v1.0.103] - 2025-04-26

### Added
- Implemented automatic architecture extraction using TypeScript analysis
- Created technical debt and legacy code detection
- Developed authentication-specific extraction for Clerk implementation mapping
- Added integration with existing Structurizr C4 model
- Created comprehensive architecture report generation

### Changed
- Updated ARCHITECTURE.md to reflect automated extraction capabilities
- Fixed Clerk authentication documentation to reflect completed migration
- Enhanced visualization for technical debt and legacy components

### Deprecated
- None

### Removed
- None

### Future Plans
- Fix npm installation issues with structurizr-typescript
- Transition to direct TypeScript compiler API for extraction
- Add CI/CD integration for automatic architecture extraction
- Implement architecture metrics dashboard

## [v1.0.102] - 2025-04-26

### Added
- Initialized Structurizr for architecture documentation
- Created C4 model with System Context and Container diagrams
- Added Architecture Decision Records (ADRs) for:
  - Adopting Structurizr for architecture documentation
  - Proposed migration from NextAuth to Clerk
- Added documentation on C4 model and Structurizr usage
- Created ARCHITECTURE.md to provide an overview of the architectural approach

### Changed
- None (initial architecture documentation)

### Deprecated
- None

### Removed
- None

### Future Plans
- Add Component-level diagrams for key containers
- Integrate Structurizr with CI/CD pipeline
- Explore Storybook integration for UI component documentation

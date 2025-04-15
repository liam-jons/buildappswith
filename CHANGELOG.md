# Changelog

All notable changes to the Buildappswith platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.7] - 2025-04-15

### Fixed
- [DEPLOY-02] Enhanced Vercel deployment configuration
  - Converted next.config.ts to next.config.js for better Vercel compatibility
  - Updated vercel.json with improved configuration settings
  - Added specific vercel-build script to package.json
  - Created comprehensive VERCEL_ENV_SETUP.md documentation
  - Added detailed troubleshooting steps to DEPLOYMENT.md
- Updated version number in package.json

## [0.1.6] - 2025-04-15

### Changed
- Updated deployment approach for UI components
  - Documented proper shadcn/Magic UI component installation process using CLI
  - Created deployment guide with specific instructions
  - Identified root cause of component import failures

## [0.1.5] - 2025-04-15

### Fixed
- Resolved additional Vercel deployment configuration issues
  - Fixed font path in fonts.ts to use public root absolute path (/fonts/... instead of ../public/fonts/...)
  - Added detailed path alias troubleshooting to deployment documentation
  - Enhanced deployment troubleshooting guide
- Updated version number in package.json

## [0.1.4] - 2025-04-15

### Fixed
- Resolved Vercel deployment configuration issues
  - Fixed OpenDyslexic font path reference in fonts.ts
  - Added missing UI components (button.tsx, dropdown-menu.tsx)
  - Updated environment configuration files
  - Enhanced deployment documentation
- Updated version number in package.json

## [0.1.3] - 2025-04-15

### Added
- Complete Builder Profile implementation with validation tiers
  - Builder profile data model with TypeScript types
  - Validation system with Entry, Established, and Expert tiers
  - Portfolio showcase component for displaying projects
  - Profile creation and editing forms
  - Schedule integration for free consultation sessions
- Vercel deployment configuration
  - Environment setup for development, preview and production
  - Automatic preview deployments for GitHub branches
  - Environment variable management

### Changed
- Updated component status tracker to reflect Builder Profile implementation
- Enhanced marketplace routing structure for builder profiles

### Fixed
- Resolved environment configuration issues for deployment

## [0.1.2] - 2025-04-15

### Added
- Comprehensive project documentation structure
  - Detailed ROADMAP.md with development phases
  - COMPONENT_STATUS.md to track implementation status
  - DECISIONS.md log for architectural choices
  - CONTRIBUTING.md guidelines for development
  - SESSION_TEMPLATE.md for continuity between sessions
- GitHub issue templates for features, bugs, and components
- Next session planning document

### Changed
- Enhanced README.md with project overview and structure
- Reorganized project documentation for better navigation

### Fixed
- Resolved GitHub repository setup instructions

## [0.1.1] - 2025-04-15

### Added
- Completed landing page implementation with all required sections
- New CTA section component with accessibility features
- Integrated all landing page components into main page
- Added CHANGELOG to track project changes

### Changed
- Updated main page.tsx to use all landing page components
- Reorganized landing page flow for better user experience
- Enhanced accessibility features in layout

### Fixed
- Fixed initialization issues in landing page components

## [0.1.0] - 2025-04-15

### Added
- Initial project setup with Next.js, TypeScript, and Tailwind CSS
- Basic project structure and configuration
- Core landing page component implementation (Hero, Features, Testimonials, Trusted By)
- Site header and footer components
- Theme toggle with light, dark, and high contrast modes
- Accessibility features including reduced motion support
- Magic UI components for enhanced visual elements

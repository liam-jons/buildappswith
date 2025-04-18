# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2025-04-18

### Fixed
- Fixed Tailwind CSS configuration by reverting to v3.4.17
- Updated PostCSS configuration to use the standard plugin structure
- Fixed aurora animation keyframe syntax in tailwind.config.ts
- Fixed globals.css structure and removed non-standard directives
- Updated package.json scripts to use pnpm consistently
- Updated version number for initial public release

### Changed
- Updated vercel.json to use pnpm instead of npm
- Updated deployment documentation for Tailwind v3
- Updated deployment checklist for production readiness
- Enhanced database synchronization workflow
- Simplified Tailwind fix script for easier configuration

## [0.1.73] - 2025-04-17

### Fixed
- Fixed Tailwind CSS v4 configuration issues
- Updated PostCSS configuration to use the new plugin structure
- Created deployment scripts and documentation for easier deployment
- Added test-build.sh script for verifying build process
- Added detailed deployment checklist

## [0.1.72] - 2025-04-16

### Fixed
- Fixed Tailwind CSS v4 migration issues
- Updated PostCSS configuration to use correct 'tailwindcss' plugin
- Removed deprecated @reference and @theme directives from globals.css
- Fixed aurora animation keyframe syntax
- Consolidated PostCSS configuration files (removed duplicate .mjs file)
- Enhanced GitHub workflows with proper error handling
- Added automatic CHANGELOG updates for production deployments
- Added database synchronization to deployment workflow
- Added type-check NPM script

## [0.1.71] - 2025-04-15

### Fixed
- Reverted experimental Tailwind v4 changes to restore styling
- Restored working configuration with Tailwind v3.4.17
- Fixed styling issues with site-wide components
- Updated postcss configuration to use correct plugins
- Fixed CSS syntax error in aurora animation keyframes

## [0.1.70] - 2025-04-14

### Changed
- Updated to Tailwind CSS v4 with proper @theme directive implementation
- Simplified tailwind.config.ts to use v4's CSS-first approach
- Modernized color variable naming with --color-[name] format
- Updated GitHub workflows to use Node.js v20 (from v18)
- Added fallback support for existing color class usage
- Added font-feature-settings to base layer for improved text rendering

## [0.1.80] - 2025-04-13

### Fixed
- Invalid hook call error in site header component
- React hooks properly placed inside component function body

## [0.1.79] - 2025-04-12

### Fixed
- Navigation menu error when clicking "I would like to..." dropdown
- Empty builder profile results handling
- API error handling for marketplace endpoints

### Added
- Dedicated navigation API for menu items
- Placeholder marketplace page for browsing builders
- Automatic sample builder creation for development environment

## [0.1.78] - 2025-04-11

### Added
- Builder Profile Creation & Management functionality
- Tier 1 Validation visualization (badges, basic metrics)
- API endpoint for builder profile creation/editing
- Builder profile service for data operations
- Admin tool for builder profile management
- Prototype builder profile for Liam Jones as example
- Builder profile link in user menu navigation

## [0.1.77] - 2025-04-10

### Changed
- Replaced custom loading animation with Magic UI AnimatedCircularProgressBar component
- Added new component files: animated-circular-progress-bar.tsx and animated-circular-progress-bar-demo.tsx

## [0.1.76] - 2025-04-09

### Changed
- Updated border beam in hero section to a single beam moving 30% faster
- Changed "About" to "About us" in navigation and submenu items updated to "Our Mission" and "Contact"
- Added Vercel, Supabase, and Neon to trusted ecosystem partners
- Changed "What can't AI do yet?" to "What can't AI do (yet)?"
- Updated accessibility button to use a simple "A" in a circle
- Changed "OpenDyslexic Font" label to "Dyslexic friendly"

## [0.1.75] - 2025-04-08

### Changed
- Moved accessibility settings button from footer to header
- Changed accessibility icon to a more familiar question mark icon
- Added accessibility settings to mobile menu
- Fixed OpenDyslexic font toggle to properly apply font to both body and html elements

## [0.1.74] - 2025-04-07

### Changed
- Removed redundant text from hero section subheading
- Updated footer links to reflect current site structure

## [0.1.73] - 2025-04-06

### Fixed
- Added "use client" directive to site-footer.tsx to fix React hooks error

## [0.1.72] - 2025-04-05

### Changed
- Updated "Buildappswith" to "BW" in the header and footer for better spacing
- Changed "BW Toolkit" to "Toolkit" in navigation
- Updated login button styling to match signup button
- Changed hero text to "Start benefiting from AI today"
- Fixed loading animation position and text size
- Increased "Trusted Ecosystem" heading size
- Updated "AI for Everyone" section with TextShimmer and different colors
- Removed "What AI Can/Can't Do" main heading
- Changed testimonials heading to "Take a look at what others are doing with AI"

### Added
- Accessibility settings panel with dark mode and OpenDyslexic font options
- Added OpenDyslexic font support with CSS implementation

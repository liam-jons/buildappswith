# Changelog

All notable changes to this project will be documented in this file.

## [0.1.80] - 2025-04-18

### Fixed
- Invalid hook call error in site header component
- React hooks properly placed inside component function body

## [0.1.79] - 2025-04-18

### Fixed
- Navigation menu error when clicking "I would like to..." dropdown
- Empty builder profile results handling
- API error handling for marketplace endpoints

### Added
- Dedicated navigation API for menu items
- Placeholder marketplace page for browsing builders
- Automatic sample builder creation for development environment

## [0.1.78] - 2025-04-18

### Added
- Builder Profile Creation & Management functionality
- Tier 1 Validation visualization (badges, basic metrics)
- API endpoint for builder profile creation/editing
- Builder profile service for data operations
- Admin tool for builder profile management
- Prototype builder profile for Liam Jones as example
- Builder profile link in user menu navigation

## [0.1.77] - 2025-04-17

### Changed
- Replaced custom loading animation with Magic UI AnimatedCircularProgressBar component
- Added new component files: animated-circular-progress-bar.tsx and animated-circular-progress-bar-demo.tsx

## [0.1.76] - 2025-04-17

### Changed
- Updated border beam in hero section to a single beam moving 30% faster
- Changed "About" to "About us" in navigation and submenu items updated to "Our Mission" and "Contact"
- Added Vercel, Supabase, and Neon to trusted ecosystem partners
- Changed "What can't AI do yet?" to "What can't AI do (yet)?"
- Updated accessibility button to use a simple "A" in a circle
- Changed "OpenDyslexic Font" label to "Dyslexic friendly"

## [0.1.75] - 2025-04-17

### Changed
- Moved accessibility settings button from footer to header
- Changed accessibility icon to a more familiar question mark icon
- Added accessibility settings to mobile menu
- Fixed OpenDyslexic font toggle to properly apply font to both body and html elements

## [0.1.74] - 2025-04-17

### Changed
- Removed redundant text from hero section subheading
- Updated footer links to reflect current site structure

## [0.1.73] - 2025-04-17

### Fixed
- Added "use client" directive to site-footer.tsx to fix React hooks error

## [0.1.72] - 2025-04-17

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

## [0.1.71] - 2025-04-24

### Fixed
- Fixed import issues with MagicUI components
- Updated component imports to match export style (default vs. named exports)

## [0.1.70] - 2025-04-24

### Fixed
- Missing dependencies issue with react-circular-progressbar
- Updated hero section loading animation to use native Tailwind animations instead of external package
- Created simplified AnimatedBeam component
- Temporarily removed AnimatedBeamSection to fix build issues
- Fixed AuroraBackground references with standard gradient backgrounds

## [0.1.65] - 2025-04-23

### Added
- New "How it Works" page explaining the platform's approach
- AI Capabilities marquee showing what AI can and cannot do
- Animated beam visualization for platform connectivity

### Changed
- Updated site header navigation structure
- Changed "I am a..." to "I would like to..." in navigation
- Added Perplexity to trusted ecosystem partners
- Updated Key Values section with distinct icons
- Changed button styling and landing page text
- Updated final CTA section with new wording
- Improved testimonials section heading
- Changed sign up button to white text on black background in dark mode

### Moved
- Archived example components after integrating functionality

## [0.1.64] - 2025-04-23

### Fixed
- Build and deployment issues
- Port conflict and webpack caching errors
- Stabilized authentication and security integration

### Added
- Documentation for troubleshooting build problems

### Changed
- Prepared for production launch
# Changelog

All notable changes to the Buildappswith platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.32] - 2025-04-15

### Added
- Enhanced CI/CD and Vercel deployment configuration
  - Updated GitHub Actions workflows to use pnpm instead of npm
  - Added accessibility testing to CI pipeline using pa11y-ci
  - Created comprehensive branch protection guidelines
  - Implemented improved deployment notifications with detailed commit comments
- Added detailed documentation for deployment and CI/CD
  - Created VERCEL_DEPLOYMENT.md with comprehensive setup instructions
  - Created BRANCH_PROTECTION.md with repository protection guidelines
  - Updated environment variable examples for consistent configuration
- Enhanced security with improved headers in Vercel configuration
  - Added Content-Security-Policy header
  - Added Strict-Transport-Security header
  - Implemented cache control for static assets

### Changed
- Improved Vercel configuration for better performance
  - Updated vercel.json with pnpm build commands
  - Added cache control headers for better asset caching
  - Enhanced GitHub integration settings
- Updated GitHub Actions workflows for more robust testing

## [0.1.31] - 2025-04-15

### Added
- Implemented comprehensive CI/CD and Vercel deployment configuration
  - Created GitHub Actions workflows for continuous integration and deployment
  - Added Vercel configuration with environment variables and deployment settings
  - Set up branch protection and deployment preview features
  - Created documentation for CI/CD workflow
- Added environment management for development, preview, and production
  - Created `.env.example` for required environment variables
  - Implemented environment-specific deployment configurations
  - Added Vercel-specific scripts to package.json
- Enhanced security with proper HTTP headers in Vercel configuration

### Changed
- Updated package.json with proper project name and version
- Added new scripts for Vercel deployment and TypeScript checking
- Enhanced project configuration for better deployment workflow

## [0.1.30] - 2025-04-15

### Added
- Implemented comprehensive Profile Editing Functionality
  - Created state management approach using React Context API
  - Implemented profile form submission and validation
  - Added portfolio project management with CRUD operations
  - Created modal dialog for adding/editing projects
  - Added confirmation for project deletion
- Added helper utilities for form data conversion
  - Created profile-form-helpers.ts with data transformation functions
  - Implemented form validation schemas in shared location
  - Added utility functions for converting between form and API data formats
- Added placeholder image warning for development environment

### Changed
- Enhanced existing EditProfileForm and AddProjectForm components
  - Added proper state management integration
  - Improved form validation error handling
  - Enhanced user experience with loading states
  - Implemented toast notifications for operation feedback
- Updated project organization
  - Moved mock data to dedicated directory
  - Created contexts directory for state management
  - Added pages directory for page components

### Fixed
- Resolved data synchronization issues between forms and profile display
- Improved error handling for form submissions
- Enhanced accessibility for form components and modals
- Updated version number in package.json to 0.1.30

## [0.1.29] - 2025-04-15

### Added
- Created comprehensive Builder Profile functionality
  - Implemented ValidationTierBadge component for Entry, Established, and Expert tiers
  - Created PortfolioShowcase component for displaying builder projects
  - Developed main BuilderProfile component with full profile display
  - Added profile demo page to showcase various validation tiers
  - Implemented tooltip with validation tier criteria explanation
- Added UI components to support profile functionality
  - Card component for structured content display
  - Tooltip component for enhanced information display
- Created platform route structure for profile pages
  - Added (platform) route group for authenticated app features
  - Set up layout structure for platform pages

### Changed
- Enhanced component organization with new directory structure
  - Created profile directory for profile-related components
  - Organized components by feature for better maintainability
- Updated version number in package.json

## [0.1.28] - 2025-04-15

### Changed
- Improved heading display layout
  - Created TwoLineAnimatedHeading component with separate static and dynamic sections
  - Placed "Build apps with" on first line and rotating names on second line
  - Enhanced visual clarity with improved vertical spacing
  - Maintained animations and reduced motion support
- Updated landing page section titles
  - Changed "Democratize AI for Everyone" to "AI for Everyone"
  - Changed "Success Stories from Our Community" to "Community Wins"
- Updated trusted ecosystem branding
  - Replaced Uber and Notion with Anthropic and Loveable
  - Used consistent styling for partner logos

### Fixed
- Fixed Particles component import error in hero visualization
  - Updated import statement to use default import syntax
  - Ensured proper component resolution and rendering
- Updated version number in package.json

## [0.1.27] - 2025-04-15

### Added
- Created dynamic hero visualization component
  - Designed interactive SVG visualization showing app building process
  - Implemented animated building blocks that form applications
  - Added connection lines with sequential animations
  - Integrated Particles component for dynamic background effects
  - Used Framer Motion for smooth, accessible animations
- Enhanced hero section user experience
  - Added second CTA button for "Learn How It Works"
  - Improved button layout with proper spacing
  - Updated animated heading names list with more relevant options
  - Maintained all existing animations and transitions

### Changed
- Replaced static hero images with dynamic interactive visualization
  - Removed hero-dark.png and hero-light.png static assets
  - Created visual representation of the app building process
  - Implemented responsive SVG that adapts to different screen sizes
  - Enhanced visual appeal with subtle animations and effects

### Fixed
- Ensured full accessibility support throughout visualization
  - Added aria labels and roles for screen readers
  - Implemented reduced motion support for users with vestibular disorders
  - Maintained color contrast for readability
  - Used semantic SVG structure for better accessibility
- Updated version number in package.json

## [0.1.26] - 2025-04-15

### Changed
- Redesigned animated heading to fix layout issues
  - Created InlineAnimatedHeading component with a more robust architecture
  - Ensured all text elements remain on a single line
  - Made styling more consistent with explicit whitespace control
  - Changed "apps" color to blue to differentiate from the rotating names
- Updated hero section descriptive text
  - Added more trust-focused messaging
  - Improved sentence structure and flow
  - Enhanced emotional appeal with more personal language

### Fixed
- Resolved issues with text wrapping in animated heading
- Fixed alignment problems in responsive layouts
- Updated version number in package.json

## [0.1.25] - 2025-04-15

### Changed
- Improved animated heading component to address layout issues
  - Created new AnimatedHeadingV2 component with modular text highlighting
  - Fixed layout to ensure animated text appears on same line as static text
  - Added support for highlighting specific words (like "apps") for future flexibility
  - Enhanced spacing and alignment for consistent display across viewports
- Updated hero section descriptive text to be more engaging
  - Replaced technical description with more inspirational messaging
  - Added forward-looking language about transforming ideas into reality
  - Implemented more emotionally appealing placeholder copy

### Fixed
- Resolved issue where animated name appeared on separate row from static text
- Fixed line-break issues in responsive design for hero section
- Updated version number in package.json

## [0.1.24] - 2025-04-15

### Added
- Created custom AnimatedHeading component for dynamic text rotation
  - Implemented smooth text transitions using Framer Motion
  - Added fixed-width container to prevent layout shifts
  - Ensured accessibility with reduced motion support
  - Created demonstration pages at /heading-demo and /heading-hero-example

### Changed
- Enhanced hero section with animated heading
  - Replaced static "Build apps with AI" text with dynamic "Build apps with [name]" rotation
  - Implemented name rotation featuring team members and custom phrases
  - Improved text styling with gradient effects for dynamic content
  - Removed "without the complexity" line for cleaner design
  - Centered heading for better visual balance

### Fixed
- Fixed alignment issues in text components
  - Added items-baseline for proper text alignment
  - Used whitespace-nowrap to prevent unwanted text wrapping
  - Implemented absolute positioning for smoother transitions
- Updated version number in package.json

## [0.1.23] - 2025-04-15

### Added
- Enhanced navigation structure to reflect core platform components
  - Added new dropdown navigation menus for Platform, Roles, and About sections
  - Created comprehensive mobile navigation with categorized sections
  - Added proper accessibility attributes for navigation (aria-expanded, aria-haspopup, etc.)
  - Created useOnClickOutside hook for handling dropdown menu interactions

### Changed
- Updated site header and footer with Buildappswith branding and content
  - Replaced generic Magic UI branding with Buildappswith
  - Updated footer sections to match platform structure
  - Enhanced footer with role-based quick links
  - Added comprehensive social media links
  - Updated navigation to provide role-based paths (Client, Learner, Builder)
- Improved accessibility features in navigation
  - Added keyboard navigation support
  - Implemented reduced motion support using framer-motion's useReducedMotion
  - Enhanced screen reader support with ARIA attributes
  - Added current page highlighting in navigation

### Fixed
- Fixed mobile navigation structure for better usability
- Added appropriate landmarks and ARIA attributes for accessibility
- Updated version number in package.json

## [0.1.22] - 2025-04-15

### Changed
- Updated landing page to replace placeholder content with Buildappswith-specific content
  - Updated hero section with platform value proposition
  - Updated key values section with three platform pillars
  - Updated client section heading to reflect AI literacy focus
  - Updated testimonials with persona-based success stories
  - Updated CTA sections with platform-specific messaging
  - Added appropriate icons and descriptions for platform features
- Updated version number in package.json

## [0.1.21] - 2025-04-15

### Added
- Created comprehensive testing infrastructure
  - Comprehensive Accessibility Testing page with font switching, contrast, and reduced motion testing
  - Centralized test navigation hub with organized categories
  - Detailed MAGIC_UI_TESTING_PLAN.md documentation
- Enhanced testing documentation
  - Component-specific testing procedures for each Magic UI component
  - Browser and device compatibility testing approach
  - Accessibility compliance verification methodologies
- Multiple test environments for different testing scenarios

### Changed
- Updated version number in package.json to 0.1.21

## [0.1.20] - 2025-04-15

### Added
- Created comprehensive Magic UI testing environment
  - Expanded test page with all Magic UI components
  - Component combination examples to test interactions
  - Accessibility section with reduced motion indicator
  - Dark mode toggle for component testing
- Added central testing hub navigation page
  - Links to all component test pages
  - Section for testing specialized platform areas
  - Accessibility testing section

### Fixed
- Corrected OpenDyslexic font path to use direct relative path from lib directory
- Updated version number in package.json

## [0.1.19] - 2025-04-15

### Fixed
- Fixed OpenDyslexic font path using correct relative path format
- Updated tailwind.config.js plugins syntax for better compatibility
- Updated version number in package.json

## [0.1.18] - 2025-04-15

### Fixed
- Comprehensive fix for Tailwind CSS v4 and Magic UI styling issues
  - Fixed font path for OpenDyslexic font to use absolute path
  - Added tailwindcss-animate package as a dependency
  - Updated PostCSS configuration to use object notation
  - Created tailwind.config.js with proper v4 format
  - Updated components.json to reference JavaScript config
  - Added @preflight directive to globals.css
- Updated version number in package.json

## [0.1.17] - 2025-04-15

### Fixed
- Resolved critical Tailwind CSS v4 compatibility issues
  - Fixed "@utility cannot be nested" error by moving @utility declarations to the top level
  - Corrected "border-border" unknown utility class by replacing with direct CSS property
  - Properly implemented responsive container padding utility at the top level
  - Replaced @apply directives with direct CSS in base styles
- Updated version number in package.json

## [0.1.16] - 2025-04-15

### Added
- Created comprehensive VERCEL_DEPLOYMENT_GUIDE.md with complete setup instructions
- Added enhanced vercel.json configuration
  - Implemented cleanUrls for better URL structure
  - Added ignoreCommand for package-lock.json monitoring
  - Disabled trailingSlash for cleaner URLs

### Changed
- Updated version number in package.json

## [0.1.15] - 2025-04-15

### Fixed
- Fixed text-shimmer component CSS issue
  - Replaced invalid `text-transparent: true;` with proper `color: transparent;`
  - Added `-webkit-background-clip: text;` for better browser compatibility
  - Fixed text shimmer animation rendering in all browsers
- Updated version number in package.json

## [0.1.14] - 2025-04-15

### Fixed
- Comprehensive Tailwind CSS v4 compatibility update
  - Added proper reference directives (`@reference "tailwindcss"`)
  - Converted custom utilities to use `@utility` directive
  - Updated animation definitions to use standard CSS
  - Implemented proper media queries for responsive utilities
  - Added explicit keyframes definitions
- Updated version number in package.json

## [0.1.13] - 2025-04-15

### Fixed
- Replaced Tailwind CSS pseudo-element utilities with standard CSS
  - Converted `before:` utilities to standard CSS pseudo-element selectors
  - Added explicit content property for pseudo-elements
  - Fixed border-beam effect to use standard CSS
- Updated version number in package.json

## [0.1.12] - 2025-04-15

### Fixed
- Resolved animation and variant compatibility issues with Tailwind CSS v4
  - Replaced `motion-safe:animate-text-shimmer` with explicit animation and media queries
  - Fixed border beam animation to use standard CSS instead of Tailwind variants
  - Updated motion utility classes to use explicit media queries
  - Added documentation comments in theme configuration
- Updated version number in package.json

## [0.1.11] - 2025-04-15

### Fixed
- Updated Tailwind CSS utility class usage for v4 compatibility
  - Replaced `bg-background` with `bg-[hsl(var(--background))]`
  - Updated text and background color references in layout.tsx
  - Used direct HSL values instead of theme color references
- Updated version number in package.json

## [0.1.10] - 2025-04-15

### Fixed
- Corrected PostCSS configuration for Tailwind CSS v4
  - Reinstalled @tailwindcss/postcss package
  - Updated PostCSS configuration format to use array of plugins
  - Fixed the way Tailwind CSS is loaded in the build process
- Updated version number in package.json

## [0.1.9] - 2025-04-15

### Fixed
- Resolved configuration conflicts
  - Removed duplicate Next.js configuration file (next.config.ts)
  - Updated PostCSS configuration for Tailwind CSS v4 compatibility
  - Fixed package.json dependencies (added autoprefixer, removed @tailwindcss/postcss)
  - Updated components.json to explicitly point to tailwind.config.ts
- Updated version number in package.json

## [0.1.8] - 2025-04-15

### Fixed
- Resolved Tailwind CSS v4 compatibility issues
  - Fixed invalid `border-border` utility class in globals.css
  - Updated font path resolution in lib/fonts.ts
  - Created test page to verify core application functionality
- Updated version number in package.json

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
# Changelog

All notable changes to this project will be documented in this file.

## [0.1.68] - 2025-04-21

### Added
- Implemented production-ready builder image solution:
  - Created `BuilderImage` component with robust error handling and fallbacks
  - Added directory structure for locally hosted builder images
  - Created documentation for managing builder profile images
  - Separated BuilderCard into its own reusable component

### Changed
- Updated Next.js image configuration to use `remotePatterns` instead of deprecated `domains`
- Improved security by limiting image sources to specific patterns
- Created path to transition away from external image hosting

## [0.1.67] - 2025-04-21

### Fixed
- Fixed marketplace image loading issues:
  - Added 'randomuser.me' and 'placehold.co' to allowed image domains in next.config.mjs
  - Updated Content Security Policy to allow images from randomuser.me and placehold.co
  - Fixed Next.js Image component configuration for external domain access
  - Resolved "unconfigured host" error when loading builder profile images

## [0.1.66] - 2025-04-21

### Added
- Created About Us pages in the marketing route group:
  - Added "Our Mission" page (`/about`) with company vision, values, and mission statement
  - Added "Contact" page (`/contact`) with placeholder contact form and company information
  - Implemented Magic UI components (TextShimmer, BorderBeam) for visual appeal
  - Ensured WCAG 2.1 AA compliance with proper heading hierarchy and semantic HTML
  - Added dummy social media links and contact emails

### Fixed
- Fixed Client Component error in Contact page:
  - Created a separate `ContactForm` client component for interactive form elements
  - Moved form event handling logic to the client component
  - Improved page architecture by separating server and client components

## [1.0.11] - 2025-04-19

### Fixed
- Fixed type errors to improve deployment compatibility:
  - Added optional chaining for builder.skills.length in marketplace page
  - Added proper type assertions for DOM Element click events
  - Updated Stripe API version to '2025-03-31.basil' for compatibility
  - Fixed BorderBeam component usage to properly handle children
  - Added missing Stripe utility functions (createCheckoutSession, getCheckoutSession)
  - Removed timeline component references as it's no longer required
  - Updated package version to 1.0.11

## [1.0.7] - 2025-04-18

### Fixed
- Final compatibility fixes for Next.js 15.3.1:
  - Fixed Stripe API integration by using proper type assertions for apiVersion
  - Added ref type conversion utility in animated-beam-section.tsx
  - Properly handled async CSRF token generation functions
  - Improved type definitions in auth module by extending Session user type
  - Fixed remaining type errors in critical components

## [1.0.6] - 2025-04-18

### Fixed
- Further TypeScript compatibility fixes for Next.js 15.3.1:
  - Updated Stripe imports to use named imports `import { Stripe } from 'stripe'`
  - Added proper NextAuthConfig type and exported authConfig from auth modules
  - Added missing strokeWidth prop to AnimatedCircularProgressBar
  - Fixed theme provider imports with proper type imports
  - Added proper type imports in auth modules
  - Reorganized auth configuration to use explicit typing

## [1.0.5] - 2025-04-18

### Fixed
- Fixed TypeScript errors to ensure compatibility with Next.js 15.3.1:
  - Updated Auth0 imports in protected-route.tsx to use NextAuth
  - Fixed React.RefObject type issues in AnimatedBeam component
  - Added missing size prop to AnimatedCircularProgressBar component
  - Resolved JSX namespace issues in cta-section.tsx by using React.ReactNode
  - Updated cookies API to use async/await for Next.js 15 compatibility
  - Fixed request.ip usage in rate-limit.ts to handle potential undefined values

## [1.0.4] - 2025-04-18

### Fixed
- Fixed BorderBeam component errors in validation-tier.tsx
  - Changed size prop from string "small" to numeric value 50
  - Restructured component usage to not include children (not supported by BorderBeam)
  - Removed invalid containerClassName prop
  - Fixed TextShimmer usage to remove unsupported gradient prop
  - Fixed build compatibility with Next.js 15.3.1
- Fixed TextShimmer component usage in payment success page
  - Removed unsupported delay and shimmerDuration props
  - Added className and shimmerWidth props instead
- Fixed TypeScript errors in checkout session API route
  - Added proper type definitions for builders directory
  - Added explicit type annotations for request parameters
- Added Edge Runtime compatibility warning to CSRF module
  - Added explicit documentation about Node.js module usage in Edge Runtime

## [1.0.3] - 2025-04-18

### Fixed
- Fixed build errors identified during deployment
  - Updated TextShimmer component to use proper structure and exports
  - Fixed date-fns-tz imports in scheduling utils to use formatInTimeZone
  - Updated NextAuth implementation in API routes to use the new auth() function
  - Removed deprecated toZonedTime usage from scheduling utilities
  - Fixed special apostrophe characters in mockBuilders.ts causing parsing errors
  - Updated ManageSchedulePage component to use correct Next.js App Router types

## [1.0.2] - 2025-04-23

### Fixed
- Fixed authentication module issues preventing successful build
  - Created proper auth module exports in `/lib/auth/index.ts`
  - Fixed missing `authOptions` export required by API routes
  - Resolved build failures in Vercel deployment
- Fixed metadata errors in client components
  - Moved metadata from profile-settings page to layout component
  - Moved metadata from onboarding page to layout component
  - Removed client-side metadata exports to fix Vercel deployment errors
- Fixed RadioGroup compatibility issues
  - Replaced Radix UI Radio Group with custom implementation
  - Removed external dependency to fix React 19 compatibility issues

## [1.0.1] - 2025-04-22

### Fixed
- Fixed import errors in landing page components
  - Created working AI capabilities marquee component with both named and default exports
  - Fixed Tailwind CSS warnings by improving CSS variable usage in Marquee component
  - Updated component exports for better compatibility

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
- Changed testimon
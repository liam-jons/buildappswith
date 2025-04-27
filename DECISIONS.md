# Architecture Documentation Decisions

## 2025-04-27: Stripe Server Component Modernization Pattern

- Implemented standardized error handling with structured `StripeOperationResult` response type and categorized error types
- Added comprehensive TypeScript typing with interface definitions for parameters and responses
- Enhanced logging with contextual metadata for improved debugging and monitoring
- Introduced structured error response handling with the `handleStripeError` helper function
- Created consistent pattern for API methods returning a promise with standardized result object
- Added proper JSDoc documentation for all functions and interfaces
- Added new utility method for retrieving checkout sessions (`getCheckoutSession`)
- Added new utility method for handling refunds (`createRefund`)
- Implemented unit tests with comprehensive coverage of both success and error paths
- Set up proper mocking approach for Stripe APIs in tests

## 2025-04-27: Builder Image Component Modernization Pattern

- Adopted Radix UI Avatar components to replace custom implementation for consistency with design system
- Implemented class-variance-authority (cva) pattern for styling variants instead of manual className mapping
- Created React.useCallback optimization for callback functions to prevent unnecessary re-renders
- Implemented proper image loading states with opacity transitions for improved user experience
- Enhanced accessibility with proper ARIA attributes and screen reader support (including sr-only text)
- Used conditional rendering instead of ternary operators for cleaner JSX structure
- Leveraged Next.js Image optimization features (sizes, priority) for better performance
- Implemented comprehensive testing strategy covering all use cases and variants

## 2025-04-26: Availability Management System Implementation

- Implemented a comprehensive availability management system for builders to control booking times
- Selected separate database models for AvailabilityRule (weekly recurring) and AvailabilityException (specific dates)
- Chose to use plain string time format ("HH:MM") for weekly rules to simplify database storage
- Used ISO date strings for exceptions and time slots to handle timezone conversions properly
- Implemented transaction support for complex database operations (especially slot management)
- Created a sophisticated time slot generation algorithm that considers rules, exceptions, and existing bookings
- Added explicit validation for time formats and constraints in both service layer and API routes
- Designed UI components with accessibility in mind (keyboard navigation, ARIA attributes, labels)
- Implemented builder scheduling settings to control booking parameters (notice time, buffer, etc.)
- Used Zod schemas for comprehensive API request validation
- Created API routes that follow consistent patterns established in the booking system
- Added detailed documentation of components, models, and algorithms in BOOKING_SYSTEM.md

## 2025-04-26: Module Resolution for Architecture Extraction Scripts

- Centralized dependencies in scripts directory with dedicated package.json
- Used explicit TypeScript module import paths in extraction scripts
- Implemented direct path resolution to locally installed binaries
- Created verification steps for dependency installation
- Selected specific dependency versions to ensure compatibility

## 2025-04-26: Package Manager Standardization for Architecture Tools

- Switched from npm to pnpm for all architecture extraction operations
- Created localized package.json in scripts directory
- Implemented direct ts-node binary execution rather than using npm/pnpm exec
- Added installation verification steps to detect missing dependencies
- Created self-contained environment for architecture extraction tools

## 2025-04-26: Direct TypeScript Compiler API Architecture Extraction

- Removed dependency on structurizr-typescript package due to npm installation issues
- Implemented direct TypeScript compiler API approach using ts-morph for more reliable extraction
- Added HTML report generation for improved readability and accessibility
- Created automated Structurizr setup with docker-compose configuration
- Enhanced visualization capabilities with dedicated technical debt reporting
- Implemented authentication flow diagram generation for better documentation
- Maintained backward compatibility with existing Structurizr setup

## 2025-04-26: Structurizr Implementation Approach

- Selected Structurizr Lite with DSL approach for architecture documentation
- Chose local Docker-based implementation for development workflow integration
- Organized documentation using C4 model principles (Context, Containers, Components, Code)
- Established version-controlled architecture documentation alongside codebase
- Decided to pursue automatic architecture extraction for accurate system representation

## 2025-04-26: Directory Structure Organization

- Created dedicated structurizr directory with decisions and documentation subdirectories
- Configured Docker volume mapping for consistent container operation
- Implemented standards for Architecture Decision Records (ADRs)
- Established changelog approach for tracking architecture-specific changes

## 2025-04-26: Architecture Extraction Implementation Approach

- Implemented automatic code extraction rather than relying solely on manual documentation
- Selected TypeScript analysis tools (ts-morph) for codebase structure extraction
- Created specialized authentication architecture extraction to accurately document Clerk implementation
- Implemented technical debt detection based on code patterns (TODOs, FIXMEs, deprecated markers)
- Integrated with existing Structurizr setup rather than creating a new architecture visualization system
- Decided to transition from structurizr-typescript dependency to direct TypeScript compiler API

## 2025-04-26: Booking System Modernization Pattern

- Adopted consistent Clerk authentication integration across all booking components
- Implemented standardized error handling pattern with Sentry integration
- Created consistent approach to mock data generation and fallbacks
- Adopted optimistic UI updates pattern for improved user experience
- Extracted business logic into component-specific helper functions for better maintainability
- Implemented consistent accessibility patterns (ARIA attributes, keyboard navigation)
- Maintained clear placeholder implementations for future functionality
- Standardized API responses with proper HTTP status codes and error formats
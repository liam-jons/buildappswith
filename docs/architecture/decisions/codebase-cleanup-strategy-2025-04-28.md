# Codebase Cleanup Strategy - April 28, 2025

## Context

The Buildappswith codebase has grown during rapid development and now contains a significant amount of unused components (40% of total components according to architecture analysis). This technical debt needs to be addressed before launch to improve maintainability and performance.

## Decision

We will implement a phased cleanup approach with the following priorities:

1. **Page Component Cleanup**: Remove unused/demo pages first
2. **UI Component Cleanup**: Remove components with no incoming references
3. **API Route Cleanup**: Consolidate duplicate API functionality
4. **Authentication Cleanup**: Remove legacy NextAuth components as part of Clerk migration
5. **Utility Cleanup**: Remove unused utility functions

## Component Selection Criteria

We will use the following criteria to determine if a component should be removed:

1. No incoming references in the dependency graph
2. Not part of the core navigation paths (as defined in site-header.tsx)
3. Marked as unused in the enhanced-architecture.json file
4. Not a critical build or configuration file (even if not directly referenced)

## Core Navigation Structure

The following pages are considered critical and will be preserved:

1. **Marketing Pages**:
   - Home page (/)
   - How it works (/how-it-works)
   - Marketplace (/marketplace)
   - Toolkit (/toolkit)
   - About Us (/about)
   - Contact (/contact)

2. **Authentication**:
   - Login (/login)
   - Signup (/signup)

3. **User Pages**:
   - Profile (/profile)
   - Bookings (/bookings)
   - Builder Profile (/builder-profile)
   - Client/Builder/Admin Dashboards

4. **Booking System**:
   - Book page with builder ID (/book/[builderId])
   - Payment processing (/api/stripe/*)

## Implementation Strategy

1. Create a backup branch before making changes
2. Remove components in small, logical groups
3. Test functionality after each group removal
4. Update documentation after successful removals
5. Increment version number in package.json

## Consequences

1. **Positive**:
   - Reduced maintenance burden
   - Improved code clarity
   - Easier onboarding for new developers
   - Better performance
   
2. **Negative**:
   - Risk of removing components that might be needed in the future
   - Temporary disruption during cleanup process
   - Need for comprehensive testing

## Progress Tracking

Current unused component percentage: 36% (down from 45%)
Target percentage after cleanup: <20%

## Validation Approach

After removal of each component group, we will:
1. Run the architecture analysis again
2. Ensure all navigation paths still function
3. Verify critical features (booking, authentication) still work

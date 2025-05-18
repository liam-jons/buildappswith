# Implementation Session: Profile Management Server Actions

## Session Context
* Session Type: Implementation (Code Development)
* Component Focus: Profile Management Server Actions and Liam's Profile Implementation
* Current Branch: feature/profile-server-actions
* Related Documentation: docs/implementation-plans/profile-server-actions-plan.md, docs/engineering/PROFILE_PAGE_IMPLEMENTATION.md
* Linear Project: PROF
* Project root directory: /Users/liamj/Documents/development/buildappswith

## Component Background
The profile management system is a cornerstone of the Buildappswith platform, with Liam's profile being identified as the highest priority in PRD 3.1. While the UI components for profile display are well-implemented, the server-side functionality for managing profiles (especially updating expertise areas, portfolio items, and session types) is incomplete. This implementation will complete the server actions for profile management and ensure Liam's profile is properly populated with the required data.

This component is critical as it forms the foundation for the marketplace and booking system, directly impacting revenue generation through session bookings with Liam. Completing this component will enable profile management, showcase Liam's expertise in ADHD productivity and AI literacy, and connect to the booking system for session reservations.

## Implementation Tasks

1. **Database Migration and Setup**
   - Apply the consolidated migration from `/prisma/migrations/consolidated_profile_enhancements/migration.sql`
   - Verify migration success with database queries
   - Prepare for Liam's profile update in both development and production environments

2. **Server Actions Implementation**
   - Complete the server actions in `/lib/profile/actions.ts` with these functions:
     - `getCurrentBuilderProfile()`
     - `updateBuilderProfile(data)`
     - `updateExpertiseAreas(expertiseAreas)`
     - `addPortfolioProject(project)`
     - `updateFeaturedStatus(profileId, featured)`
     - `getBuilderProfileById(profileId)`
     - `getBuilderProfileBySlug(slug)`
   - Include proper error handling, validation, and logging in all actions
   - Ensure Clerk authentication integration for all profile management actions

3. **Liam's Profile Data Implementation**
   - Update the Liam profile script (`/scripts/seed-data/update-liam-profile-with-expertise.js`)
   - Include all expertise areas as defined in the planning document
   - Use the correct Clerk user IDs for different environments:
     - Production: `user_2wBNHJwI9cJdILyvlRnv4zxu090`
     - Development: `user_2wiigzHyOhaAl4PPIhkKyT2yAkx`
   - Ensure all required data is included (bio, expertise areas, social links, portfolio items)

4. **Testing and Verification**
   - Implement test cases as outlined in the planning document
   - Create verification utilities to ensure data integrity
   - Test integration with the booking system
   - Verify that Liam's profile is correctly displayed in the UI

## Implementation Guidelines

1. **Error Handling Pattern**
   - Follow existing error handling patterns in other server actions
   - Use structured error responses with type, message, and optional details
   - Log all errors appropriately using the logger

2. **JSON Field Handling**
   - Implement proper serialization/deserialization for JSON fields
   - Handle dates in JSON correctly
   - Validate all JSON data using Zod schemas

3. **Clerk Integration**
   - Use the existing data-service.ts functionality for Clerk integration
   - Extend with additional methods as needed for profile-specific operations
   - Ensure all profile operations are properly authenticated

4. **Testing Approach**
   - Create unit tests for all server actions
   - Test JSON field handling specifically
   - Add integration tests for API routes
   - Create test data fixtures for consistent testing

## Dependencies and Related Components
- Auth system (Clerk integration)
- Booking system (for session types)
- UI components that display profile data
- API routes that use the server actions

## Expected Output
- Completed and tested server actions for profile management
- Consolidated database migration applied
- Liam's profile properly populated with all required data
- Test cases for verification
- Documentation of the implementation

## Clerk User IDs

- **Production**:
  - Liam's user ID: `user_2wBNHJwI9cJdILyvlRnv4zxu090`

- **Development**:
  - Liam's user ID (admin): `user_2wiigzHyOhaAl4PPIhkKyT2yAkx`
  - Test builder ID: `user_2wijG5bX0muA5EWLJ848xms1Qqs`
  - Test client ID: `user_2wijZcerutLbFnGdELbGzwGzZnL`
  - Dev org ID: `org_2wiibRry34rjK2GHcxZgoq9Q0yi`
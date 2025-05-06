# Profile Management Server Actions and Database Migration Planning

## Executive Summary

This planning document outlines a comprehensive approach to implementing profile management server actions and database migration for Liam's profile in the BuildAppsWith platform. The work will focus on completing the server-side functionality for managing profiles, with special attention to expertise areas, portfolio items, and Clerk user integration.

Key components of this plan include:
1. A database migration strategy that safely adds marketplace and expertise fields
2. A robust server actions architecture for profile management
3. Clear API contracts for profile-related endpoints
4. Detailed data structure for Liam's profile
5. Integration plan with Clerk authentication
6. Comprehensive test cases for verification
7. Risk analysis and mitigation strategies

The implementation will enable proper management of Liam's profile as required by PRD 3.1, ensuring it can showcase his expertise in ADHD productivity and AI literacy while supporting the booking system for session reservations.

## Database Migration Strategy

We'll consolidate two existing manual migrations to ensure all necessary schema changes are properly applied:

```sql
-- ConsolidatedProfileMigration

-- Add expertise and marketplace fields to BuilderProfile
ALTER TABLE "BuilderProfile" 
  ADD COLUMN IF NOT EXISTS "slug" TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS "tagline" TEXT,
  ADD COLUMN IF NOT EXISTS "displayName" TEXT,
  ADD COLUMN IF NOT EXISTS "completedProjects" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "responseRate" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "expertiseAreas" JSONB,
  ADD COLUMN IF NOT EXISTS "featured" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "searchable" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "availability" TEXT NOT NULL DEFAULT 'available',
  ADD COLUMN IF NOT EXISTS "topSkills" TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "clerkUserId" TEXT UNIQUE;

-- Create indexes for marketplace search
CREATE INDEX IF NOT EXISTS "BuilderProfile_featured_idx" ON "BuilderProfile"("featured");
CREATE INDEX IF NOT EXISTS "BuilderProfile_searchable_idx" ON "BuilderProfile"("searchable");
CREATE INDEX IF NOT EXISTS "BuilderProfile_availability_idx" ON "BuilderProfile"("availability");
CREATE INDEX IF NOT EXISTS "BuilderProfile_validationTier_idx" ON "BuilderProfile"("validationTier");
```

After migration, we'll verify the schema changes and run the Liam profile update script to populate the required data.

## Server Actions Implementation

We'll implement the following server actions in the `lib/profile/actions.ts` file:

1. `getCurrentBuilderProfile()` - Get the current user's builder profile
2. `updateBuilderProfile(data)` - Update the current user's builder profile
3. `updateExpertiseAreas(expertiseAreas)` - Update expertise areas for a builder profile
4. `addPortfolioProject(project)` - Add a portfolio project to the builder profile
5. `updateFeaturedStatus(profileId, featured)` - Update a builder profile's featured status (admin only)
6. `getBuilderProfileById(profileId)` - Get a builder profile by ID for public viewing
7. `getBuilderProfileBySlug(slug)` - Get a builder profile by slug for public viewing

The implementation will follow patterns similar to other actions in the codebase, with proper error handling, validation, and logging.

## Liam's Profile Data Structure

Liam's profile will include the following key components:

1. **Basic Profile Data**: displayName, tagline, slug, bio, headline, domains, badges
2. **Social Links**: website, LinkedIn, GitHub, Twitter
3. **Expertise Areas**: ADHD_PRODUCTIVITY, AI_LITERACY, BUILDING_WITH_AI, BUSINESS_VALUE, each with descriptions, bullet points, and testimonials
4. **Portfolio Projects**: ADHD Task Manager, AI Literacy Learning Portal, Business Value Calculator
5. **Session Types**: Quick Strategy Session, ADHD Productivity Consultation, Business AI Assessment, AI Literacy Workshop

This data structure aligns with the PRD 3.1 requirements and will be populated using the update script.

## Integration with Clerk User Data

The integration will ensure that:

1. Liam's profile is properly linked to his Clerk user ID
2. Profile updates are authenticated through Clerk
3. Role-based access control is enforced for profile management
4. User data is synchronized between Clerk and our database

We'll extend the existing data-service.ts functionality with methods to link profiles to Clerk users and verify profile permissions.

## Test Cases for Verification

We've defined comprehensive test cases including:

1. Unit tests for server actions
2. Tests for JSON handling
3. API route tests
4. End-to-end test cases
5. Test data fixtures for consistent testing

These tests will ensure the implementation is robust and meets the requirements.

## Risk Assessment and Mitigation

Key risks identified include:

1. **Database Migration Risks**: Mitigated through backups, conditional clauses, and testing
2. **JSON Data Handling Risks**: Mitigated through validation, error handling, and sanitization
3. **Authentication Integration Risks**: Mitigated through double-verification and audit logging
4. **Liam's Profile Data Integrity Risks**: Mitigated through dedicated seeding and verification
5. **Performance Risks**: Mitigated through indexes and optimization
6. **Environment Configuration Risks**: Mitigated through validation and checklists
7. **Integration Testing Risks**: Mitigated through comprehensive test coverage

Each risk has a detailed mitigation strategy to ensure successful implementation.

## Implementation Plan

1. **Phase 1: Database Migration** (1 day)
   - Create consolidated migration
   - Test migration in development
   - Apply to production with proper backups
   - Verify schema changes

2. **Phase 2: Server Actions Implementation** (2 days)
   - Implement profile actions
   - Add validation and error handling
   - Implement Clerk integration
   - Create test suite

3. **Phase 3: Liam's Profile Data** (1 day)
   - Update Liam's profile with complete data
   - Verify expertise areas and session types
   - Test booking integration

4. **Phase 4: Testing and Verification** (1 day)
   - Run all test cases
   - Perform manual verification
   - Test integration with booking system
   - Document implementation

## Clerk User IDs

- **Production**:
  - Liam's user ID: `user_2wBNHJwI9cJdILyvlRnv4zxu090`

- **Development**:
  - Liam's user ID (admin): `user_2wiigzHyOhaAl4PPIhkKyT2yAkx`
  - Test builder ID: `user_2wijG5bX0muA5EWLJ848xms1Qqs`
  - Test client ID: `user_2wijZcerutLbFnGdELbGzwGzZnL`
  - Dev org ID: `org_2wiibRry34rjK2GHcxZgoq9Q0yi`

## Tasks Required from Liam

For successful implementation of Liam's profile, we'll need:

1. Confirmation of all bio content and expertise area descriptions
2. Images for portfolio projects (to be uploaded to the appropriate location)
3. Review and approval of the session types and pricing
4. Verification of his Clerk user ID in the production environment
5. Final review of the implemented profile

## Conclusion

This comprehensive plan addresses all aspects of the profile management server actions and database migration for Liam's profile. By following this approach, we'll successfully implement the server-side functionality required by PRD 3.1, enabling Liam's profile to showcase his expertise and support the booking system for session reservations.
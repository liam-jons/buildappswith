# Database Sync and Marketplace Builder Visibility Fix

## Problem Summary

Builders were not appearing in the marketplace UI in both development and production environments despite being present in the database. This document outlines the root causes and solutions.

## Root Causes

1. **Schema-Code Mismatch**: The code was referencing fields in the BuilderProfile model that didn't exist in the schema.prisma file, including:
   - `searchable`: Used as a filter condition but missing from schema
   - `displayName`: Referenced in UI components but missing from schema
   - `tagline`: Referenced in profile data display but missing from schema
   - `topSkills`: Used for skill display but missing from schema
   - Additional fields related to availability and metrics

2. **API Filtering Logic**: All queries in `marketplace-service.ts` included a `searchable: true` filter condition, but since the field didn't exist in the schema, no profiles matched.

## Applied Fixes

1. **Schema Updates**: Added missing fields to the BuilderProfile model:
   ```prisma
   model BuilderProfile {
     // Existing fields...
     searchable       Boolean        @default(true)
     displayName      String?
     topSkills        String[]       @default([])
     tagline          String?
     slug             String?
     expertiseAreas   Json?
     completedProjects Int           @default(0)
     responseRate     Float?
     availability     String?        @default("available")
     // Other fields...

     @@index([searchable])
   }
   ```

2. **Profile Update Script**: Created a script to ensure your profile has all required fields:
   - Finds user by Clerk ID
   - Creates or updates builder profile
   - Sets all required fields including `searchable: true`
   - Creates session types and portfolio items
   - Adds required skills

## Deployment Instructions

1. **Development Environment**:
   - Apply schema changes: `npx prisma generate`
   - Run update script: `node scripts/update-liam-profile-complete.js`
   - Restart dev server: `pnpm dev`

2. **Production Environment**:
   - Deploy schema changes first
   - Run update script with production credentials:
     ```
     NODE_ENV=production DATABASE_URL="your-production-url" node scripts/update-liam-profile-complete.js
     ```

## Additional Considerations

1. **Authentication**: The 401 errors on `/api/navigation` endpoint in development suggest possible authentication configuration issues. The middleware.ts file has the correct marketplace routes in the publicRoutes array, but it might need review.

2. **Cookie Domain**: The production warning about the cookie domain rejection should be addressed separately as it could affect user sessions.

3. **Future Work**: A comprehensive audit of the entire database schema against code references would help identify any other mismatches before they cause issues.

## Success Criteria

After applying these fixes:
- Builder profiles should appear in the marketplace
- Your profile should be visible as a featured builder
- The booking flow should work correctly

If profiles still don't appear after these changes, additional logging and database validation will be needed to identify other potential issues.

## Next Steps

1. Monitor marketplace visibility after deploying changes
2. Implement a more robust schema validation process
3. Document the database schema completely to prevent future mismatches
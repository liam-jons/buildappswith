# Marketplace Builder Visibility Fix Plan

## Summary of Issues Identified

1. Builder profiles exist in the production database and have:
   - Searchable flag set to true
   - Session types configured
   - Expertise areas populated
   - Clerk IDs assigned

2. Middleware configuration:
   - Public routes correctly include `/api/marketplace/builders` and `/api/marketplace/builders/(.+)`
   - The routes appear properly configured in both middleware.ts and middleware/config.ts

3. API Testing:
   - Production API endpoint returns an empty array of builders
   - The API works on the local environment but not in production
   - Data exists in the database, but is not being returned by the API

4. Role mapping:
   - Clerk uses "Member" and "Admin" roles by default
   - Our application uses "CLIENT", "BUILDER", and "ADMIN" roles
   - Role mapping may have inconsistencies between environments

5. Feature flags:
   - UseDynamicMarketplace flag may affect builder visibility
   - Feature flag defaults are set in client-side code, not server

## Implementation Plan

### 1. Verify Database Synchronization in Production

```sql
-- Check if any builders have searchable=true but are missing expected fields
SELECT 
  bp.id, 
  u.email, 
  u.clerkId, 
  bp.searchable,
  bp.featured, 
  bp.expertise_areas IS NULL as missing_expertise
FROM "BuilderProfile" bp
JOIN "User" u ON bp.userId = u.id
WHERE bp.searchable = true
ORDER BY bp.featured DESC, u.email;
```

### 2. Check Clerk-Database User Role Synchronization

Create a script file at `/scripts/verify-clerk-roles.js`:

```javascript
// Script to verify roles between Clerk and database
const { PrismaClient } = require('@prisma/client');
const { clerkClient } = require('@clerk/clerk-sdk-node');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Comparing Clerk and database roles...');
    
    // Get all users from database
    const dbUsers = await prisma.user.findMany({
      where: {
        clerkId: {
          not: null
        }
      },
      include: {
        builderProfile: {
          select: {
            id: true,
            searchable: true
          }
        }
      }
    });
    
    console.log(`Found ${dbUsers.length} users with Clerk IDs in database`);
    
    // Process each user
    for (const user of dbUsers) {
      if (!user.clerkId) continue;
      
      try {
        // Get user from Clerk
        const clerkUser = await clerkClient.users.getUser(user.clerkId);
        
        // Extract roles from Clerk metadata
        const clerkRoles = clerkUser.publicMetadata?.roles || [];
        const dbRoles = user.roles || [];
        
        // Check for builder role mismatch
        const isClerkBuilder = clerkRoles.includes('BUILDER');
        const isDbBuilder = dbRoles.includes('BUILDER');
        const hasBuilderProfile = !!user.builderProfile;
        
        if (isClerkBuilder !== isDbBuilder || isDbBuilder !== hasBuilderProfile) {
          console.log(`[MISMATCH] User ${user.email} (${user.clerkId}):`);
          console.log(`  Clerk roles: ${clerkRoles.join(', ')}`);
          console.log(`  DB roles: ${dbRoles.join(', ')}`);
          console.log(`  Has builder profile: ${hasBuilderProfile}`);
          console.log(`  Builder profile searchable: ${user.builderProfile?.searchable}`);
          
          // If needed, update Clerk roles to match database
          if (hasBuilderProfile && !isClerkBuilder) {
            console.log(`  ACTION NEEDED: Add BUILDER role to Clerk for ${user.email}`);
            
            // Uncomment to apply the fix:
            // await clerkClient.users.updateUser(user.clerkId, {
            //   publicMetadata: {
            //     ...clerkUser.publicMetadata,
            //     roles: [...clerkRoles, 'BUILDER']
            //   }
            // });
          }
        }
      } catch (error) {
        console.error(`Error processing user ${user.clerkId}:`, error);
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
```

### 3. Fix Marketplace Data Service Query

Inspect `/lib/marketplace/data/marketplace-service.ts` to ensure the query properly handles the searchable flag:

```typescript
// Verify that the where condition in fetchBuilders function is correctly constructed
const where: Prisma.BuilderProfileWhereInput = {
  searchable: true,
  // Make sure there are no additional filters accidentally limiting results
};
```

### 4. Server-Side Feature Flag Configuration

Create a new file at `/lib/server-feature-flags.ts`:

```typescript
/**
 * Server-side feature flag configuration
 * 
 * This module provides environment-based default settings for 
 * feature flags when accessed from server components.
 */

import { FeatureFlag } from './feature-flags';

// Environment-specific feature flag defaults
const ENVIRONMENT_DEFAULTS: Record<string, Record<FeatureFlag, boolean>> = {
  production: {
    [FeatureFlag.UseBuilderImage]: true, // Enable fixed builder image in production
    [FeatureFlag.UseViewingPreferences]: false,
    [FeatureFlag.UseClerkAuth]: true,
    [FeatureFlag.UseDynamicMarketplace]: true, // Ensure marketplace is enabled in production
  },
  preview: {
    [FeatureFlag.UseBuilderImage]: true,
    [FeatureFlag.UseViewingPreferences]: false,
    [FeatureFlag.UseClerkAuth]: true,
    [FeatureFlag.UseDynamicMarketplace]: true,
  },
  development: {
    [FeatureFlag.UseBuilderImage]: true,
    [FeatureFlag.UseViewingPreferences]: false,
    [FeatureFlag.UseClerkAuth]: true,
    [FeatureFlag.UseDynamicMarketplace]: true,
  },
};

// Default feature flag configuration (if environment not matched)
const DEFAULT_FLAGS: Record<FeatureFlag, boolean> = {
  [FeatureFlag.UseBuilderImage]: true,
  [FeatureFlag.UseViewingPreferences]: false,
  [FeatureFlag.UseClerkAuth]: true,
  [FeatureFlag.UseDynamicMarketplace]: true,
};

/**
 * Get the feature flag defaults for the current environment
 */
export function getServerFeatureFlags(): Record<FeatureFlag, boolean> {
  const env = process.env.NODE_ENV || 'development';
  return ENVIRONMENT_DEFAULTS[env] || DEFAULT_FLAGS;
}

/**
 * Get a specific feature flag value for server-side code
 */
export function getServerFeatureFlag(flag: FeatureFlag): boolean {
  const flags = getServerFeatureFlags();
  return flags[flag];
}
```

### 5. Update Marketplace API to Use Server Feature Flags

Modify `/app/api/marketplace/builders/route.ts`:

```typescript
// Import the server feature flags
import { getServerFeatureFlag } from '@/lib/server-feature-flags';
import { FeatureFlag } from '@/lib/feature-flags';

// In the GET handler, check the feature flag before fetching builders
export async function GET(request: NextRequest) {
  // [existing code]

  try {
    // Check if dynamic marketplace is enabled
    const isDynamicMarketplaceEnabled = getServerFeatureFlag(FeatureFlag.UseDynamicMarketplace);
    
    if (!isDynamicMarketplaceEnabled) {
      apiLogger.warn('Dynamic marketplace disabled by feature flag', {
        flag: FeatureFlag.UseDynamicMarketplace,
        value: isDynamicMarketplaceEnabled
      });
      
      // Return empty results if feature is disabled
      return NextResponse.json({
        success: true,
        data: [],
        pagination: {
          page: 1,
          limit: 9,
          total: 0,
          totalPages: 0,
          hasMore: false
        }
      });
    }
    
    // [rest of existing code]
  } catch (error) {
    // [existing error handling]
  }
}
```

### 6. Add Enhanced Logging to Marketplace Service

Update `/lib/marketplace/data/marketplace-service.ts` with additional logging:

```typescript
// In the fetchBuilders function:
try {
  // Log the query parameters for debugging
  marketplaceLogger.info('Fetching builders with params', {
    page,
    limit,
    filters,
    whereClause: JSON.stringify(where),
    environment: process.env.NODE_ENV,
  });
  
  // [existing database query]
  
  // Log the query results
  marketplaceLogger.info('Builder query results', {
    totalFound: total,
    returnedCount: builders.length,
    environment: process.env.NODE_ENV,
  });
  
  // [rest of existing code]
} catch (error) {
  // [existing error handling]
}
```

### 7. Fix Builder Profiles in Database

Create a script at `/scripts/fix-builder-visibility.js`:

```javascript
// Script to ensure builder profiles have correct visibility settings
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Fixing builder profile visibility...');
    
    // Find all users with BUILDER role
    const builders = await prisma.user.findMany({
      where: {
        roles: {
          has: 'BUILDER'
        }
      },
      include: {
        builderProfile: true
      }
    });
    
    console.log(`Found ${builders.length} users with BUILDER role`);
    
    // Count users missing builder profiles
    const missingProfiles = builders.filter(user => !user.builderProfile);
    console.log(`Found ${missingProfiles.length} builders missing builder profiles`);
    
    // Create missing builder profiles
    if (missingProfiles.length > 0) {
      for (const user of missingProfiles) {
        console.log(`Creating builder profile for ${user.email}`);
        
        await prisma.builderProfile.create({
          data: {
            userId: user.id,
            searchable: true,
            featured: false,
            validationTier: 1,
            domains: [],
            badges: [],
            availability: 'available',
            expertiseAreas: {
              BUILDING_WITH_AI: {
                level: 3,
                description: "Expert in creating AI-powered applications and workflows",
                yearsExperience: 2
              }
            }
          }
        });
      }
    }
    
    // Update existing builder profiles to be searchable
    const updatedCount = await prisma.builderProfile.updateMany({
      where: {
        searchable: false,
        user: {
          roles: {
            has: 'BUILDER'
          }
        }
      },
      data: {
        searchable: true
      }
    });
    
    console.log(`Updated ${updatedCount.count} builder profiles to be searchable`);
    
    // Verify fixed builder profiles
    const searchableBuilders = await prisma.builderProfile.count({
      where: {
        searchable: true
      }
    });
    
    console.log(`Total searchable builder profiles after fix: ${searchableBuilders}`);
    
  } catch (error) {
    console.error('Error fixing builder profiles:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
```

### 8. Testing Plan

1. First, apply fixes in development and verify:
   - Run verification scripts to check database consistency
   - Test API endpoints to ensure builders are returned
   - Verify that feature flags work correctly

2. Apply in staging/preview:
   - Apply the role sync and database fixes in the preview environment
   - Test API endpoints and frontend components
   - Verify that Calendly integration works properly

3. Apply in production:
   - Use the same scripts to apply fixes in production
   - Verify API endpoints return correct data
   - Test end-to-end flow in production

### 9. Long-term Fixes

1. Implement a scheduled job to periodically verify and sync Clerk roles with database roles
2. Create comprehensive API tests for the marketplace endpoints
3. Add server-side feature flag configurations for all environments
4. Add logging to critical paths in the marketplace and booking flows
5. Document the role mapping between Clerk and our database

## Implementation Sequence

1. Run verification scripts to assess the current state
2. Apply database fixes for roles and builder profiles
3. Add server-side feature flag configuration
4. Update API endpoints to use server feature flags 
5. Add enhanced logging to aid debugging
6. Test fixes in development and staging
7. Apply fixes in production
8. Verify marketplace functionality end-to-end
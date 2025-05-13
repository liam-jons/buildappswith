# Marketplace Visibility Production Launch Plan

## Current Environment Status

### Production Environment
- **Active Users**: 
  1. Liam Jons (Admin, Builder, Client) - Clerk ID: `user_2wiigzHyOhaAl4PPIhkKyT2yAkx`
  2. John Smith (Client) - Clerk ID: `user_2x0BF1LtHXGViNF3IxOz288fpSk`

- **Target State**: 
  - 6 total marketplace builders including Liam
  - 5 development users to be migrated to production with "Demo Account" tag
  - All users properly synced between Clerk and database

### Development Environment
- **Clerk Status**: 8 users (7 from TEST_USER_MATRIX.md + Liam)
- **Database Status**: Multiple test users with mismatched Clerk IDs
- **Email Domains**: All need to use `@buildappswith.com` domain
- **Issue**: Email inconsistencies between documentation and Clerk dashboard

### User Signup Issues
- Currently blocking new user registration due to security settings
- Being investigated separately
- Manual user creation as temporary workaround

## Comprehensive Implementation Plan

### 1. Fix Production Database-Clerk Synchronization

First, we need to ensure our two confirmed production users are correctly set up:

```javascript
// scripts/sync-production-clerk-users.js
const { PrismaClient } = require('@prisma/client');
const { clerkClient } = require('@clerk/clerk-sdk-node');

const prisma = new PrismaClient();

// Known production users
const PRODUCTION_USERS = [
  {
    clerkId: 'user_2wiigzHyOhaAl4PPIhkKyT2yAkx',
    name: 'Liam Jons',
    email: 'liam.jones@buildappswith.com',
    roles: ['ADMIN', 'BUILDER', 'CLIENT'],
    createBuilderProfile: true,
    featured: true,
    searchable: true,
    isDemo: false
  },
  {
    clerkId: 'user_2x0BF1LtHXGViNF3IxOz288fpSk',
    name: 'John Smith',
    email: 'john@example.com',  // Update with actual email
    roles: ['CLIENT'],
    createBuilderProfile: false,
    isDemo: false
  },
  // Demo users to be added - these will be filled in from development
  // But marked as demo accounts
];

async function syncProductionUsers() {
  try {
    console.log('Starting production user synchronization...');
    
    for (const userData of PRODUCTION_USERS) {
      // Check if user exists in database
      let dbUser = await prisma.user.findFirst({
        where: { 
          OR: [
            { clerkId: userData.clerkId },
            { email: userData.email }
          ]
        },
        include: { builderProfile: true }
      });
      
      if (dbUser) {
        console.log(`Updating existing user: ${userData.email}`);
        
        // Update user data
        dbUser = await prisma.user.update({
          where: { id: dbUser.id },
          data: {
            clerkId: userData.clerkId,
            name: userData.name,
            email: userData.email,
            roles: userData.roles,
            isDemo: userData.isDemo || false
          },
          include: { builderProfile: true }
        });
      } else {
        console.log(`Creating new user: ${userData.email}`);
        
        // Create new user
        dbUser = await prisma.user.create({
          data: {
            clerkId: userData.clerkId,
            name: userData.name,
            email: userData.email,
            roles: userData.roles,
            isDemo: userData.isDemo || false
          },
          include: { builderProfile: true }
        });
      }
      
      // Create builder profile if needed
      if (userData.createBuilderProfile && !dbUser.builderProfile) {
        console.log(`Creating builder profile for ${userData.email}`);
        
        await prisma.builderProfile.create({
          data: {
            userId: dbUser.id,
            searchable: userData.searchable || true,
            featured: userData.featured || false,
            validationTier: 2,
            domains: [],
            badges: [],
            availability: 'available',
            expertiseAreas: {
              BUILDING_WITH_AI: {
                level: 4,
                description: "Expert in creating AI-powered applications and workflows",
                yearsExperience: 3
              },
              AI_LITERACY: {
                level: 4,
                description: "Specializes in making AI concepts accessible to beginners",
                yearsExperience: 2
              },
              ADHD_PRODUCTIVITY: {
                level: 3,
                description: "Helps clients overcome ADHD challenges with practical AI solutions",
                yearsExperience: 2
              }
            }
          }
        });
      } else if (userData.createBuilderProfile && dbUser.builderProfile) {
        // Update existing builder profile
        console.log(`Updating builder profile for ${userData.email}`);
        
        await prisma.builderProfile.update({
          where: { id: dbUser.builderProfile.id },
          data: {
            searchable: userData.searchable || true,
            featured: userData.featured || false,
            expertiseAreas: dbUser.builderProfile.expertiseAreas || {
              BUILDING_WITH_AI: {
                level: 4,
                description: "Expert in creating AI-powered applications and workflows",
                yearsExperience: 3
              }
            }
          }
        });
      }
      
      // Verify in Clerk if needed
      try {
        const clerkUser = await clerkClient.users.getUser(userData.clerkId);
        
        // Update Clerk metadata if needed
        if (!clerkUser.publicMetadata?.roles || 
            JSON.stringify(clerkUser.publicMetadata.roles) !== JSON.stringify(userData.roles)) {
          
          console.log(`Updating Clerk roles for ${userData.email}`);
          
          await clerkClient.users.updateUser(userData.clerkId, {
            publicMetadata: {
              ...clerkUser.publicMetadata,
              roles: userData.roles
            }
          });
        }
      } catch (error) {
        console.warn(`Could not verify Clerk user ${userData.clerkId}: ${error.message}`);
      }
    }
    
    console.log('Production user synchronization completed');
    
  } catch (error) {
    console.error('Error syncing production users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the sync
syncProductionUsers();
```

### 2. Create Demo Builder Accounts for Production

```javascript
// scripts/create-demo-builders.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Demo builder data - these are representative profiles that will 
// be displayed in production but marked as demo accounts
const DEMO_BUILDERS = [
  {
    name: 'Alex Taylor',
    email: 'alex.taylor@buildappswith.com',
    roles: ['BUILDER', 'CLIENT'],
    bio: 'AI application specialist with expertise in conversational agents and knowledge management.',
    headline: 'AI & Automation Expert',
    featured: true,
    searchable: true,
    validationTier: 2,
    expertiseAreas: {
      BUILDING_WITH_AI: {
        level: 4,
        description: "Creating practical AI workflows for businesses",
        yearsExperience: 5
      },
      DATA_AUTOMATION: {
        level: 3,
        description: "Building data pipelines and automation systems",
        yearsExperience: 4
      }
    }
  },
  {
    name: 'Sam Johnson',
    email: 'sam.johnson@buildappswith.com',
    roles: ['BUILDER'],
    bio: 'Specializing in ADHD-focused productivity tools and AI assistants for neurodivergent workflows.',
    headline: 'Productivity Systems Designer',
    featured: false,
    searchable: true,
    validationTier: 1,
    expertiseAreas: {
      ADHD_PRODUCTIVITY: {
        level: 5,
        description: "Creating specialized tools for ADHD professionals",
        yearsExperience: 3
      },
      BUILDING_WITH_AI: {
        level: 3,
        description: "Integrating AI into productivity workflows",
        yearsExperience: 2
      }
    }
  },
  {
    name: 'Jordan Rivera',
    email: 'jordan.rivera@buildappswith.com',
    roles: ['BUILDER', 'CLIENT'],
    bio: 'AI literacy educator and consultant helping businesses understand and implement generative AI.',
    headline: 'AI Literacy Specialist',
    featured: true,
    searchable: true,
    validationTier: 3,
    expertiseAreas: {
      AI_LITERACY: {
        level: 5,
        description: "Training executives and teams in AI concepts",
        yearsExperience: 4
      },
      BUILDING_WITH_AI: {
        level: 4,
        description: "Designing practical AI applications",
        yearsExperience: 3
      }
    }
  },
  {
    name: 'Morgan Chen',
    email: 'morgan.chen@buildappswith.com',
    roles: ['BUILDER'],
    bio: 'Full-stack developer specializing in AI integrations for startups and SMBs.',
    headline: 'AI Integration Developer',
    featured: false,
    searchable: true,
    validationTier: 2,
    expertiseAreas: {
      BUILDING_WITH_AI: {
        level: 4,
        description: "End-to-end AI application development",
        yearsExperience: 3
      },
      AI_LITERACY: {
        level: 3,
        description: "Technical workshops and implementation",
        yearsExperience: 2
      }
    }
  },
  {
    name: 'Jamie Wilson',
    email: 'jamie.wilson@buildappswith.com',
    roles: ['BUILDER', 'CLIENT'],
    bio: 'AI strategy consultant specializing in business process optimization and workflow redesign.',
    headline: 'AI Process Optimization Expert',
    featured: false,
    searchable: true,
    validationTier: 2,
    expertiseAreas: {
      BUILDING_WITH_AI: {
        level: 4,
        description: "Business workflow automation with AI",
        yearsExperience: 5
      },
      ADHD_PRODUCTIVITY: {
        level: 2,
        description: "ADHD-focused team productivity systems",
        yearsExperience: 1
      }
    }
  }
];

async function createDemoBuilders() {
  try {
    console.log('Starting demo builder creation...');
    
    for (const builderData of DEMO_BUILDERS) {
      // Check if builder already exists
      let dbUser = await prisma.user.findFirst({
        where: { email: builderData.email },
        include: { builderProfile: true }
      });
      
      if (dbUser) {
        console.log(`Updating existing demo builder: ${builderData.email}`);
        
        // Update user data
        dbUser = await prisma.user.update({
          where: { id: dbUser.id },
          data: {
            name: builderData.name,
            roles: builderData.roles,
            isDemo: true  // Mark as demo account
          },
          include: { builderProfile: true }
        });
      } else {
        console.log(`Creating new demo builder: ${builderData.email}`);
        
        // Create new user
        dbUser = await prisma.user.create({
          data: {
            name: builderData.name,
            email: builderData.email,
            roles: builderData.roles,
            isDemo: true  // Mark as demo account
          },
          include: { builderProfile: true }
        });
      }
      
      // Create/update builder profile
      if (!dbUser.builderProfile) {
        console.log(`Creating builder profile for ${builderData.email}`);
        
        await prisma.builderProfile.create({
          data: {
            userId: dbUser.id,
            bio: builderData.bio,
            headline: builderData.headline,
            searchable: builderData.searchable,
            featured: builderData.featured,
            validationTier: builderData.validationTier,
            domains: [],
            badges: [],
            availability: 'available',
            expertiseAreas: builderData.expertiseAreas,
            // Create some session types
            sessionTypes: {
              create: [
                {
                  title: 'Initial Consultation',
                  description: 'Introductory session to discuss your needs and how I can help.',
                  durationMinutes: 30,
                  price: 0,
                  currency: 'USD',
                  isActive: true
                },
                {
                  title: 'Strategy Session',
                  description: 'In-depth strategy discussion for your AI implementation.',
                  durationMinutes: 60,
                  price: 99.99,
                  currency: 'USD',
                  isActive: true
                }
              ]
            }
          }
        });
      } else {
        // Update existing builder profile
        console.log(`Updating builder profile for ${builderData.email}`);
        
        await prisma.builderProfile.update({
          where: { id: dbUser.builderProfile.id },
          data: {
            bio: builderData.bio,
            headline: builderData.headline,
            searchable: builderData.searchable,
            featured: builderData.featured,
            validationTier: builderData.validationTier,
            expertiseAreas: builderData.expertiseAreas
          }
        });
        
        // Check if session types exist, create if not
        const sessionTypes = await prisma.sessionType.findMany({
          where: { builderId: dbUser.builderProfile.id }
        });
        
        if (sessionTypes.length === 0) {
          console.log(`Creating session types for ${builderData.email}`);
          
          await prisma.sessionType.createMany({
            data: [
              {
                builderId: dbUser.builderProfile.id,
                title: 'Initial Consultation',
                description: 'Introductory session to discuss your needs and how I can help.',
                durationMinutes: 30,
                price: 0,
                currency: 'USD',
                isActive: true
              },
              {
                builderId: dbUser.builderProfile.id,
                title: 'Strategy Session',
                description: 'In-depth strategy discussion for your AI implementation.',
                durationMinutes: 60,
                price: 99.99,
                currency: 'USD',
                isActive: true
              }
            ]
          });
        }
      }
    }
    
    console.log('Demo builder creation completed');
    
  } catch (error) {
    console.error('Error creating demo builders:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the creation
createDemoBuilders();
```

### 3. Update Schema for Subscriber Role

Let's add a `SUBSCRIBER` role to our schema to support the sales funnel:

```sql
-- Add a migration script to add SUBSCRIBER role
-- scripts/add-subscriber-role.sql

-- Update the UserRole enum
ALTER TYPE "UserRole" ADD VALUE 'SUBSCRIBER' AFTER 'CLIENT';

-- Create a Subscriber profile table
CREATE TABLE "SubscriberProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "interests" TEXT[],
    "newsletterFrequency" TEXT NOT NULL DEFAULT 'weekly',
    "subscriptionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastEmailSent" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubscriberProfile_pkey" PRIMARY KEY ("id")
);

-- Create a unique constraint on userId
CREATE UNIQUE INDEX "SubscriberProfile_userId_key" ON "SubscriberProfile"("userId");

-- Add foreign key constraint
ALTER TABLE "SubscriberProfile" ADD CONSTRAINT "SubscriberProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add isDemo flag to User table if not exists
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isDemo" BOOLEAN NOT NULL DEFAULT false;
```

Update the Prisma schema to reflect these changes:

```typescript
// prisma/schema.prisma update

enum UserRole {
  CLIENT
  BUILDER
  ADMIN
  SUBSCRIBER
}

model User {
  id               String          @id @default(cuid())
  name             String?
  email            String          @unique
  emailVerified    DateTime?
  imageUrl         String?
  isFounder        Boolean         @default(false)
  stripeCustomerId String?
  verified         Boolean         @default(false)
  clerkId          String?         @unique
  isDemo           Boolean         @default(false)
  createdAt        DateTime        @default(now())
  updatedAt        DateTime        @updatedAt
  roles            UserRole[]      @default([CLIENT])
  capabilities     AICapability[]
  accounts         Account[]
  bookingsAsClient Booking[]       @relation("BookingsAsClient")
  builderProfile   BuilderProfile?
  clientProfile    ClientProfile?
  subscriberProfile SubscriberProfile?
  sessions         Session[]
}

model SubscriberProfile {
  id                 String     @id @default(cuid())
  userId             String     @unique
  interests          String[]
  newsletterFrequency String     @default("weekly")
  subscriptionDate   DateTime   @default(now())
  lastEmailSent      DateTime?
  createdAt          DateTime   @default(now())
  updatedAt          DateTime   @updatedAt
  user               User       @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### 4. Update API to Handle Demo Accounts

Update the marketplace API to handle demo accounts correctly:

```typescript
// lib/marketplace/data/marketplace-service.ts

/**
 * Fetch builders with pagination and filtering
 */
export async function fetchBuilders(
  page: number = 1,
  limit: number = 9,
  filters?: MarketplaceFilters
): Promise<PaginatedResponse<BuilderProfileListing>> {
  try {
    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build where conditions
    const where: Prisma.BuilderProfileWhereInput = {
      searchable: true,
      // In production, we can choose to include demo accounts 
      // but might want to filter them with a special parameter
      ...(process.env.NODE_ENV === 'production' && filters?.excludeDemo && {
        user: {
          isDemo: false
        }
      }),
      // The User model in the current schema doesn't have deletedAt field
      // So we don't filter by deletedAt
    };
    
    // Add demo flag to filter
    if (filters?.isDemo !== undefined) {
      where.user = {
        ...where.user,
        isDemo: filters.isDemo
      };
    }
    
    // Show demo tag in builder profile
    const includeDemo = true;
    
    // [rest of existing function]
    
    // Add isDemo in the returned builder data
    const builderListings: BuilderProfileListing[] = builders.map((builder) => {
      try {
        // Apply user field mapping to handle schema differences
        const mappedUser = builder.user;

        return {
          // [existing fields]
          id: builder.id,
          userId: builder.userId,
          name: builder.displayName || mappedUser.name || 'Unknown Builder',
          // [other fields]
          
          // Add isDemo flag
          isDemo: mappedUser.isDemo || false,
        };
      } catch (error) {
        // [existing error handling]
      }
    });
    
    // [rest of existing function]
  }
}
```

### 5. Update Role Mapping for SUBSCRIBER Role

```typescript
// lib/auth/express/client-auth.ts

// Add SUBSCRIBER to UserRole enum
export enum UserRole {
  ADMIN = 'ADMIN',
  BUILDER = 'BUILDER',
  CLIENT = 'CLIENT',
  SUBSCRIBER = 'SUBSCRIBER',
}

// Update permission mapping
const hasPermission = (permission: string): boolean => {
  // Simple role-based permission mapping
  const rolePermissions: Record<string, string[]> = {
    [UserRole.ADMIN]: ['*'], // Admin has all permissions
    [UserRole.BUILDER]: ['profile:edit', 'builder:manage'],
    [UserRole.CLIENT]: ['profile:view', 'booking:create'],
    [UserRole.SUBSCRIBER]: ['profile:view', 'newsletter:manage'],
  };

  // [rest of existing function]
};

// Add isSubscriber hook
export function useIsSubscriber(): boolean {
  return useHasRole(UserRole.SUBSCRIBER);
}
```

### 6. Fix TEST_USER_MATRIX.md Documentation

```markdown
# Update to TEST_USER_MATRIX.md

## Available Test Users

| Type | Role(s) | Clerk ID | Email | Description |
|------|---------|----------|-------|-------------|
| Basic Client | CLIENT | `user_2wtz5pWuoIXbbkdndL6n5f0tMLT` | client-test@buildappswith.com | Standard client account with basic permissions |
| Premium Client | CLIENT | `user_2wtzoD4QCQCCYs4Z4MKUFAdMYQq` | premium-client@buildappswith.com | Client with premium features unlocked |
| New Builder | BUILDER | `user_2wu00KHccnL1FoCIIzEQYlzVjpW` | new-builder@buildappswith.com | Builder with limited experience and portfolio |
| Established Builder | BUILDER | `user_2wu07wHNdf7LolavvVZxbrmdEqg` | established-builder@buildappswith.com | Experienced builder with full profile and portfolio |
| Admin User | ADMIN | `user_2wu0TwPYijtMmMrzvdiP7ys5Mmh` | admin@buildappswith.com | Administrator with platform management capabilities |
| Dual Role User | BUILDER, CLIENT | `user_2wu0bNqtVmt4E7WfGwrzlWSxd1k` | dual-role@buildappswith.com | User with both builder and client capabilities |
| Triple Role User | BUILDER, CLIENT, ADMIN | `user_2wu0EluO69r3MDAMSKy5ORgpz1Z` | triple-role@buildappswith.com | User with all three role types (super admin) |
| Subscriber | SUBSCRIBER | (to be added) | subscriber@buildappswith.com | Newsletter subscriber and potential future customer |

Note: All test user emails should use the buildappswith.com domain for consistency. The Clerk IDs in this document need to be updated once the users are properly created in the Clerk dashboard.
```

### 7. Create Comprehensive Production Launch Checklist

```markdown
# Production Launch Checklist

## Database Preparation
- [ ] Run migration to add SUBSCRIBER role and isDemo flag
- [ ] Sync real production users (Liam, John)
- [ ] Create demo builder accounts
- [ ] Verify all builder profiles have expertiseAreas
- [ ] Verify all builder profiles have session types

## Clerk Configuration
- [ ] Verify Liam's account has correct roles in Clerk
- [ ] Verify John's account has correct roles in Clerk
- [ ] Update webhook handler to support SUBSCRIBER role
- [ ] Test Clerk webhook synchronization

## API Testing
- [ ] Test marketplace builders endpoint
- [ ] Test single builder endpoint
- [ ] Verify demo builders appear correctly
- [ ] Verify featured sorting works properly
- [ ] Test with and without demo filters

## Frontend Verification
- [ ] Verify marketplace page displays builders
- [ ] Verify builder profiles are clickable
- [ ] Test booking flow with a builder
- [ ] Verify Liam's profile appears correctly
- [ ] Check that demo accounts have appropriate labeling

## User Management
- [ ] Create script to automatically clean test data from production
- [ ] Set up regular Clerk-Database sync job
- [ ] Document process for adding new demo accounts
- [ ] Test account creation and onboarding flow

## Security
- [ ] Verify public API endpoints are accessible without auth
- [ ] Test API rate limiting
- [ ] Verify cross-site request forgery protection
- [ ] Check content security policy headers
```

### 8. Implement UI Updates for Demo Accounts

```tsx
// components/marketplace/builder-card.tsx

// Add demo badge for demo accounts
import { Badge } from '@/components/ui/core/badge';

// In the component
{builder.isDemo && (
  <Badge variant="outline" className="ml-2 bg-yellow-100 text-yellow-800 border-yellow-300">
    Demo Account
  </Badge>
)}
```

### 9. Create Script for Clerk-DB User Synchronization

```javascript
// scripts/clerk-db-sync.js
const { PrismaClient } = require('@prisma/client');
const { clerkClient } = require('@clerk/clerk-sdk-node');

const prisma = new PrismaClient();

async function syncClerkUsers() {
  try {
    console.log('Starting Clerk-Database user synchronization...');
    
    // Get all users from Clerk
    const clerkUsers = await clerkClient.users.getUserList({
      limit: 100
    });
    
    console.log(`Found ${clerkUsers.length} users in Clerk`);
    
    // Process each Clerk user
    for (const clerkUser of clerkUsers) {
      const email = clerkUser.emailAddresses[0]?.emailAddress;
      if (!email) {
        console.log(`Skipping user without email: ${clerkUser.id}`);
        continue;
      }
      
      // Extract roles from metadata
      const roles = clerkUser.publicMetadata?.roles || ['CLIENT'];
      
      // Check if user exists in database
      let dbUser = await prisma.user.findFirst({
        where: { 
          OR: [
            { clerkId: clerkUser.id },
            { email }
          ]
        },
        include: { builderProfile: true, clientProfile: true, subscriberProfile: true }
      });
      
      if (dbUser) {
        console.log(`Updating existing user: ${email}`);
        
        // Update user data
        dbUser = await prisma.user.update({
          where: { id: dbUser.id },
          data: {
            clerkId: clerkUser.id,
            email,
            name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || dbUser.name,
            imageUrl: clerkUser.imageUrl || dbUser.imageUrl,
            roles,
            emailVerified: clerkUser.emailAddresses[0]?.verification?.status === 'verified' 
              ? new Date() 
              : dbUser.emailVerified
          },
          include: { builderProfile: true, clientProfile: true, subscriberProfile: true }
        });
      } else {
        console.log(`Creating new user: ${email}`);
        
        // Create new user
        dbUser = await prisma.user.create({
          data: {
            clerkId: clerkUser.id,
            email,
            name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
            imageUrl: clerkUser.imageUrl,
            roles,
            emailVerified: clerkUser.emailAddresses[0]?.verification?.status === 'verified' 
              ? new Date() 
              : null
          },
          include: { builderProfile: true, clientProfile: true, subscriberProfile: true }
        });
      }
      
      // Create necessary profiles based on roles
      await ensureUserProfiles(dbUser, roles);
    }
    
    // Check for DB users without valid Clerk IDs
    const orphanedUsers = await prisma.user.findMany({
      where: {
        clerkId: { not: null },
        NOT: { 
          clerkId: { in: clerkUsers.map(u => u.id) }
        },
        // Don't include demo users in this check
        isDemo: false
      }
    });
    
    console.log(`Found ${orphanedUsers.length} users with invalid Clerk IDs`);
    
    // Nullify invalid Clerk IDs
    if (orphanedUsers.length > 0) {
      for (const user of orphanedUsers) {
        console.log(`Nullifying invalid Clerk ID for ${user.email}`);
        
        await prisma.user.update({
          where: { id: user.id },
          data: { clerkId: null }
        });
      }
    }
    
    console.log('Clerk-Database user synchronization completed');
    
  } catch (error) {
    console.error('Error syncing Clerk users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function ensureUserProfiles(user, roles) {
  // Create builder profile if needed
  if (roles.includes('BUILDER') && !user.builderProfile) {
    console.log(`Creating builder profile for ${user.email}`);
    
    await prisma.builderProfile.create({
      data: {
        userId: user.id,
        searchable: true,
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
  
  // Create client profile if needed
  if (roles.includes('CLIENT') && !user.clientProfile) {
    console.log(`Creating client profile for ${user.email}`);
    
    await prisma.clientProfile.create({
      data: {
        userId: user.id
      }
    });
  }
  
  // Create subscriber profile if needed
  if (roles.includes('SUBSCRIBER') && !user.subscriberProfile) {
    console.log(`Creating subscriber profile for ${user.email}`);
    
    await prisma.subscriberProfile.create({
      data: {
        userId: user.id,
        interests: [],
        newsletterFrequency: 'weekly'
      }
    });
  }
}

// Run the sync
syncClerkUsers();
```

## Testing and Verification Plan

1. **Database Schema Updates**:
   - Run the migration to add SUBSCRIBER role and isDemo flag
   - Verify the schema has been updated

2. **Production User Sync**:
   - Run the sync-production-clerk-users.js script
   - Verify Liam and John are correctly set up in the database
   - Check that Clerk roles match database roles

3. **Demo Builder Creation**:
   - Run the create-demo-builders.js script
   - Verify all 5 demo builders are created with proper profiles
   - Check that they have session types and expertise areas

4. **API Testing**:
   - Test the marketplace API endpoint
   - Verify it returns both real and demo builders
   - Check that demo badges display correctly

5. **Frontend Verification**:
   - Verify Liam's profile appears on the marketplace
   - Check that booking functionality works with Liam's profile
   - Verify session types display correctly

6. **Continuous Maintenance**:
   - Set up scheduled job for clerk-db-sync.js
   - Monitor for any misalignments between Clerk and database
   - Document process for adding new users

## Subscriber Role Implementation

The SUBSCRIBER role addition provides several benefits:

1. **Sales Funnel Tracking**:
   - Captures potential customers at the newsletter stage
   - Allows for conversion tracking from subscriber to client
   - Enables targeted communications based on interest

2. **User Journey Support**:
   - Creates a logical progression: Subscriber → Client → Builder
   - Enables personalized onboarding based on user type
   - Supports re-engagement campaigns for inactive subscribers

3. **Marketing Automation**:
   - Subscriber profiles can store preferences and interests
   - Enables segmented email campaigns through integration
   - Provides metrics for marketing effectiveness

Implementation of this role sets up the platform for more sophisticated marketing and conversion optimization in the future.

## Conclusion

This comprehensive implementation plan addresses all requirements for the production launch:

1. Ensures real users (Liam and John) are properly configured in production
2. Creates 5 demo builder accounts for marketplace visibility
3. Adds SUBSCRIBER role to support the sales funnel
4. Updates documentation to reflect the current environment
5. Provides scripts for ongoing maintenance and synchronization
6. Implements proper handling of demo accounts in the UI

Following this plan will result in a properly functioning marketplace with visible builder profiles in production, including Liam's profile, which is a significant milestone for the platform launch.
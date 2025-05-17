# Test Data Seeding Strategy

## Overview

This document outlines the test data seeding strategy for the BuildAppsWith platform. It defines a structured approach to provide consistent, isolated test data across all testing environments.

**Date**: May 8, 2025  
**Branch**: feature/testing-enhancement  
**Status**: Approved

## Core Principles

1. **Deterministic Data**: Test data should be predictable and consistent across test runs
2. **Domain Isolation**: Different domains should have isolated test data
3. **Role-Based Testing**: Test data should support different user roles (client, builder, admin)
4. **Environmental Consistency**: Test data should be consistent across local, CI, and staging environments
5. **Fast Setup/Teardown**: Test data seeding should be performant

## Implementation Pattern

The test data seeding system is modular and allows selective seeding of specific domains:

```typescript
// scripts/seed-testing/index.ts
import { seedUsers } from './domains/users';
import { seedProfiles } from './domains/profiles';
import { seedSessionTypes } from './domains/scheduling';
import { seedBookings } from './domains/bookings';
import { seedPayments } from './domains/payments';

export async function seedTestData(options: {
  environment: 'test' | 'ci' | 'development';
  domains?: ('users' | 'profiles' | 'scheduling' | 'bookings' | 'payments')[];
  reset?: boolean;
}) {
  // Reset database if needed
  if (options.reset) {
    await resetDatabase(options.environment);
  }
  
  // Seed domains in order of dependencies
  const domains = options.domains || ['users', 'profiles', 'scheduling', 'bookings', 'payments'];
  
  if (domains.includes('users')) await seedUsers(options);
  if (domains.includes('profiles')) await seedProfiles(options);
  if (domains.includes('scheduling')) await seedSessionTypes(options);
  if (domains.includes('bookings')) await seedBookings(options);
  if (domains.includes('payments')) await seedPayments(options);
}
```

## Test Data Models

### User Model

```typescript
/**
 * Test user model representing application users
 */
export interface TestUser {
  /** Unique user identifier */
  id: string;
  /** User's email address - must be unique */
  email: string;
  /** User's display name */
  name: string;
  /** User's role in the system */
  role: 'CLIENT' | 'BUILDER' | 'ADMIN';
  /** Optional Clerk ID for authentication */
  clerkId?: string;
  /** Whether user's email is verified */
  verified: boolean;
}
```

### Profile Models

```typescript
/**
 * Builder profile model extending user
 */
export interface TestBuilderProfile {
  id: string;
  userId: string;
  bio: string;
  headline: string;
  hourlyRate: number;
  domains: string[];
  badges: string[];
  validationTier: number;
  featuredBuilder: boolean;
  availableForHire: boolean;
  portfolioItems: TestPortfolioItem[];
  sessionTypes: TestSessionType[];
  skills: TestBuilderSkill[];
}

/**
 * Client profile model
 */
export interface TestClientProfile {
  id: string;
  userId: string;
  companyName?: string;
  industry?: string;
  projectPreferences?: Record<string, any>;
}
```

### Session and Booking Models

```typescript
/**
 * Session type model for bookable sessions
 */
export interface TestSessionType {
  id: string;
  builderId: string;
  title: string;
  description: string;
  durationMinutes: number;
  price: number;
  currency: string;
  isActive: boolean;
  color?: string;
}

/**
 * Booking model for scheduled sessions
 */
export interface TestBooking {
  id: string;
  builderId: string;
  clientId: string;
  sessionTypeId?: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  paymentStatus: 'UNPAID' | 'PAID' | 'REFUNDED';
  amount?: number;
}
```

## Factory Functions

The system includes factory functions to generate test data with consistent defaults:

```typescript
export const testDataFactory = {
  user(overrides: Partial<TestUser> = {}): TestUser {
    return {
      id: uuidv4(),
      email: `test-${uuidv4().slice(0, 8)}@example.com`,
      name: `Test User ${uuidv4().slice(0, 4)}`,
      role: 'CLIENT',
      verified: true,
      ...overrides
    };
  },

  builderProfile(userId: string, overrides: Partial<TestBuilderProfile> = {}): TestBuilderProfile {
    // Default builder profile implementation
  },

  clientProfile(userId: string, overrides: Partial<TestClientProfile> = {}): TestClientProfile {
    // Default client profile implementation
  },

  sessionType(builderId: string, overrides: Partial<TestSessionType> = {}): TestSessionType {
    // Default session type implementation
  },

  booking(builderId: string, clientId: string, overrides: Partial<TestBooking> = {}): TestBooking {
    // Default booking implementation
  }
}
```

## Predefined Test Personas

The system provides standard test personas for consistent testing across the platform:

```typescript
// Predefined test personas for consistent testing
export const testPersonas = {
  client: {
    user: testDataFactory.user({
      id: 'test-client-id',
      email: 'test-client@buildappswith.com',
      name: 'Test Client',
      role: 'CLIENT',
      clerkId: 'clerk_test_client'
    }),
    profile: testDataFactory.clientProfile('test-client-id', {
      id: 'test-client-profile-id',
      companyName: 'Client Company Ltd',
      industry: 'Education'
    })
  },

  premiumClient: {
    user: testDataFactory.user({
      id: 'premium-client-id',
      email: 'premium-client@buildappswith.com',
      name: 'Premium Client',
      role: 'CLIENT',
      clerkId: 'clerk_premium_client'
    }),
    profile: testDataFactory.clientProfile('premium-client-id', {
      id: 'premium-client-profile-id',
      companyName: 'Premium Enterprises',
      industry: 'Finance'
    })
  },

  newBuilder: {
    // New builder persona details
  },

  establishedBuilder: {
    // Established builder persona details
  },

  admin: {
    // Admin persona details
  },

  multiRole: {
    // Multi-role user persona details
  }
};
```

## Scenario-Specific Seed Functions

The system includes specialized seed functions for specific test scenarios:

```typescript
export const scenarioSeeds = {
  /**
   * Seeds data for booking flow tests with multiple available time slots
   */
  async bookingFlow(prisma: PrismaClient): Promise<void> {
    // Booking-specific test data implementation
  },

  /**
   * Seeds data for marketplace testing with multiple builders
   */
  async marketplace(prisma: PrismaClient): Promise<void> {
    // Marketplace-specific test data implementation
  },

  /**
   * Seeds data for payment testing
   */
  async paymentTesting(prisma: PrismaClient): Promise<void> {
    // Payment-specific test data implementation
  }
};
```

## Integration with Testing Framework

The seed system integrates with the test framework's global setup:

```typescript
// __tests__/e2e/global-setup.ts
async function globalSetup(config: FullConfig): Promise<void> {
  // Database setup
  const prisma = new PrismaClient();

  try {
    // Reset database first
    await resetDatabase(prisma);

    // Seed with base test data
    await seedTestData(prisma);

    // Seed scenario-specific data based on environment variables
    if (process.env.SEED_BOOKING_FLOW) {
      await scenarioSeeds.bookingFlow(prisma);
    }

    if (process.env.SEED_MARKETPLACE) {
      await scenarioSeeds.marketplace(prisma);
    }

    if (process.env.SEED_PAYMENT_TESTING) {
      await scenarioSeeds.paymentTesting(prisma);
    }

    console.log('Test data seeding completed successfully');
  } catch (error) {
    console.error('Failed to seed test data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }

  // Continue with browser setup for E2E tests
  // ...
}
```

## Usage Patterns

### Standard Test Setup

For most tests, use the global setup to seed standard data:

```typescript
// Configuration in playwright.config.ts
export default defineConfig({
  // ...
  globalSetup: require.resolve('./__tests__/e2e/global-setup'),
  // ...
});
```

### Custom Test Data

For tests requiring custom data:

```typescript
test('displays builder with specific skills', async ({ page }) => {
  // Seed custom data for this test
  const prisma = new PrismaClient();
  
  try {
    // Create custom builder with specific skills
    await scenarioSeeds.customBuilder(prisma, {
      skills: ['React', 'TypeScript', 'AI Integration']
    });
    
    // Test with custom data
    await page.goto('/marketplace');
    // ...
  } finally {
    await prisma.$disconnect();
  }
});
```

## Benefits

1. **Consistency**: Ensures consistent test data across all test runs
2. **Isolation**: Each test can run in isolation without interference
3. **Maintainability**: Centralizes test data management
4. **Extensibility**: Easily add new domains or scenarios
5. **Performance**: Optimized for fast test execution

## Implementation Timeline

1. **Phase 1**: Base seed data models and factory functions (Completed)
2. **Phase 2**: Scenario-specific seed functions (Completed)
3. **Phase 3**: Integration with E2E testing global setup (Completed)
4. **Phase 4**: CI pipeline integration (In Progress)
5. **Phase 5**: Visual testing integration (Planned)
/**
 * E2E Test Data Helper Utilities
 * 
 * Provides helper functions for creating and managing test data
 * for E2E tests. These utilities make it easier to set up specific
 * test scenarios with the right data.
 */
import { Page } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import { createE2EDataFactory, E2EDataFactory } from './database-isolation';
import { testClerkIds, TestPersona } from '../../utils/models';

/**
 * Authentication data for different test users
 */
export interface TestUserAuth {
  email: string;
  password: string;
  name: string;
  id: string;
  clerkId?: string;
}

/**
 * Get auth credentials for a specific test persona
 */
export function getTestUserAuth(persona: TestPersona): TestUserAuth {
  switch (persona) {
    case TestPersona.CLIENT_BASIC:
      return {
        email: 'basic-client@example.com',
        password: 'Password123!', // For E2E testing only
        name: 'Basic Client',
        id: 'client-basic-id',
        clerkId: testClerkIds.clientOne
      };
      
    case TestPersona.CLIENT_PREMIUM:
      return {
        email: 'premium-client@example.com',
        password: 'Password123!',
        name: 'Premium Client',
        id: 'client-premium-id',
        clerkId: testClerkIds.premiumOne
      };
      
    case TestPersona.BUILDER_NEW:
      return {
        email: 'new-builder@example.com',
        password: 'Password123!',
        name: 'New Builder',
        id: 'builder-new-id',
        clerkId: testClerkIds.newBuilder
      };
      
    case TestPersona.BUILDER_EXPERIENCED:
      return {
        email: 'experienced-builder@example.com',
        password: 'Password123!',
        name: 'Experienced Builder',
        id: 'builder-exp-id',
        clerkId: testClerkIds.establishedBuilder
      };
      
    case TestPersona.ADMIN_SUPER:
      return {
        email: 'admin@example.com',
        password: 'Password123!',
        name: 'Super Admin',
        id: 'admin-super-id',
        clerkId: testClerkIds.adminOne
      };
      
    default:
      throw new Error(`No test credentials defined for persona: ${persona}`);
  }
}

/**
 * Test builder data with session types
 */
export interface TestBuilderData {
  user: {
    id: string;
    name: string;
    email: string;
    clerkId?: string;
  };
  profile: {
    id: string;
    slug?: string;
    bio: string;
    title: string;
    hourlyRate: number;
    skills: string[];
  };
  sessionTypes: Array<{
    id: string;
    name: string;
    description: string;
    duration: number;
    price: number;
  }>;
}

/**
 * Create common test builders with standardized data
 * 
 * @param factory E2E data factory instance
 * @returns Collection of predefined test builders
 */
export async function createTestBuilders(factory: E2EDataFactory): Promise<Record<string, TestBuilderData>> {
  // Create frontend developer builder
  const frontendBuilder = await factory.createBuilder(2);
  await factory.prisma.profile.update({
    where: { id: frontendBuilder.profile.id },
    data: {
      bio: "Frontend specialist with 5+ years of experience in React and modern JS frameworks.",
      title: "Senior Frontend Developer",
      hourlyRate: 100,
      skills: ["React", "TypeScript", "CSS", "NextJS", "UI Design"]
    }
  });
  
  // Update session types
  await factory.prisma.sessionType.update({
    where: { id: frontendBuilder.sessionTypes[0].id },
    data: {
      name: "Frontend Consultation",
      description: "React architecture review and optimization advice",
      duration: 60,
      price: 12000 // $120.00
    }
  });
  
  await factory.prisma.sessionType.update({
    where: { id: frontendBuilder.sessionTypes[1].id },
    data: {
      name: "Code Review Session",
      description: "In-depth code review with actionable feedback",
      duration: 30,
      price: 7500 // $75.00
    }
  });
  
  // Create backend developer builder
  const backendBuilder = await factory.createBuilder(2);
  await factory.prisma.profile.update({
    where: { id: backendBuilder.profile.id },
    data: {
      bio: "Backend architect specializing in scalable API design and database optimization.",
      title: "Backend Systems Architect",
      hourlyRate: 120,
      skills: ["Node.js", "PostgreSQL", "AWS", "Microservices", "API Design"]
    }
  });
  
  // Update session types
  await factory.prisma.sessionType.update({
    where: { id: backendBuilder.sessionTypes[0].id },
    data: {
      name: "API Architecture Review",
      description: "Evaluate and improve your API design",
      duration: 60,
      price: 15000 // $150.00
    }
  });
  
  await factory.prisma.sessionType.update({
    where: { id: backendBuilder.sessionTypes[1].id },
    data: {
      name: "Database Optimization",
      description: "Analyze and optimize your database queries",
      duration: 45,
      price: 12000 // $120.00
    }
  });
  
  // Create fullstack developer builder
  const fullstackBuilder = await factory.createBuilder(3);
  await factory.prisma.profile.update({
    where: { id: fullstackBuilder.profile.id },
    data: {
      bio: "Full-stack developer with expertise in modern web development stack.",
      title: "Full-Stack Web Developer",
      hourlyRate: 90,
      skills: ["React", "Node.js", "MongoDB", "Express", "TypeScript", "AWS"]
    }
  });
  
  // Update session types
  await factory.prisma.sessionType.update({
    where: { id: fullstackBuilder.sessionTypes[0].id },
    data: {
      name: "Project Setup & Architecture",
      description: "Get your project started with the right foundation",
      duration: 90,
      price: 13500 // $135.00
    }
  });
  
  await factory.prisma.sessionType.update({
    where: { id: fullstackBuilder.sessionTypes[1].id },
    data: {
      name: "Technical Interview Prep",
      description: "Mock interviews and coding exercises",
      duration: 60,
      price: 9000 // $90.00
    }
  });
  
  await factory.prisma.sessionType.update({
    where: { id: fullstackBuilder.sessionTypes[2].id },
    data: {
      name: "Quick Tech Advice",
      description: "Rapid problem-solving session",
      duration: 30,
      price: 5000 // $50.00
    }
  });
  
  return {
    frontend: formatBuilderData(frontendBuilder),
    backend: formatBuilderData(backendBuilder),
    fullstack: formatBuilderData(fullstackBuilder)
  };
}

/**
 * Format builder data for easier test usage
 */
function formatBuilderData(builder: any): TestBuilderData {
  return {
    user: {
      id: builder.user.id,
      name: builder.user.name,
      email: builder.user.email,
      clerkId: builder.user.clerkId
    },
    profile: {
      id: builder.profile.id,
      slug: builder.user.name.toLowerCase().replace(/\s+/g, '-'),
      bio: builder.profile.bio,
      title: builder.profile.title,
      hourlyRate: builder.profile.hourlyRate,
      skills: builder.profile.skills
    },
    sessionTypes: builder.sessionTypes.map((st: any) => ({
      id: st.id,
      name: st.name,
      description: st.description,
      duration: st.duration,
      price: st.price
    }))
  };
}

/**
 * Create test booking with all related entities
 * 
 * @param factory E2E data factory
 * @param options Configuration options
 * @returns Complete booking scenario with all entities
 */
export async function createTestBookingScenario(
  factory: E2EDataFactory,
  options: {
    status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
    paymentStatus?: 'PENDING' | 'PAID' | 'REFUNDED';
    startTime?: Date;
    withPayment?: boolean;
  } = {}
) {
  const scenario = await factory.createBookingScenario({
    status: options.status,
    paymentStatus: options.paymentStatus,
    withPayment: options.withPayment
  });
  
  // Customize booking time if requested
  if (options.startTime) {
    const endTime = new Date(options.startTime);
    endTime.setMinutes(endTime.getMinutes() + scenario.sessionType.duration);
    
    await factory.prisma.booking.update({
      where: { id: scenario.booking.id },
      data: {
        startTime: options.startTime,
        endTime: endTime
      }
    });
    
    // Refresh booking data
    scenario.booking = await factory.prisma.booking.findUnique({
      where: { id: scenario.booking.id }
    }) as any;
  }
  
  return scenario;
}

/**
 * Login as a specific test user
 * 
 * @param page Playwright page
 * @param persona Test persona to login as
 */
export async function loginAsTestUser(page: Page, persona: TestPersona): Promise<void> {
  const auth = getTestUserAuth(persona);
  
  // Navigate to login
  await page.goto('/login');
  
  // Fill login form
  await page.fill('input[type="email"]', auth.email);
  await page.fill('input[type="password"]', auth.password);
  
  // Submit form
  await page.click('button[type="submit"]');
  
  // Wait for navigation to dashboard or redirect
  await Promise.race([
    page.waitForURL(/.*\/(dashboard|profile|builder|admin)/),
    page.waitForTimeout(5000) // Fallback timeout
  ]);
  
  // Verify login was successful
  const isLoggedIn = await page.isVisible('[data-testid="user-menu"]');
  if (!isLoggedIn) {
    throw new Error(`Failed to login as ${persona}`);
  }
}

/**
 * Setup test scenario with database and authentication
 * 
 * @param page Playwright page
 * @param prisma Prisma client
 * @param persona Test persona to authenticate as
 * @returns Test data factory for creating test entities
 */
export async function setupTestScenario(
  page: Page, 
  prisma: PrismaClient, 
  persona?: TestPersona
): Promise<E2EDataFactory> {
  // Create test data factory
  const factory = createE2EDataFactory(prisma);
  
  // Login if persona specified
  if (persona) {
    await loginAsTestUser(page, persona);
  }
  
  return factory;
}

/**
 * Usage examples:
 * 
 * ```typescript
 * // Example 1: Create test booking scenario
 * test('complete booking flow', async ({ page }) => {
 *   await withE2EIsolation(async (db) => {
 *     const factory = createE2EDataFactory(db);
 *     
 *     // Create standardized test builders
 *     const builders = await createTestBuilders(factory);
 *     
 *     // Create a pending booking
 *     const bookingScenario = await createTestBookingScenario(factory, {
 *       status: 'PENDING',
 *       withPayment: false
 *     });
 *     
 *     // Login as the client
 *     await loginAsTestUser(page, TestPersona.CLIENT_BASIC);
 *     
 *     // Continue with test using the created entities
 *     await page.goto(`/booking/confirmation?bookingId=${bookingScenario.booking.id}`);
 *     // ... rest of test
 *   });
 * });
 * ```
 */
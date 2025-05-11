/**
 * Database Isolation Utilities for E2E Tests
 * 
 * Provides mechanisms for database isolation and seeding in E2E tests.
 */
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { resetTestDatabase } from '../../utils/database/reset';
import { seedTestData } from '../../utils/seed/base-seed';
import { TestPersona } from '../../utils/models';

/**
 * Options for E2E test database setup
 */
export interface E2EDbOptions {
  /** Use isolated schema for this test run */
  useIsolatedSchema?: boolean;
  
  /** Test run identifier */
  testRunId?: string;
  
  /** Reset database before test */
  resetBeforeTest?: boolean;
  
  /** Skip seeding test data */
  skipSeed?: boolean;
  
  /** Personas to include in seeding */
  personas?: TestPersona[];
  
  /** Additional seed domains */
  seedDomains?: ('users' | 'profiles' | 'scheduling' | 'bookings' | 'payments')[];
}

// Store database clients to reuse connections
const dbClients: Record<string, PrismaClient> = {};

// Default options
const defaultOptions: E2EDbOptions = {
  useIsolatedSchema: true,
  resetBeforeTest: true,
  skipSeed: false,
  personas: [
    TestPersona.CLIENT_BASIC,
    TestPersona.CLIENT_PREMIUM,
    TestPersona.BUILDER_NEW,
    TestPersona.BUILDER_EXPERIENCED,
    TestPersona.ADMIN_SUPER
  ],
  seedDomains: ['users', 'profiles', 'scheduling', 'bookings', 'payments']
};

/**
 * Get a database client for E2E tests
 * This creates an isolated schema if requested or uses the test schema
 * 
 * @param options Configuration options
 * @returns Configured PrismaClient
 */
export async function getE2EDatabase(options: E2EDbOptions = {}): Promise<PrismaClient> {
  const opts = { ...defaultOptions, ...options };
  const testRunId = opts.testRunId || uuidv4();
  
  // If isolated schema requested, create/reuse a dedicated client
  if (opts.useIsolatedSchema) {
    if (!dbClients[testRunId]) {
      // Create isolated schema name
      const schemaName = `e2e_${testRunId.replace(/[^a-zA-Z0-9]/g, '_')}`;
      
      // Get the database URL
      const baseUrl = process.env.DATABASE_URL || process.env.TEST_DATABASE_URL;
      if (!baseUrl) {
        throw new Error('DATABASE_URL or TEST_DATABASE_URL environment variable must be set');
      }
      
      // Create a base client to set up the schema
      const basePrisma = new PrismaClient();
      
      try {
        // Create schema if it doesn't exist
        await basePrisma.$executeRawUnsafe(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);
        
        // Create client with isolated schema
        dbClients[testRunId] = new PrismaClient({
          datasources: {
            db: {
              url: `${baseUrl}?schema=${schemaName}`
            }
          }
        });
        
        console.log(`Created isolated database schema "${schemaName}" for E2E tests`);
      } finally {
        await basePrisma.$disconnect();
      }
    }
    
    return dbClients[testRunId];
  }
  
  // Otherwise use a shared test client
  if (!dbClients['test']) {
    dbClients['test'] = new PrismaClient();
  }
  
  return dbClients['test'];
}

/**
 * Setup database for E2E testing
 * Resets and seeds the database as needed
 * 
 * @param options Configuration options
 * @returns Configured PrismaClient ready for testing
 */
export async function setupE2EDatabase(options: E2EDbOptions = {}): Promise<PrismaClient> {
  const opts = { ...defaultOptions, ...options };
  const prisma = await getE2EDatabase(opts);
  
  try {
    // Reset database if needed
    if (opts.resetBeforeTest) {
      await resetTestDatabase(prisma);
    }
    
    // Seed test data if not skipped
    if (!opts.skipSeed) {
      await seedTestData({
        environment: 'test',
        domains: opts.seedDomains,
        reset: false, // Already reset above if needed
        personas: opts.personas
      });
    }
    
    return prisma;
  } catch (error) {
    console.error('Failed to setup E2E database:', error);
    throw error;
  }
}

/**
 * Run a test with database isolation
 * Creates temporary tables that are rolled back after the test
 * 
 * @param callback Test function to execute with isolated database
 * @returns Result of the callback function
 */
export async function withE2EIsolation<T>(
  callback: (db: PrismaClient) => Promise<T>,
  options: E2EDbOptions = {}
): Promise<T> {
  const prisma = await setupE2EDatabase(options);
  
  try {
    // Begin transaction
    await prisma.$executeRaw`BEGIN`;
    
    // Set transaction to serializable for complete isolation
    await prisma.$executeRaw`SET TRANSACTION ISOLATION LEVEL SERIALIZABLE`;
    
    // Execute test with transaction context
    const result = await callback(prisma);
    
    // Always rollback after test
    await prisma.$executeRaw`ROLLBACK`;
    
    return result;
  } catch (error) {
    // Ensure rollback on error
    try {
      await prisma.$executeRaw`ROLLBACK`;
    } catch (rollbackError) {
      console.error('Failed to rollback transaction:', rollbackError);
    }
    
    throw error;
  }
}

/**
 * Clean up all database resources for E2E tests
 * 
 * @param testRunId Test run identifier to clean up
 */
export async function cleanupE2EDatabase(testRunId?: string): Promise<void> {
  // If testRunId provided, clean up that specific schema
  if (testRunId && dbClients[testRunId]) {
    const prisma = dbClients[testRunId];
    const schemaName = `e2e_${testRunId.replace(/[^a-zA-Z0-9]/g, '_')}`;
    
    try {
      // Drop the schema
      await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schemaName}" CASCADE`);
      console.log(`Cleaned up isolated schema "${schemaName}"`);
    } finally {
      await prisma.$disconnect();
      delete dbClients[testRunId];
    }
    
    return;
  }
  
  // Otherwise clean up all schemas and clients
  const basePrisma = new PrismaClient();
  
  try {
    // Find all e2e schemas
    const schemas = await basePrisma.$queryRaw<Array<{ nspname: string }>>`
      SELECT nspname FROM pg_namespace 
      WHERE nspname LIKE 'e2e_%'
    `;
    
    // Drop each schema
    for (const { nspname } of schemas) {
      await basePrisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${nspname}" CASCADE`);
      console.log(`Cleaned up isolated schema "${nspname}"`);
    }
    
    console.log(`Cleaned up ${schemas.length} isolated schemas`);
  } catch (error) {
    console.error('Failed to clean up E2E database resources:', error);
    throw error;
  } finally {
    await basePrisma.$disconnect();
    
    // Disconnect all clients
    for (const id of Object.keys(dbClients)) {
      await dbClients[id].$disconnect();
      delete dbClients[id];
    }
  }
}

/**
 * Create test entities helper
 * 
 * Creates test data directly within an E2E test with proper relationship links
 */
export class E2EDataFactory {
  constructor(private prisma: PrismaClient) {}
  
  /**
   * Create a test user
   */
  async createUser(data: {
    name?: string;
    email?: string;
    role?: 'CLIENT' | 'BUILDER' | 'ADMIN';
    verified?: boolean;
  } = {}) {
    const userId = uuidv4();
    const role = data.role || 'CLIENT';
    const testNumber = Math.floor(Math.random() * 10000);
    
    const user = await this.prisma.user.create({
      data: {
        id: userId,
        name: data.name || `Test ${role} ${testNumber}`,
        email: data.email || `test-${role.toLowerCase()}-${testNumber}@example.com`,
        clerkId: `user_test_${testNumber}`,
        role: role,
        emailVerified: data.verified !== false ? new Date() : null
      }
    });
    
    return user;
  }
  
  /**
   * Create a profile for a user
   */
  async createProfile(data: {
    userId: string;
    bio?: string;
    title?: string;
    skills?: string[];
    hourlyRate?: number;
  }) {
    const profileId = uuidv4();
    
    const profile = await this.prisma.profile.create({
      data: {
        id: profileId,
        userId: data.userId,
        bio: data.bio || 'Test bio content',
        title: data.title || 'Test title',
        skills: data.skills || [],
        hourlyRate: data.hourlyRate,
        socialLinks: {
          twitter: 'https://twitter.com/test',
          github: 'https://github.com/test'
        }
      }
    });
    
    return profile;
  }
  
  /**
   * Create a session type for a builder
   */
  async createSessionType(data: {
    builderId: string;
    name?: string;
    description?: string;
    duration?: number;
    price?: number;
    isActive?: boolean;
  }) {
    const sessionTypeId = uuidv4();
    
    const sessionType = await this.prisma.sessionType.create({
      data: {
        id: sessionTypeId,
        builderId: data.builderId,
        name: data.name || 'Test Session Type',
        description: data.description || 'Test session type description',
        duration: data.duration || 60,
        price: data.price || 100,
        isActive: data.isActive !== false
      }
    });
    
    return sessionType;
  }
  
  /**
   * Create a booking between a client and builder
   */
  async createBooking(data: {
    clientId: string;
    builderId: string;
    sessionTypeId: string;
    startTime?: Date;
    endTime?: Date;
    status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
    paymentStatus?: 'PENDING' | 'PAID' | 'REFUNDED';
  }) {
    const bookingId = uuidv4();
    const now = new Date();
    
    // Default to a booking tomorrow
    const startTime = data.startTime || new Date(now.setDate(now.getDate() + 1));
    startTime.setHours(10, 0, 0, 0); // 10 AM
    
    const endTime = data.endTime || new Date(startTime);
    endTime.setHours(11, 0, 0, 0); // 1 hour session
    
    const booking = await this.prisma.booking.create({
      data: {
        id: bookingId,
        clientId: data.clientId,
        builderId: data.builderId,
        sessionTypeId: data.sessionTypeId,
        startTime: startTime,
        endTime: endTime,
        status: data.status || 'PENDING',
        paymentStatus: data.paymentStatus || 'PENDING',
        calendlyEventUri: `test-calendly-event-${bookingId}`,
        calendlyInviteeUri: `test-calendly-invitee-${bookingId}`
      }
    });
    
    return booking;
  }
  
  /**
   * Create a payment for a booking
   */
  async createPayment(data: {
    bookingId: string;
    amount?: number;
    currency?: string;
    status?: 'PENDING' | 'SUCCEEDED' | 'FAILED' | 'REFUNDED';
  }) {
    const paymentId = uuidv4();
    
    const payment = await this.prisma.payment.create({
      data: {
        id: paymentId,
        bookingId: data.bookingId,
        amount: data.amount || 10000, // 100 USD by default
        currency: data.currency || 'usd',
        status: data.status || 'PENDING',
        stripePaymentIntentId: `pi_test_${paymentId}`,
        stripeCustomerId: `cus_test_${paymentId}`,
        createdAt: new Date()
      }
    });
    
    return payment;
  }
  
  /**
   * Create a complete user with profile
   */
  async createCompleteUser(role: 'CLIENT' | 'BUILDER' | 'ADMIN' = 'CLIENT') {
    const user = await this.createUser({ role });
    const profile = await this.createProfile({ userId: user.id });
    
    return { user, profile };
  }
  
  /**
   * Create a complete builder with profile and session types
   */
  async createBuilder(sessionTypeCount: number = 3) {
    const { user, profile } = await this.createCompleteUser('BUILDER');
    const sessionTypes = [];
    
    for (let i = 0; i < sessionTypeCount; i++) {
      sessionTypes.push(
        await this.createSessionType({
          builderId: user.id,
          name: `Session Type ${i + 1}`,
          duration: [30, 60, 90][i % 3],
          price: [5000, 10000, 15000][i % 3]
        })
      );
    }
    
    return { user, profile, sessionTypes };
  }
  
  /**
   * Create a complete booking scenario with client, builder, session type, and booking
   */
  async createBookingScenario(options: {
    withPayment?: boolean;
    status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
    paymentStatus?: 'PENDING' | 'PAID' | 'REFUNDED';
  } = {}) {
    // Create client
    const client = await this.createCompleteUser('CLIENT');
    
    // Create builder with session type
    const builder = await this.createBuilder(1);
    const sessionType = builder.sessionTypes[0];
    
    // Create booking
    const booking = await this.createBooking({
      clientId: client.user.id,
      builderId: builder.user.id,
      sessionTypeId: sessionType.id,
      status: options.status || 'PENDING',
      paymentStatus: options.paymentStatus || 'PENDING'
    });
    
    // Create payment if requested
    let payment = null;
    if (options.withPayment) {
      payment = await this.createPayment({
        bookingId: booking.id,
        amount: sessionType.price,
        status: options.paymentStatus === 'PAID' ? 'SUCCEEDED' : 
               options.paymentStatus === 'REFUNDED' ? 'REFUNDED' : 'PENDING'
      });
    }
    
    return {
      client,
      builder,
      sessionType,
      booking,
      payment
    };
  }
}

/**
 * Create a test data factory instance
 */
export function createE2EDataFactory(prisma: PrismaClient): E2EDataFactory {
  return new E2EDataFactory(prisma);
}

/**
 * Usage examples:
 * 
 * ```typescript
 * // Example 1: Use with isolation
 * test('booking flow test', async ({ page }) => {
 *   await withE2EIsolation(async (db) => {
 *     const factory = createE2EDataFactory(db);
 *     
 *     // Create test booking scenario
 *     const { client, builder, sessionType } = await factory.createBookingScenario();
 *     
 *     // Use these test entities in your test
 *     await page.goto(`/profile/${builder.user.id}`);
 *     // ... rest of test
 *   });
 * });
 * 
 * // Example 2: Combine with feature flags
 * test('marketplace feature test', async ({ page }) => {
 *   await withE2EIsolation(async (db) => {
 *     // Set up test data
 *     const factory = createE2EDataFactory(db);
 *     await factory.createBuilder();
 *     
 *     // Run test with specific feature flag
 *     await withFeatureFlag(page, 'UseDynamicMarketplace', true, async () => {
 *       await page.goto('/marketplace');
 *       // ... test assertions
 *     });
 *   });
 * });
 * ```
 */
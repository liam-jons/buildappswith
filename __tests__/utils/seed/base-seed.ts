/**
 * Base seed implementation for test data
 */
import { PrismaClient } from '@prisma/client';
import { 
  TestUser, 
  TestProfile, 
  TestSessionType, 
  TestBooking, 
  TestPayment,
  TestPersona
} from '../models';
import { 
  createUser, 
  createProfile, 
  createSessionType, 
  createBooking, 
  createPayment,
  createPersona
} from '../factory';
import { resetTestDatabase } from '../database';

/**
 * Options for seeding test data
 */
export interface SeedOptions {
  /** Target environment for seeding */
  environment: 'test' | 'ci' | 'development';
  
  /** Specific domains to seed */
  domains?: ('users' | 'profiles' | 'scheduling' | 'bookings' | 'payments')[];
  
  /** Whether to reset the database before seeding */
  reset?: boolean;
  
  /** Count of each entity to create */
  count?: {
    users?: number;
    profiles?: number;
    sessionTypes?: number;
    bookings?: number;
    payments?: number;
  };
  
  /** Specific personas to create */
  personas?: TestPersona[];
}

/**
 * Default seed options
 */
const defaultSeedOptions: SeedOptions = {
  environment: 'test',
  domains: ['users', 'profiles', 'scheduling', 'bookings', 'payments'],
  reset: true,
  count: {
    users: 5,
    profiles: 5,
    sessionTypes: 3,
    bookings: 2,
    payments: 2
  },
  personas: [
    TestPersona.CLIENT_BASIC,
    TestPersona.BUILDER_EXPERIENCED,
    TestPersona.ADMIN_SUPER
  ]
};

/**
 * Seed users into the database
 */
async function seedUsers(
  prisma: PrismaClient, 
  options: SeedOptions,
  createdEntities: { 
    users: TestUser[];
    builderIds: string[];
    clientIds: string[];
    adminIds: string[];
  }
): Promise<void> {
  console.log(`Seeding users for ${options.environment}...`);
  
  // Create standard count of users
  const count = options.count?.users || defaultSeedOptions.count!.users!;
  
  for (let i = 0; i < count; i++) {
    // Alternate between client and builder roles
    const role = i % 3 === 0 ? 'ADMIN' : (i % 2 === 0 ? 'BUILDER' : 'CLIENT');
    
    const testUser = createUser({ role });
    
    const user = await prisma.user.create({
      data: {
        id: testUser.id,
        name: testUser.name,
        email: testUser.email,
        clerkId: testUser.clerkId || `user_${Math.random().toString(36).substring(2, 15)}`,
        role: testUser.role,
        emailVerified: testUser.verified ? new Date() : null
      }
    });
    
    createdEntities.users.push(testUser);
    
    // Track IDs by role for later use
    if (user.role === 'BUILDER') {
      createdEntities.builderIds.push(user.id);
    } else if (user.role === 'CLIENT') {
      createdEntities.clientIds.push(user.id);
    } else if (user.role === 'ADMIN') {
      createdEntities.adminIds.push(user.id);
    }
  }
  
  // Create persona users if specified
  if (options.personas && options.personas.length > 0) {
    for (const persona of options.personas) {
      const { user: testUser } = createPersona(persona);
      
      const user = await prisma.user.create({
        data: {
          id: testUser.id,
          name: testUser.name,
          email: testUser.email,
          clerkId: testUser.clerkId || `user_${Math.random().toString(36).substring(2, 15)}`,
          role: testUser.role,
          emailVerified: testUser.verified ? new Date() : null
        }
      });
      
      createdEntities.users.push(testUser);
      
      // Track IDs by role for later use
      if (user.role === 'BUILDER') {
        createdEntities.builderIds.push(user.id);
      } else if (user.role === 'CLIENT') {
        createdEntities.clientIds.push(user.id);
      } else if (user.role === 'ADMIN') {
        createdEntities.adminIds.push(user.id);
      }
    }
  }
  
  console.log(`✅ Seeded ${createdEntities.users.length} users`);
}

/**
 * Seed profiles into the database
 */
async function seedProfiles(
  prisma: PrismaClient,
  options: SeedOptions,
  createdEntities: {
    users: TestUser[];
    profiles: TestProfile[];
  }
): Promise<void> {
  console.log(`Seeding profiles for ${options.environment}...`);
  
  // Create profiles for all users
  for (const user of createdEntities.users) {
    const testProfile = createProfile({
      userId: user.id,
      // Customize by role
      hourlyRate: user.role === 'BUILDER' ? 100 : undefined,
      skills: user.role === 'BUILDER' ? ['JavaScript', 'React', 'Node.js'] : undefined
    });
    
    await prisma.profile.create({
      data: {
        id: testProfile.id,
        userId: testProfile.userId,
        bio: testProfile.bio,
        title: testProfile.title,
        skills: testProfile.skills,
        availability: testProfile.availability,
        hourlyRate: testProfile.hourlyRate,
        socialLinks: testProfile.socialLinks as any
      }
    });
    
    createdEntities.profiles.push(testProfile);
  }
  
  // Create persona profiles if specified
  if (options.personas && options.personas.length > 0) {
    for (const persona of options.personas) {
      const { user: testUser, profile: testProfile } = createPersona(persona);
      
      await prisma.profile.create({
        data: {
          id: testProfile.id,
          userId: testUser.id,
          bio: testProfile.bio,
          title: testProfile.title,
          skills: testProfile.skills,
          availability: testProfile.availability,
          hourlyRate: testProfile.hourlyRate,
          socialLinks: testProfile.socialLinks as any
        }
      });
      
      createdEntities.profiles.push(testProfile);
    }
  }
  
  console.log(`✅ Seeded ${createdEntities.profiles.length} profiles`);
}

/**
 * Seed session types into the database
 */
async function seedSessionTypes(
  prisma: PrismaClient,
  options: SeedOptions,
  createdEntities: {
    builderIds: string[];
    sessionTypes: TestSessionType[];
  }
): Promise<void> {
  if (!options.domains?.includes('scheduling')) return;
  
  console.log(`Seeding session types for ${options.environment}...`);
  
  // Create session types for each builder
  for (const builderId of createdEntities.builderIds) {
    // Create multiple session types per builder
    const count = options.count?.sessionTypes || defaultSeedOptions.count!.sessionTypes!;
    
    for (let i = 0; i < count; i++) {
      const testSessionType = createSessionType({
        builderId,
        name: `Session Type ${i + 1}`,
        duration: [30, 60, 90][i % 3], // Alternate durations
        price: [50, 100, 150][i % 3] // Alternate prices
      });
      
      await prisma.sessionType.create({
        data: {
          id: testSessionType.id,
          builderId: testSessionType.builderId,
          name: testSessionType.name,
          description: testSessionType.description,
          duration: testSessionType.duration,
          price: testSessionType.price,
          isActive: testSessionType.isActive
        }
      });
      
      createdEntities.sessionTypes.push(testSessionType);
    }
  }
  
  console.log(`✅ Seeded ${createdEntities.sessionTypes.length} session types`);
}

/**
 * Seed bookings into the database
 */
async function seedBookings(
  prisma: PrismaClient,
  options: SeedOptions,
  createdEntities: {
    clientIds: string[];
    builderIds: string[];
    sessionTypes: TestSessionType[];
    bookings: TestBooking[];
  }
): Promise<void> {
  if (!options.domains?.includes('bookings')) return;
  
  console.log(`Seeding bookings for ${options.environment}...`);
  
  // Need clients, builders, and session types to create bookings
  if (
    createdEntities.clientIds.length === 0 ||
    createdEntities.builderIds.length === 0 ||
    createdEntities.sessionTypes.length === 0
  ) {
    console.warn('Cannot seed bookings: missing required entities');
    return;
  }
  
  // Create bookings for each client with various builders
  for (const clientId of createdEntities.clientIds) {
    // Get random builder and session type
    const randomBuilderIdx = Math.floor(Math.random() * createdEntities.builderIds.length);
    const builderId = createdEntities.builderIds[randomBuilderIdx];
    
    // Find session types for this builder
    const builderSessionTypes = createdEntities.sessionTypes.filter(
      st => st.builderId === builderId
    );
    
    if (builderSessionTypes.length === 0) continue;
    
    // Create bookings
    const count = options.count?.bookings || defaultSeedOptions.count!.bookings!;
    
    for (let i = 0; i < count; i++) {
      const randomSessionTypeIdx = Math.floor(Math.random() * builderSessionTypes.length);
      const sessionType = builderSessionTypes[randomSessionTypeIdx];
      
      // Create staggered booking dates
      const startTime = new Date();
      startTime.setDate(startTime.getDate() + i + 1); // Future dates
      startTime.setHours(9 + i, 0, 0); // Different times
      
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + sessionType.duration);
      
      const testBooking = createBooking({
        clientId,
        builderId,
        sessionTypeId: sessionType.id,
        startTime,
        endTime,
        status: ['PENDING', 'CONFIRMED', 'COMPLETED'][i % 3] as any
      });
      
      await prisma.booking.create({
        data: {
          id: testBooking.id,
          clientId: testBooking.clientId,
          builderId: testBooking.builderId,
          sessionTypeId: testBooking.sessionTypeId,
          startTime: testBooking.startTime,
          endTime: testBooking.endTime,
          status: testBooking.status,
          paymentStatus: testBooking.paymentStatus
        }
      });
      
      createdEntities.bookings.push(testBooking);
    }
  }
  
  console.log(`✅ Seeded ${createdEntities.bookings.length} bookings`);
}

/**
 * Seed payments into the database
 */
async function seedPayments(
  prisma: PrismaClient,
  options: SeedOptions,
  createdEntities: {
    bookings: TestBooking[];
    payments: TestPayment[];
  }
): Promise<void> {
  if (!options.domains?.includes('payments')) return;
  
  console.log(`Seeding payments for ${options.environment}...`);
  
  // Need bookings to create payments
  if (createdEntities.bookings.length === 0) {
    console.warn('Cannot seed payments: no bookings available');
    return;
  }
  
  // Create payments for confirmed and completed bookings
  const eligibleBookings = createdEntities.bookings.filter(
    b => b.status === 'CONFIRMED' || b.status === 'COMPLETED'
  );
  
  for (const booking of eligibleBookings) {
    const testPayment = createPayment({
      bookingId: booking.id,
      status: booking.status === 'COMPLETED' ? 'SUCCEEDED' : 'PENDING'
    });
    
    await prisma.payment.create({
      data: {
        id: testPayment.id,
        bookingId: testPayment.bookingId,
        amount: testPayment.amount,
        currency: testPayment.currency,
        status: testPayment.status,
        stripePaymentIntentId: testPayment.stripePaymentIntentId,
        stripeCustomerId: testPayment.stripeCustomerId,
        createdAt: testPayment.createdAt
      }
    });
    
    createdEntities.payments.push(testPayment);
  }
  
  console.log(`✅ Seeded ${createdEntities.payments.length} payments`);
}

/**
 * Main function to seed test data
 */
export async function seedTestData(options: Partial<SeedOptions> = {}): Promise<{
  users: TestUser[];
  profiles: TestProfile[];
  sessionTypes: TestSessionType[];
  bookings: TestBooking[];
  payments: TestPayment[];
}> {
  // Merge with default options
  const mergedOptions: SeedOptions = {
    ...defaultSeedOptions,
    ...options,
    count: {
      ...defaultSeedOptions.count,
      ...options.count
    }
  };
  
  console.log(`🌱 Starting to seed data for ${mergedOptions.environment}...`);
  
  const prisma = new PrismaClient();
  
  // Tracking created entities for reference and relationships
  const createdEntities = {
    users: [] as TestUser[],
    profiles: [] as TestProfile[],
    sessionTypes: [] as TestSessionType[],
    bookings: [] as TestBooking[],
    payments: [] as TestPayment[],
    builderIds: [] as string[],
    clientIds: [] as string[],
    adminIds: [] as string[]
  };
  
  try {
    // Reset database if requested
    if (mergedOptions.reset) {
      await resetTestDatabase(prisma);
    }
    
    // Seed domains in order of dependencies
    if (mergedOptions.domains?.includes('users')) {
      await seedUsers(prisma, mergedOptions, createdEntities);
    }
    
    if (mergedOptions.domains?.includes('profiles')) {
      await seedProfiles(prisma, mergedOptions, createdEntities);
    }
    
    if (mergedOptions.domains?.includes('scheduling')) {
      await seedSessionTypes(prisma, mergedOptions, createdEntities);
    }
    
    if (mergedOptions.domains?.includes('bookings')) {
      await seedBookings(prisma, mergedOptions, createdEntities);
    }
    
    if (mergedOptions.domains?.includes('payments')) {
      await seedPayments(prisma, mergedOptions, createdEntities);
    }
    
    console.log('✅ Test data seeding completed successfully');
    
    // Return all created entities for reference
    return {
      users: createdEntities.users,
      profiles: createdEntities.profiles,
      sessionTypes: createdEntities.sessionTypes,
      bookings: createdEntities.bookings,
      payments: createdEntities.payments
    };
  } catch (error) {
    console.error('❌ Failed to seed test data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}
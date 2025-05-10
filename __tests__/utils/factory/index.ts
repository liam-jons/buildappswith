/**
 * Factory functions for generating test data
 */
import { v4 as uuidv4 } from 'uuid';
import {
  TestUser,
  TestProfile,
  TestSessionType,
  TestBooking,
  TestPayment,
  TestPersona,
  testClerkIds
} from '../models';

/**
 * Factory for creating test users
 */
export function createUser(overrides: Partial<TestUser> = {}): TestUser {
  return {
    id: uuidv4(),
    email: `test-${uuidv4().slice(0, 8)}@example.com`,
    name: `Test User ${uuidv4().slice(0, 4)}`,
    role: 'CLIENT',
    verified: true,
    clerkId: overrides.clerkId || undefined,
    ...overrides
  };
}

/**
 * Factory for creating test profiles
 */
export function createProfile(overrides: Partial<TestProfile> = {}): TestProfile {
  return {
    id: uuidv4(),
    userId: uuidv4(),
    bio: 'This is a test bio for a generated profile',
    title: 'Test Profile',
    skills: ['JavaScript', 'React', 'Node.js'],
    availability: 'Weekdays 9am-5pm',
    hourlyRate: 100,
    socialLinks: {
      github: 'https://github.com/testuser',
      twitter: 'https://twitter.com/testuser',
      linkedin: 'https://linkedin.com/in/testuser'
    },
    ...overrides
  };
}

/**
 * Factory for creating test session types
 */
export function createSessionType(overrides: Partial<TestSessionType> = {}): TestSessionType {
  return {
    id: uuidv4(),
    builderId: uuidv4(),
    name: 'Test Session',
    description: 'A test session for development purposes',
    duration: 60, // minutes
    price: 150, // in dollars
    isActive: true,
    ...overrides
  };
}

/**
 * Factory for creating test bookings
 */
export function createBooking(overrides: Partial<TestBooking> = {}): TestBooking {
  const startTime = new Date();
  startTime.setHours(startTime.getHours() + 24); // 24 hours from now
  
  const endTime = new Date(startTime);
  endTime.setMinutes(endTime.getMinutes() + 60); // 1 hour session
  
  return {
    id: uuidv4(),
    clientId: uuidv4(),
    builderId: uuidv4(),
    sessionTypeId: uuidv4(),
    startTime,
    endTime,
    status: 'PENDING',
    paymentStatus: 'PENDING',
    ...overrides
  };
}

/**
 * Factory for creating test payments
 */
export function createPayment(overrides: Partial<TestPayment> = {}): TestPayment {
  return {
    id: uuidv4(),
    bookingId: uuidv4(),
    amount: 150,
    currency: 'USD',
    status: 'SUCCEEDED',
    stripePaymentIntentId: `pi_${uuidv4().replace(/-/g, '')}`,
    stripeCustomerId: `cus_${uuidv4().replace(/-/g, '')}`,
    createdAt: new Date(),
    ...overrides
  };
}

/**
 * Create test data based on persona
 */
export function createPersona(persona: TestPersona): { user: TestUser; profile: TestProfile; } {
  switch (persona) {
    case TestPersona.CLIENT_BASIC: {
      const userId = uuidv4();
      const user = createUser({
        id: userId,
        role: 'CLIENT',
        name: 'Basic Client',
        email: 'basic-client@example.com',
        clerkId: testClerkIds.clientOne
      });
      
      const profile = createProfile({
        userId,
        title: 'App Enthusiast',
        bio: 'Looking to build my first app'
      });
      
      return { user, profile };
    }
    
    case TestPersona.CLIENT_PREMIUM: {
      const userId = uuidv4();
      const user = createUser({
        id: userId,
        role: 'CLIENT',
        name: 'Premium Client',
        email: 'premium-client@example.com',
        clerkId: testClerkIds.premiumOne
      });
      
      const profile = createProfile({
        userId,
        title: 'Startup Founder',
        bio: 'Building the next big thing in tech',
        hourlyRate: 0 // client doesn't have hourly rate
      });
      
      return { user, profile };
    }
    
    case TestPersona.BUILDER_NEW: {
      const userId = uuidv4();
      const user = createUser({
        id: userId,
        role: 'BUILDER',
        name: 'New Builder',
        email: 'new-builder@example.com',
        clerkId: testClerkIds.newBuilder
      });
      
      const profile = createProfile({
        userId,
        title: 'Junior Developer',
        bio: 'Recently started building apps professionally',
        skills: ['JavaScript', 'React'],
        hourlyRate: 50
      });
      
      return { user, profile };
    }
    
    case TestPersona.BUILDER_EXPERIENCED: {
      const userId = uuidv4();
      const user = createUser({
        id: userId,
        role: 'BUILDER',
        name: 'Experienced Builder',
        email: 'experienced-builder@example.com',
        clerkId: testClerkIds.establishedBuilder
      });
      
      const profile = createProfile({
        userId,
        title: 'Senior Full-Stack Developer',
        bio: '10+ years building web and mobile applications',
        skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'AWS', 'PostgreSQL'],
        hourlyRate: 150
      });
      
      return { user, profile };
    }
    
    case TestPersona.ADMIN_SUPER: {
      const userId = uuidv4();
      const user = createUser({
        id: userId,
        role: 'ADMIN',
        name: 'Super Admin',
        email: 'super-admin@example.com',
        clerkId: testClerkIds.adminOne
      });
      
      const profile = createProfile({
        userId,
        title: 'Platform Administrator',
        bio: 'Managing and overseeing platform operations'
      });
      
      return { user, profile };
    }
    
    default:
      throw new Error(`Unknown persona: ${persona}`);
  }
}

/**
 * Factory for creating related entities
 */
export function createRelatedEntities(): {
  builder: TestUser;
  builderProfile: TestProfile;
  client: TestUser;
  clientProfile: TestProfile;
  sessionType: TestSessionType;
  booking: TestBooking;
  payment: TestPayment;
} {
  // Create builder
  const builderUserId = uuidv4();
  const builder = createUser({
    id: builderUserId,
    role: 'BUILDER',
    name: 'Test Builder',
    email: 'test-builder@example.com'
  });
  
  const builderProfile = createProfile({
    userId: builderUserId
  });
  
  // Create client
  const clientUserId = uuidv4();
  const client = createUser({
    id: clientUserId,
    role: 'CLIENT',
    name: 'Test Client',
    email: 'test-client@example.com'
  });
  
  const clientProfile = createProfile({
    userId: clientUserId
  });
  
  // Create session type
  const sessionTypeId = uuidv4();
  const sessionType = createSessionType({
    id: sessionTypeId,
    builderId: builderUserId
  });
  
  // Create booking
  const bookingId = uuidv4();
  const booking = createBooking({
    id: bookingId,
    clientId: clientUserId,
    builderId: builderUserId,
    sessionTypeId
  });
  
  // Create payment
  const payment = createPayment({
    bookingId
  });
  
  return {
    builder,
    builderProfile,
    client,
    clientProfile,
    sessionType,
    booking,
    payment
  };
}
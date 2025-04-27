import { vi } from 'vitest';
import { mockUsers } from '../mocks/users';
import { UserRole } from '@/lib/auth/types';

/**
 * Type for the Clerk user object structure
 */
export interface ClerkUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  fullName: string | null;
  username: string | null;
  primaryEmailAddress: {
    emailAddress: string;
    id: string;
    verification: { status: 'verified' | 'unverified' };
  };
  primaryEmailAddressId: string;
  emailAddresses: Array<{
    emailAddress: string;
    id: string;
    verification: { status: 'verified' | 'unverified' };
  }>;
  imageUrl: string | null;
  publicMetadata: {
    roles?: UserRole[];
    verified?: boolean;
    completedOnboarding?: boolean;
    stripeCustomerId?: string | null;
    [key: string]: any;
  };
  privateMetadata: Record<string, any>;
  unsafeMetadata: Record<string, any>;
  createdAt?: string;
  reload: () => Promise<void>;
}

/**
 * Type for the Clerk auth object structure
 */
export interface ClerkAuth {
  isLoaded: boolean;
  isSignedIn: boolean;
  userId: string | null;
  sessionId: string | null;
  getToken: () => Promise<string | null>;
}

/**
 * Type for user mock configuration
 */
export type UserMockType = 'client' | 'builder' | 'admin' | 'multiRole' | 'unverified' | Record<string, any>;

/**
 * Interface for mock Clerk exports
 */
export interface ClerkMock {
  useUser: () => { isLoaded: boolean; isSignedIn: boolean; user: ClerkUser | null };
  useAuth: () => ClerkAuth;
  currentUser: () => Promise<ClerkUser | null>;
  auth: () => Promise<ClerkAuth>;
  ClerkProvider: React.FC<{ children: React.ReactNode }>;
  SignedIn: React.FC<{ children: React.ReactNode }>;
  SignedOut: React.FC<{ children: React.ReactNode }>;
  clerkClient: {
    users: {
      updateUser: (userId: string, data: Record<string, any>) => Promise<any>;
    };
  };
}

/**
 * Configure different auth mocks to simulate different user roles and states
 * @param userType The type of user to mock ('client', 'builder', 'admin', 'multiRole', 'unverified')
 * @param overrides Override specific properties of the mock user
 * @returns Configured mock functions for @clerk/nextjs
 */
export function configureMockClerk(userType: UserMockType = 'client', overrides: Record<string, any> = {}): ClerkMock {
  // Get the base mock user based on userType
  const mockUser = typeof userType === 'string' 
    ? { ...mockUsers[userType], ...overrides }
    : { ...userType, ...overrides };

  // Create Clerk user object
  const clerkUser: ClerkUser = {
    id: mockUser.clerkId,
    firstName: mockUser.name ? mockUser.name.split(' ')[0] : 'Test',
    lastName: mockUser.name ? mockUser.name.split(' ')[1] || '' : 'User',
    fullName: mockUser.name || 'Test User',
    username: mockUser.name?.replace(' ', '') || 'testuser',
    primaryEmailAddress: { 
      emailAddress: mockUser.email,
      id: 'email-id',
      verification: { status: mockUser.verified ? 'verified' : 'unverified' }
    },
    primaryEmailAddressId: 'email-id',
    emailAddresses: [{ 
      emailAddress: mockUser.email,
      id: 'email-id',
      verification: { status: mockUser.verified ? 'verified' : 'unverified' }
    }],
    imageUrl: mockUser.image,
    publicMetadata: {
      roles: mockUser.roles || [UserRole.CLIENT],
      verified: mockUser.verified || false,
      completedOnboarding: mockUser.completedOnboarding || false,
      stripeCustomerId: mockUser.stripeCustomerId || null,
      ...(mockUser.publicMetadata || {}),
    },
    privateMetadata: {},
    unsafeMetadata: {},
    createdAt: mockUser.createdAt || new Date().toISOString(),
    reload: vi.fn().mockResolvedValue(undefined),
  };

  // Create Clerk auth object
  const clerkAuth: ClerkAuth = {
    isLoaded: true,
    isSignedIn: true,
    userId: mockUser.clerkId,
    sessionId: `session-${mockUser.clerkId}`,
    getToken: vi.fn().mockResolvedValue('test-token'),
  };

  // Return configured mock
  return {
    useUser: vi.fn().mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
      user: clerkUser,
    }),
    useAuth: vi.fn().mockReturnValue(clerkAuth),
    currentUser: vi.fn().mockResolvedValue(clerkUser),
    auth: vi.fn().mockResolvedValue(clerkAuth),
    ClerkProvider: ({ children }) => children,
    SignedIn: ({ children }) => children,
    SignedOut: () => null,
    clerkClient: {
      users: {
        updateUser: vi.fn().mockResolvedValue(clerkUser),
      },
    },
  };
}

/**
 * Creates an unauthenticated Clerk mock 
 * @returns Mock functions for unauthenticated state
 */
export function createUnauthenticatedMock(): ClerkMock {
  return {
    useUser: vi.fn().mockReturnValue({
      isLoaded: true,
      isSignedIn: false,
      user: null,
    }),
    useAuth: vi.fn().mockReturnValue({
      isLoaded: true,
      isSignedIn: false,
      userId: null,
      sessionId: null,
      getToken: vi.fn().mockResolvedValue(null),
    }),
    currentUser: vi.fn().mockResolvedValue(null),
    auth: vi.fn().mockResolvedValue({
      isLoaded: true,
      isSignedIn: false,
      userId: null,
      sessionId: null,
      getToken: vi.fn().mockResolvedValue(null),
    }),
    ClerkProvider: ({ children }) => children,
    SignedIn: () => null,
    SignedOut: ({ children }) => children,
    clerkClient: {
      users: {
        updateUser: vi.fn(),
      },
    },
  };
}

/**
 * Creates a loading state Clerk mock
 * @returns Mock functions for loading state
 */
export function createLoadingMock(): ClerkMock {
  return {
    useUser: vi.fn().mockReturnValue({
      isLoaded: false,
      isSignedIn: false,
      user: null,
    }),
    useAuth: vi.fn().mockReturnValue({
      isLoaded: false,
      isSignedIn: false,
      userId: null,
      sessionId: null,
      getToken: vi.fn().mockResolvedValue(null),
    }),
    currentUser: vi.fn().mockResolvedValue(null),
    auth: vi.fn().mockResolvedValue({
      isLoaded: false,
      isSignedIn: false,
      userId: null,
      sessionId: null,
      getToken: vi.fn().mockResolvedValue(null),
    }),
    ClerkProvider: ({ children }) => children,
    SignedIn: () => null,
    SignedOut: ({ children }) => children,
    clerkClient: {
      users: {
        updateUser: vi.fn(),
      },
    },
  };
}

/**
 * Sets up Clerk mocking for Vitest
 * @param userType The type of user to mock
 * @param overrides Override specific properties of the mock user
 * @returns The configured Clerk mock
 */
export function setupMockClerk(userType: UserMockType = 'client', overrides = {}): ClerkMock {
  const mockClerk = configureMockClerk(userType, overrides);
  
  // Set up the mock for Clerk
  vi.mock('@clerk/nextjs', () => mockClerk);
  
  return mockClerk;
}

/**
 * Reset Clerk mocks
 */
export function resetMockClerk() {
  vi.resetModules();
  vi.resetAllMocks();
}

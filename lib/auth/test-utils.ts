/**
 * Authentication Test Utilities
 * 
 * This file provides utilities for testing authentication-related functionality.
 * 
 * Version: 1.0.0
 */

import { UserRole } from './types';

/**
 * Mock user data for different roles
 */
export const mockUsers = {
  /**
   * Mock user with CLIENT role
   */
  client: {
    id: 'user_2bRNCpQnBgQ5Y9G1vB8Zv6Fetso',
    firstName: 'Client',
    lastName: 'User',
    fullName: 'Client User',
    username: 'clientuser',
    primaryEmailAddress: {
      emailAddress: 'client@example.com',
      id: 'idn_2bRNCWQ5Y9G1v8ZKF3',
      verification: { status: 'verified' }
    },
    primaryEmailAddressId: 'idn_2bRNCWQ5Y9G1v8ZKF3',
    emailAddresses: [{
      emailAddress: 'client@example.com',
      id: 'idn_2bRNCWQ5Y9G1v8ZKF3',
      verification: { status: 'verified' }
    }],
    imageUrl: '/images/avatar-placeholder.png',
    publicMetadata: {
      roles: [UserRole.CLIENT],
      verified: true,
      completedOnboarding: true,
      stripeCustomerId: 'cus_client123'
    },
    privateMetadata: {},
    unsafeMetadata: {},
    reload: async () => Promise.resolve(),
  },
  
  /**
   * Mock user with BUILDER role
   */
  builder: {
    id: 'user_2BuiLD3rpQn2Pg75A9V8xFetso',
    firstName: 'Builder',
    lastName: 'User',
    fullName: 'Builder User',
    username: 'builderuser',
    primaryEmailAddress: {
      emailAddress: 'builder@example.com',
      id: 'idn_2Build3rWQ59G19KF3',
      verification: { status: 'verified' }
    },
    primaryEmailAddressId: 'idn_2Build3rWQ59G19KF3',
    emailAddresses: [{
      emailAddress: 'builder@example.com',
      id: 'idn_2Build3rWQ59G19KF3',
      verification: { status: 'verified' }
    }],
    imageUrl: '/images/avatar-placeholder.png',
    publicMetadata: {
      roles: [UserRole.BUILDER],
      verified: true,
      completedOnboarding: true,
      stripeCustomerId: 'cus_builder123',
      builderProfile: {
        id: 'bld_123456',
        slug: 'builder-user',
        validationTier: 2
      }
    },
    privateMetadata: {},
    unsafeMetadata: {},
    reload: async () => Promise.resolve(),
  },
  
  /**
   * Mock user with ADMIN role
   */
  admin: {
    id: 'user_2AdM1NpQnBgQ5Y9G1vB8Zv6Fso',
    firstName: 'Admin',
    lastName: 'User',
    fullName: 'Admin User',
    username: 'adminuser',
    primaryEmailAddress: {
      emailAddress: 'admin@example.com',
      id: 'idn_2AdM1NWQ5Y9G1v8ZKF3',
      verification: { status: 'verified' }
    },
    primaryEmailAddressId: 'idn_2AdM1NWQ5Y9G1v8ZKF3',
    emailAddresses: [{
      emailAddress: 'admin@example.com',
      id: 'idn_2AdM1NWQ5Y9G1v8ZKF3',
      verification: { status: 'verified' }
    }],
    imageUrl: '/images/avatar-placeholder.png',
    publicMetadata: {
      roles: [UserRole.ADMIN],
      verified: true,
      completedOnboarding: true
    },
    privateMetadata: {},
    unsafeMetadata: {},
    reload: async () => Promise.resolve(),
  },
  
  /**
   * Mock user with multiple roles
   */
  multiRole: {
    id: 'user_2MuLt1RoL3pQnBgQ5Y9G1v6Fso',
    firstName: 'Multi',
    lastName: 'Role',
    fullName: 'Multi Role',
    username: 'multirole',
    primaryEmailAddress: {
      emailAddress: 'multi@example.com',
      id: 'idn_2MuLt1RoL3WQ5Y9ZKF3',
      verification: { status: 'verified' }
    },
    primaryEmailAddressId: 'idn_2MuLt1RoL3WQ5Y9ZKF3',
    emailAddresses: [{
      emailAddress: 'multi@example.com',
      id: 'idn_2MuLt1RoL3WQ5Y9ZKF3',
      verification: { status: 'verified' }
    }],
    imageUrl: '/images/avatar-placeholder.png',
    publicMetadata: {
      roles: [UserRole.CLIENT, UserRole.BUILDER],
      verified: true,
      completedOnboarding: true,
      stripeCustomerId: 'cus_multi123',
      builderProfile: {
        id: 'bld_789012',
        slug: 'multi-role',
        validationTier: 3
      }
    },
    privateMetadata: {},
    unsafeMetadata: {},
    reload: async () => Promise.resolve(),
  },
  
  /**
   * Mock unverified user
   */
  unverified: {
    id: 'user_2UnV3rpQnBgQ5Y9G1vB8Zv6Fso',
    firstName: 'Unverified',
    lastName: 'User',
    fullName: 'Unverified User',
    username: 'unverifieduser',
    primaryEmailAddress: {
      emailAddress: 'unverified@example.com',
      id: 'idn_2UnV3rWQ5Y9G1v8ZKF3',
      verification: { status: 'unverified' }
    },
    primaryEmailAddressId: 'idn_2UnV3rWQ5Y9G1v8ZKF3',
    emailAddresses: [{
      emailAddress: 'unverified@example.com',
      id: 'idn_2UnV3rWQ5Y9G1v8ZKF3',
      verification: { status: 'unverified' }
    }],
    imageUrl: '/images/avatar-placeholder.png',
    publicMetadata: {
      roles: [UserRole.CLIENT],
      verified: false,
      completedOnboarding: false
    },
    privateMetadata: {},
    unsafeMetadata: {},
    reload: async () => Promise.resolve(),
  }
};

/**
 * Create a mock Clerk object with authenticated state
 * 
 * @param userType - The type of user to mock ('client', 'builder', 'admin', etc.)
 * @param overrides - Optional overrides for the user data
 * @returns A mock Clerk object
 */
export function createAuthenticatedMock(
  userType: keyof typeof mockUsers = 'client',
  overrides: Record<string, any> = {}
) {
  // Get the base user data
  const userData = { ...mockUsers[userType] };
  
  // Apply overrides to publicMetadata
  if (overrides.publicMetadata) {
    userData.publicMetadata = {
      ...userData.publicMetadata,
      ...overrides.publicMetadata,
    };
  }
  
  // Apply any other overrides
  Object.keys(overrides).forEach(key => {
    if (key !== 'publicMetadata') {
      (userData as any)[key] = overrides[key];
    }
  });
  
  // Create the mock Clerk object
  return {
    __esModule: true,
    default: {},
    // Auth hooks
    useAuth: () => ({
      isLoaded: true,
      isSignedIn: true,
      userId: userData.id,
      sessionId: 'sess_test123',
      signOut: async () => Promise.resolve(),
      user: userData,
    }),
    useUser: () => ({
      isLoaded: true,
      isSignedIn: true,
      user: userData,
    }),
    // Client components
    SignIn: ({ children }: any) => children,
    SignUp: ({ children }: any) => children,
    SignedIn: ({ children }: any) => children,
    SignedOut: () => null,
    UserButton: () => null,
    // Server functions
    auth: () => ({
      userId: userData.id,
      sessionId: 'sess_test123',
      getToken: async () => 'test-token',
    }),
    currentUser: () => userData,
    clerkClient: {
      users: {
        getUser: async () => userData,
        updateUser: async () => userData,
      },
    },
    // Helpers/middleware
    authMiddleware: () => (req: any) => req,
    Protect: ({ children }: any) => children,
  };
}

/**
 * Create a mock Clerk object for unauthenticated state
 * 
 * @returns A mock Clerk object for unauthenticated state
 */
export function createUnauthenticatedMock() {
  return {
    __esModule: true,
    default: {},
    // Auth hooks
    useAuth: () => ({
      isLoaded: true,
      isSignedIn: false,
      userId: null,
      sessionId: null,
      signOut: async () => Promise.resolve(),
      user: null,
    }),
    useUser: () => ({
      isLoaded: true,
      isSignedIn: false,
      user: null,
    }),
    // Client components
    SignIn: ({ children }: any) => children,
    SignUp: ({ children }: any) => children,
    SignedIn: () => null,
    SignedOut: ({ children }: any) => children,
    UserButton: () => null,
    // Server functions
    auth: () => ({
      userId: null,
      sessionId: null,
      getToken: async () => null,
    }),
    currentUser: () => null,
    clerkClient: {
      users: {
        getUser: async () => { throw new Error('User not found'); },
      },
    },
    // Helpers/middleware
    authMiddleware: () => (req: any) => req,
    Protect: () => null,
  };
}

/**
 * Create a mock Clerk object for loading state
 * 
 * @returns A mock Clerk object for loading state
 */
export function createLoadingMock() {
  return {
    __esModule: true,
    default: {},
    // Auth hooks
    useAuth: () => ({
      isLoaded: false,
      isSignedIn: undefined,
      userId: null,
      sessionId: null,
      signOut: async () => Promise.resolve(),
      user: null,
    }),
    useUser: () => ({
      isLoaded: false,
      isSignedIn: undefined,
      user: null,
    }),
    // Client components
    SignIn: ({ children }: any) => children,
    SignUp: ({ children }: any) => children,
    SignedIn: () => null,
    SignedOut: () => null,
    UserButton: () => null,
    // Server functions
    auth: () => ({
      userId: null,
      sessionId: null,
      getToken: async () => null,
    }),
    currentUser: () => null,
    // Helpers/middleware
    authMiddleware: () => (req: any) => req,
    Protect: ({ children }: any) => null,
  };
}

/**
 * Set up a mock Clerk instance for testing
 * 
 * @param userType - The type of user to mock ('client', 'builder', 'admin', etc.)
 * @param overrides - Optional overrides for the user data
 */
export function setupMockClerk(
  userType: keyof typeof mockUsers | 'unauthenticated' | 'loading' = 'client',
  overrides: Record<string, any> = {}
) {
  if (userType === 'unauthenticated') {
    // @ts-ignore - Dynamic mocking
    global.jest.mock('@clerk/nextjs', () => createUnauthenticatedMock());
    return createUnauthenticatedMock();
  }
  
  if (userType === 'loading') {
    // @ts-ignore - Dynamic mocking
    global.jest.mock('@clerk/nextjs', () => createLoadingMock());
    return createLoadingMock();
  }
  
  const mockClerk = createAuthenticatedMock(userType as keyof typeof mockUsers, overrides);
  // @ts-ignore - Dynamic mocking
  global.jest.mock('@clerk/nextjs', () => mockClerk);
  return mockClerk;
}

/**
 * Reset mock Clerk instance
 */
export function resetMockClerk() {
  // @ts-ignore - Dynamic mocking
  global.jest.resetModules();
}

/**
 * Testing utility for making authenticated requests to API routes
 * 
 * @param userType - The type of user to authenticate as
 * @returns Headers with authentication information
 */
export function createAuthHeaders(userType: keyof typeof mockUsers = 'client') {
  const userData = mockUsers[userType];
  
  return {
    'x-user-id': userData.id,
    'x-user-roles': JSON.stringify(userData.publicMetadata.roles),
  };
}

/**
 * Mock middleware API for testing role-based access
 */
export const mockMiddlewareAPI = {
  /**
   * Mock getAuth function for testing API route handlers
   * 
   * @param userType - The type of user to authenticate as
   * @returns Mock auth object
   */
  getAuth: (userType: keyof typeof mockUsers | null = 'client') => {
    if (!userType) {
      return {
        userId: null,
        sessionClaims: null,
        getToken: async () => null,
      };
    }
    
    const userData = mockUsers[userType];
    
    return {
      userId: userData.id,
      sessionClaims: {
        sub: userData.id,
        'public_metadata': userData.publicMetadata,
      },
      getToken: async () => 'test-token',
    };
  },
};

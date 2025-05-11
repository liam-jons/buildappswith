import { render, RenderOptions, waitFor, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import React, { ReactElement } from 'react';
import { mockUsers } from '../mocks/auth/mock-users';
import { vi, beforeEach, afterEach } from 'vitest';
import { testClerkIds } from './models';

// Types of users that can be mocked
export type UserType = keyof typeof mockUsers;

// Role type definition
export type RoleType = 'CLIENT' | 'BUILDER' | 'ADMIN';

// Mock state tracking to enable resetting between tests
let currentMockUserType: UserType | null = null;
let currentRoles: string[] = [];
let currentClerkId: string | null = null;

// Create mock implementations of Clerk components/hooks
const mockAuth = vi.fn();
const mockCurrentUser = vi.fn();
const mockUseUser = vi.fn();
const mockUseAuth = vi.fn();
const mockClerkProvider = vi.fn(({ children }) => React.createElement(React.Fragment, null, children));
const mockSignedIn = vi.fn(({ children }) => children);
const mockSignedOut = vi.fn(({ children }) => null);
const mockUseSignIn = vi.fn();
const mockUseSignUp = vi.fn();
const mockUseClerk = vi.fn();
const mockUseSession = vi.fn();
const mockRedirectToSignIn = vi.fn();
const mockSignOut = vi.fn().mockResolvedValue({});

// Create mapping from user types to clerk IDs
const userTypeToClerkId = {
  'client': testClerkIds.clientOne,
  'premium-client': testClerkIds.premiumOne,
  'builder': testClerkIds.establishedBuilder,
  'new-builder': testClerkIds.newBuilder,
  'admin': testClerkIds.adminOne,
  'dual-role': testClerkIds.dualRole,
  'triple-role': testClerkIds.tripleRole,
  'unauthenticated': null
};

// Setup auto reset for Clerk mocks between tests
beforeEach(() => {
  if (currentMockUserType) {
    // Re-apply previous mock setup if it exists
    setupMockClerk(currentMockUserType);
  }
});

afterEach(() => {
  // Reset any mocks that were called during a test
  resetMockClerk();
});

// Setup mock globally to ensure consistent behavior
vi.mock('@clerk/nextjs', () => ({
  auth: mockAuth,
  currentUser: mockCurrentUser,
  useUser: mockUseUser,
  useAuth: mockUseAuth,
  useSession: mockUseSession,
  useSignIn: mockUseSignIn,
  useSignUp: mockUseSignUp,
  useClerk: mockUseClerk,
  ClerkProvider: mockClerkProvider,
  SignedIn: mockSignedIn,
  SignedOut: mockSignedOut,
  redirectToSignIn: mockRedirectToSignIn,
  signOut: mockSignOut
}));

/**
 * Configure mock implementations for a specific user type
 *
 * @param userType Type of user to mock (client, builder, admin, etc.)
 * @param overrides Custom overrides for the mock user
 * @returns The mock user object with consistent clerk ID and roles
 */
export function setupMockClerk(
  userType: UserType = 'client',
  overrides: Record<string, any> = {}
) {
  // Save the current mock state for auto-reset
  currentMockUserType = userType;

  // Get the mock user based on type
  const mockUser = mockUsers[userType];
  let roles: string[] = [];

  // Set roles based on user type and overrides
  if (userType === 'unauthenticated') {
    roles = [];
  } else if (userType === 'dual-role') {
    roles = ['CLIENT', 'BUILDER'];
  } else if (userType === 'triple-role') {
    roles = ['CLIENT', 'BUILDER', 'ADMIN'];
  } else if (mockUser?.role) {
    roles = [mockUser.role];
  }

  // Add any additional roles from overrides
  if (overrides.roles) {
    if (Array.isArray(overrides.roles)) {
      roles.push(...overrides.roles.filter((role: string) => !roles.includes(role)));
    } else if (typeof overrides.roles === 'string' && !roles.includes(overrides.roles)) {
      roles.push(overrides.roles);
    }
  }

  // Save current roles for auto-reset
  currentRoles = [...roles];

  // Use consistent clerk IDs from test models
  const clerkId = userTypeToClerkId[userType] || mockUser?.id || null;

  // Save current clerk ID for auto-reset
  currentClerkId = clerkId;

  // Create session ID based on clerk ID for consistency
  const sessionId = clerkId ? `session_${clerkId.replace('user_', '')}` : null;

  // Set up auth mock implementation
  mockAuth.mockReturnValue({
    userId: clerkId,
    sessionId: sessionId,
    getToken: userType === 'unauthenticated'
      ? vi.fn().mockRejectedValue(new Error('User not authenticated'))
      : vi.fn().mockResolvedValue(`test-token-${clerkId}`),
  });

  // Set up currentUser mock implementation
  mockCurrentUser.mockResolvedValue(mockUser ? {
    id: clerkId,
    firstName: mockUser.name.split(' ')[0],
    lastName: mockUser.name.split(' ')[1] || '',
    emailAddresses: [{
      emailAddress: mockUser.email,
      id: `email_${clerkId?.substring(5, 15)}`,
      primary: true,
      verified: mockUser.verified
    }],
    imageUrl: mockUser.avatar || 'https://img.clerk.com/default-avatar.png',
    publicMetadata: {
      roles,
      verified: mockUser.verified,
      ...overrides.metadata,
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    updatedAt: new Date().toISOString(),
  } : null);

  // Set up useUser mock implementation
  mockUseUser.mockReturnValue({
    isLoaded: true,
    isSignedIn: userType !== 'unauthenticated',
    user: mockUser ? {
      id: clerkId,
      firstName: mockUser.name.split(' ')[0],
      lastName: mockUser.name.split(' ')[1] || '',
      fullName: mockUser.name,
      primaryEmailAddress: {
        emailAddress: mockUser.email,
        id: `email_${clerkId?.substring(5, 15)}`,
        primary: true,
        verified: mockUser.verified
      },
      imageUrl: mockUser.avatar || 'https://img.clerk.com/default-avatar.png',
      publicMetadata: {
        roles,
        verified: mockUser.verified,
        ...overrides.metadata,
      },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
      updatedAt: new Date().toISOString(),
      // Add full profile fields if needed
      ...(overrides.userFields || {}),
    } : null,
  });

  // Set up useAuth mock implementation
  mockUseAuth.mockReturnValue({
    isLoaded: true,
    isSignedIn: userType !== 'unauthenticated',
    userId: clerkId,
    sessionId: sessionId,
    getToken: userType === 'unauthenticated'
      ? vi.fn().mockRejectedValue(new Error('User not authenticated'))
      : vi.fn().mockResolvedValue(`test-token-${clerkId}`),
  });

  // Set up useSession mock implementation
  mockUseSession.mockReturnValue({
    isLoaded: true,
    isSignedIn: userType !== 'unauthenticated',
    session: clerkId ? {
      id: sessionId,
      userId: clerkId,
      status: 'active',
      lastActiveAt: new Date(),
      expireAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
      createdAt: new Date(Date.now() - 1000 * 60 * 60),
    } : null,
  });

  // Set up useSignIn mock implementation
  mockUseSignIn.mockReturnValue({
    isLoaded: true,
    signIn: vi.fn().mockResolvedValue({
      status: 'complete',
      createdSessionId: sessionId,
    }),
    setActive: vi.fn().mockResolvedValue({}),
  });

  // Set up useSignUp mock implementation
  mockUseSignUp.mockReturnValue({
    isLoaded: true,
    signUp: vi.fn().mockResolvedValue({
      status: 'complete',
      createdSessionId: sessionId,
      createdUserId: clerkId,
    }),
    setActive: vi.fn().mockResolvedValue({}),
  });

  // Set up useClerk mock implementation
  mockUseClerk.mockReturnValue({
    openSignIn: vi.fn(),
    openSignUp: vi.fn(),
    signOut: mockSignOut,
    user: mockUser ? {
      id: clerkId,
      firstName: mockUser.name.split(' ')[0],
      lastName: mockUser.name.split(' ')[1] || '',
      fullName: mockUser.name,
      primaryEmailAddress: {
        emailAddress: mockUser.email,
        id: `email_${clerkId?.substring(5, 15)}`,
        verified: mockUser.verified
      },
      imageUrl: mockUser.avatar || 'https://img.clerk.com/default-avatar.png',
      publicMetadata: {
        roles,
        verified: mockUser.verified,
        ...overrides.metadata,
      },
    } : null,
    session: clerkId ? {
      id: sessionId,
      userId: clerkId,
      status: 'active',
      lastActiveAt: new Date(),
    } : null,
  });

  // Set up SignedIn mock implementation
  mockSignedIn.mockImplementation(({ children }) =>
    userType !== 'unauthenticated'
      ? React.createElement(React.Fragment, null, children)
      : null
  );

  // Set up SignedOut mock implementation
  mockSignedOut.mockImplementation(({ children }) =>
    userType === 'unauthenticated'
      ? React.createElement(React.Fragment, null, children)
      : null
  );

  // Return an enhanced user object with clerk ID and roles
  return {
    user: {
      ...mockUser,
      clerkId,
      roles,
      sessionId
    }
  };
}

/**
 * Reset all mocks between tests
 */
export function resetMockClerk() {
  mockAuth.mockReset();
  mockCurrentUser.mockReset();
  mockUseUser.mockReset();
  mockUseAuth.mockReset();
  mockUseSession.mockReset();
  mockUseSignIn.mockReset();
  mockUseSignUp.mockReset();
  mockUseClerk.mockReset();
  mockSignedIn.mockReset();
  mockSignedOut.mockReset();
  mockRedirectToSignIn.mockReset();
  mockSignOut.mockReset().mockResolvedValue({});
}

/**
 * Get roles from a user type
 * @param userType The user type to get roles for
 * @returns An array of role strings
 */
export function getRolesForUserType(userType: UserType): RoleType[] {
  if (userType === 'unauthenticated') return [];
  if (userType === 'dual-role') return ['CLIENT', 'BUILDER'];
  if (userType === 'triple-role') return ['CLIENT', 'BUILDER', 'ADMIN'];
  if (userType === 'admin') return ['ADMIN'];
  if (userType === 'builder' || userType === 'new-builder') return ['BUILDER'];
  return ['CLIENT']; // Default for client, premium-client
}

/**
 * Check if a user has a specific role
 * @param userType The user type to check
 * @param role The role to check for
 * @returns true if the user has the specified role
 */
export function hasRole(userType: UserType, role: RoleType): boolean {
  return getRolesForUserType(userType).includes(role);
}

// Interface for render options with auth
interface CustomRenderOptions extends RenderOptions {
  userType?: UserType;
  userOverrides?: Record<string, any>;
  providers?: React.ComponentType<any>[];
}

/**
 * Wrapper component that provides auth context
 */
function AuthWrapper({
  children,
  userType = 'client',
  userOverrides = {},
  providers = []
}: {
  children: React.ReactNode;
  userType?: UserType;
  userOverrides?: Record<string, any>;
  providers?: React.ComponentType<any>[];
}) {
  // Setup mock clerk auth
  setupMockClerk(userType, userOverrides);

  // Create a wrapper with all providers - avoid JSX for better compatibility
  const Wrapper = providers.reduce(
    (AccumulatedWrappers, Provider) => {
      return function NestedWrapper({ children }: { children: React.ReactNode }) {
        return React.createElement(
          AccumulatedWrappers,
          null,
          React.createElement(Provider, null, children)
        );
      };
    },
    function BaseWrapper({ children }: { children: React.ReactNode }) {
      return React.createElement(React.Fragment, null, children);
    }
  );

  // Return wrapped children
  return React.createElement(Wrapper, null, children);
}

/**
 * Custom render function that includes auth context
 *
 * @param ui Component to render
 * @param options Render options, including auth options
 * @returns Rendered component with testing utilities
 */
export function renderWithAuth(
  ui: ReactElement,
  options: CustomRenderOptions = {}
) {
  const {
    userType = 'client',
    userOverrides = {},
    providers = [],
    ...renderOptions
  } = options;

  // Create user event instance for interaction testing
  const user = userEvent.setup();

  // Render with auth wrapper
  const rendered = render(ui, {
    wrapper: function TestWrapper({ children }) {
      return React.createElement(AuthWrapper, {
        userType: userType,
        userOverrides: userOverrides,
        providers: providers
      }, children);
    },
    ...renderOptions,
  });

  return {
    ...rendered,
    user, // Return the user-event instance
    // Helper to find elements by role and wait for them
    findByRoleAndWait: async (role: string, name?: string | RegExp) => {
      return await waitFor(() => name
        ? screen.getByRole(role, { name })
        : screen.getByRole(role)
      );
    },
    // Helper to wait for an element to be removed
    waitForElementToBeRemoved: async (callback: () => HTMLElement | null) => {
      return await waitFor(() => {
        try {
          const element = callback();
          if (element) {
            throw new Error('Element still in document');
          }
          return true;
        } catch (e) {
          if (e.message === 'Element still in document') {
            throw e;
          }
          return true;
        }
      });
    }
  };
}

/**
 * Helper to setup authentication for API route tests
 * @param userType The type of user to authenticate as
 * @returns Auth object for API route handlers
 */
export function setupApiAuth(userType: UserType = 'client') {
  const mockUser = setupMockClerk(userType);
  const roles = getRolesForUserType(userType);

  return {
    userId: mockUser.user.clerkId,
    sessionId: mockUser.user.sessionId,
    roles: roles,
    getToken: () => Promise.resolve(`test-token-${mockUser.user.clerkId}`),
  };
}

// Re-export testing library utilities
export * from '@testing-library/react';
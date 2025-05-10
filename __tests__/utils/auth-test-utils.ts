import { render, RenderOptions } from '@testing-library/react';
import React, { ReactElement } from 'react';
import { mockUsers } from '../mocks/auth/mock-users';
import { vi } from 'vitest';

// Types of users that can be mocked
type UserType = keyof typeof mockUsers;

// Create mock implementations of Clerk components/hooks
const mockAuth = vi.fn();
const mockCurrentUser = vi.fn();
const mockUseUser = vi.fn();
const mockUseAuth = vi.fn();
const mockClerkProvider = vi.fn(({ children }) => React.createElement(React.Fragment, null, children));
const mockSignedIn = vi.fn(({ children }) => children);
const mockSignedOut = vi.fn(({ children }) => null);

// Setup mock globally
vi.mock('@clerk/nextjs', () => ({
  auth: mockAuth,
  currentUser: mockCurrentUser,
  useUser: mockUseUser,
  useAuth: mockUseAuth,
  ClerkProvider: mockClerkProvider,
  SignedIn: mockSignedIn,
  SignedOut: mockSignedOut
}));

// Configure mock implementations for a specific user type
export function setupMockClerk(
  userType: UserType = 'client',
  overrides: Record<string, any> = {}
) {
  // Get the mock user based on type
  const mockUser = mockUsers[userType];
  
  // Set up auth mock implementation
  mockAuth.mockReturnValue({
    userId: mockUser?.id || null,
    sessionId: mockUser ? 'test-session-id' : null,
    getToken: userType === 'unauthenticated' 
      ? vi.fn().mockRejectedValue(new Error('User not authenticated'))
      : vi.fn().mockResolvedValue('test-token'),
  });
  
  // Set up currentUser mock implementation
  mockCurrentUser.mockResolvedValue(mockUser || null);
  
  // Set up useUser mock implementation
  mockUseUser.mockReturnValue({
    isLoaded: true,
    isSignedIn: userType !== 'unauthenticated',
    user: mockUser ? {
      id: mockUser.id,
      firstName: mockUser.name.split(' ')[0],
      lastName: mockUser.name.split(' ')[1] || '',
      primaryEmailAddress: { emailAddress: mockUser.email },
      publicMetadata: {
        roles: [mockUser.role],
        ...overrides.metadata,
      },
    } : null,
  });
  
  // Set up useAuth mock implementation
  mockUseAuth.mockReturnValue({
    isLoaded: true,
    isSignedIn: userType !== 'unauthenticated',
    userId: mockUser?.id || null,
    sessionId: mockUser ? 'test-session-id' : null,
    getToken: userType === 'unauthenticated' 
      ? vi.fn().mockRejectedValue(new Error('User not authenticated'))
      : vi.fn().mockResolvedValue('test-token'),
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
  
  return { user: mockUser };
}

// Reset all mocks between tests
export function resetMockClerk() {
  mockAuth.mockReset();
  mockCurrentUser.mockReset();
  mockUseUser.mockReset();
  mockUseAuth.mockReset();
  mockSignedIn.mockReset();
  mockSignedOut.mockReset();
}

// Interface for render options with auth
interface CustomRenderOptions extends RenderOptions {
  userType?: UserType;
  userOverrides?: Record<string, any>;
}

// Wrapper component that provides auth context
function AuthWrapper({ 
  children, 
  userType = 'client',
  userOverrides = {}
}: { 
  children: React.ReactNode;
  userType?: UserType;
  userOverrides?: Record<string, any>;
}) {
  // Setup mock clerk auth
  setupMockClerk(userType, userOverrides);
  
  // Return children directly
  return React.createElement(React.Fragment, null, children);
}

// Custom render function that includes auth context
export function renderWithAuth(
  ui: ReactElement,
  options: CustomRenderOptions = {}
) {
  const { userType = 'client', userOverrides = {}, ...renderOptions } = options;
  
  return render(ui, {
    wrapper: ({ children }) =>
      React.createElement(AuthWrapper,
        { userType: userType, userOverrides: userOverrides },
        children
      ),
    ...renderOptions,
  });
}

// Export everything from testing-library
export * from '@testing-library/react';
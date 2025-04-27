import React from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { vi } from 'vitest';
import { setupMockClerk, resetMockClerk, UserMockType } from './clerk-test-utils';
import { mockUsers } from '../mocks/users';

/**
 * Custom render options extended with auth-related options
 */
interface AuthRenderOptions extends RenderOptions {
  userType?: UserMockType;
  userOverrides?: Record<string, any>;
}

/**
 * Auth provider component for testing authenticated components
 */
export const AuthProvider: React.FC<{
  userType?: UserMockType;
  userOverrides?: Record<string, any>;
  children: React.ReactNode;
}> = ({ userType = 'client', userOverrides = {}, children }) => {
  // Set up mock before rendering
  React.useEffect(() => {
    setupMockClerk(userType, userOverrides);
    
    // Clean up mock after unmounting
    return () => {
      resetMockClerk();
    };
  }, [userType, userOverrides]);
  
  return <>{children}</>;
};

/**
 * Custom render method that wraps components with auth provider for Vitest
 * @param ui Component to render
 * @param options Render options
 * @returns RenderResult with additional mockUser property
 */
export function renderWithAuth(
  ui: React.ReactElement,
  { userType = 'client', userOverrides = {}, ...renderOptions }: AuthRenderOptions = {}
): RenderResult & { mockUser: Record<string, any> } {
  // Set up mock clerk before rendering
  setupMockClerk(userType, userOverrides);
  
  // Create wrapper component
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <AuthProvider userType={userType} userOverrides={userOverrides}>
      {children}
    </AuthProvider>
  );
  
  // Get the mock user for reference
  const mockUser = typeof userType === 'string' 
    ? { ...mockUsers[userType], ...userOverrides }
    : { ...userType, ...userOverrides };
  
  // Render with wrapper
  const result = render(ui, { wrapper: Wrapper, ...renderOptions });
  
  // Return render result with mock user
  return {
    ...result,
    mockUser,
  };
}

/**
 * Helper to test if a component requires authentication
 * @param Component The component to test
 * @param props Props to pass to the component
 * @returns boolean indicating whether the component requires authentication
 */
export function requiresAuthentication(
  Component: React.ComponentType<any>,
  props: Record<string, any> = {}
): boolean {
  // Mock useRouter push function
  const routerPush = vi.fn();
  vi.mock('next/navigation', () => ({
    useRouter: () => ({
      push: routerPush,
    }),
    redirect: vi.fn(),
  }));
  
  // Reset mocks
  resetMockClerk();
  
  // Create unauthenticated mock
  vi.mock('@clerk/nextjs', () => ({
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
    ClerkProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    SignedIn: () => null,
    SignedOut: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  }));
  
  // Render the component
  const { container, unmount } = render(<Component {...props} />);
  
  // Check if login redirect occurred
  const redirected = routerPush.mock.calls.some(
    (call) => call[0] === '/login' || call[0] === '/signin' || call[0] === '/auth'
  );
  
  // Clean up
  unmount();
  resetMockClerk();
  
  // Component requires authentication if it redirected or shows login content
  return redirected ||
    container.innerHTML.includes('login') || 
    container.innerHTML.includes('sign in') ||
    container.innerHTML.includes('unauthorized') ||
    container.innerHTML.length === 0; // Empty container often means redirect
}

/**
 * Helper to test if a component requires a specific role
 * @param Component The component to test
 * @param requiredRole The role that might be required 
 * @param props Props to pass to the component
 * @returns boolean indicating whether the component requires the specific role
 */
export function requiresRole(
  Component: React.ComponentType<any>,
  requiredRole: string,
  props: Record<string, any> = {}
): boolean {
  // Set of roles to test against
  const allRoles = ['CLIENT', 'BUILDER', 'ADMIN'];
  const otherRoles = allRoles.filter(role => role !== requiredRole);
  
  // Test with each other role
  for (const role of otherRoles) {
    // Reset mocks
    resetMockClerk();
    
    // Set up mock for user with just this role
    setupMockClerk({
      ...mockUsers.client,
      roles: [role],
    });
    
    // Render the component
    const { container, unmount } = render(<Component {...props} />);
    
    // Check if the component shows forbidden/unauthorized content
    const requiresOtherRole = 
      container.innerHTML.includes('forbidden') || 
      container.innerHTML.includes('unauthorized') ||
      container.innerHTML.includes('access denied') ||
      container.innerHTML.length === 0; // Redirected away
    
    // Clean up
    unmount();
    
    // If the component works with any other role, it doesn't require this specific role
    if (!requiresOtherRole) {
      return false;
    }
  }
  
  // Now test with the required role
  resetMockClerk();
  setupMockClerk({
    ...mockUsers.client,
    roles: [requiredRole],
  });
  
  // Render the component
  const { container, unmount } = render(<Component {...props} />);
  
  // Clean up
  unmount();
  resetMockClerk();
  
  // If the component doesn't show forbidden content with this role, it requires this role
  return !container.innerHTML.includes('forbidden') && 
         !container.innerHTML.includes('unauthorized') &&
         !container.innerHTML.includes('access denied') &&
         container.innerHTML.length > 0; // Not redirected away
}

/**
 * Enhanced auth test utilities for Clerk authentication
 * Version: 1.0.114
 * 
 * This file provides backward compatibility with the existing auth-test-utils
 * while utilizing the new standardized Clerk test utilities.
 */

import { vi } from 'vitest';
import { 
  configureMockClerk, 
  UserMockType, 
  resetMockClerk, 
  createUnauthenticatedMock 
} from './clerk-test-utils';
import { render as rtlRender, RenderOptions } from '@testing-library/react';
import React from 'react';
import { mockUsers, createMockUser } from '../mocks/users';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';

/**
 * Backward compatible setupMockAuth function that uses the new clerk-test-utils
 * @param userType The type of user to mock ('client', 'builder', 'admin', 'multiRole', 'unverified')
 * @param overrides Override specific properties of the mock user
 * @returns Configured mock functions for @clerk/nextjs
 */
export function setupMockAuth(
  userType: UserMockType = 'client', 
  overrides: Record<string, any> = {}
) {
  // Configure mock Clerk with the specified user type and overrides
  const mockClerk = configureMockClerk(userType, overrides);
  
  // Mock the Clerk authentication module
  vi.mock('@clerk/nextjs', () => mockClerk);
  
  return mockClerk;
}

/**
 * Reset function to clear Clerk mocks
 */
export function resetMockAuth() {
  resetMockClerk();
}

/**
 * Auth provider component for testing authenticated components
 */
export function AuthProvider({ 
  userType = 'client', 
  overrides = {}, 
  children 
}: { 
  userType?: UserMockType, 
  overrides?: Record<string, any>, 
  children: React.ReactNode
}) {
  // Setup mock auth when component mounts
  React.useEffect(() => {
    setupMockAuth(userType, overrides);
    return () => resetMockAuth();
  }, [userType, overrides]);
  
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <div data-testid="auth-provider">
        {children}
      </div>
      <Toaster />
    </ThemeProvider>
  );
}

/**
 * Custom render method that wraps components with auth provider
 */
export function renderWithAuth(
  ui: React.ReactElement, 
  { 
    userType = 'client', 
    userOverrides = {}, 
    renderOptions = {} 
  }: { 
    userType?: UserMockType, 
    userOverrides?: Record<string, any>, 
    renderOptions?: Omit<RenderOptions, 'wrapper'> 
  } = {}
) {
  setupMockAuth(userType, userOverrides);
  
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider userType={userType} overrides={userOverrides}>
      {children}
    </AuthProvider>
  );
  
  return {
    ...rtlRender(ui, { wrapper: Wrapper, ...renderOptions }),
    mockUser: typeof userType === 'string' 
      ? { ...mockUsers[userType as keyof typeof mockUsers], ...userOverrides }
      : { ...userType, ...userOverrides },
  };
}

/**
 * Helper to test if a component requires authentication
 */
export function requiresAuthentication(
  Component: React.ComponentType<any>, 
  props: Record<string, any> = {}
): boolean {
  // Reset and create unauthenticated Clerk mock
  resetMockClerk();
  vi.mock('@clerk/nextjs', () => createUnauthenticatedMock());
  
  // Render the component
  const { container } = rtlRender(React.createElement(Component, props));
  
  // Reset the mock
  resetMockAuth();
  
  // If the component redirects or shows login content, it requires authentication
  return container.innerHTML.includes('login') || 
         container.innerHTML.includes('sign in') ||
         container.innerHTML.includes('unauthorized') ||
         container.innerHTML.length === 0; // Redirected away
}

/**
 * Helper to test if a component requires a specific role
 */
export function requiresRole(
  Component: React.ComponentType<any>,
  requiredRole: string,
  props: Record<string, any> = {}
): boolean {
  // Test with all roles except the required one
  const allRoles = ['CLIENT', 'BUILDER', 'ADMIN'];
  const otherRoles = allRoles.filter(role => role !== requiredRole);
  
  // Test with each role individually
  for (const role of otherRoles) {
    // Create a user with just this role
    const mockUser = {
      ...mockUsers.client,
      roles: [role],
    };
    
    // Configure mock for user with this role
    setupMockAuth(mockUser);
    
    // Render the component
    const { container } = rtlRender(React.createElement(Component, props));
    
    // Check if the component shows forbidden/unauthorized content
    const requiresOtherRole = 
      container.innerHTML.includes('forbidden') || 
      container.innerHTML.includes('unauthorized') ||
      container.innerHTML.includes('access denied') ||
      container.innerHTML.length === 0; // Redirected away
    
    // Reset the mock
    resetMockAuth();
    
    // If the component works with any other role, it doesn't require this specific role
    if (!requiresOtherRole) {
      return false;
    }
  }
  
  // If we got here, the component showed forbidden content for all other roles
  // Now test with the required role to confirm it works
  setupMockAuth({
    ...mockUsers.client,
    roles: [requiredRole],
  });
  
  // Render the component
  const { container } = rtlRender(React.createElement(Component, props));
  
  // Reset the mock
  resetMockAuth();
  
  // If the component doesn't show forbidden content with this role, it requires this role
  return !container.innerHTML.includes('forbidden') && 
         !container.innerHTML.includes('unauthorized') &&
         !container.innerHTML.includes('access denied') &&
         container.innerHTML.length > 0; // Not redirected away
}

/**
 * Mock fetch function for API testing
 */
export const mockFetch = vi.fn().mockImplementation(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ success: true }),
  })
);

/**
 * Helper to create mock API routes
 */
export const mockApi = (path: string, response: any, options = {}) => {
  return vi.fn().mockImplementation(() => Promise.resolve({
    ok: true,
    json: () => Promise.resolve(response),
    ...options,
  }));
};

// Export all utilities
export {
  mockUsers,
  createMockUser,
  configureMockClerk,
  createUnauthenticatedMock,
};

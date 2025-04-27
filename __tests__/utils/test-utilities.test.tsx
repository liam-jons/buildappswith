/**
 * Test the updated test utilities for Clerk authentication
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen } from './test-utils';
import { UserRole } from '@/lib/auth/types';
import { useAuth } from '@/lib/auth/clerk-hooks';
import { configureMockClerk, resetMockClerk, createUnauthenticatedMock } from './clerk-test-utils';

// Mock the clerk-hooks module
vi.mock('@/lib/auth/clerk-hooks', () => ({
  useAuth: vi.fn(),
}));

// Reset mocks after each test
afterEach(() => {
  vi.resetAllMocks();
});

// Component that uses auth hook for testing
function TestAuthComponent() {
  const { user, isAuthenticated, isLoading, isClient, isBuilder, isAdmin } = useAuth();
  
  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Not authenticated</div>;
  
  return (
    <div>
      <div>User: {user?.name}</div>
      <div>Email: {user?.email}</div>
      <div>Client: {isClient ? 'Yes' : 'No'}</div>
      <div>Builder: {isBuilder ? 'Yes' : 'No'}</div>
      <div>Admin: {isAdmin ? 'Yes' : 'No'}</div>
    </div>
  );
}

describe('Test Utilities for Clerk Authentication', () => {
  beforeEach(() => {
    // Set up the mock implementation for useAuth
    vi.mocked(useAuth).mockImplementation(() => {
      const clerkAuth = vi.mocked('@clerk/nextjs').useAuth();
      const clerkUser = vi.mocked('@clerk/nextjs').useUser().user;
      
      const roles = clerkUser?.publicMetadata?.roles as UserRole[] || [];
      
      return {
        user: clerkUser ? {
          id: clerkUser.id,
          name: clerkUser.fullName || '',
          email: clerkUser.primaryEmailAddress?.emailAddress || '',
          image: clerkUser.imageUrl || '',
          roles,
          verified: clerkUser.primaryEmailAddress?.verification?.status === 'verified',
          stripeCustomerId: clerkUser.publicMetadata?.stripeCustomerId as string || null,
        } : null,
        isLoading: !clerkAuth.isLoaded,
        isAuthenticated: !!clerkAuth.isSignedIn,
        isClient: roles.includes(UserRole.CLIENT) || false,
        isBuilder: roles.includes(UserRole.BUILDER) || false,
        isAdmin: roles.includes(UserRole.ADMIN) || false,
        status: clerkAuth.isLoaded ? (clerkAuth.isSignedIn ? "authenticated" : "unauthenticated") : "loading",
        signIn: vi.fn(),
        signOut: vi.fn(),
        updateSession: vi.fn(),
      };
    });
  });

  it('should render a component with client role user', () => {
    render(<TestAuthComponent />);
    
    expect(screen.getByText('User: Client User')).toBeInTheDocument();
    expect(screen.getByText('Email: client@example.com')).toBeInTheDocument();
    expect(screen.getByText('Client: Yes')).toBeInTheDocument();
    expect(screen.getByText('Builder: No')).toBeInTheDocument();
    expect(screen.getByText('Admin: No')).toBeInTheDocument();
  });

  it('should render a component with builder role user', () => {
    render(<TestAuthComponent />, { userType: 'builder' });
    
    expect(screen.getByText('User: Builder User')).toBeInTheDocument();
    expect(screen.getByText('Email: builder@example.com')).toBeInTheDocument();
    expect(screen.getByText('Client: No')).toBeInTheDocument();
    expect(screen.getByText('Builder: Yes')).toBeInTheDocument();
    expect(screen.getByText('Admin: No')).toBeInTheDocument();
  });

  it('should render a component with admin role user', () => {
    render(<TestAuthComponent />, { userType: 'admin' });
    
    expect(screen.getByText('User: Admin User')).toBeInTheDocument();
    expect(screen.getByText('Email: admin@example.com')).toBeInTheDocument();
    expect(screen.getByText('Client: No')).toBeInTheDocument();
    expect(screen.getByText('Builder: No')).toBeInTheDocument();
    expect(screen.getByText('Admin: Yes')).toBeInTheDocument();
  });

  it('should render a component with multi-role user', () => {
    render(<TestAuthComponent />, { userType: 'multiRole' });
    
    expect(screen.getByText('User: Multi Role User')).toBeInTheDocument();
    expect(screen.getByText('Email: multirole@example.com')).toBeInTheDocument();
    expect(screen.getByText('Client: Yes')).toBeInTheDocument();
    expect(screen.getByText('Builder: Yes')).toBeInTheDocument();
    expect(screen.getByText('Admin: No')).toBeInTheDocument();
  });

  it('should render a component with custom user overrides', () => {
    render(
      <TestAuthComponent />, 
      { 
        userType: 'client',
        userOverrides: {
          name: 'Custom User',
          email: 'custom@example.com',
          roles: [UserRole.CLIENT, UserRole.ADMIN],
        }
      }
    );
    
    expect(screen.getByText('User: Custom User')).toBeInTheDocument();
    expect(screen.getByText('Email: custom@example.com')).toBeInTheDocument();
    expect(screen.getByText('Client: Yes')).toBeInTheDocument();
    expect(screen.getByText('Builder: No')).toBeInTheDocument();
    expect(screen.getByText('Admin: Yes')).toBeInTheDocument();
  });

  it('should render unauthenticated state', () => {
    // Reset and create unauthenticated Clerk mock
    resetMockClerk();
    vi.mock('@clerk/nextjs', () => createUnauthenticatedMock());
    
    render(<TestAuthComponent />);
    
    expect(screen.getByText('Not authenticated')).toBeInTheDocument();
  });
});

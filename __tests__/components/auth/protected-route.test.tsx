import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import ProtectedRoute from '@/components/auth/protected-route';
import { renderWithAuth, setupMockAuth, resetMockAuth } from '../../utils/auth-test-utils';
import { UserRole } from '@/lib/auth/types';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  })),
  usePathname: () => '/admin',
  useSearchParams: () => ({ get: () => null }),
}));

// Mock fetch API
global.fetch = jest.fn();

describe('ProtectedRoute Component', () => {
  // Reset all mocks after each test
  afterEach(() => {
    jest.clearAllMocks();
    resetMockAuth();
  });

  // Test authentication check
  it('redirects to login if user is not authenticated', async () => {
    // Mock unauthenticated session
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: () => Promise.resolve(null),
    });

    // Get the mocked router
    const router = require('next/navigation').useRouter();

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    // Wait for authentication check to complete
    await waitFor(() => {
      expect(router.push).toHaveBeenCalledWith('/login');
    });

    // Check that protected content is not rendered
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  // Test authenticated user with no required roles
  it('renders children if user is authenticated and no roles are required', async () => {
    // Mock authenticated session
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: () => Promise.resolve({
        user: {
          id: 'user-id',
          roles: [UserRole.CLIENT],
        },
      }),
    });

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    // Wait for authentication check to complete
    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });

  // Test authenticated user with required roles
  it('renders children if user has the required role', async () => {
    // Mock authenticated session with admin role
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: () => Promise.resolve({
        user: {
          id: 'admin-id',
          roles: [UserRole.ADMIN],
        },
      }),
    });

    render(
      <ProtectedRoute requiredRoles={[UserRole.ADMIN]}>
        <div>Admin Content</div>
      </ProtectedRoute>
    );

    // Wait for authentication check to complete
    await waitFor(() => {
      expect(screen.getByText('Admin Content')).toBeInTheDocument();
    });
  });

  // Test authenticated user with wrong role
  it('redirects to dashboard if user does not have the required role', async () => {
    // Mock authenticated session with client role
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: () => Promise.resolve({
        user: {
          id: 'client-id',
          roles: [UserRole.CLIENT],
        },
      }),
    });

    // Get the mocked router
    const router = require('next/navigation').useRouter();

    render(
      <ProtectedRoute requiredRoles={[UserRole.ADMIN]}>
        <div>Admin Content</div>
      </ProtectedRoute>
    );

    // Wait for authentication check to complete
    await waitFor(() => {
      expect(router.push).toHaveBeenCalledWith('/dashboard');
    });

    // Check that protected content is not rendered
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });

  // Test authenticated user with multiple roles
  it('renders children if user has one of multiple required roles', async () => {
    // Mock authenticated session with multiple roles
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: () => Promise.resolve({
        user: {
          id: 'multi-role-id',
          roles: [UserRole.CLIENT, UserRole.BUILDER],
        },
      }),
    });

    render(
      <ProtectedRoute requiredRoles={[UserRole.BUILDER, UserRole.ADMIN]}>
        <div>Builder Content</div>
      </ProtectedRoute>
    );

    // Wait for authentication check to complete
    await waitFor(() => {
      expect(screen.getByText('Builder Content')).toBeInTheDocument();
    });
  });

  // Test loading state
  it('shows loading indicator while checking authentication', async () => {
    // Mock slow resolving session check
    (global.fetch as jest.Mock).mockImplementationOnce(() => 
      new Promise(resolve => 
        setTimeout(() => 
          resolve({
            json: () => Promise.resolve({
              user: {
                id: 'user-id',
                roles: [UserRole.CLIENT],
              },
            }),
          }), 
          100
        )
      )
    );

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    // Check that loading indicator is shown
    expect(screen.getByRole('status')).toBeInTheDocument();
    
    // Wait for authentication check to complete
    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });

  // Test error handling
  it('redirects to login if authentication check fails', async () => {
    // Mock failed authentication check
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    // Get the mocked router
    const router = require('next/navigation').useRouter();

    // Suppress console error for this test
    jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    // Wait for authentication check to complete
    await waitFor(() => {
      expect(router.push).toHaveBeenCalledWith('/login');
    });

    // Check that protected content is not rendered
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    
    // Restore console.error
    (console.error as jest.Mock).mockRestore();
  });

  // Test redirect with callback URL
  it('redirects to login with callback URL when not authenticated', async () => {
    // Mock unauthenticated session
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: () => Promise.resolve(null),
    });

    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/admin/dashboard',
      },
      writable: true,
    });

    // Get the mocked router
    const router = require('next/navigation').useRouter();

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    // Wait for authentication check to complete
    await waitFor(() => {
      expect(router.push).toHaveBeenCalledWith('/login?callbackUrl=%2Fadmin%2Fdashboard');
    });
  });
});

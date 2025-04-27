/**
 * Protected Route Tests
 * Version: 1.0.115
 * 
 * Tests for the ProtectedRoute component using the new Clerk authentication utilities
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, afterEach } from 'vitest';
import { renderWithAuth, resetMockClerk, createUnauthenticatedMock } from '../../utils/auth-test-utils';
import { UserRole } from '@/lib/auth/types';

// Import the ProtectedRoute component
import ProtectedRoute from '@/components/auth/protected-route';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  })),
  usePathname: () => '/admin',
  useSearchParams: () => ({ get: () => null }),
}));

describe('ProtectedRoute Component', () => {
  // Reset all mocks after each test
  afterEach(() => {
    vi.clearAllMocks();
    resetMockClerk();
  });

  // Test authentication check
  it('redirects to login if user is not authenticated', async () => {
    // Mock unauthenticated state with Clerk
    resetMockClerk();
    vi.mock('@clerk/nextjs', () => createUnauthenticatedMock());
    
    // Get the mocked router
    const router = require('next/navigation').useRouter();

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    // Wait for authentication check to complete
    await waitFor(() => {
      expect(router.push).toHaveBeenCalledWith(expect.stringContaining('/login'));
    });

    // Check that protected content is not rendered
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  // Test authenticated user with no required roles
  it('renders children if user is authenticated and no roles are required', async () => {
    // Render with client user
    const { getByText } = renderWithAuth(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>,
      { userType: 'client' }
    );

    // Wait for authentication check to complete
    await waitFor(() => {
      expect(getByText('Protected Content')).toBeInTheDocument();
    });
  });

  // Test authenticated user with required roles
  it('renders children if user has the required role', async () => {
    // Render with admin user
    const { getByText } = renderWithAuth(
      <ProtectedRoute requiredRoles={[UserRole.ADMIN]}>
        <div>Admin Content</div>
      </ProtectedRoute>,
      { userType: 'admin' }
    );

    // Wait for authentication check to complete
    await waitFor(() => {
      expect(getByText('Admin Content')).toBeInTheDocument();
    });
  });

  // Test authenticated user with wrong role
  it('redirects to dashboard if user does not have the required role', async () => {
    // Get the mocked router
    const router = require('next/navigation').useRouter();

    // Render with client user
    renderWithAuth(
      <ProtectedRoute requiredRoles={[UserRole.ADMIN]}>
        <div>Admin Content</div>
      </ProtectedRoute>,
      { userType: 'client' }
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
    // Render with multi-role user
    const { getByText } = renderWithAuth(
      <ProtectedRoute requiredRoles={[UserRole.BUILDER, UserRole.ADMIN]}>
        <div>Builder Content</div>
      </ProtectedRoute>,
      { userType: 'multiRole' }
    );

    // Wait for authentication check to complete
    await waitFor(() => {
      expect(getByText('Builder Content')).toBeInTheDocument();
    });
  });

  // Test loading state
  it('shows loading indicator while checking authentication', async () => {
    // Use loading state for authentication check
    const originalUseAuth = require('@/lib/auth/clerk-hooks').useAuth;
    const mockUseAuth = vi.fn().mockReturnValue({ 
      isLoading: true,
      isAuthenticated: false,
      user: null 
    });
    
    vi.mock('@/lib/auth/clerk-hooks', () => ({
      ...vi.importActual('@/lib/auth/clerk-hooks'),
      useAuth: mockUseAuth
    }));

    // Render component
    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    // Check that loading indicator is shown
    expect(screen.getByRole('status')).toBeInTheDocument();
    
    // Restore original useAuth
    vi.mock('@/lib/auth/clerk-hooks', () => ({
      ...vi.importActual('@/lib/auth/clerk-hooks'),
      useAuth: originalUseAuth
    }));
  });

  // Test redirect with callback URL
  it('redirects to login with callback URL when not authenticated', async () => {
    // Mock unauthenticated state with Clerk
    resetMockClerk();
    vi.mock('@clerk/nextjs', () => createUnauthenticatedMock());

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
      expect(router.push).toHaveBeenCalledWith(expect.stringContaining('callbackUrl'));
    });
  });
});

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import AdminDashboardLayout from '@/app/(platform)/admin/layout';
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

// Mock the AdminNav component
jest.mock('@/components/admin/admin-nav', () => ({
  AdminNav: () => <div data-testid="admin-nav">Admin Navigation</div>,
}));

// Mock the ProtectedRoute component to directly test its integration
jest.mock('@/components/auth/protected-route', () => ({
  __esModule: true,
  default: ({ children, requiredRoles }: { children: React.ReactNode, requiredRoles?: string[] }) => (
    <div data-testid="protected-route" data-roles={requiredRoles?.join(',')}>
      {children}
    </div>
  ),
}));

// Mock fetch API for auth checks
global.fetch = jest.fn().mockImplementation(() => 
  Promise.resolve({
    json: () => Promise.resolve({
      user: {
        id: 'admin-id',
        roles: [UserRole.ADMIN],
      },
    }),
  })
);

describe('AdminDashboardLayout Component', () => {
  // Reset all mocks after each test
  afterEach(() => {
    jest.clearAllMocks();
    resetMockAuth();
  });

  // Test the component renders with protected route
  it('renders the admin layout with ProtectedRoute wrapper', async () => {
    render(
      <AdminDashboardLayout>
        <div>Admin Dashboard Content</div>
      </AdminDashboardLayout>
    );

    // Verify protected route is used with admin role
    const protectedRoute = screen.getByTestId('protected-route');
    expect(protectedRoute).toBeInTheDocument();
    expect(protectedRoute).toHaveAttribute('data-roles', UserRole.ADMIN);
    
    // Verify admin nav is rendered
    expect(screen.getByTestId('admin-nav')).toBeInTheDocument();
    
    // Verify content is rendered
    expect(screen.getByText('Admin Dashboard Content')).toBeInTheDocument();
  });

  // Test that heading is rendered correctly
  it('renders the admin dashboard heading', async () => {
    render(
      <AdminDashboardLayout>
        <div>Test Content</div>
      </AdminDashboardLayout>
    );

    // Verify heading is rendered
    expect(screen.getByRole('heading', { name: /admin dashboard/i })).toBeInTheDocument();
  });

  // Test integration with real ProtectedRoute (with role checks)
  it('integrates correctly with ProtectedRoute for role-based access', async () => {
    // Unmock ProtectedRoute to test real integration
    jest.unmock('@/components/auth/protected-route');
    
    // Re-import with the real implementation
    const { default: RealAdminDashboardLayout } = await import('@/app/(platform)/admin/layout');
    
    // Mock authenticated session with admin role
    (global.fetch as jest.Mock).mockResolvedValue({
      json: () => Promise.resolve({
        user: {
          id: 'admin-id',
          roles: [UserRole.ADMIN],
        },
      }),
    });

    render(
      <RealAdminDashboardLayout>
        <div>Admin Dashboard Content</div>
      </RealAdminDashboardLayout>
    );

    // Wait for authentication check to complete
    await waitFor(() => {
      expect(screen.getByText('Admin Dashboard Content')).toBeInTheDocument();
    });
  });

  // Test with a non-admin user
  it('restricts access for non-admin users', async () => {
    // Unmock ProtectedRoute to test real integration
    jest.unmock('@/components/auth/protected-route');
    
    // Re-import with the real implementation
    const { default: RealAdminDashboardLayout } = await import('@/app/(platform)/admin/layout');
    
    // Mock authenticated session with client role (non-admin)
    (global.fetch as jest.Mock).mockResolvedValue({
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
      <RealAdminDashboardLayout>
        <div>Admin Dashboard Content</div>
      </RealAdminDashboardLayout>
    );

    // Wait for authentication check to complete and redirect
    await waitFor(() => {
      expect(router.push).toHaveBeenCalledWith('/dashboard');
    });

    // Check that admin content is not rendered
    expect(screen.queryByText('Admin Dashboard Content')).not.toBeInTheDocument();
  });

  // Test with unauthenticated user
  it('redirects unauthenticated users to login', async () => {
    // Unmock ProtectedRoute to test real integration
    jest.unmock('@/components/auth/protected-route');
    
    // Re-import with the real implementation
    const { default: RealAdminDashboardLayout } = await import('@/app/(platform)/admin/layout');
    
    // Mock unauthenticated session
    (global.fetch as jest.Mock).mockResolvedValue({
      json: () => Promise.resolve(null),
    });

    // Get the mocked router
    const router = require('next/navigation').useRouter();

    render(
      <RealAdminDashboardLayout>
        <div>Admin Dashboard Content</div>
      </RealAdminDashboardLayout>
    );

    // Wait for authentication check to complete and redirect
    await waitFor(() => {
      expect(router.push).toHaveBeenCalledWith(expect.stringContaining('/login'));
    });

    // Check that admin content is not rendered
    expect(screen.queryByText('Admin Dashboard Content')).not.toBeInTheDocument();
  });
});

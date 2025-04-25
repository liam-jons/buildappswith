import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import AdminBuildersPage from '@/app/(platform)/admin/builders/page';
import { renderWithAuth, setupMockAuth, resetMockAuth } from '../../utils/auth-test-utils';
import { UserRole } from '@/lib/auth/types';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  })),
  usePathname: () => '/admin/builders',
  useSearchParams: () => ({ get: () => null }),
}));

// Mock components
jest.mock('@/components/profile/validation-tier-badge', () => ({
  ValidationTierBadge: ({ tier, size }: { tier: string, size?: string }) => (
    <div data-testid={`validation-tier-${tier}`} data-size={size}>
      Validation Tier: {tier}
    </div>
  ),
}));

// Mock Sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock Sentry
jest.mock('@sentry/nextjs', () => ({
  captureException: jest.fn(),
}));

// Mock fetch API
global.fetch = jest.fn().mockImplementation((url) => {
  if (url === '/api/test/auth') {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        user: {
          id: 'admin-id',
          roles: [UserRole.ADMIN],
        },
      }),
    });
  }
  
  if (url.includes('/api/marketplace/builders')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        data: [
          {
            id: 'builder-1',
            name: 'Test Builder 1',
            title: 'AI Developer',
            validationTier: 'established',
            rating: 4.8,
            joinDate: '2023-01-01',
          },
          {
            id: 'builder-2',
            name: 'Test Builder 2',
            title: 'Frontend Expert',
            validationTier: 'expert',
            rating: 4.9,
            joinDate: '2023-02-15',
          },
        ],
        pagination: {
          page: 1,
          limit: 50,
          total: 2,
          totalPages: 1,
          hasMore: false,
        },
      }),
    });
  }
  
  if (url === '/api/admin/builders/prototype') {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        message: 'Prototype builder profile created successfully',
      }),
    });
  }
  
  // Default response for unmatched URLs
  return Promise.resolve({
    ok: false,
    json: () => Promise.resolve({ error: 'Not found' }),
  });
});

describe('AdminBuildersPage Component', () => {
  // Reset all mocks after each test
  afterEach(() => {
    jest.clearAllMocks();
    resetMockAuth();
  });

  // Test loading state
  it('displays loading state while fetching data', async () => {
    // Delay fetch response
    jest.spyOn(global, 'fetch').mockImplementationOnce(() => 
      new Promise((resolve) => setTimeout(() => resolve({
        ok: true,
        json: () => Promise.resolve({
          user: {
            id: 'admin-id',
            roles: [UserRole.ADMIN],
          },
        }),
      }), 100))
    );

    renderWithAuth(<AdminBuildersPage />, {
      userType: 'admin',
    });

    // Check for loading state
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument(); // Loading spinner
  });

  // Test successful data fetch for admin user
  it('displays builder management page for admin users', async () => {
    renderWithAuth(<AdminBuildersPage />, {
      userType: 'admin',
    });

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Builder Management')).toBeInTheDocument();
    });

    // Verify page content
    expect(screen.getByText('Builder Profiles')).toBeInTheDocument();
    expect(screen.getByText('Manage builder profiles and validation levels')).toBeInTheDocument();
    
    // Verify builder data is displayed in table
    expect(screen.getByText('Test Builder 1')).toBeInTheDocument();
    expect(screen.getByText('Test Builder 2')).toBeInTheDocument();
    expect(screen.getByText('AI Developer')).toBeInTheDocument();
    expect(screen.getByText('Frontend Expert')).toBeInTheDocument();
    
    // Verify table headers
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Validation')).toBeInTheDocument();
    expect(screen.getByText('Rating')).toBeInTheDocument();
    expect(screen.getByText('Join Date')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  // Test restricted access for non-admin users
  it('redirects non-admin users to dashboard', async () => {
    // Mock non-admin user
    jest.spyOn(global, 'fetch').mockImplementationOnce((url) => {
      if (url === '/api/test/auth') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            user: {
              id: 'client-id',
              roles: [UserRole.CLIENT],
            },
          }),
        });
      }
      return Promise.reject(new Error('Unexpected URL'));
    });
    
    // Get the mocked router
    const router = require('next/navigation').useRouter();
    
    renderWithAuth(<AdminBuildersPage />, {
      userType: 'client',
    });
    
    // Wait for authentication check to complete and redirect
    await waitFor(() => {
      expect(router.push).toHaveBeenCalledWith('/');
    });
  });

  // Test unauthenticated user access
  it('redirects unauthenticated users to login', async () => {
    // Get the mocked router
    const router = require('next/navigation').useRouter();
    
    // Render with unauthenticated state
    const { useAuth } = require('@clerk/nextjs');
    useAuth.mockReturnValue({
      isLoaded: true,
      userId: null,
    });
    
    render(<AdminBuildersPage />);
    
    // Wait for authentication check to complete and redirect
    await waitFor(() => {
      expect(router.push).toHaveBeenCalledWith('/login');
    });
  });

  // Test create prototype builder functionality
  it('allows admin to create prototype builder profile', async () => {
    // Spy on toast
    const { toast } = require('sonner');
    
    renderWithAuth(<AdminBuildersPage />, {
      userType: 'admin',
    });
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Builder Management')).toBeInTheDocument();
    });
    
    // Click create prototype button
    fireEvent.click(screen.getByText('Create Prototype Builder'));
    
    // Wait for request to complete
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        expect.stringContaining('Prototype builder profile created')
      );
    });
    
    // Check that fetch was called with correct URL and method
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/admin/builders/prototype',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      })
    );
  });

  // Test empty state
  it('displays empty state when no builders are found', async () => {
    // Mock an empty response
    jest.spyOn(global, 'fetch').mockImplementation((url) => {
      if (url === '/api/test/auth') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            user: {
              id: 'admin-id',
              roles: [UserRole.ADMIN],
            },
          }),
        });
      }
      
      if (url.includes('/api/marketplace/builders')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            data: [],
            pagination: {
              page: 1,
              limit: 50,
              total: 0,
              totalPages: 0,
              hasMore: false,
            },
          }),
        });
      }
      
      return Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'Not found' }),
      });
    });
    
    renderWithAuth(<AdminBuildersPage />, {
      userType: 'admin',
    });
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Builder Management')).toBeInTheDocument();
    });
    
    // Verify empty state content
    expect(screen.getByText('No builder profiles found')).toBeInTheDocument();
    expect(screen.getByText('Create Prototype Builder Profile')).toBeInTheDocument();
  });

  // Test error handling
  it('handles fetch errors gracefully', async () => {
    // Mock a fetch that fails
    jest.spyOn(global, 'fetch').mockImplementationOnce((url) => {
      if (url === '/api/test/auth') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            user: {
              id: 'admin-id',
              roles: [UserRole.ADMIN],
            },
          }),
        });
      }
      return Promise.reject(new Error('Network error'));
    });
    
    // Spy on toast and Sentry
    const { toast } = require('sonner');
    const Sentry = require('@sentry/nextjs');
    
    renderWithAuth(<AdminBuildersPage />, {
      userType: 'admin',
    });
    
    // Wait for error handling
    await waitFor(() => {
      expect(Sentry.captureException).toHaveBeenCalled();
    });
  });
  
  // Test view profile link
  it('allows admin to navigate to builder profiles', async () => {
    renderWithAuth(<AdminBuildersPage />, {
      userType: 'admin',
    });
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Builder Management')).toBeInTheDocument();
    });
    
    // Find and click view profile button
    const viewProfileButtons = screen.getAllByText('View Profile');
    fireEvent.click(viewProfileButtons[0]);
    
    // Get the mocked router
    const router = require('next/navigation').useRouter();
    
    // Check navigation
    expect(router.push).toHaveBeenCalledWith(expect.stringContaining('/builder-profile/'));
  });
});
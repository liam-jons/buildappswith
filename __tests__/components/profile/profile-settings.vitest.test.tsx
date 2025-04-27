import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithAuth } from '../../utils/vitest-auth-utils';
import ProfilePage from '@/app/profile-settings/page';
import { UserRole } from '@/lib/auth/types';

// Mock components that would be used
vi.mock('@/components/site-header', () => ({
  SiteHeader: () => <div data-testid="site-header">Site Header</div>,
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock fetch
global.fetch = vi.fn();

describe('ProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock for fetch
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({
        message: 'Profile updated successfully',
        user: {
          id: 'user-id',
          name: 'Test User',
          email: 'test@example.com',
          roles: [UserRole.CLIENT],
        },
      }),
    });
  });

  it('renders the profile settings form', () => {
    renderWithAuth(<ProfilePage />);

    // Check that the form renders correctly
    expect(screen.getByText('Profile Settings')).toBeDefined();
    expect(screen.getByLabelText('Name')).toBeDefined();
    expect(screen.getByLabelText('Email')).toBeDefined();
    expect(screen.getByText('Client - I want to commission apps')).toBeDefined();
    expect(screen.getByText('Builder - I want to build apps for clients')).toBeDefined();
    expect(screen.getByRole('button', { name: /Update Profile/i })).toBeDefined();
    expect(screen.getByText('Account Status')).toBeDefined();
  });

  it('pre-fills the form with user data', async () => {
    renderWithAuth(<ProfilePage />, {
      userType: 'client',
      userOverrides: {
        name: 'John Doe',
        email: 'john.doe@example.com',
      },
    });

    // Check that form fields are pre-filled
    await waitFor(() => {
      expect(screen.getByLabelText('Name')).toHaveValue('John Doe');
      expect(screen.getByLabelText('Email')).toHaveValue('john.doe@example.com');
    });

    // Check that client role is selected
    const clientRadio = screen.getByLabelText(/Client - I want to commission apps/i);
    expect(clientRadio).toBeChecked();
  });

  it('pre-fills the form for builder role', async () => {
    renderWithAuth(<ProfilePage />, {
      userType: 'builder',
    });

    // Check that builder role is selected
    await waitFor(() => {
      const builderRadio = screen.getByLabelText(/Builder - I want to build apps for clients/i);
      expect(builderRadio).toBeChecked();
    });
  });

  it('pre-fills the form for admin role', async () => {
    renderWithAuth(<ProfilePage />, {
      userType: 'admin',
    });

    // Check that admin role is selected
    await waitFor(() => {
      const adminRadio = screen.getByLabelText(/Admin - Platform administration/i);
      expect(adminRadio).toBeChecked();
    });
  });

  it('shows admin role option only for admin users', async () => {
    // Render with client role (non-admin)
    const { queryByLabelText, unmount } = renderWithAuth(<ProfilePage />, {
      userType: 'client',
    });

    // Check that admin role option is not shown
    await waitFor(() => {
      expect(queryByLabelText(/Admin - Platform administration/i)).toBeNull();
    });

    // Unmount to clean up
    unmount();

    // Render with admin role
    renderWithAuth(<ProfilePage />, {
      userType: 'admin',
    });

    // Check that admin role option is shown
    await waitFor(() => {
      expect(screen.getByLabelText(/Admin - Platform administration/i)).toBeDefined();
    });
  });

  it('redirects to login if user is not authenticated', async () => {
    // Create custom unauthenticated user mock
    const unauthenticated = {
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
    };

    // Mock Clerk with unauthenticated state
    vi.mock('@clerk/nextjs', () => unauthenticated);

    // Force re-import of the module to use the mock
    vi.resetModules();
    const ProfilePageReimported = require('@/app/profile-settings/page').default;
    
    const router = require('next/navigation').useRouter();
    
    // Render page with unauthenticated mock
    render(<ProfilePageReimported />);

    // Check that it redirects to login
    await waitFor(() => {
      expect(router.push).toHaveBeenCalledWith('/login');
    });
  });

  it('shows loading state initially', () => {
    // Create a user that is still loading
    const loadingUser = {
      useUser: vi.fn().mockReturnValue({
        isLoaded: false,
        user: null,
      }),
      useAuth: vi.fn().mockReturnValue({
        isLoaded: false,
      }),
      ClerkProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    };

    vi.mock('@clerk/nextjs', () => loadingUser);
    
    // Force re-import of the module to use the mock
    vi.resetModules();
    const ProfilePageReimported = require('@/app/profile-settings/page').default;
    
    // Render page with loading mock
    render(<ProfilePageReimported />);

    // Check that it shows loading state
    expect(screen.getByRole('status')).toBeDefined();
  });

  it('submits form with updated name successfully', async () => {
    const toast = require('sonner').toast;
    
    // Mock user.reload function
    const mockReload = vi.fn();
    
    renderWithAuth(<ProfilePage />, {
      userType: 'client',
      userOverrides: {
        reload: mockReload,
      },
    });

    // Change the name field
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Updated Name' } });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Update Profile/i }));

    // Check that API was called with correct data
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/profiles/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Updated Name',
          role: UserRole.CLIENT,
        }),
      });
    });

    // Check that success toast was shown
    expect(toast.success).toHaveBeenCalledWith('Profile updated', {
      description: expect.any(String),
    });

    // Check that user.reload was called to refresh user data
    expect(mockReload).toHaveBeenCalled();
  });

  it('submits form with updated role successfully', async () => {
    renderWithAuth(<ProfilePage />, {
      userType: 'client',
    });

    // Change the role
    fireEvent.click(screen.getByLabelText(/Builder - I want to build apps for clients/i));

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Update Profile/i }));

    // Check that API was called with correct data
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/profiles/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Client User', // Default name from mock
          role: UserRole.BUILDER,
        }),
      });
    });
  });

  it('validates form data before submission', async () => {
    renderWithAuth(<ProfilePage />);

    // Clear the name field
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: '' } });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Update Profile/i }));

    // Check that validation error is shown
    await waitFor(() => {
      expect(screen.getByText('Name must be at least 2 characters.')).toBeDefined();
    });

    // Verify that API was not called
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('shows error toast when API request fails', async () => {
    const toast = require('sonner').toast;

    // Mock fetch to fail
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      json: async () => ({
        error: 'Something went wrong',
      }),
    });

    renderWithAuth(<ProfilePage />);

    // Change the name field
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Updated Name' } });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Update Profile/i }));

    // Check that error toast was shown
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Something went wrong', {
        description: expect.any(String),
      });
    });
  });

  it('handles network errors gracefully', async () => {
    const toast = require('sonner').toast;

    // Mock fetch to throw an error
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network error'));

    renderWithAuth(<ProfilePage />);

    // Change the name field
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Updated Name' } });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Update Profile/i }));

    // Check that error toast was shown
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Something went wrong', {
        description: expect.any(String),
      });
    });
  });

  it('shows loading state during form submission', async () => {
    // Delay the API response
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({
            ok: true,
            json: async () => ({
              message: 'Profile updated successfully',
              user: { id: 'user-id', name: 'Updated Name' },
            }),
          });
        }, 100);
      });
    });

    renderWithAuth(<ProfilePage />);

    // Change the name field
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Updated Name' } });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Update Profile/i }));

    // Check that loading state is shown
    expect(screen.getByRole('button', { name: /Update Profile/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Update Profile/i }).querySelector('.animate-spin')).toBeDefined();
  });

  it('displays correct account status information', async () => {
    // Render with verified user
    renderWithAuth(<ProfilePage />, {
      userType: 'client',
      userOverrides: {
        verified: true,
        stripeCustomerId: 'stripe-123',
        createdAt: '2023-01-01T00:00:00Z',
      },
    });

    // Check account status section
    await waitFor(() => {
      expect(screen.getByText('Verified Account')).toBeDefined();
      expect(screen.getByText('Payment Account Connected')).toBeDefined();
      expect(screen.getByText(/Account created on/)).toBeDefined();
    });

    // Unmount to clean up
    screen.unmount();

    // Render with unverified user and no payment method
    renderWithAuth(<ProfilePage />, {
      userType: 'unverified',
      userOverrides: {
        stripeCustomerId: null,
      },
    });

    // Check account status section
    await waitFor(() => {
      expect(screen.getByText('Verification Pending')).toBeDefined();
      expect(screen.getByText('No Payment Method')).toBeDefined();
    });
  });

  it('disables the email field', async () => {
    renderWithAuth(<ProfilePage />);

    // Check that email field is disabled
    await waitFor(() => {
      expect(screen.getByLabelText('Email')).toBeDisabled();
      expect(screen.getByText('Your email address cannot be changed here.')).toBeDefined();
    });
  });
});

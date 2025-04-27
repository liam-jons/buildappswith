import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithAuth } from '../../utils/vitest-auth-utils';
import OnboardingPage from '@/app/onboarding/page';
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

describe('OnboardingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock for fetch
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({
        message: 'Profile created successfully',
        user: {
          id: 'user-id',
          name: 'Test User',
          email: 'test@example.com',
          roles: [UserRole.CLIENT],
        },
      }),
    });
  });

  it('renders the onboarding form', () => {
    renderWithAuth(<OnboardingPage />);

    // Check that the form renders correctly
    expect(screen.getByText('Complete Your Profile')).toBeDefined();
    expect(screen.getByLabelText('Name')).toBeDefined();
    expect(screen.getByText('Client - I want to commission apps')).toBeDefined();
    expect(screen.getByText('Builder - I want to build apps for clients')).toBeDefined();
    expect(screen.getByRole('button', { name: /Complete Profile/i })).toBeDefined();
  });

  it('redirects to dashboard if user has already completed onboarding', async () => {
    const router = require('next/navigation').useRouter();

    // Render with a user that has completed onboarding
    renderWithAuth(<OnboardingPage />, {
      userType: 'client',
      userOverrides: {
        publicMetadata: {
          completedOnboarding: true,
        },
      },
    });

    // Check that it redirects to dashboard
    await waitFor(() => {
      expect(router.push).toHaveBeenCalledWith('/dashboard');
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
    const OnboardingPageReimported = require('@/app/onboarding/page').default;
    
    const router = require('next/navigation').useRouter();
    
    // Render page with unauthenticated mock
    render(<OnboardingPageReimported />);

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
    const OnboardingPageReimported = require('@/app/onboarding/page').default;
    
    // Render page with loading mock
    render(<OnboardingPageReimported />);

    // Check that it shows loading state
    expect(screen.getByRole('status')).toBeDefined();
  });

  it('pre-fills form with user data when available', async () => {
    // Render with user that has a name
    renderWithAuth(<OnboardingPage />, {
      userType: 'client',
      userOverrides: {
        name: 'John Doe',
      },
    });

    // Check that name field is pre-filled
    await waitFor(() => {
      expect(screen.getByLabelText('Name')).toHaveValue('John Doe');
    });
  });

  it('submits form with client role successfully', async () => {
    const router = require('next/navigation').useRouter();
    const toast = require('sonner').toast;

    renderWithAuth(<OnboardingPage />);

    // Fill out the form
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'John Smith' } });
    fireEvent.click(screen.getByLabelText(/Client - I want to commission apps/i));

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Complete Profile/i }));

    // Check that API was called with correct data
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/profiles/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'John Smith',
          role: UserRole.CLIENT,
          isOnboarding: true,
        }),
      });
    });

    // Check that success toast was shown
    expect(toast.success).toHaveBeenCalledWith('Profile created', {
      description: expect.any(String),
    });

    // Check that user is redirected to dashboard
    expect(router.push).toHaveBeenCalledWith('/dashboard');
  });

  it('submits form with builder role successfully', async () => {
    renderWithAuth(<OnboardingPage />);

    // Fill out the form
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Jane Builder' } });
    fireEvent.click(screen.getByLabelText(/Builder - I want to build apps for clients/i));

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Complete Profile/i }));

    // Check that API was called with correct data
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/profiles/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Jane Builder',
          role: UserRole.BUILDER,
          isOnboarding: true,
        }),
      });
    });
  });

  it('validates required fields before submission', async () => {
    renderWithAuth(<OnboardingPage />);

    // Clear the name field
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: '' } });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Complete Profile/i }));

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

    renderWithAuth(<OnboardingPage />);

    // Fill out the form
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'John Smith' } });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Complete Profile/i }));

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

    renderWithAuth(<OnboardingPage />);

    // Fill out the form
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'John Smith' } });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Complete Profile/i }));

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
              message: 'Profile created successfully',
              user: { id: 'user-id', name: 'Test User' },
            }),
          });
        }, 100);
      });
    });

    renderWithAuth(<OnboardingPage />);

    // Fill out the form
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'John Smith' } });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Complete Profile/i }));

    // Check that loading state is shown
    expect(screen.getByRole('button', { name: /Complete Profile/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Complete Profile/i }).querySelector('.animate-spin')).toBeDefined();
  });
});

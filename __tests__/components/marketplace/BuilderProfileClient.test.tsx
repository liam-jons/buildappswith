import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BuilderProfileClient } from '@/app/(platform)/marketplace/[id]/BuilderProfileClient';
import { renderWithAuth, setupMockAuth, resetMockAuth } from '../../utils/auth-test-utils';

// Mock the next/image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} src={props.src || ''} alt={props.alt || ''} />;
  },
}));

// Mock the next/navigation hooks
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/marketplace/builder-id',
  useSearchParams: () => ({ get: () => null }),
}));

// Mock the UI components that might cause issues in the test environment
jest.mock('@/components/profile/validation-tier-badge', () => ({
  ValidationTierBadge: ({ tier }: { tier: string }) => (
    <div data-testid={`validation-tier-${tier}`}>Validation Tier: {tier}</div>
  ),
}));

// Add a test ID to the loading state for easier testing
jest.mock('@/components/ui/card', () => {
  const actual = jest.requireActual('@/components/ui/card');
  return {
    ...actual,
    Card: ({ children, className }: { children: React.ReactNode, className?: string }) => (
      <div className={className} data-testid="card-component">{children}</div>
    ),
    CardHeader: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="card-header">{children}</div>
    ),
    CardContent: ({ children, className }: { children: React.ReactNode, className?: string }) => (
      <div className={className} data-testid="card-content">{children}</div>
    ),
  };
});

// Mock fetch function to return builder data
global.fetch = jest.fn().mockImplementation((url) => {
  if (url.includes('/api/marketplace/builders/')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        id: 'test-builder-id',
        name: 'Test Builder',
        title: 'AI Developer',
        bio: 'Experienced AI developer specializing in custom solutions.',
        avatarUrl: '/images/avatar-placeholder.png',
        validationTier: 'established',
        skills: ['AI', 'Machine Learning', 'React'],
        hourlyRate: 100,
        portfolio: [
          {
            title: 'Project 1',
            description: 'A custom AI application',
            tags: ['AI', 'Web'],
            imageUrl: '/images/portfolio-placeholder.png',
            projectUrl: 'https://example.com/project1',
          },
        ],
        socialLinks: {
          website: 'https://example.com',
          github: 'https://github.com/testbuilder',
        },
      }),
    });
  }
  return Promise.resolve({
    ok: false,
    json: () => Promise.resolve({ error: 'Not found' }),
  });
});

describe('BuilderProfileClient Component', () => {
  // Reset all mocks after each test
  afterEach(() => {
    jest.clearAllMocks();
    resetMockAuth();
  });

  // Test loading state
  it('displays loading state while fetching builder data', async () => {
    // Delay fetch response
    jest.spyOn(global, 'fetch').mockImplementationOnce(() => 
      new Promise((resolve) => setTimeout(() => resolve({
        ok: true,
        json: () => Promise.resolve({
          id: 'test-builder-id',
          name: 'Test Builder',
          title: 'AI Developer',
          validationTier: 'established',
          skills: [],
        }),
      }), 100))
    );

    render(<BuilderProfileClient builderId="test-builder-id" />);

    // Check for loading state - the component uses animate-pulse class for loading
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  // Test successful data fetch
  it('displays builder profile when data is loaded successfully', async () => {
    renderWithAuth(<BuilderProfileClient builderId="test-builder-id" />, {
      userType: 'client',
    });

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Test Builder')).toBeInTheDocument();
    });

    // Verify profile details are displayed
    expect(screen.getByText('AI Developer')).toBeInTheDocument();
    expect(screen.getByText('Experienced AI developer specializing in custom solutions.')).toBeInTheDocument();
    
    // Verify skills are displayed
    const skills = ['AI', 'Machine Learning', 'React'];
    for (const skill of skills) {
      expect(screen.getByText(skill)).toBeInTheDocument();
    }
    
    // Verify hourly rate is displayed
    expect(screen.getByText('$100')).toBeInTheDocument();
  });

  // Test failed data fetch
  it('displays error message when builder is not found', async () => {
    // Mock a failed fetch
    jest.spyOn(global, 'fetch').mockImplementationOnce(() => 
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'Builder not found' }),
      })
    );

    renderWithAuth(<BuilderProfileClient builderId="non-existent-id" />, {
      userType: 'client',
    });

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText('Builder Not Found')).toBeInTheDocument();
    });
    expect(screen.getByText("The builder profile you're looking for doesn't exist or has been removed.")).toBeInTheDocument();
    expect(screen.getByText('Return to Marketplace')).toBeInTheDocument();
  });

  // Test portfolio tab content
  it('displays portfolio content when portfolio tab is clicked', async () => {
    renderWithAuth(<BuilderProfileClient builderId="test-builder-id" />, {
      userType: 'client',
    });

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Test Builder')).toBeInTheDocument();
    });

    // Click portfolio tab
    const portfolioTab = screen.getByRole('tab', { name: /portfolio/i });
    portfolioTab.click();

    // Check portfolio content
    expect(screen.getByText('Project 1')).toBeInTheDocument();
    expect(screen.getByText('A custom AI application')).toBeInTheDocument();
    expect(screen.getByText('View Project')).toBeInTheDocument();
  });

  // Test sessions tab content
  it('displays sessions booking content when sessions tab is clicked', async () => {
    renderWithAuth(<BuilderProfileClient builderId="test-builder-id" />, {
      userType: 'client',
    });

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Test Builder')).toBeInTheDocument();
    });

    // Click sessions tab
    const sessionsTab = screen.getByRole('tab', { name: /sessions/i });
    sessionsTab.click();

    // Check sessions content
    expect(screen.getByText('Book a Session')).toBeInTheDocument();
    expect(screen.getByText(/Ready to start working with Test Builder/)).toBeInTheDocument();
    expect(screen.getByText('View Available Sessions')).toBeInTheDocument();
  });
  
  // Test access with different user roles
  it('allows all authenticated users to view builder profiles regardless of role', async () => {
    // Test with different user roles
    const roles = ['client', 'builder', 'admin', 'multiRole'];
    
    for (const role of roles) {
      // Reset DOM and mocks
      document.body.innerHTML = '';
      jest.clearAllMocks();
      resetMockAuth();
      
      renderWithAuth(<BuilderProfileClient builderId="test-builder-id" />, {
        userType: role,
      });
      
      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText('Test Builder')).toBeInTheDocument();
      });
      
      // Verify basic profile content is visible
      expect(screen.getByText('AI Developer')).toBeInTheDocument();
    }
  });
  
  // Test with unverified user
  it('allows unverified users to view builder profiles', async () => {
    renderWithAuth(<BuilderProfileClient builderId="test-builder-id" />, {
      userType: 'unverified',
    });
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Test Builder')).toBeInTheDocument();
    });
    
    // Verify profile content is visible to unverified users
    expect(screen.getByText('AI Developer')).toBeInTheDocument();
  });
  
  // Test unauthenticated user access
  it('allows unauthenticated users to view builder profiles', async () => {
    // Mock unauthenticated state
    const mockAuth = {
      useUser: jest.fn().mockReturnValue({
        isLoaded: true,
        isSignedIn: false,
        user: null,
      }),
      useAuth: jest.fn().mockReturnValue({
        isLoaded: true,
        isSignedIn: false,
        userId: null,
        sessionId: null,
        getToken: jest.fn().mockResolvedValue(null),
      }),
      ClerkProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
      SignedIn: () => null,
      SignedOut: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    };
    
    jest.mock('@clerk/nextjs', () => mockAuth);
    
    // Render without auth wrapper
    render(<BuilderProfileClient builderId="test-builder-id" />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Test Builder')).toBeInTheDocument();
    });
    
    // Verify profile content is visible
    expect(screen.getByText('AI Developer')).toBeInTheDocument();
  });
  
  // Test fetch error handling
  it('handles fetch errors gracefully', async () => {
    // Mock a fetch that throws an error
    jest.spyOn(global, 'fetch').mockImplementationOnce(() => 
      Promise.reject(new Error('Network error'))
    );
    
    // Spy on console.error to verify error logging
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    renderWithAuth(<BuilderProfileClient builderId="test-builder-id" />, {
      userType: 'client',
    });
    
    // Wait for error to be logged
    await waitFor(() => {
      expect(console.error).toHaveBeenCalled();
    });
    
    // Verify error state is displayed
    expect(screen.getByText('Builder Not Found')).toBeInTheDocument();
    
    // Restore console.error
    jest.restoreAllMocks();
  });
});

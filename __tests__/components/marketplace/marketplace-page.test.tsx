import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import MarketplacePage from '@/app/(platform)/marketplace/page';
import { renderWithAuth, setupMockAuth, resetMockAuth } from '../../utils/auth-test-utils';
import { UserRole } from '@/lib/auth/types';

// Mock components to simplify testing
jest.mock('@/components/profile/validation-tier-badge', () => ({
  ValidationTierBadge: ({ tier }: { tier: string }) => (
    <div data-testid={`validation-tier-${tier}`}>Validation Tier: {tier}</div>
  ),
}));

jest.mock('@/components/marketplace/builder-card', () => ({
  BuilderCard: ({ builder }: { builder: any }) => (
    <div data-testid="builder-card" data-builder-id={builder.id}>
      <h3>{builder.name}</h3>
      <p>{builder.title}</p>
    </div>
  ),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/marketplace',
  useSearchParams: () => ({ get: () => null }),
}));

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

// Mock Magic UI components
jest.mock('@/components/magicui/text-shimmer', () => ({
  TextShimmer: ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div className={className} data-testid="text-shimmer">{children}</div>
  ),
}));

// Mock fetch function
global.fetch = jest.fn().mockImplementation((url) => {
  if (url.includes('/api/marketplace/filters')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        skills: [
          { value: 'ai', label: 'AI' },
          { value: 'machine-learning', label: 'Machine Learning' },
          { value: 'react', label: 'React' },
        ],
        validationTiers: [
          { value: 'entry', label: 'Entry' },
          { value: 'established', label: 'Established' },
          { value: 'expert', label: 'Expert' },
        ],
        availability: [
          { value: 'full-time', label: 'Full Time' },
          { value: 'part-time', label: 'Part Time' },
          { value: 'weekends', label: 'Weekends' },
        ],
        sortOptions: [
          { value: 'rating', label: 'Rating' },
          { value: 'newest', label: 'Newest' },
          { value: 'hourly-rate', label: 'Hourly Rate' },
        ],
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
            bio: 'Experienced AI developer specializing in custom solutions.',
            avatarUrl: '/images/avatar-placeholder.png',
            validationTier: 'established',
            skills: ['AI', 'Machine Learning', 'React'],
            rating: 4.8,
            joinDate: '2023-01-01',
          },
          {
            id: 'builder-2',
            name: 'Test Builder 2',
            title: 'Frontend Expert',
            bio: 'Specialized in building beautiful interfaces.',
            avatarUrl: '/images/avatar-placeholder.png',
            validationTier: 'expert',
            skills: ['React', 'TypeScript', 'UI/UX'],
            rating: 4.9,
            joinDate: '2023-02-15',
          },
          {
            id: 'builder-3',
            name: 'Test Builder 3',
            title: 'Full Stack Developer',
            bio: 'Building end-to-end solutions.',
            avatarUrl: '/images/avatar-placeholder.png',
            validationTier: 'entry',
            skills: ['Node.js', 'MongoDB', 'React'],
            rating: 4.5,
            joinDate: '2023-03-10',
          },
        ],
        pagination: {
          page: 1,
          limit: 9,
          total: 3,
          totalPages: 1,
          hasMore: false,
        },
      }),
    });
  }
  
  // Default response for unmatched URLs
  return Promise.resolve({
    ok: false,
    json: () => Promise.resolve({ error: 'Not found' }),
  });
});

describe('MarketplacePage Component', () => {
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
          skills: [], validationTiers: [], availability: [], sortOptions: []
        }),
      }), 100))
    );

    render(<MarketplacePage />);

    // Check for loading state - the component uses animate-pulse for loading
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  // Test successful data fetch for unauthenticated user
  it('displays marketplace for unauthenticated users', async () => {
    render(<MarketplacePage />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('AI Application Builders')).toBeInTheDocument();
    });

    // Verify marketplace is displayed
    expect(screen.getByText('Find skilled builders to help bring your AI application ideas to life')).toBeInTheDocument();
    
    // Verify builder cards are displayed
    expect(screen.getByTestId('builder-card')).toBeInTheDocument();
    expect(screen.getByText('Test Builder 1')).toBeInTheDocument();
  });

  // Test authenticated user access with different roles
  it('allows all user roles to access the marketplace', async () => {
    // Test with different user roles
    const roles = ['client', 'builder', 'admin', 'multiRole', 'unverified'];
    
    for (const role of roles) {
      // Reset DOM and mocks
      document.body.innerHTML = '';
      jest.clearAllMocks();
      resetMockAuth();
      
      renderWithAuth(<MarketplacePage />, {
        userType: role,
      });
      
      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText('AI Application Builders')).toBeInTheDocument();
      });
      
      // Verify marketplace is displayed
      expect(screen.getByText('Find skilled builders to help bring your AI application ideas to life')).toBeInTheDocument();
      
      // Verify all builder cards are displayed
      expect(screen.getAllByTestId('builder-card').length).toBe(3);
    }
  });

  // Test search functionality
  it('allows users to search for builders', async () => {
    render(<MarketplacePage />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('AI Application Builders')).toBeInTheDocument();
    });

    // Find search input and change its value
    const searchInput = screen.getByPlaceholderText('Search builders...');
    fireEvent.change(searchInput, { target: { value: 'AI' } });

    // Verify search input value is updated
    expect(searchInput).toHaveValue('AI');
  });

  // Test sorting functionality
  it('allows users to sort builders', async () => {
    render(<MarketplacePage />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('AI Application Builders')).toBeInTheDocument();
    });

    // Find sort select and click to open
    const sortSelect = screen.getByRole('combobox');
    fireEvent.click(sortSelect);
    
    // Wait for sort options to appear
    await waitFor(() => {
      expect(screen.getByText('Newest')).toBeInTheDocument();
    });
    
    // Click on an option
    fireEvent.click(screen.getByText('Newest'));
  });

  // Test filter functionality
  it('displays filter options correctly', async () => {
    render(<MarketplacePage />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Filters')).toBeInTheDocument();
    });

    // Verify filter categories
    expect(screen.getByText('Validation Level')).toBeInTheDocument();
    expect(screen.getByText('Availability')).toBeInTheDocument();
    expect(screen.getByText('Skills')).toBeInTheDocument();
    
    // Verify filter options
    expect(screen.getByText('Apply Filters')).toBeInTheDocument();
  });

  // Test empty state
  it('displays empty state when no builders are found', async () => {
    // Mock an empty response
    jest.spyOn(global, 'fetch').mockImplementation((url) => {
      if (url.includes('/api/marketplace/filters')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            skills: [],
            validationTiers: [],
            availability: [],
            sortOptions: [],
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
              limit: 9,
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

    render(<MarketplacePage />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('No builders found')).toBeInTheDocument();
    });

    // Verify empty state content
    expect(screen.getByText('Try adjusting your search or filters to find builders')).toBeInTheDocument();
    expect(screen.getByText('Reset Filters')).toBeInTheDocument();
    expect(screen.getByText('Interested in becoming a builder?')).toBeInTheDocument();
  });

  // Test error handling
  it('handles fetch errors gracefully', async () => {
    // Mock a fetch that throws an error
    jest.spyOn(global, 'fetch').mockImplementationOnce(() => 
      Promise.reject(new Error('Network error'))
    );
    
    // Spy on console.error to verify error logging
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(<MarketplacePage />);
    
    // Wait for error to be logged
    await waitFor(() => {
      expect(console.error).toHaveBeenCalled();
    });
    
    // Restore console.error
    jest.restoreAllMocks();
  });
});
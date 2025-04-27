/**
 * Profile Card Component Tests
 * Version: 1.0.117
 * 
 * Tests for the ProfileCard component using the new Clerk authentication utilities
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { renderWithAuth, resetMockClerk, createUnauthenticatedMock } from '../../utils/auth-test-utils';
import { UserRole } from '@/lib/auth/types';
import { vi, describe, it, expect, afterEach } from 'vitest';
import { ProfileCard } from '@/components/profile/profile-card';

// Mock the ValidationTierBadge component
vi.mock('@/components/profile/validation-tier-badge', () => ({
  ValidationTierBadge: ({ tier, size }: { tier: string, size?: string }) => (
    <div data-testid={`validation-tier-${tier}`} data-size={size}>
      Validation Tier: {tier}
    </div>
  ),
}));

// Mock window.location
const locationAssignMock = vi.fn();
Object.defineProperty(window, 'location', {
  value: {
    assign: locationAssignMock,
    href: '',
  },
  writable: true,
});

// Sample profile data for tests
const mockProfile = {
  id: 'test-profile-id',
  userId: 'test-user-id',
  name: 'Test User',
  title: 'AI Enthusiast',
  bio: 'Exploring the possibilities of AI applications.',
  avatarUrl: '/images/avatar-placeholder.png',
  validationTier: 'entry' as 'entry' | 'established' | 'expert',
  skills: ['AI', 'Machine Learning', 'Python'],
  roles: [UserRole.CLIENT],
};

describe('ProfileCard Component', () => {
  // Reset all mocks after each test
  afterEach(() => {
    vi.clearAllMocks();
    resetMockClerk();
    locationAssignMock.mockClear();
  });

  // Test basic rendering
  it('renders profile card correctly with all information', () => {
    render(<ProfileCard profile={mockProfile} />);

    // Check profile name and title
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('AI Enthusiast')).toBeInTheDocument();
    
    // Check validation tier badge
    expect(screen.getByTestId('validation-tier-entry')).toBeInTheDocument();
    
    // Check avatar image
    const avatarImg = screen.getByAltText('Test User');
    expect(avatarImg).toBeInTheDocument();
    expect(avatarImg).toHaveAttribute('src', expect.stringContaining('avatar-placeholder'));
    
    // Check bio
    expect(screen.getByText('Exploring the possibilities of AI applications.')).toBeInTheDocument();
    
    // Check skills
    mockProfile.skills.forEach(skill => {
      expect(screen.getByText(skill)).toBeInTheDocument();
    });
    
    // Check for client role badge
    expect(screen.getByText('Client')).toBeInTheDocument();
  });

  // Test with minimal profile data
  it('handles profile with minimal information', () => {
    const minimalProfile = {
      id: 'minimal-profile',
      userId: 'minimal-user',
      name: 'Minimal User',
      validationTier: 'entry' as 'entry' | 'established' | 'expert',
      roles: [UserRole.CLIENT],
    };
    
    render(<ProfileCard profile={minimalProfile} />);
    
    // Check profile name
    expect(screen.getByText('Minimal User')).toBeInTheDocument();
    
    // Check default message when no bio is provided
    expect(screen.getByText("This user hasn't added a bio yet.")).toBeInTheDocument();
    
    // Check validation tier badge
    expect(screen.getByTestId('validation-tier-entry')).toBeInTheDocument();
  });

  // Test with many skills (truncation)
  it('truncates skills when there are more than 5', () => {
    const profileWithManySkills = {
      ...mockProfile,
      skills: ['AI', 'Machine Learning', 'Python', 'JavaScript', 'React', 'Node.js', 'TypeScript'],
    };
    
    render(<ProfileCard profile={profileWithManySkills} />);
    
    // Check first 5 skills are displayed
    ['AI', 'Machine Learning', 'Python', 'JavaScript', 'React'].forEach(skill => {
      expect(screen.getByText(skill)).toBeInTheDocument();
    });
    
    // Check +2 more indicator
    expect(screen.getByText('+2 more')).toBeInTheDocument();
    
    // Verify hidden skills are not visible
    expect(screen.queryByText('Node.js')).not.toBeInTheDocument();
    expect(screen.queryByText('TypeScript')).not.toBeInTheDocument();
  });

  // Test view profile button action
  it('navigates to profile page when View Profile button is clicked', () => {
    render(<ProfileCard profile={mockProfile} />);
    
    // Click view profile button
    fireEvent.click(screen.getByText('View Profile'));
    
    // Check navigation
    expect(window.location.href).toBe('/profiles/test-profile-id');
  });

  // Test authenticated user interactions
  it('renders the same for all user roles without role-specific elements', () => {
    // Test with different user roles
    const roles = ['client', 'builder', 'admin', 'multiRole', 'unverified'];
    
    for (const role of roles) {
      // Reset DOM and mocks
      document.body.innerHTML = '';
      vi.clearAllMocks();
      resetMockClerk();
      
      renderWithAuth(<ProfileCard profile={mockProfile} />, {
        userType: role,
      });
      
      // Check fundamental content for all roles
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('AI Enthusiast')).toBeInTheDocument();
      expect(screen.getByTestId('validation-tier-entry')).toBeInTheDocument();
      expect(screen.getByText('View Profile')).toBeInTheDocument();
    }
  });

  // Test unauthenticated user access
  it('renders correctly for unauthenticated users', () => {
    // Set up unauthenticated state with Clerk
    resetMockClerk();
    vi.mock('@clerk/nextjs', () => createUnauthenticatedMock());
    
    render(<ProfileCard profile={mockProfile} />);
    
    // Check profile name and title
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('AI Enthusiast')).toBeInTheDocument();
    
    // Check view profile button
    expect(screen.getByText('View Profile')).toBeInTheDocument();
  });

  // Test different validation tiers
  it('shows the correct validation tier badge', () => {
    // Test entry tier
    render(<ProfileCard profile={mockProfile} />);
    expect(screen.getByTestId('validation-tier-entry')).toBeInTheDocument();
    
    // Reset DOM
    document.body.innerHTML = '';
    
    // Test established tier
    render(<ProfileCard profile={{ ...mockProfile, validationTier: 'established' }} />);
    expect(screen.getByTestId('validation-tier-established')).toBeInTheDocument();
    
    // Reset DOM
    document.body.innerHTML = '';
    
    // Test expert tier
    render(<ProfileCard profile={{ ...mockProfile, validationTier: 'expert' }} />);
    expect(screen.getByTestId('validation-tier-expert')).toBeInTheDocument();
  });

  // Test multiple roles
  it('shows all role badges when user has multiple roles', () => {
    const multiRoleProfile = {
      ...mockProfile,
      roles: [UserRole.CLIENT, UserRole.BUILDER],
    };
    
    render(<ProfileCard profile={multiRoleProfile} />);
    
    // Check both role badges are displayed
    expect(screen.getByText('Client')).toBeInTheDocument();
    expect(screen.getByText('Builder')).toBeInTheDocument();
  });

  // Test accessibility concerns
  it('provides accessible information', () => {
    render(<ProfileCard profile={mockProfile} />);
    
    // Avatar should have proper alt text
    expect(screen.getByAltText('Test User')).toBeInTheDocument();
    
    // Button should be accessible
    expect(screen.getByRole('button', { name: 'View Profile' })).toBeInTheDocument();
  });
});
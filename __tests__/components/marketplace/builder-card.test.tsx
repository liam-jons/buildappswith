/**
 * Builder Card Component Tests
 * Version: 1.0.116
 * 
 * Tests for the BuilderCard component using the new Clerk authentication utilities
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BuilderCard } from '@/components/marketplace/builder-card';
import { renderWithAuth, resetMockClerk, createUnauthenticatedMock } from '../../utils/auth-test-utils';
import { UserRole } from '@/lib/auth/types';
import { vi, describe, it, expect, afterEach } from 'vitest';

// Mock the ValidationTierBadge component
vi.mock('@/components/profile/validation-tier-badge', () => ({
  ValidationTierBadge: ({ tier, size }: { tier: string, size?: string }) => (
    <div data-testid={`validation-tier-${tier}`} data-size={size}>
      Validation Tier: {tier}
    </div>
  ),
}));

// Mock the BuilderImage component
vi.mock('@/components/marketplace/builder-image', () => ({
  BuilderImage: ({ src, alt, fallbackText, size }: { src?: string, alt: string, fallbackText?: string, size?: string }) => (
    <div data-testid="builder-image" data-src={src} data-alt={alt} data-fallback={fallbackText} data-size={size}>
      Builder Image
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

// Sample builder data for tests
const mockBuilder = {
  id: 'test-builder-id',
  name: 'Test Builder',
  title: 'AI Developer',
  bio: 'Experienced AI developer specializing in custom solutions.',
  avatarUrl: '/images/avatar-placeholder.png',
  validationTier: 'established' as 'entry' | 'established' | 'expert',
  skills: ['AI', 'Machine Learning', 'React'],
  hourlyRate: 100,
};

describe('BuilderCard Component', () => {
  // Reset all mocks after each test
  afterEach(() => {
    vi.clearAllMocks();
    resetMockClerk();
    locationAssignMock.mockClear();
  });

  // Test basic rendering
  it('renders builder card correctly with all information', () => {
    render(<BuilderCard builder={mockBuilder} />);

    // Check builder name and title
    expect(screen.getByText('Test Builder')).toBeInTheDocument();
    expect(screen.getByText('AI Developer')).toBeInTheDocument();
    
    // Check validation tier badge
    expect(screen.getByTestId('validation-tier-established')).toBeInTheDocument();
    
    // Check builder image
    expect(screen.getByTestId('builder-image')).toBeInTheDocument();
    expect(screen.getByTestId('builder-image')).toHaveAttribute('data-src', '/images/avatar-placeholder.png');
    
    // Check bio
    expect(screen.getByText('Experienced AI developer specializing in custom solutions.')).toBeInTheDocument();
    
    // Check skills
    mockBuilder.skills.forEach(skill => {
      expect(screen.getByText(skill)).toBeInTheDocument();
    });
    
    // Check view profile button
    expect(screen.getByText('View Profile')).toBeInTheDocument();
  });

  // Test with minimal builder data
  it('handles builder with minimal information', () => {
    const minimalBuilder = {
      id: 'minimal-builder',
      name: 'Minimal Builder',
      validationTier: 'entry' as 'entry' | 'established' | 'expert',
    };
    
    render(<BuilderCard builder={minimalBuilder} />);
    
    // Check builder name
    expect(screen.getByText('Minimal Builder')).toBeInTheDocument();
    
    // Check default bio message
    expect(screen.getByText("This builder hasn't added a bio yet.")).toBeInTheDocument();
    
    // Check validation tier badge
    expect(screen.getByTestId('validation-tier-entry')).toBeInTheDocument();
  });

  // Test with many skills (truncation)
  it('truncates skills when there are more than 5', () => {
    const builderWithManySkills = {
      ...mockBuilder,
      skills: ['AI', 'Machine Learning', 'React', 'TypeScript', 'Node.js', 'Python', 'AWS'],
    };
    
    render(<BuilderCard builder={builderWithManySkills} />);
    
    // Check first 5 skills are displayed
    ['AI', 'Machine Learning', 'React', 'TypeScript', 'Node.js'].forEach(skill => {
      expect(screen.getByText(skill)).toBeInTheDocument();
    });
    
    // Check +2 more indicator
    expect(screen.getByText('+2 more')).toBeInTheDocument();
    
    // Verify hidden skills are not visible
    expect(screen.queryByText('Python')).not.toBeInTheDocument();
    expect(screen.queryByText('AWS')).not.toBeInTheDocument();
  });

  // Test view profile button action
  it('navigates to builder profile when View Profile button is clicked', () => {
    render(<BuilderCard builder={mockBuilder} />);
    
    // Click view profile button
    fireEvent.click(screen.getByText('View Profile'));
    
    // Check navigation
    expect(window.location.href).toBe('/marketplace/test-builder-id');
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
      
      renderWithAuth(<BuilderCard builder={mockBuilder} />, {
        userType: role,
      });
      
      // Check fundamental content for all roles
      expect(screen.getByText('Test Builder')).toBeInTheDocument();
      expect(screen.getByText('AI Developer')).toBeInTheDocument();
      expect(screen.getByTestId('validation-tier-established')).toBeInTheDocument();
      expect(screen.getByText('View Profile')).toBeInTheDocument();
    }
  });

  // Test unauthenticated user access
  it('renders correctly for unauthenticated users', () => {
    // Set up unauthenticated state with Clerk
    resetMockClerk();
    vi.mock('@clerk/nextjs', () => createUnauthenticatedMock());
    
    render(<BuilderCard builder={mockBuilder} />);
    
    // Check builder name and title
    expect(screen.getByText('Test Builder')).toBeInTheDocument();
    expect(screen.getByText('AI Developer')).toBeInTheDocument();
    
    // Check view profile button
    expect(screen.getByText('View Profile')).toBeInTheDocument();
  });

  // Test accessibility concerns
  it('provides accessible information', () => {
    render(<BuilderCard builder={mockBuilder} />);
    
    // Image should have proper alt text
    expect(screen.getByTestId('builder-image')).toHaveAttribute('data-alt', 'Test Builder');
    
    // Button should be accessible
    expect(screen.getByRole('button', { name: 'View Profile' })).toBeInTheDocument();
  });
});
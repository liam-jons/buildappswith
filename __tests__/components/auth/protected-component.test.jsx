/**
 * Protected Component Tests
 * Version: 1.0.114
 * 
 * Tests for protected components using the new Clerk authentication utilities
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { 
  renderWithAuth, 
  mockUsers, 
  createUnauthenticatedMock, 
  resetMockClerk 
} from '../../utils/auth-test-utils';

// Example protected component that shows different content based on user role
const ProtectedComponent = ({ requireAuth = true }) => {
  // Import hooks from mock
  const { useUser, useAuth } = require('@clerk/nextjs');
  
  // Get user from mock hooks
  const { user } = useUser();
  const { isSignedIn } = useAuth();
  
  // If not signed in and auth is required, show login message
  if (!isSignedIn && requireAuth) {
    return <div>Please log in to access this content</div>;
  }
  
  // Check for admin role
  const isAdmin = user?.publicMetadata?.roles?.includes('ADMIN');
  
  // Check for builder role
  const isBuilder = user?.publicMetadata?.roles?.includes('BUILDER');
  
  // Render conditional content based on role
  return (
    <div>
      <h1>Protected Component</h1>
      <p>Welcome, {user?.firstName}</p>
      
      {/* Client content (visible to all authenticated users) */}
      <div data-testid="client-content">
        <h2>Client Dashboard</h2>
        <p>This content is visible to all authenticated users</p>
      </div>
      
      {/* Builder content */}
      {isBuilder && (
        <div data-testid="builder-content">
          <h2>Builder Dashboard</h2>
          <p>This content is only visible to builders</p>
        </div>
      )}
      
      {/* Admin content */}
      {isAdmin && (
        <div data-testid="admin-content">
          <h2>Admin Dashboard</h2>
          <p>This content is only visible to admins</p>
        </div>
      )}
    </div>
  );
};

describe('ProtectedComponent', () => {
  // Reset all mocks after each test
  afterEach(() => {
    vi.resetAllMocks();
  });
  
  // Test that unauthenticated users see login message
  it('shows login message for unauthenticated users', () => {
    // Reset and create unauthenticated Clerk mock
    resetMockClerk();
    vi.mock('@clerk/nextjs', () => createUnauthenticatedMock());
    
    // Render the component without auth provider
    const { getByText } = render(<ProtectedComponent />);
    
    // Verify login message is shown
    expect(getByText('Please log in to access this content')).toBeInTheDocument();
  });
  
  // Test that client users see client content only
  it('shows client content for users with CLIENT role', () => {
    // Render with client user
    const { getByTestId, queryByTestId } = renderWithAuth(<ProtectedComponent />, {
      userType: 'client',
    });
    
    // Verify client content is shown
    expect(getByTestId('client-content')).toBeInTheDocument();
    
    // Verify builder content is not shown
    expect(queryByTestId('builder-content')).not.toBeInTheDocument();
    
    // Verify admin content is not shown
    expect(queryByTestId('admin-content')).not.toBeInTheDocument();
  });
  
  // Test that builder users see client and builder content
  it('shows client and builder content for users with BUILDER role', () => {
    // Render with builder user
    const { getByTestId, queryByTestId } = renderWithAuth(<ProtectedComponent />, {
      userType: 'builder',
    });
    
    // Verify client content is shown
    expect(getByTestId('client-content')).toBeInTheDocument();
    
    // Verify builder content is shown
    expect(getByTestId('builder-content')).toBeInTheDocument();
    
    // Verify admin content is not shown
    expect(queryByTestId('admin-content')).not.toBeInTheDocument();
  });
  
  // Test that admin users see all content
  it('shows all content for users with ADMIN role', () => {
    // Render with admin user
    const { getByTestId } = renderWithAuth(<ProtectedComponent />, {
      userType: 'admin',
    });
    
    // Verify client content is shown
    expect(getByTestId('client-content')).toBeInTheDocument();
    
    // Verify admin content is shown
    expect(getByTestId('admin-content')).toBeInTheDocument();
  });
  
  // Test with multi-role user
  it('shows appropriate content for users with multiple roles', () => {
    // Render with multi-role user (client + builder)
    const { getByTestId, queryByTestId } = renderWithAuth(<ProtectedComponent />, {
      userType: 'multiRole',
    });
    
    // Verify client content is shown
    expect(getByTestId('client-content')).toBeInTheDocument();
    
    // Verify builder content is shown
    expect(getByTestId('builder-content')).toBeInTheDocument();
    
    // Verify admin content is not shown
    expect(queryByTestId('admin-content')).not.toBeInTheDocument();
  });
  
  // Test with custom user
  it('allows testing with custom user properties', () => {
    // Render with custom user (client with custom name)
    const { getByText } = renderWithAuth(<ProtectedComponent />, {
      userType: 'client',
      userOverrides: {
        name: 'Custom Name',
      },
    });
    
    // Verify custom name is shown
    expect(getByText('Welcome, Custom')).toBeInTheDocument();
  });
});

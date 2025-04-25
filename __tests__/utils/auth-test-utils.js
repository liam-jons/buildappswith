const React = require('react')
const RTL = require('@testing-library/react')
const { mockUsers } = require('../mocks/users.ts')

/**
 * Configure different auth mocks to simulate different user roles and states
 * @param {string} userType The type of user to mock ('client', 'builder', 'admin', 'multiRole', 'unverified')
 * @param {Object} overrides Override specific properties of the mock user
 * @returns {Object} Configured mock functions for @clerk/nextjs
 */
function configureMockAuth(userType = 'client', overrides = {}) {
  // Get the base mock user based on userType
  const mockUser = typeof userType === 'string' 
    ? { ...mockUsers[userType], ...overrides }
    : userType // Allow passing a complete user object

  // Create Clerk mocks with the specified user type
  return {
    auth: jest.fn().mockReturnValue({
      userId: mockUser.clerkId,
      sessionId: `session-${mockUser.clerkId}`,
      getToken: jest.fn().mockResolvedValue('test-token'),
    }),
    currentUser: jest.fn().mockResolvedValue({
      id: mockUser.clerkId,
      firstName: mockUser.name ? mockUser.name.split(' ')[0] : 'Test',
      lastName: mockUser.name ? mockUser.name.split(' ')[1] || '' : 'User',
      emailAddresses: [{ 
        emailAddress: mockUser.email,
        id: 'email-id',
        verification: { status: mockUser.verified ? 'verified' : 'unverified' }
      }],
      primaryEmailAddressId: 'email-id',
      imageUrl: mockUser.image,
      username: mockUser.name?.replace(' ', '') || 'testuser',
      publicMetadata: {
        roles: mockUser.roles,
      },
    }),
    useUser: jest.fn().mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
      user: {
        id: mockUser.clerkId,
        firstName: mockUser.name ? mockUser.name.split(' ')[0] : 'Test',
        lastName: mockUser.name ? mockUser.name.split(' ')[1] || '' : 'User',
        primaryEmailAddress: { 
          emailAddress: mockUser.email,
          id: 'email-id',
          verification: { status: mockUser.verified ? 'verified' : 'unverified' }
        },
        imageUrl: mockUser.image,
        username: mockUser.name?.replace(' ', '') || 'testuser',
        publicMetadata: {
          roles: mockUser.roles,
        },
      },
    }),
    useAuth: jest.fn().mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
      userId: mockUser.clerkId,
      sessionId: `session-${mockUser.clerkId}`,
      getToken: jest.fn().mockResolvedValue('test-token'),
    }),
    ClerkProvider: ({ children }) => children,
    SignedIn: ({ children }) => children,
    SignedOut: () => null,
  }
}

/**
 * Set up the mock authentication for a test that uses Clerk
 * @param {string} userType The type of user to mock ('client', 'builder', 'admin', 'multiRole', 'unverified')
 * @param {Object} overrides Override specific properties of the mock user
 */
function setupMockAuth(userType = 'client', overrides = {}) {
  const mockAuth = configureMockAuth(userType, overrides)
  
  // Mock the Clerk authentication module
  jest.mock('@clerk/nextjs', () => mockAuth)
  
  return mockAuth
}

/**
 * Reset the Clerk authentication mock after tests
 */
function resetMockAuth() {
  jest.resetModules()
  jest.restoreAllMocks()
}

/**
 * Auth provider component for testing authenticated components
 * @param {Object} props Component props
 * @param {string} props.userType The type of user to mock ('client', 'builder', 'admin', 'multiRole', 'unverified')
 * @param {Object} props.overrides Override specific properties of the mock user
 * @param {React.ReactNode} props.children Child components
 */
function AuthProvider({ userType = 'client', overrides = {}, children }) {
  // In a real component, this would use ClerkProvider
  // But for testing, we just need to ensure the mock auth is configured
  React.useEffect(() => {
    setupMockAuth(userType, overrides)
    return () => resetMockAuth()
  }, [userType, overrides])
  
  return React.createElement('div', { 'data-testid': 'auth-provider' }, children)
}

/**
 * Custom render method that wraps components with auth provider
 * @param {React.ReactNode} ui Component to render
 * @param {Object} options Render options
 * @param {string} options.userType The type of user to mock ('client', 'builder', 'admin', 'multiRole', 'unverified')
 * @param {Object} options.userOverrides Override specific properties of the mock user
 * @param {Object} options.renderOptions Additional options to pass to render
 */
function renderWithAuth(ui, { userType = 'client', userOverrides = {}, ...renderOptions } = {}) {
  setupMockAuth(userType, userOverrides)
  
  const Wrapper = ({ children }) => {
    return React.createElement(AuthProvider, { userType, overrides: userOverrides }, children)
  }
  
  return {
    ...RTL.render(ui, { wrapper: Wrapper, ...renderOptions }),
    mockUser: typeof userType === 'string' 
      ? { ...mockUsers[userType], ...userOverrides }
      : { ...userType, ...userOverrides },
  }
}

/**
 * Helper to test if a component requires authentication
 * @param {React.ReactNode} Component The component to test
 * @param {Object} props Props to pass to the component
 * @returns {boolean} True if the component requires authentication
 */
function requiresAuthentication(Component, props = {}) {
  // Configure mock for signed out user
  const signedOutMock = {
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
    ClerkProvider: ({ children }) => children,
    SignedIn: () => null,
    SignedOut: ({ children }) => children,
  }
  
  // Mock the Clerk authentication module
  jest.mock('@clerk/nextjs', () => signedOutMock)
  
  // Render the component
  const { container } = RTL.render(React.createElement(Component, props))
  
  // Reset the mock
  resetMockAuth()
  
  // If the component redirects or shows login content, it requires authentication
  return container.innerHTML.includes('login') || 
         container.innerHTML.includes('sign in') ||
         container.innerHTML.includes('unauthorized') ||
         container.innerHTML.length === 0 // Redirected away
}

/**
 * Helper to test if a component requires a specific role
 * @param {React.ReactNode} Component The component to test
 * @param {string} requiredRole The role to test for ('CLIENT', 'BUILDER', 'ADMIN')
 * @param {Object} props Props to pass to the component
 * @returns {boolean} True if the component requires the specific role
 */
function requiresRole(Component, requiredRole, props = {}) {
  // Test with all roles except the required one
  const allRoles = ['CLIENT', 'BUILDER', 'ADMIN']
  const otherRoles = allRoles.filter(role => role !== requiredRole)
  
  // Test with each role individually
  for (const role of otherRoles) {
    // Create a user with just this role
    const mockUser = {
      ...mockUsers.client,
      roles: [role],
    }
    
    // Configure mock for user with this role
    setupMockAuth(mockUser)
    
    // Render the component
    const { container } = RTL.render(React.createElement(Component, props))
    
    // Check if the component shows forbidden/unauthorized content
    const requiresOtherRole = 
      container.innerHTML.includes('forbidden') || 
      container.innerHTML.includes('unauthorized') ||
      container.innerHTML.includes('access denied') ||
      container.innerHTML.length === 0 // Redirected away
    
    // Reset the mock
    resetMockAuth()
    
    // If the component works with any other role, it doesn't require this specific role
    if (!requiresOtherRole) {
      return false
    }
  }
  
  // If we got here, the component showed forbidden content for all other roles
  // Now test with the required role to confirm it works
  setupMockAuth({
    ...mockUsers.client,
    roles: [requiredRole],
  })
  
  // Render the component
  const { container } = RTL.render(React.createElement(Component, props))
  
  // Reset the mock
  resetMockAuth()
  
  // If the component doesn't show forbidden content with this role, it requires this role
  return !container.innerHTML.includes('forbidden') && 
         !container.innerHTML.includes('unauthorized') &&
         !container.innerHTML.includes('access denied') &&
         container.innerHTML.length > 0 // Not redirected away
}

// Export all utilities
module.exports = {
  mockUsers: require('../mocks/users.ts').mockUsers,
  createMockUser: require('../mocks/users.ts').createMockUser,
  configureMockAuth,
  setupMockAuth,
  resetMockAuth,
  renderWithAuth,
  requiresAuthentication,
  requiresRole,
  AuthProvider,
}
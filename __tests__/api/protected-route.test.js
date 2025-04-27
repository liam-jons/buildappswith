const { mockUsers, setupMockAuth, resetMockAuth } = require('../utils/auth-test-utils')

// Mock Next.js server components
jest.mock('next/server', () => ({
  NextRequest: class NextRequest {
    constructor(url) {
      this.url = url
      this.method = 'GET'
      this.headers = new Map()
    }
  },
  NextResponse: {
    json: (body, init) => ({
      status: init?.status || 200,
      headers: new Map(),
      json: async () => body,
    }),
  },
}))

// Import after mocking
const { NextRequest, NextResponse } = require('next/server')

// First, let's mock the requireAuth and requireRole functions
jest.mock('@/lib/auth/clerk/helpers', () => ({
  requireAuth: jest.fn(),
  requireRole: jest.fn(),
  hasRole: jest.fn(),
}))

// Import after mocking
const { requireAuth, requireRole, hasRole } = require('@/lib/auth/clerk/helpers')

// Mock the API handlers
jest.mock('@/lib/auth/clerk/api-auth', () => {
  // Get the actual implementation
  const original = jest.requireActual('@/lib/auth/clerk/api-auth')
  
  // Create jest.fn wrappers for testing
  return {
    withAuth: jest.fn(handler => original.withAuth(handler)),
    withRole: jest.fn((role, handler) => original.withRole(role, handler)),
    withAdmin: jest.fn(handler => original.withAdmin(handler)),
    withBuilder: jest.fn(handler => original.withBuilder(handler)),
  }
})

// Import after mocking
const { withAuth, withRole, withAdmin, withBuilder } = require('@/lib/auth/clerk/api-auth')

describe('Protected API Routes', () => {
  // Reset mocks after each test
  afterEach(() => {
    jest.clearAllMocks()
    resetMockAuth()
  })
  
  describe('withAuth handler', () => {
    // Test successful authentication
    it('allows authenticated requests', async () => {
      // Setup mock authenticated user
      setupMockAuth('client')
      
      // Configure requireAuth to return a mock user
      requireAuth.mockResolvedValueOnce(mockUsers.client)
      
      // Create a mock handler function
      const mockHandler = jest.fn().mockReturnValue(
        NextResponse.json({ success: true })
      )
      
      // Wrap the handler with withAuth
      const protectedHandler = withAuth(mockHandler)
      
      // Create a mock request
      const req = new NextRequest('https://example.com/api/test')
      
      // Call the handler
      const response = await protectedHandler(req)
      
      // Verify handler was called with user
      expect(mockHandler).toHaveBeenCalledWith(req, mockUsers.client)
      
      // Verify response
      expect(response.status).toBe(200)
      expect(await response.json()).toEqual({ success: true })
    })
    
    // Test unauthorized access
    it('rejects unauthenticated requests', async () => {
      // Configure requireAuth to throw unauthorized error
      requireAuth.mockRejectedValueOnce(new Error('Unauthorized'))
      
      // Create a mock handler function
      const mockHandler = jest.fn()
      
      // Wrap the handler with withAuth
      const protectedHandler = withAuth(mockHandler)
      
      // Create a mock request
      const req = new NextRequest('https://example.com/api/test')
      
      // Call the handler
      const response = await protectedHandler(req)
      
      // Verify handler was not called
      expect(mockHandler).not.toHaveBeenCalled()
      
      // Verify response
      expect(response.status).toBe(401)
      expect(await response.json()).toEqual({ error: 'Unauthorized' })
    })
  })
  
  describe('withRole handler', () => {
    // Test successful role access
    it('allows users with the required role', async () => {
      // Setup mock authenticated user with admin role
      setupMockAuth('admin')
      
      // Configure requireRole to return a mock user
      requireRole.mockResolvedValueOnce(mockUsers.admin)
      
      // Create a mock handler function
      const mockHandler = jest.fn().mockReturnValue(
        NextResponse.json({ success: true })
      )
      
      // Wrap the handler with withRole
      const protectedHandler = withRole('ADMIN', mockHandler)
      
      // Create a mock request
      const req = new NextRequest('https://example.com/api/admin')
      
      // Call the handler
      const response = await protectedHandler(req)
      
      // Verify handler was called with user
      expect(mockHandler).toHaveBeenCalledWith(req, mockUsers.admin)
      
      // Verify response
      expect(response.status).toBe(200)
      expect(await response.json()).toEqual({ success: true })
    })
    
    // Test unauthorized access
    it('rejects users without the required role', async () => {
      // Configure requireRole to throw forbidden error
      requireRole.mockRejectedValueOnce(new Error('Forbidden: Requires ADMIN role'))
      
      // Create a mock handler function
      const mockHandler = jest.fn()
      
      // Wrap the handler with withRole
      const protectedHandler = withRole('ADMIN', mockHandler)
      
      // Create a mock request
      const req = new NextRequest('https://example.com/api/admin')
      
      // Call the handler
      const response = await protectedHandler(req)
      
      // Verify handler was not called
      expect(mockHandler).not.toHaveBeenCalled()
      
      // Verify response
      expect(response.status).toBe(403)
      expect(await response.json()).toEqual({ error: 'Forbidden: Requires ADMIN role' })
    })
  })
  
  describe('Role-specific handlers', () => {
    // Test withAdmin
    it('withAdmin requires ADMIN role', async () => {
      // Setup to intercept withRole calls
      const originalWithRole = withRole
      withRole.mockImplementation((role, handler) => {
        // Just verify the role, don't actually try to run the handler
        expect(role).toBe('ADMIN')
        return handler // Just return the handler for simplicity
      })
      
      // Create a mock handler
      const mockHandler = jest.fn()
      
      // Wrap with withAdmin
      withAdmin(mockHandler)
      
      // Verify withRole was called with ADMIN role
      expect(withRole).toHaveBeenCalledWith('ADMIN', mockHandler)
      
      // Reset the mock
      withRole.mockImplementation(originalWithRole)
    })
    
    // Test withBuilder
    it('withBuilder requires BUILDER role', async () => {
      // Setup to intercept withRole calls
      const originalWithRole = withRole
      withRole.mockImplementation((role, handler) => {
        // Just verify the role, don't actually try to run the handler
        expect(role).toBe('BUILDER')
        return handler // Just return the handler for simplicity
      })
      
      // Create a mock handler
      const mockHandler = jest.fn()
      
      // Wrap with withBuilder
      withBuilder(mockHandler)
      
      // Verify withRole was called with BUILDER role
      expect(withRole).toHaveBeenCalledWith('BUILDER', mockHandler)
      
      // Reset the mock
      withRole.mockImplementation(originalWithRole)
    })
  })
})

# API Testing Patterns

**Version:** 1.0.0
**Date:** May 10, 2025
**Status:** Approved
**Key Stakeholders:** Engineering Team, API Developers, QA

## Overview

This document outlines the standardized patterns for testing API endpoints in the BuildAppsWith platform. It provides guidance for implementing consistent, thorough API tests across all platform domains and services.

## Key Concepts

- **API Test Layers**: Unit, integration, and E2E testing of API endpoints
- **Request Mocking**: Techniques for mocking API requests
- **Response Validation**: Standard patterns for validating API responses
- **Error Handling**: Testing API error scenarios and responses
- **Authentication**: Testing authenticated API endpoints
- **Data Integrity**: Verifying API data handling and consistency

## API Testing Framework

Our API testing framework consists of:

1. **Testing Infrastructure**
   - MSW (Mock Service Worker) for request interception
   - Next.js API route testing utilities
   - Database transaction isolation
   - Authentication mocking utilities

2. **Test Categories**
   - Unit tests for API utility functions
   - Integration tests for API route handlers
   - E2E tests for complete API flows

3. **Testing Utilities**
   - Mock request/response creators
   - API response validators
   - Authentication header generators
   - Database seeding utilities for API tests

## API Testing Utilities

### Mock Request/Response Utilities

The testing framework provides utilities for mocking Next.js API requests and responses:

```typescript
// __tests__/utils/api-test-utils.ts

import { NextRequest } from 'next/server'
import { vi } from 'vitest'

/**
 * Create a mock NextRequest with optional parameters
 */
export function createMockRequest(
  url: string,
  options: {
    method?: string,
    headers?: Record<string, string>,
    cookies?: Record<string, string>,
    body?: any,
    searchParams?: Record<string, string>
  } = {}
) {
  // Create URL with search params
  const fullUrl = new URL(url.startsWith('http') ? url : `http://localhost${url}`)
  
  // Add search params
  if (options.searchParams) {
    Object.entries(options.searchParams).forEach(([key, value]) => {
      fullUrl.searchParams.set(key, value)
    })
  }
  
  // Create init options
  const init: RequestInit = {
    method: options.method || 'GET',
    headers: options.headers || {},
  }
  
  // Add body if specified
  if (options.body) {
    if (typeof options.body === 'object') {
      init.body = JSON.stringify(options.body)
      init.headers = {
        'Content-Type': 'application/json',
        ...init.headers,
      }
    } else {
      init.body = options.body
    }
  }
  
  // Create request
  const req = new NextRequest(fullUrl, init)
  
  // Add cookies
  if (options.cookies) {
    Object.entries(options.cookies).forEach(([key, value]) => {
      // @ts-ignore - cookies is readonly but we need to mock it
      req.cookies.set(key, value)
    })
  }
  
  return req
}

/**
 * Create a mock route context with params
 */
export function createRouteContext(params: Record<string, string>) {
  return { params }
}

/**
 * Create test authentication headers
 */
export function getAuthHeaders(userId: string, roles: string[] = ['CLIENT']) {
  return {
    'x-user-id': userId,
    'x-user-roles': JSON.stringify(roles),
  }
}

/**
 * Create an authenticated mock request
 */
export function createAuthenticatedRequest(
  url: string,
  userId: string, 
  roles: string[] = ['CLIENT'],
  options: {
    method?: string,
    body?: any,
    searchParams?: Record<string, string>
  } = {}
) {
  return createMockRequest(url, {
    ...options,
    headers: getAuthHeaders(userId, roles),
  })
}

/**
 * Mock response functions for API tests
 */
export function createMockResponseFunctions() {
  const json = vi.fn()
  const status = vi.fn().mockReturnValue({ json })
  const redirect = vi.fn()
  
  return {
    status,
    json,
    redirect,
    headers: new Headers(),
  }
}
```

### API Test Helpers

Utilities for testing API endpoints:

```typescript
// __tests__/utils/api-test-helpers.ts

import { vi } from 'vitest'
import { createMockRequest, createRouteContext } from './api-test-utils'

/**
 * Test an API handler function directly
 */
export async function testApiHandler({
  handler,
  url = 'http://localhost/api/test',
  method = 'GET',
  headers = {},
  params = {},
  body = undefined,
  searchParams = {},
  test,
}) {
  // Create mock request
  const req = createMockRequest(url, {
    method,
    headers,
    body,
    searchParams,
  })
  
  // Create mock context
  const context = createRouteContext(params)
  
  // Call the handler
  const response = await handler(req, context)
  
  // Parse response
  const status = response.status
  const data = response.headers.get('content-type')?.includes('application/json')
    ? await response.json()
    : await response.text()
  
  // Run test function with response data
  await test({ status, data })
  
  return { status, data }
}

/**
 * Set up database transaction for API tests
 */
export async function withApiTransaction(test) {
  const prisma = createTestPrismaClient()
  
  await prisma.$transaction(async (tx) => {
    await test(tx)
    throw new Error('Rollback transaction') // Force rollback
  }).catch(err => {
    if (err.message !== 'Rollback transaction') {
      throw err
    }
  })
}

/**
 * Mock database queries for API tests
 */
export function mockDatabaseQueries(queries = {}) {
  return vi.mock('@/lib/db', () => ({
    db: {
      $transaction: vi.fn(async (callback) => await callback({
        user: {
          findUnique: vi.fn().mockImplementation(queries.user?.findUnique || (() => null)),
          findMany: vi.fn().mockImplementation(queries.user?.findMany || (() => [])),
          create: vi.fn().mockImplementation(queries.user?.create || ((data) => data)),
          update: vi.fn().mockImplementation(queries.user?.update || ((data) => data)),
        },
        // Add other models as needed
        ...queries,
      })),
    },
  }))
}
```

## Unit Testing API Utilities

Unit tests for API utility functions:

```typescript
// __tests__/unit/lib/api-utils.test.ts
import { describe, it, expect, vi } from 'vitest'
import { 
  formatApiResponse,
  handleApiError,
  validateRequest 
} from '@/lib/api-utils'

describe('API Utilities', () => {
  describe('formatApiResponse', () => {
    it('formats successful responses', () => {
      const data = { user: { id: '123', name: 'Test User' } }
      const response = formatApiResponse(data)
      
      expect(response.success).toBe(true)
      expect(response.user).toEqual(data.user)
      expect(response.error).toBeUndefined()
    })
    
    it('formats error responses', () => {
      const error = { message: 'Not found', code: 'NOT_FOUND' }
      const response = formatApiResponse(null, error)
      
      expect(response.success).toBe(false)
      expect(response.error).toEqual(error)
      expect(response.data).toBeUndefined()
    })
  })
  
  describe('handleApiError', () => {
    it('formats database errors correctly', () => {
      const dbError = new Error('Database error')
      dbError.code = 'P2002' // Prisma unique constraint error
      
      const response = handleApiError(dbError)
      
      expect(response.status).toBe(400)
      expect(response.data.success).toBe(false)
      expect(response.data.error.message).toContain('already exists')
    })
    
    it('formats validation errors correctly', () => {
      const validationError = new Error('Validation error')
      validationError.name = 'ValidationError'
      validationError.errors = ['Field is required']
      
      const response = handleApiError(validationError)
      
      expect(response.status).toBe(400)
      expect(response.data.success).toBe(false)
      expect(response.data.error.message).toContain('Validation error')
      expect(response.data.error.errors).toEqual(['Field is required'])
    })
    
    it('formats authentication errors correctly', () => {
      const authError = new Error('Authentication required')
      authError.name = 'AuthenticationError'
      
      const response = handleApiError(authError)
      
      expect(response.status).toBe(401)
      expect(response.data.success).toBe(false)
      expect(response.data.error.message).toContain('Authentication required')
    })
    
    it('formats general errors as 500 internal server error', () => {
      const generalError = new Error('Something went wrong')
      
      const response = handleApiError(generalError)
      
      expect(response.status).toBe(500)
      expect(response.data.success).toBe(false)
      expect(response.data.error.message).toContain('Internal server error')
      // Should not expose internal error details
      expect(response.data.error.message).not.toContain('Something went wrong')
    })
  })
  
  describe('validateRequest', () => {
    it('validates request body against schema', () => {
      const schema = {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 3 },
          email: { type: 'string', format: 'email' },
        },
        required: ['name', 'email'],
      }
      
      const validBody = { name: 'Test User', email: 'test@example.com' }
      const result = validateRequest(validBody, schema)
      
      expect(result.success).toBe(true)
      expect(result.data).toEqual(validBody)
    })
    
    it('returns validation errors for invalid data', () => {
      const schema = {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 3 },
          email: { type: 'string', format: 'email' },
        },
        required: ['name', 'email'],
      }
      
      const invalidBody = { name: 'Te' }
      const result = validateRequest(invalidBody, schema)
      
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
      expect(result.error.errors.length).toBe(2) // Name too short and email missing
    })
  })
})
```

## Integration Testing API Routes

Integration tests for API route handlers:

```typescript
// __tests__/api/marketplace/builders.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from '@/app/api/marketplace/builders/route'
import { testApiHandler } from '@/__tests__/utils/api-test-helpers'
import { mockDatabaseQueries } from '@/__tests__/utils/api-test-helpers'

describe('Marketplace API - Builders', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })
  
  describe('GET /api/marketplace/builders', () => {
    it('returns list of builders with 200 status', async () => {
      // Mock database queries
      const mockBuilders = [
        { id: 'builder_1', displayName: 'Builder 1' },
        { id: 'builder_2', displayName: 'Builder 2' },
      ]
      
      mockDatabaseQueries({
        builderProfile: {
          findMany: () => mockBuilders,
        },
      })
      
      // Test API handler
      await testApiHandler({
        handler: GET,
        url: 'http://localhost/api/marketplace/builders',
        method: 'GET',
        test: async ({ status, data }) => {
          expect(status).toBe(200)
          expect(data.success).toBe(true)
          expect(data.builders).toHaveLength(2)
          expect(data.builders[0].id).toBe('builder_1')
        },
      })
    })
    
    it('filters builders by expertise', async () => {
      // Mock database queries with expertise filter
      const mockBuilders = [
        { id: 'builder_1', displayName: 'Builder 1', expertise: ['React'] },
      ]
      
      mockDatabaseQueries({
        builderProfile: {
          findMany: (params) => {
            if (params.where.expertise.hasSome.includes('React')) {
              return mockBuilders
            }
            return []
          },
        },
      })
      
      // Test API handler
      await testApiHandler({
        handler: GET,
        url: 'http://localhost/api/marketplace/builders',
        method: 'GET',
        searchParams: { expertise: 'React' },
        test: async ({ status, data }) => {
          expect(status).toBe(200)
          expect(data.success).toBe(true)
          expect(data.builders).toHaveLength(1)
          expect(data.builders[0].expertise).toContain('React')
        },
      })
    })
    
    it('returns empty array when no builders match filters', async () => {
      // Mock empty database results
      mockDatabaseQueries({
        builderProfile: {
          findMany: () => [],
        },
      })
      
      // Test API handler
      await testApiHandler({
        handler: GET,
        url: 'http://localhost/api/marketplace/builders',
        method: 'GET',
        searchParams: { expertise: 'NonExistent' },
        test: async ({ status, data }) => {
          expect(status).toBe(200)
          expect(data.success).toBe(true)
          expect(data.builders).toEqual([])
        },
      })
    })
    
    it('handles database errors gracefully', async () => {
      // Mock database error
      mockDatabaseQueries({
        builderProfile: {
          findMany: () => {
            throw new Error('Database connection error')
          },
        },
      })
      
      // Test API handler
      await testApiHandler({
        handler: GET,
        url: 'http://localhost/api/marketplace/builders',
        method: 'GET',
        test: async ({ status, data }) => {
          expect(status).toBe(500)
          expect(data.success).toBe(false)
          expect(data.error).toBeDefined()
          expect(data.error.message).toContain('Internal server error')
          // Should not expose internal error details
          expect(data.error.message).not.toContain('Database connection error')
        },
      })
    })
  })
  
  describe('GET /api/marketplace/builders/:id', () => {
    it('returns a specific builder with 200 status', async () => {
      // Mock database queries
      const mockBuilder = {
        id: 'builder_1',
        displayName: 'Builder 1',
        bio: 'Test bio',
        expertise: ['React', 'Next.js'],
      }
      
      mockDatabaseQueries({
        builderProfile: {
          findUnique: (params) => {
            if (params.where.id === 'builder_1') {
              return mockBuilder
            }
            return null
          },
        },
      })
      
      // Test API handler
      await testApiHandler({
        handler: GET,
        url: 'http://localhost/api/marketplace/builders/builder_1',
        method: 'GET',
        params: { id: 'builder_1' },
        test: async ({ status, data }) => {
          expect(status).toBe(200)
          expect(data.success).toBe(true)
          expect(data.builder).toEqual(mockBuilder)
        },
      })
    })
    
    it('returns 404 for non-existent builder', async () => {
      // Mock database queries
      mockDatabaseQueries({
        builderProfile: {
          findUnique: () => null,
        },
      })
      
      // Test API handler
      await testApiHandler({
        handler: GET,
        url: 'http://localhost/api/marketplace/builders/non-existent',
        method: 'GET',
        params: { id: 'non-existent' },
        test: async ({ status, data }) => {
          expect(status).toBe(404)
          expect(data.success).toBe(false)
          expect(data.error.message).toContain('Builder not found')
        },
      })
    })
  })
})
```

## Testing Authenticated API Routes

Tests for authenticated API endpoints:

```typescript
// __tests__/api/profile/user-profile.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, PUT } from '@/app/api/profile/user/route'
import { testApiHandler } from '@/__tests__/utils/api-test-helpers'
import { createAuthenticatedRequest } from '@/__tests__/utils/api-test-utils'
import { mockDatabaseQueries } from '@/__tests__/utils/api-test-helpers'
import { mockServerAuth } from '@/__tests__/utils/auth-test-utils'

describe('Profile API - User Profile', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })
  
  describe('GET /api/profile/user', () => {
    it('returns user profile for authenticated user', async () => {
      // Mock authenticated server auth
      mockServerAuth({
        isAuthenticated: true,
        userId: 'user_123',
        roles: ['CLIENT'],
      })
      
      // Mock database queries
      const mockProfile = {
        id: 'profile_123',
        userId: 'user_123',
        bio: 'Test bio',
        socialLinks: {
          github: 'https://github.com/testuser',
          linkedin: 'https://linkedin.com/in/testuser',
        },
      }
      
      mockDatabaseQueries({
        profile: {
          findUnique: () => mockProfile,
        },
      })
      
      // Create authenticated request
      const req = createAuthenticatedRequest(
        '/api/profile/user',
        'user_123',
        ['CLIENT']
      )
      
      // Call API route
      const response = await GET(req)
      
      // Assert response
      expect(response.status).toBe(200)
      
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.profile).toEqual(mockProfile)
    })
    
    it('returns 401 for unauthenticated request', async () => {
      // Mock unauthenticated server auth
      mockServerAuth({
        isAuthenticated: false,
      })
      
      // Create unauthenticated request
      const req = createAuthenticatedRequest(
        '/api/profile/user',
        '',
        []
      )
      
      // Call API route
      const response = await GET(req)
      
      // Assert response
      expect(response.status).toBe(401)
      
      const data = await response.json()
      expect(data.success).toBe(false)
      expect(data.error.message).toContain('Unauthorized')
    })
    
    it('returns 404 when profile not found', async () => {
      // Mock authenticated server auth
      mockServerAuth({
        isAuthenticated: true,
        userId: 'user_123',
        roles: ['CLIENT'],
      })
      
      // Mock database queries
      mockDatabaseQueries({
        profile: {
          findUnique: () => null,
        },
      })
      
      // Create authenticated request
      const req = createAuthenticatedRequest(
        '/api/profile/user',
        'user_123',
        ['CLIENT']
      )
      
      // Call API route
      const response = await GET(req)
      
      // Assert response
      expect(response.status).toBe(404)
      
      const data = await response.json()
      expect(data.success).toBe(false)
      expect(data.error.message).toContain('Profile not found')
    })
  })
  
  describe('PUT /api/profile/user', () => {
    it('updates user profile successfully', async () => {
      // Mock authenticated server auth
      mockServerAuth({
        isAuthenticated: true,
        userId: 'user_123',
        roles: ['CLIENT'],
      })
      
      // Mock database queries
      const mockUpdatedProfile = {
        id: 'profile_123',
        userId: 'user_123',
        bio: 'Updated bio',
        socialLinks: {
          github: 'https://github.com/testuser',
          linkedin: 'https://linkedin.com/in/testuser',
        },
      }
      
      mockDatabaseQueries({
        profile: {
          findUnique: () => ({ 
            id: 'profile_123', 
            userId: 'user_123' 
          }),
          update: () => mockUpdatedProfile,
        },
      })
      
      // Create authenticated request with update data
      const req = createAuthenticatedRequest(
        '/api/profile/user',
        'user_123',
        ['CLIENT'],
        {
          method: 'PUT',
          body: {
            bio: 'Updated bio',
            socialLinks: {
              github: 'https://github.com/testuser',
              linkedin: 'https://linkedin.com/in/testuser',
            },
          },
        }
      )
      
      // Call API route
      const response = await PUT(req)
      
      // Assert response
      expect(response.status).toBe(200)
      
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.profile).toEqual(mockUpdatedProfile)
    })
    
    it('validates profile update data', async () => {
      // Mock authenticated server auth
      mockServerAuth({
        isAuthenticated: true,
        userId: 'user_123',
        roles: ['CLIENT'],
      })
      
      // Create authenticated request with invalid data
      const req = createAuthenticatedRequest(
        '/api/profile/user',
        'user_123',
        ['CLIENT'],
        {
          method: 'PUT',
          body: {
            bio: 123, // Invalid type, should be string
            socialLinks: 'not-an-object', // Invalid type, should be object
          },
        }
      )
      
      // Call API route
      const response = await PUT(req)
      
      // Assert response
      expect(response.status).toBe(400)
      
      const data = await response.json()
      expect(data.success).toBe(false)
      expect(data.error.message).toContain('Validation error')
      expect(data.error.errors).toBeDefined()
    })
    
    it('prevents updating another user\'s profile', async () => {
      // Mock authenticated server auth
      mockServerAuth({
        isAuthenticated: true,
        userId: 'user_123',
        roles: ['CLIENT'],
      })
      
      // Mock database queries
      mockDatabaseQueries({
        profile: {
          findUnique: () => ({ 
            id: 'profile_456', 
            userId: 'user_456' // Different from the authenticated user
          }),
        },
      })
      
      // Create authenticated request
      const req = createAuthenticatedRequest(
        '/api/profile/user',
        'user_123',
        ['CLIENT'],
        {
          method: 'PUT',
          body: {
            bio: 'Trying to update another user\'s profile',
          },
        }
      )
      
      // Call API route
      const response = await PUT(req)
      
      // Assert response
      expect(response.status).toBe(403)
      
      const data = await response.json()
      expect(data.success).toBe(false)
      expect(data.error.message).toContain('Forbidden')
    })
    
    it('allows admins to update any profile', async () => {
      // Mock authenticated server auth with admin role
      mockServerAuth({
        isAuthenticated: true,
        userId: 'admin_123',
        roles: ['ADMIN'],
      })
      
      // Mock database queries
      const mockUpdatedProfile = {
        id: 'profile_456',
        userId: 'user_456', // Different from the authenticated user
        bio: 'Admin updated bio',
      }
      
      mockDatabaseQueries({
        profile: {
          findUnique: () => ({ 
            id: 'profile_456', 
            userId: 'user_456' 
          }),
          update: () => mockUpdatedProfile,
        },
      })
      
      // Create authenticated request with admin role
      const req = createAuthenticatedRequest(
        '/api/profile/user/user_456',
        'admin_123',
        ['ADMIN'],
        {
          method: 'PUT',
          body: {
            bio: 'Admin updated bio',
          },
        }
      )
      
      // Call API route
      const response = await PUT(req)
      
      // Assert response
      expect(response.status).toBe(200)
      
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.profile).toEqual(mockUpdatedProfile)
    })
  })
})
```

## Testing API Error Handling

Tests for API error handling scenarios:

```typescript
// __tests__/api/error-handling.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, POST } from '@/app/api/test/error-handling/route'
import { testApiHandler } from '@/__tests__/utils/api-test-helpers'
import { createMockRequest } from '@/__tests__/utils/api-test-utils'
import { mockDatabaseQueries } from '@/__tests__/utils/api-test-helpers'

describe('API Error Handling', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })
  
  describe('Database errors', () => {
    it('handles database connection errors', async () => {
      // Mock database error
      mockDatabaseQueries({
        user: {
          findMany: () => {
            const error = new Error('Connection refused')
            error.code = 'P1001' // Prisma connection error
            throw error
          },
        },
      })
      
      // Create request
      const req = createMockRequest('/api/test/error-handling')
      
      // Call API route
      const response = await GET(req)
      
      // Assert response
      expect(response.status).toBe(500)
      
      const data = await response.json()
      expect(data.success).toBe(false)
      expect(data.error.message).toContain('Internal server error')
      expect(data.error.code).toBe('DB_ERROR')
      
      // Should not expose internal details
      expect(data.error.message).not.toContain('Connection refused')
    })
    
    it('handles database constraint violations', async () => {
      // Mock database error
      mockDatabaseQueries({
        user: {
          create: () => {
            const error = new Error('Unique constraint violation')
            error.code = 'P2002' // Prisma unique constraint error
            error.meta = { target: ['email'] }
            throw error
          },
        },
      })
      
      // Create request
      const req = createMockRequest('/api/test/error-handling', {
        method: 'POST',
        body: {
          name: 'Test User',
          email: 'existing@example.com',
        },
      })
      
      // Call API route
      const response = await POST(req)
      
      // Assert response
      expect(response.status).toBe(400)
      
      const data = await response.json()
      expect(data.success).toBe(false)
      expect(data.error.message).toContain('already exists')
      expect(data.error.code).toBe('UNIQUE_CONSTRAINT')
      expect(data.error.field).toBe('email')
    })
    
    it('handles record not found errors', async () => {
      // Mock database error
      mockDatabaseQueries({
        user: {
          findUnique: () => {
            const error = new Error('Record not found')
            error.code = 'P2025' // Prisma not found error
            throw error
          },
        },
      })
      
      // Create request
      const req = createMockRequest('/api/test/error-handling/123')
      
      // Call API route
      const response = await GET(req)
      
      // Assert response
      expect(response.status).toBe(404)
      
      const data = await response.json()
      expect(data.success).toBe(false)
      expect(data.error.message).toContain('not found')
      expect(data.error.code).toBe('NOT_FOUND')
    })
  })
  
  describe('Validation errors', () => {
    it('handles invalid request body', async () => {
      // Create request with invalid body
      const req = createMockRequest('/api/test/error-handling', {
        method: 'POST',
        body: {
          name: 123, // Should be string
          email: 'not-an-email', // Invalid email format
        },
      })
      
      // Call API route
      const response = await POST(req)
      
      // Assert response
      expect(response.status).toBe(400)
      
      const data = await response.json()
      expect(data.success).toBe(false)
      expect(data.error.message).toContain('Validation error')
      expect(data.error.code).toBe('VALIDATION_ERROR')
      expect(data.error.errors).toBeDefined()
      expect(data.error.errors.length).toBe(2) // Two validation errors
    })
    
    it('handles missing required fields', async () => {
      // Create request with missing fields
      const req = createMockRequest('/api/test/error-handling', {
        method: 'POST',
        body: {
          // Missing required fields name and email
        },
      })
      
      // Call API route
      const response = await POST(req)
      
      // Assert response
      expect(response.status).toBe(400)
      
      const data = await response.json()
      expect(data.success).toBe(false)
      expect(data.error.message).toContain('Validation error')
      expect(data.error.code).toBe('VALIDATION_ERROR')
      expect(data.error.errors).toBeDefined()
      expect(data.error.errors.length).toBe(2) // Two missing fields
    })
  })
  
  describe('Authentication errors', () => {
    it('handles unauthenticated requests to protected endpoints', async () => {
      // Mock authentication middleware
      vi.mock('@/lib/auth/middleware', () => ({
        requireAuth: () => (req, res, next) => {
          return Response.json(
            { success: false, error: { message: 'Unauthorized' } },
            { status: 401 }
          )
        },
      }))
      
      // Create request without auth
      const req = createMockRequest('/api/test/error-handling/protected')
      
      // Call API route
      const response = await GET(req)
      
      // Assert response
      expect(response.status).toBe(401)
      
      const data = await response.json()
      expect(data.success).toBe(false)
      expect(data.error.message).toContain('Unauthorized')
    })
    
    it('handles insufficient permissions', async () => {
      // Mock authorization middleware
      vi.mock('@/lib/auth/middleware', () => ({
        requireAuth: () => (req, res, next) => next(),
        requireRole: (roles) => (req, res, next) => {
          return Response.json(
            { success: false, error: { message: 'Forbidden', code: 'INSUFFICIENT_PERMISSIONS' } },
            { status: 403 }
          )
        },
      }))
      
      // Create request
      const req = createMockRequest('/api/test/error-handling/admin-only')
      
      // Call API route
      const response = await GET(req)
      
      // Assert response
      expect(response.status).toBe(403)
      
      const data = await response.json()
      expect(data.success).toBe(false)
      expect(data.error.message).toContain('Forbidden')
      expect(data.error.code).toBe('INSUFFICIENT_PERMISSIONS')
    })
  })
  
  describe('Rate limiting', () => {
    it('handles rate limit exceeded', async () => {
      // Mock rate limiting middleware
      vi.mock('@/lib/rate-limit', () => ({
        rateLimitAPI: () => (req, res, next) => {
          return Response.json(
            { 
              success: false, 
              error: { 
                message: 'Too many requests', 
                code: 'RATE_LIMIT_EXCEEDED',
                retryAfter: 60 
              } 
            },
            { 
              status: 429,
              headers: {
                'Retry-After': '60',
              }
            }
          )
        },
      }))
      
      // Create request
      const req = createMockRequest('/api/test/error-handling')
      
      // Call API route
      const response = await GET(req)
      
      // Assert response
      expect(response.status).toBe(429)
      expect(response.headers.get('Retry-After')).toBe('60')
      
      const data = await response.json()
      expect(data.success).toBe(false)
      expect(data.error.message).toContain('Too many requests')
      expect(data.error.code).toBe('RATE_LIMIT_EXCEEDED')
      expect(data.error.retryAfter).toBe(60)
    })
  })
})
```

## Testing API with MSW

Using Mock Service Worker for client-side API testing:

```typescript
// __tests__/integration/marketplace/api-client.test.tsx
import { describe, it, expect, vi, beforeAll, afterAll, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { BuilderList } from '@/components/marketplace/builder-list'
import { mockBuilders } from '@/__tests__/mocks/marketplace/builders.mocks'

// Set up MSW server
const server = setupServer(
  // Mock GET /api/marketplace/builders endpoint
  http.get('/api/marketplace/builders', () => {
    return HttpResponse.json({
      success: true,
      builders: mockBuilders,
    })
  }),
  
  // Mock GET /api/marketplace/builders with filter
  http.get('/api/marketplace/builders', ({ request }) => {
    const url = new URL(request.url)
    const expertise = url.searchParams.get('expertise')
    
    if (expertise) {
      const filteredBuilders = mockBuilders.filter(builder => 
        builder.expertise.includes(expertise)
      )
      
      return HttpResponse.json({
        success: true,
        builders: filteredBuilders,
      })
    }
    
    return HttpResponse.json({
      success: true,
      builders: mockBuilders,
    })
  }),
  
  // Mock error response
  http.get('/api/marketplace/builders/error', () => {
    return HttpResponse.json(
      {
        success: false,
        error: {
          message: 'Something went wrong',
          code: 'INTERNAL_ERROR',
        },
      },
      { status: 500 }
    )
  })
)

describe('API Client Integration', () => {
  // Start MSW server before tests
  beforeAll(() => server.listen())
  
  // Reset handlers after each test
  afterEach(() => server.resetHandlers())
  
  // Close server after all tests
  afterAll(() => server.close())
  
  it('fetches and displays builders from API', async () => {
    // Render component that makes API request
    render(<BuilderList />)
    
    // Initially should show loading state
    expect(screen.getByTestId('loading-state')).toBeInTheDocument()
    
    // Wait for API response to be processed
    await waitFor(() => {
      expect(screen.queryByTestId('loading-state')).not.toBeInTheDocument()
    })
    
    // Verify builders are displayed
    expect(screen.getAllByTestId('builder-card')).toHaveLength(mockBuilders.length)
    expect(screen.getByText(mockBuilders[0].displayName)).toBeInTheDocument()
  })
  
  it('filters builders by expertise', async () => {
    // Mock filter function
    const filterByExpertise = vi.fn()
    
    // Render component with filter prop
    render(<BuilderList onFilterChange={filterByExpertise} />)
    
    // Wait for initial load
    await waitFor(() => {
      expect(screen.queryByTestId('loading-state')).not.toBeInTheDocument()
    })
    
    // Filter by React expertise
    fireEvent.click(screen.getByTestId('filter-expertise-React'))
    
    // Verify filter was applied
    expect(filterByExpertise).toHaveBeenCalledWith({ expertise: 'React' })
    
    // Mock the filter API response
    server.use(
      http.get('/api/marketplace/builders', () => {
        const reactBuilders = mockBuilders.filter(builder => 
          builder.expertise.includes('React')
        )
        
        return HttpResponse.json({
          success: true,
          builders: reactBuilders,
        })
      })
    )
    
    // Simulate component re-fetching with filter
    rerender(<BuilderList filter={{ expertise: 'React' }} onFilterChange={filterByExpertise} />)
    
    // Wait for filtered results
    await waitFor(() => {
      const builderCards = screen.getAllByTestId('builder-card')
      expect(builderCards.length).toBeLessThan(mockBuilders.length)
    })
  })
  
  it('handles API errors gracefully', async () => {
    // Override handler to return error
    server.use(
      http.get('/api/marketplace/builders', () => {
        return HttpResponse.json(
          {
            success: false,
            error: {
              message: 'Something went wrong',
              code: 'INTERNAL_ERROR',
            },
          },
          { status: 500 }
        )
      })
    )
    
    // Render component
    render(<BuilderList />)
    
    // Wait for error state
    await waitFor(() => {
      expect(screen.queryByTestId('loading-state')).not.toBeInTheDocument()
      expect(screen.getByTestId('error-state')).toBeInTheDocument()
    })
    
    // Verify error message
    expect(screen.getByText(/unable to load builders/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
  })
})
```

## E2E Testing API Endpoints

E2E tests for API endpoints:

```typescript
// __tests__/e2e/api/api-endpoints.spec.ts
import { test, expect } from '@playwright/test'
import { AuthUtils } from '@/__tests__/utils/e2e-auth-utils'

test.describe('API Endpoints E2E Tests', () => {
  test.describe('Marketplace API', () => {
    test('GET /api/marketplace/builders returns list of builders', async ({ request }) => {
      // Make request to API endpoint
      const response = await request.get('/api/marketplace/builders')
      
      // Assert response
      expect(response.status()).toBe(200)
      
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(Array.isArray(data.builders)).toBe(true)
      expect(data.builders.length).toBeGreaterThan(0)
      
      // Verify builder data structure
      const builder = data.builders[0]
      expect(builder).toHaveProperty('id')
      expect(builder).toHaveProperty('displayName')
      expect(builder).toHaveProperty('expertise')
    })
    
    test('GET /api/marketplace/builders with filter returns filtered results', async ({ request }) => {
      // Make request with filter
      const response = await request.get('/api/marketplace/builders?expertise=React')
      
      // Assert response
      expect(response.status()).toBe(200)
      
      const data = await response.json()
      expect(data.success).toBe(true)
      
      // Verify all returned builders have the filtered expertise
      for (const builder of data.builders) {
        expect(builder.expertise).toContain('React')
      }
    })
    
    test('GET /api/marketplace/builders/:id returns specific builder', async ({ request }) => {
      // First get list of builders to find an ID
      const listResponse = await request.get('/api/marketplace/builders')
      const builders = (await listResponse.json()).builders
      const builderId = builders[0].id
      
      // Make request with builder ID
      const response = await request.get(`/api/marketplace/builders/${builderId}`)
      
      // Assert response
      expect(response.status()).toBe(200)
      
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.builder).toHaveProperty('id', builderId)
      expect(data.builder).toHaveProperty('displayName')
    })
    
    test('GET /api/marketplace/builders/:id returns 404 for non-existent builder', async ({ request }) => {
      // Make request with non-existent ID
      const response = await request.get('/api/marketplace/builders/non-existent-id')
      
      // Assert response
      expect(response.status()).toBe(404)
      
      const data = await response.json()
      expect(data.success).toBe(false)
      expect(data.error.message).toContain('not found')
    })
  })
  
  test.describe('Authentication Required APIs', () => {
    test('Access protected endpoint with authentication', async ({ browser }) => {
      // Create context with client auth state
      const context = await browser.newContext({
        storageState: AuthUtils.getStorageStatePath('client')
      })
      
      // Make authenticated request
      const response = await context.request.get('/api/profile/user')
      
      // Assert response
      expect(response.status()).toBe(200)
      
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.profile).toBeDefined()
    })
    
    test('Access protected endpoint without authentication returns 401', async ({ request }) => {
      // Make unauthenticated request
      const response = await request.get('/api/profile/user')
      
      // Assert response
      expect(response.status()).toBe(401)
      
      const data = await response.json()
      expect(data.success).toBe(false)
      expect(data.error.message).toContain('Unauthorized')
    })
    
    test('Access admin endpoint with admin authentication', async ({ browser }) => {
      // Create context with admin auth state
      const context = await browser.newContext({
        storageState: AuthUtils.getStorageStatePath('admin')
      })
      
      // Make authenticated admin request
      const response = await context.request.get('/api/admin/dashboard')
      
      // Assert response
      expect(response.status()).toBe(200)
      
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.adminData).toBeDefined()
    })
    
    test('Access admin endpoint with non-admin authentication returns 403', async ({ browser }) => {
      // Create context with client auth state
      const context = await browser.newContext({
        storageState: AuthUtils.getStorageStatePath('client')
      })
      
      // Make authenticated client request to admin endpoint
      const response = await context.request.get('/api/admin/dashboard')
      
      // Assert response
      expect(response.status()).toBe(403)
      
      const data = await response.json()
      expect(data.success).toBe(false)
      expect(data.error.message).toContain('Forbidden')
    })
  })
  
  test.describe('API POST Requests', () => {
    test('POST request with valid data succeeds', async ({ browser }) => {
      // Create context with auth state
      const context = await browser.newContext({
        storageState: AuthUtils.getStorageStatePath('client')
      })
      
      // Make POST request with valid data
      const response = await context.request.post('/api/profile/user', {
        data: {
          bio: 'Updated from E2E test',
          socialLinks: {
            github: 'https://github.com/testuser',
          },
        },
      })
      
      // Assert response
      expect(response.status()).toBe(200)
      
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.profile.bio).toBe('Updated from E2E test')
    })
    
    test('POST request with invalid data returns validation error', async ({ browser }) => {
      // Create context with auth state
      const context = await browser.newContext({
        storageState: AuthUtils.getStorageStatePath('client')
      })
      
      // Make POST request with invalid data
      const response = await context.request.post('/api/profile/user', {
        data: {
          bio: 123, // Invalid type, should be string
          socialLinks: 'not-an-object', // Invalid type, should be object
        },
      })
      
      // Assert response
      expect(response.status()).toBe(400)
      
      const data = await response.json()
      expect(data.success).toBe(false)
      expect(data.error.message).toContain('Validation error')
      expect(data.error.errors).toBeDefined()
    })
  })
})
```

## API Contract Testing

Tests to verify API contracts between client and server:

```typescript
// __tests__/contract/api-contracts.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import axios from 'axios'
import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import { schemas } from '@/lib/api/schemas'

// Set up JSON Schema validator
const ajv = new Ajv()
addFormats(ajv)

// Compile schemas
const validators = {
  builder: ajv.compile(schemas.builder),
  profile: ajv.compile(schemas.profile),
  sessionType: ajv.compile(schemas.sessionType),
  booking: ajv.compile(schemas.booking),
}

// Set up MSW server
const server = setupServer(
  // Mock the API endpoints with real world examples
  http.get('/api/marketplace/builders', () => {
    return HttpResponse.json({
      success: true,
      builders: [
        {
          id: 'builder_1',
          displayName: 'Builder Name',
          headline: 'Expert Developer',
          bio: 'Experienced developer...',
          hourlyRate: 100,
          expertise: ['React', 'Next.js'],
          validationTier: 2,
          socialLinks: {
            github: 'https://github.com/username',
            linkedin: 'https://linkedin.com/in/username',
          },
        },
        // More examples...
      ],
    })
  }),
  
  http.get('/api/profile/user', () => {
    return HttpResponse.json({
      success: true,
      profile: {
        id: 'profile_1',
        userId: 'user_1',
        bio: 'My profile bio',
        headline: 'Developer',
        socialLinks: {
          github: 'https://github.com/username',
          linkedin: 'https://linkedin.com/in/username',
        },
        projects: [
          {
            id: 'project_1',
            title: 'Project Title',
            description: 'Project description',
            imageUrl: 'https://example.com/image.jpg',
            url: 'https://example.com/project',
          },
        ],
      },
    })
  }),
  
  // More endpoint mocks...
)

describe('API Contract Validation', () => {
  // Start MSW server before tests
  beforeAll(() => server.listen())
  
  // Close server after tests
  afterAll(() => server.close())
  
  it('GET /api/marketplace/builders returns data that matches schema', async () => {
    // Make request to mocked endpoint
    const response = await axios.get('http://localhost/api/marketplace/builders')
    
    // Assert response structure
    expect(response.status).toBe(200)
    expect(response.data.success).toBe(true)
    expect(Array.isArray(response.data.builders)).toBe(true)
    
    // Validate each builder against schema
    for (const builder of response.data.builders) {
      const valid = validators.builder(builder)
      
      // If validation fails, show errors
      if (!valid) {
        console.error('Schema validation errors:', validators.builder.errors)
      }
      
      expect(valid).toBe(true)
    }
  })
  
  it('GET /api/profile/user returns data that matches schema', async () => {
    // Make request to mocked endpoint
    const response = await axios.get('http://localhost/api/profile/user')
    
    // Assert response structure
    expect(response.status).toBe(200)
    expect(response.data.success).toBe(true)
    expect(response.data.profile).toBeDefined()
    
    // Validate profile against schema
    const valid = validators.profile(response.data.profile)
    
    // If validation fails, show errors
    if (!valid) {
      console.error('Schema validation errors:', validators.profile.errors)
    }
    
    expect(valid).toBe(true)
  })
  
  // More contract tests for other endpoints...
})
```

## API Performance Testing

Basic API performance testing:

```typescript
// __tests__/performance/api-performance.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { setupServer } from 'msw/node'
import { http, HttpResponse, delay } from 'msw'
import axios from 'axios'

// Set up MSW server with realistic delays
const server = setupServer(
  // Fast endpoint (<50ms)
  http.get('/api/marketplace/builders', async () => {
    await delay(30)
    return HttpResponse.json({
      success: true,
      builders: [],
    })
  }),
  
  // Medium endpoint (50-200ms)
  http.get('/api/marketplace/builders/:id', async () => {
    await delay(150)
    return HttpResponse.json({
      success: true,
      builder: { id: 'builder_1', displayName: 'Builder 1' },
    })
  }),
  
  // Slow endpoint (>200ms)
  http.get('/api/marketplace/search', async () => {
    await delay(300)
    return HttpResponse.json({
      success: true,
      results: [],
    })
  })
)

describe('API Performance Tests', () => {
  // Start MSW server before tests
  beforeAll(() => server.listen())
  
  // Close server after tests
  afterAll(() => server.close())
  
  it('Fast API endpoints respond within 50ms', async () => {
    // Measure response time
    const start = performance.now()
    await axios.get('http://localhost/api/marketplace/builders')
    const end = performance.now()
    const duration = end - start
    
    // Assert response time
    expect(duration).toBeLessThan(50)
  })
  
  it('Medium API endpoints respond within 200ms', async () => {
    // Measure response time
    const start = performance.now()
    await axios.get('http://localhost/api/marketplace/builders/1')
    const end = performance.now()
    const duration = end - start
    
    // Assert response time
    expect(duration).toBeLessThan(200)
  })
  
  it('Slow API endpoints respond within 500ms', async () => {
    // Measure response time
    const start = performance.now()
    await axios.get('http://localhost/api/marketplace/search')
    const end = performance.now()
    const duration = end - start
    
    // Assert response time
    expect(duration).toBeLessThan(500)
  })
})
```

## Related Documents

- [Comprehensive Testing Strategy](./COMPREHENSIVE_TESTING_STRATEGY.md) - Master testing document
- [Testing Implementation Summary](./TESTING_IMPLEMENTATION_SUMMARY.md) - Current implementation status
- [Authentication Testing Patterns](./AUTHENTICATION_PATTERNS.md) - Authentication testing guidelines
- [Error Testing Patterns](./ERROR_TESTING_PATTERNS.md) - Error handling testing guidelines

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0.0 | May 10, 2025 | Initial API testing patterns | BuildAppsWith Team |
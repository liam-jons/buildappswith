/**
 * API Profile Tests
 * Version: 1.0.118
 *
 * Tests for the profiles/user API route using the new Clerk authentication utilities
 */

import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { mockUsers } from '../../mocks/users';
import { resetMockClerk } from '../../utils/clerk-test-utils';
import { UserRole } from '@/lib/auth/types';

// Mock Clerk auth before importing
vi.mock('@clerk/nextjs', () => ({
  auth: vi.fn(),
  clerkClient: {
    users: {
      updateUser: vi.fn().mockResolvedValue({}),
    },
  },
}));

// Import after mocking
const { auth } = require('@clerk/nextjs');
const { clerkClient } = require('@clerk/nextjs');

// Mock the auth helpers
vi.mock('@/lib/auth/clerk/helpers', () => ({
  requireAuth: vi.fn(),
  requireRole: vi.fn(),
  hasRole: vi.fn(),
}));

// Mock the database
vi.mock('@/lib/db', () => ({
  db: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    },
    builderProfile: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

// Mock Sentry
vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(),
}));

// Mock the auth data
vi.mock('@/lib/auth/data-access', () => ({
  authData: {
    updateUser: vi.fn().mockImplementation((id, data) => Promise.resolve({ 
      id, 
      ...data, 
      email: 'test@example.com',
      image: '/avatar.png',
    })),
    addRole: vi.fn().mockResolvedValue(true),
  },
}));

// Import the handlers after mocking dependencies
import * as handlers from '@/app/api/profiles/user/route';

// Helper to create a request
const createRequest = (method: string, body?: any) => {
  const req = new NextRequest(`https://buildappswith.com/api/profiles/user`, {
    method,
  });
  
  // Add the body if provided
  if (body) {
    // Mock the json method
    req.json = vi.fn().mockResolvedValue(body);
  }
  
  return req;
};

describe('User Profile API Routes', () => {
  // Before each test, set up the auth mock
  beforeEach(() => {
    // Configure auth to return an authenticated user
    vi.mocked(auth).mockReturnValue({
      userId: mockUsers.client.clerkId,
      sessionId: `session-${mockUsers.client.clerkId}`,
      getToken: vi.fn().mockResolvedValue('test-token'),
    });
  });
  
  // After each test, reset all mocks
  afterEach(() => {
    vi.clearAllMocks();
    resetMockClerk();
  });
  
  describe('GET /api/profiles/user', () => {
    it('returns the authenticated user profile', async () => {
      // Mock the withAuth to pass the user to the handler
      vi.mocked(require('@/lib/auth/clerk/api-auth').withAuth).mockImplementation(
        (handler) => {
          return async (req: NextRequest) => {
            return handler(req, mockUsers.client);
          };
        }
      );
      
      // Create a GET request
      const req = createRequest('GET');
      
      // Call the handler
      const response = await handlers.GET(req, {} as any);
      const data = await response.json();
      
      // Verify the response
      expect(response.status).toBe(200);
      expect(data).toEqual({
        id: mockUsers.client.id,
        name: mockUsers.client.name,
        email: mockUsers.client.email,
        image: mockUsers.client.image,
        roles: mockUsers.client.roles,
        verified: mockUsers.client.verified,
      });
    });
    
    it('returns 500 when an error occurs', async () => {
      // Mock the withAuth to pass the user to the handler
      vi.mocked(require('@/lib/auth/clerk/api-auth').withAuth).mockImplementation(
        (handler) => {
          return async (req: NextRequest) => {
            return handler(req, mockUsers.client);
          };
        }
      );
      
      // Mock console.error to avoid test output noise
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Mock to throw an error
      const originalJsonMethod = JSON.stringify;
      JSON.stringify = vi.fn().mockImplementation(() => {
        throw new Error('Test error');
      });
      
      // Create a GET request
      const req = createRequest('GET');
      
      // Call the handler
      const response = await handlers.GET(req, {} as any);
      const data = await response.json();
      
      // Verify the response
      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to fetch user profile' });
      
      // Restore mocks
      JSON.stringify = originalJsonMethod;
      consoleErrorSpy.mockRestore();
    });
  });
  
  describe('POST /api/profiles/user', () => {
    it('updates the user profile successfully', async () => {
      // Mock the withAuth to pass the user to the handler
      vi.mocked(require('@/lib/auth/clerk/api-auth').withAuth).mockImplementation(
        (handler) => {
          return async (req: NextRequest) => {
            return handler(req, mockUsers.client);
          };
        }
      );
      
      // Create valid profile data
      const profileData = {
        name: 'Updated Name',
        role: UserRole.BUILDER,
      };
      
      // Create a POST request with the profile data
      const req = createRequest('POST', profileData);
      
      // Call the handler
      const response = await handlers.POST(req, {} as any);
      const data = await response.json();
      
      // Verify the response
      expect(response.status).toBe(200);
      expect(data.message).toBe('Profile updated successfully');
      expect(data.user.name).toBe('Updated Name');
      expect(data.user.roles).toContain(UserRole.BUILDER);
      
      // Verify that the auth data was updated
      expect(require('@/lib/auth/data-access').authData.updateUser).toHaveBeenCalledWith(
        mockUsers.client.id,
        { name: 'Updated Name' }
      );
      
      // Verify that the role was added
      expect(require('@/lib/auth/data-access').authData.addRole).toHaveBeenCalledWith(
        mockUsers.client.id,
        UserRole.BUILDER
      );
      
      // Verify that Clerk was updated
      expect(clerkClient.users.updateUser).toHaveBeenCalledWith(
        mockUsers.client.clerkId,
        expect.objectContaining({
          firstName: 'Updated',
          lastName: 'Name',
          publicMetadata: expect.objectContaining({
            roles: expect.arrayContaining([UserRole.BUILDER]),
            verified: true,
          }),
        })
      );
    });
    
    it('creates a builder profile during onboarding if role is BUILDER', async () => {
      // Mock the withAuth to pass the user to the handler
      vi.mocked(require('@/lib/auth/clerk/api-auth').withAuth).mockImplementation(
        (handler) => {
          return async (req: NextRequest) => {
            return handler(req, mockUsers.client);
          };
        }
      );
      
      // Mock the database to indicate no existing profile
      vi.mocked(require('@/lib/db').db.builderProfile.findUnique).mockResolvedValueOnce(null);
      
      // Create valid profile data with onboarding flag
      const profileData = {
        name: 'New Builder',
        role: UserRole.BUILDER,
        isOnboarding: true,
      };
      
      // Create a POST request with the profile data
      const req = createRequest('POST', profileData);
      
      // Call the handler
      const response = await handlers.POST(req, {} as any);
      const data = await response.json();
      
      // Verify the response
      expect(response.status).toBe(200);
      expect(data.message).toBe('Profile created successfully');
      
      // Verify that a builder profile was created
      expect(require('@/lib/db').db.builderProfile.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: mockUsers.client.id,
          bio: '',
          headline: '',
          validationTier: 1,
        }),
      });
    });
    
    it('returns 400 for invalid request data', async () => {
      // Mock the withAuth to pass the user to the handler
      vi.mocked(require('@/lib/auth/clerk/api-auth').withAuth).mockImplementation(
        (handler) => {
          return async (req: NextRequest) => {
            return handler(req, mockUsers.client);
          };
        }
      );
      
      // Create invalid profile data (missing required fields)
      const invalidData = {
        // Missing name and role
      };
      
      // Create a POST request with the invalid data
      const req = createRequest('POST', invalidData);
      
      // Call the handler
      const response = await handlers.POST(req, {} as any);
      const data = await response.json();
      
      // Verify the response
      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid request body');
      expect(data.details).toBeDefined();
    });
    
    it('returns 500 when an error occurs', async () => {
      // Mock the withAuth to pass the user to the handler
      vi.mocked(require('@/lib/auth/clerk/api-auth').withAuth).mockImplementation(
        (handler) => {
          return async (req: NextRequest) => {
            return handler(req, mockUsers.client);
          };
        }
      );
      
      // Mock console.error to avoid test output noise
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Mock the auth data to throw an error
      vi.mocked(require('@/lib/auth/data-access').authData.updateUser).mockRejectedValueOnce(
        new Error('Database error')
      );
      
      // Create valid profile data
      const profileData = {
        name: 'Error Test',
        role: UserRole.CLIENT,
      };
      
      // Create a POST request with the profile data
      const req = createRequest('POST', profileData);
      
      // Call the handler
      const response = await handlers.POST(req, {} as any);
      const data = await response.json();
      
      // Verify the response
      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to update user profile');
      
      // Restore mocks
      consoleErrorSpy.mockRestore();
    });
  });
  
  describe('Authentication', () => {
    it('rejects unauthenticated requests', async () => {
      // Configure auth to return no user
      vi.mocked(auth).mockReturnValue({
        userId: null,
        sessionId: null,
        getToken: vi.fn().mockResolvedValue(null),
      });
      
      // Mock the withAuth to simulate authentication failure
      vi.mocked(require('@/lib/auth/clerk/api-auth').withAuth).mockImplementation(
        () => {
          return async () => {
            return NextResponse.json(
              { error: 'Unauthorized' },
              { status: 401 }
            );
          };
        }
      );
      
      // Create a GET request
      const req = createRequest('GET');
      
      // Call the handler
      const response = await handlers.GET(req, {} as any);
      const data = await response.json();
      
      // Verify the response
      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });
  });
});
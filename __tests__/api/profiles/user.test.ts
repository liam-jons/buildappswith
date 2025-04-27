import { NextRequest, NextResponse } from 'next/server';
import { mockUsers } from '../../mocks/users';
import { UserRole } from '@/lib/auth/types';

// Mock dependencies
jest.mock('@/lib/auth/clerk/helpers', () => ({
  requireAuth: jest.fn(),
}));

jest.mock('@/lib/auth/data-access', () => ({
  authData: {
    updateUser: jest.fn(),
    addRole: jest.fn(),
  },
}));

jest.mock('@clerk/nextjs', () => ({
  clerkClient: {
    users: {
      updateUser: jest.fn(),
    },
  },
}));

jest.mock('@/lib/db', () => ({
  db: {
    builderProfile: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock('@sentry/nextjs', () => ({
  captureException: jest.fn(),
}));

describe('Profile User API', () => {
  // Import the route handlers after mocks are set up
  let GET: Function;
  let POST: Function;
  let helpers: any;
  let authData: any;
  let clerkClient: any;
  let db: any;
  let sentry: any;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Reset modules
    jest.resetModules();

    // Re-import the mocked modules
    helpers = require('@/lib/auth/clerk/helpers');
    authData = require('@/lib/auth/data-access').authData;
    clerkClient = require('@clerk/nextjs').clerkClient;
    db = require('@/lib/db').db;
    sentry = require('@sentry/nextjs');

    // Import the route handlers (need to re-import to get fresh references to mocks)
    const route = require('@/app/api/profiles/user/route');
    GET = route.GET;
    POST = route.POST;
  });

  describe('GET handler', () => {
    it('returns user profile data for authenticated users', async () => {
      // Mock authenticated user
      const mockUser = { ...mockUsers.client };
      helpers.requireAuth.mockResolvedValue(mockUser);

      // Create mock request
      const request = new NextRequest('https://buildappswith.dev/api/profiles/user');

      // Call the GET handler
      const response = await GET(request);
      const responseData = await response.json();

      // Check that the response contains the expected user data
      expect(response.status).toBe(200);
      expect(responseData).toEqual({
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        image: mockUser.image,
        roles: mockUser.roles,
        verified: mockUser.verified,
      });
    });

    it('handles errors gracefully', async () => {
      // Mock an error
      helpers.requireAuth.mockRejectedValue(new Error('Authentication failed'));

      // Create mock request
      const request = new NextRequest('https://buildappswith.dev/api/profiles/user');

      // Call the GET handler
      const response = await GET(request);
      const responseData = await response.json();

      // Check that the response is an error
      expect(response.status).toBe(500);
      expect(responseData).toEqual({ error: 'Failed to fetch user profile' });
      expect(sentry.captureException).toHaveBeenCalled();
    });
  });

  describe('POST handler', () => {
    it('updates user profile successfully', async () => {
      // Mock authenticated user
      const mockUser = { ...mockUsers.client };
      helpers.requireAuth.mockResolvedValue(mockUser);

      // Mock successful database update
      authData.updateUser.mockResolvedValue({ ...mockUser, name: 'Updated Name' });

      // Create mock request with update data
      const request = new NextRequest('https://buildappswith.dev/api/profiles/user', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Updated Name',
          role: UserRole.CLIENT,
        }),
      });

      // Call the POST handler
      const response = await POST(request);
      const responseData = await response.json();

      // Check that the response contains the success message
      expect(response.status).toBe(200);
      expect(responseData.message).toBe('Profile updated successfully');
      expect(responseData.user).toEqual(expect.objectContaining({
        name: 'Updated Name',
      }));

      // Verify the user was updated in the database
      expect(authData.updateUser).toHaveBeenCalledWith(mockUser.id, {
        name: 'Updated Name',
      });

      // Verify Clerk metadata was updated
      expect(clerkClient.users.updateUser).toHaveBeenCalledWith(mockUser.clerkId, expect.objectContaining({
        firstName: 'Updated',
        lastName: 'Name',
        publicMetadata: expect.objectContaining({
          roles: mockUser.roles,
          verified: true,
        }),
      }));
    });

    it('adds a new role when updating with a different role', async () => {
      // Mock authenticated user with CLIENT role
      const mockUser = { ...mockUsers.client };
      helpers.requireAuth.mockResolvedValue(mockUser);

      // Mock successful database update
      authData.updateUser.mockResolvedValue(mockUser);

      // Create mock request with a different role
      const request = new NextRequest('https://buildappswith.dev/api/profiles/user', {
        method: 'POST',
        body: JSON.stringify({
          name: mockUser.name,
          role: UserRole.BUILDER,
        }),
      });

      // Call the POST handler
      await POST(request);

      // Verify the role was added
      expect(authData.addRole).toHaveBeenCalledWith(mockUser.id, UserRole.BUILDER);
    });

    it('creates a builder profile during onboarding when role is BUILDER', async () => {
      // Mock authenticated user
      const mockUser = { ...mockUsers.client };
      helpers.requireAuth.mockResolvedValue(mockUser);

      // Mock successful database update
      authData.updateUser.mockResolvedValue(mockUser);

      // Mock no existing builder profile
      db.builderProfile.findUnique.mockResolvedValue(null);

      // Create mock request for onboarding with builder role
      const request = new NextRequest('https://buildappswith.dev/api/profiles/user', {
        method: 'POST',
        body: JSON.stringify({
          name: mockUser.name,
          role: UserRole.BUILDER,
          isOnboarding: true,
        }),
      });

      // Call the POST handler
      const response = await POST(request);
      const responseData = await response.json();

      // Check that the response indicates profile creation
      expect(response.status).toBe(200);
      expect(responseData.message).toBe('Profile created successfully');

      // Verify builder profile was created
      expect(db.builderProfile.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: mockUser.id,
          availableForHire: true,
          validationTier: 1,
        }),
      });

      // Verify Clerk metadata was updated with completedOnboarding flag
      expect(clerkClient.users.updateUser).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          publicMetadata: expect.objectContaining({
            completedOnboarding: true,
          }),
        })
      );
    });

    it('does not create a duplicate builder profile if one exists', async () => {
      // Mock authenticated user with BUILDER role
      const mockUser = { ...mockUsers.builder };
      helpers.requireAuth.mockResolvedValue(mockUser);

      // Mock successful database update
      authData.updateUser.mockResolvedValue(mockUser);

      // Mock existing builder profile
      db.builderProfile.findUnique.mockResolvedValue({
        userId: mockUser.id,
        bio: 'Existing bio',
      });

      // Create mock request for onboarding with builder role
      const request = new NextRequest('https://buildappswith.dev/api/profiles/user', {
        method: 'POST',
        body: JSON.stringify({
          name: mockUser.name,
          role: UserRole.BUILDER,
          isOnboarding: true,
        }),
      });

      // Call the POST handler
      await POST(request);

      // Verify builder profile creation was not attempted
      expect(db.builderProfile.create).not.toHaveBeenCalled();
    });

    it('validates the request data', async () => {
      // Mock authenticated user
      const mockUser = { ...mockUsers.client };
      helpers.requireAuth.mockResolvedValue(mockUser);

      // Create mock request with invalid data
      const request = new NextRequest('https://buildappswith.dev/api/profiles/user', {
        method: 'POST',
        body: JSON.stringify({
          name: '', // Invalid - name is too short
          role: 'INVALID_ROLE', // Invalid - not a valid role
        }),
      });

      // Call the POST handler
      const response = await POST(request);
      const responseData = await response.json();

      // Check that the response contains validation errors
      expect(response.status).toBe(400);
      expect(responseData.error).toBe('Invalid request body');
      expect(responseData.details.fieldErrors).toBeDefined();
      expect(responseData.details.fieldErrors.name).toBeDefined();
      expect(responseData.details.fieldErrors.role).toBeDefined();

      // Verify that no updates were attempted
      expect(authData.updateUser).not.toHaveBeenCalled();
      expect(clerkClient.users.updateUser).not.toHaveBeenCalled();
    });

    it('handles errors gracefully', async () => {
      // Mock authenticated user
      const mockUser = { ...mockUsers.client };
      helpers.requireAuth.mockResolvedValue(mockUser);

      // Mock a database error
      authData.updateUser.mockRejectedValue(new Error('Database error'));

      // Create mock request
      const request = new NextRequest('https://buildappswith.dev/api/profiles/user', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Updated Name',
          role: UserRole.CLIENT,
        }),
      });

      // Call the POST handler
      const response = await POST(request);
      const responseData = await response.json();

      // Check that the response is an error
      expect(response.status).toBe(500);
      expect(responseData).toEqual({ error: 'Failed to update user profile' });
      expect(sentry.captureException).toHaveBeenCalled();
    });
  });
});

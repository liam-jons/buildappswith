/**
 * User Profiles API Route
 * Version: 1.0.0
 * 
 * API routes for managing user profiles
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import { authData } from '@/lib/auth/data-access';
import { UserRole, AuthObject } from '@/lib/auth/types';
import { clerkClient } from '@clerk/nextjs';
import { z } from 'zod';
import { db } from '@/lib/db';
import { captureException } from '@sentry/nextjs';
import { AuthErrorType, createAuthErrorResponse, addAuthPerformanceMetrics } from '@/lib/auth/adapters/clerk-express/errors';
import { logger } from '@/lib/logger';

// Schema for profile update validation
const profileUpdateSchema = z.object({
  name: z.string().min(2, { message: "Name is required and must be at least 2 characters" }),
  role: z.enum([UserRole.ADMIN, UserRole.BUILDER, UserRole.CLIENT], {
    errorMap: () => ({ message: "Invalid role specified" })
  }),
  isOnboarding: z.boolean().optional(),
});

/**
 * GET /api/profiles/user
 * 
 * Get the authenticated user's profile
 */
export const GET = withAuth(async (req: NextRequest, context: { params?: any }, auth: AuthObject) => {
  const startTime = performance.now();
  const path = req.nextUrl.pathname;
  const method = req.method;

  try {
    // Look up the full user profile in the database
    const dbUser = await db.user.findUnique({
      where: { clerkId: auth.userId },
    });

    if (!dbUser) {
      logger.warn('User not found in GET /api/profiles/user', { userId: auth.userId, path, method });
      return createAuthErrorResponse(
        AuthErrorType.AUTHENTICATION,
        'User not found',
        404,
        path,
        method,
        auth.userId
      );
    }

    // Return the user profile without sensitive information
    const response = NextResponse.json({
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      image: dbUser.imageUrl,
      roles: dbUser.roles,
      verified: dbUser.verified,
    });
    return addAuthPerformanceMetrics(response, startTime, true, path, method, auth.userId);

  } catch (error) {
    logger.error('Error fetching user profile', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: auth.userId,
      path,
      method 
    });
    captureException(error);
    
    return createAuthErrorResponse(
      AuthErrorType.SERVER,
      'Failed to fetch user profile',
      500,
      path,
      method,
      auth.userId
    );
  }
});

/**
 * POST /api/profiles/user
 * 
 * Update the authenticated user's profile
 */
export const POST = withAuth(async (req: NextRequest, context: { params?: any }, auth: AuthObject) => {
  const startTime = performance.now();
  const path = req.nextUrl.pathname;
  const method = req.method;

  try {
    // Parse the request body
    const requestBody = await req.json();
    
    // Validate the request body against the schema
    const result = profileUpdateSchema.safeParse(requestBody);
    
    if (!result.success) {
      logger.warn('Invalid request body for POST /api/profiles/user', { 
        userId: auth.userId,
        path, 
        method, 
        validationErrors: result.error.format() 
      });
      return createAuthErrorResponse(
        AuthErrorType.VALIDATION,
        'Invalid request body',
        400,
        path,
        method,
        auth.userId
      );
    }
    
    const validatedData = result.data;
    
    // First, find the user in our database
    const dbUser = await db.user.findUnique({
      where: { clerkId: auth.userId },
    });
    
    if (!dbUser) {
      logger.warn('User not found in POST /api/profiles/user', { userId: auth.userId, path, method });
      return createAuthErrorResponse(
        AuthErrorType.AUTHENTICATION,
        'User not found',
        404,
        path,
        method,
        auth.userId
      );
    }
    
    // Update the user profile in our database
    const updatedUser = await authData.updateUser(dbUser.id, {
      name: validatedData.name,
    });
    
    // Handle role changes if needed
    if (validatedData.role && !dbUser.roles.includes(validatedData.role)) {
      await authData.addRole(dbUser.id, validatedData.role);
    }
    
    // Prepare name parsing for Clerk
    const nameParts = validatedData.name.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    
    // Create or verify builder profile if needed during onboarding
    let builderProfileMessage = '';
    
    if (validatedData.isOnboarding && validatedData.role === UserRole.BUILDER) {
      // Check if the user already has a builder profile
      const existingProfile = await db.builderProfile.findUnique({
        where: { userId: dbUser.id },
      });
      
      if (!existingProfile) {
        // Create a basic builder profile
        await db.builderProfile.create({
          data: {
            userId: dbUser.id,
            bio: '',
            headline: '',
            availableForHire: true,
            validationTier: 1,
          },
        });
        
        builderProfileMessage = 'created';
      }
      
      // Update Clerk metadata to indicate onboarding is complete
      await clerkClient.users.updateUser(auth.userId, {
        publicMetadata: {
          ...dbUser.roles.includes(validatedData.role) 
            ? { roles: dbUser.roles } 
            : { roles: [...dbUser.roles, validatedData.role] },
          verified: true,
          completedOnboarding: true,
        },
      });
    } else {
      // Standard profile update
      await clerkClient.users.updateUser(auth.userId, {
        firstName,
        lastName,
        publicMetadata: {
          ...dbUser.roles.includes(validatedData.role) 
            ? { roles: dbUser.roles } 
            : { roles: [...dbUser.roles, validatedData.role] },
          verified: true,
        },
      });
    }
    
    // Re-fetch the updated user with roles
    const refreshedUser = await db.user.findUnique({
      where: { id: dbUser.id },
    });
    
    const response = NextResponse.json({
      message: builderProfileMessage 
        ? 'Profile created successfully' 
        : 'Profile updated successfully',
      user: refreshedUser,
    });
    return addAuthPerformanceMetrics(response, startTime, true, path, method, auth.userId);

  } catch (error) {
    logger.error('Error updating user profile', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: auth.userId,
      path,
      method 
    });
    captureException(error);
    
    return createAuthErrorResponse(
      AuthErrorType.SERVER,
      'Failed to update user profile',
      500,
      path,
      method,
      auth.userId
    );
  }
});
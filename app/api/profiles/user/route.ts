import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/clerk/api-auth';
import { AuthUser } from '@/lib/auth/clerk/helpers';
import { z } from 'zod';
import { authData } from '@/lib/auth/data-access';
import { db } from '@/lib/db';
import { UserRole } from '@/lib/auth/types';
import { clerkClient } from '@clerk/nextjs';
import * as Sentry from '@sentry/nextjs';

// User profile schema for validation
const userProfileSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  role: z.enum([UserRole.CLIENT, UserRole.BUILDER], {
    required_error: "Please select a role.",
  }),
  // Additional fields can be added in the future
  isOnboarding: z.boolean().optional().default(false), // To track if this is part of onboarding
});

// Type for the validated data
type UserProfileData = z.infer<typeof userProfileSchema>;

/**
 * GET handler for fetching current user profile
 */
export const GET = withAuth(async (request: NextRequest, user: AuthUser) => {
  try {
    // We already have the user data from auth middleware
    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      roles: user.roles,
      verified: user.verified,
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    Sentry.captureException(error);
    
    return NextResponse.json(
      { error: 'Failed to fetch user profile' }, 
      { status: 500 }
    );
  }
});

/**
 * POST handler for updating user profile
 */
export const POST = withAuth(async (request: NextRequest, user: AuthUser) => {
  try {
    // Parse and validate the request body
    const body = await request.json();
    const result = userProfileSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: result.error.flatten() }, 
        { status: 400 }
      );
    }
    
    const data = result.data;
    const isOnboarding = data.isOnboarding || false;
    
    // Step 1: Update the user in our database
    const updatedUser = await authData.updateUser(user.id, {
      name: data.name,
    });

    // Step 2: Update the user's role if needed
    if (!user.roles.includes(data.role)) {
      await authData.addRole(user.id, data.role);
    }
    
    // Step 3: Update the user's metadata in Clerk
    await clerkClient.users.updateUser(user.clerkId, {
      firstName: data.name.split(' ')[0],
      lastName: data.name.includes(' ') ? data.name.split(' ').slice(1).join(' ') : '',
      publicMetadata: {
        ...user, // Keep existing metadata
        roles: [...new Set([...user.roles, data.role])], // Ensure unique roles
        verified: true, // Mark as verified during profile update
        completedOnboarding: isOnboarding ? true : undefined, // Update if onboarding
      },
    });
    
    // If this was part of onboarding and the selected role is BUILDER, 
    // initiate an empty builder profile
    if (isOnboarding && data.role === UserRole.BUILDER) {
      const existingProfile = await db.builderProfile.findUnique({
        where: { userId: user.id },
      });
      
      if (!existingProfile) {
        await db.builderProfile.create({
          data: {
            userId: user.id,
            bio: '',
            headline: '',
            hourlyRate: 0,
            domains: [],
            availableForHire: true,
            portfolioItems: [],
            validationTier: 1, // Entry level
          },
        });
      }
    }
    
    // Return the updated user data
    return NextResponse.json({
      message: isOnboarding ? 'Profile created successfully' : 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        image: updatedUser.image,
        roles: [...new Set([...user.roles, data.role])], // Include the newly added role
        verified: true,
      },
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    Sentry.captureException(error);
    
    return NextResponse.json(
      { error: 'Failed to update user profile' }, 
      { status: 500 }
    );
  }
});

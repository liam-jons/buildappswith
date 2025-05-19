/**
 * Builder Profiles API Route
 * Version: 2.0.0
 *
 * API routes for managing builder profiles
 * Updated to use Clerk Express SDK protection helpers
 */

import { NextRequest, NextResponse } from 'next/server';
import { withBuilder } from '@/lib/auth/api-auth';
import { z } from 'zod';
import { db } from '@/lib/db';
import { captureException } from '@sentry/nextjs';
import { UserRole } from '@/lib/auth/types';
import { AuthErrorType, createAuthErrorResponse, addAuthPerformanceMetrics } from '@/lib/auth/express/errors';
import { logger } from '@/lib/logger';

// Schema for builder profile updates
const builderProfileSchema = z.object({
  bio: z.string().max(1000, { message: "Bio cannot exceed 1000 characters" }).optional(),
  headline: z.string().max(100, { message: "Headline cannot exceed 100 characters" }).optional(),
  skills: z.array(z.string()).optional(),
  availableForHire: z.boolean().optional(),
  adhd_focus: z.boolean().optional(),
  socialLinks: z.object({
    website: z.string().url({ message: "Invalid website URL" }).optional().nullable(),
    github: z.string().url({ message: "Invalid GitHub URL" }).optional().nullable(),
    linkedin: z.string().url({ message: "Invalid LinkedIn URL" }).optional().nullable(),
    twitter: z.string().url({ message: "Invalid Twitter URL" }).optional().nullable(),
  }).optional(),
});

/**
 * GET /api/profiles/builder
 *
 * Get the authenticated user's builder profile
 */
export const GET = withBuilder(async (req: NextRequest, auth: { userId: string; roles: UserRole[] }) => {
  const startTime = performance.now();
  const path = req.nextUrl.pathname;
  const method = req.method;
  const { userId, roles } = auth;

  try {
    logger.debug('Fetching builder profile', { userId, path, method });

    // Look up the user in the database
    const dbUser = await db.user.findUnique({
      where: { clerkId: userId },
      include: {
        builderProfile: {
          include: {
            skills: {
              include: {
                skill: true
              }
            }
          }
        }
      }
    });

    if (!dbUser) {
      logger.warn('User not found when fetching builder profile', { userId, path, method });
      return createAuthErrorResponse(
        AuthErrorType.AUTHENTICATION,
        'User not found',
        404,
        path,
        method,
        userId
      );
    }

    if (!dbUser.builderProfile) {
      logger.warn('Builder profile not found', { userId, path, method });
      return createAuthErrorResponse(
        'RESOURCE_NOT_FOUND',
        'Builder profile not found',
        404,
        path,
        method,
        userId
      );
    }

    // Transform skills into a more readable format
    const formattedSkills = dbUser.builderProfile.skills.map(skill => ({
      id: skill.skill.id,
      name: skill.skill.name,
      domain: skill.skill.domain,
    }));

    // Return the builder profile with performance metrics
    const response = NextResponse.json({
      success: true,
      data: {
        id: dbUser.builderProfile.id,
        userId: dbUser.id,
        bio: dbUser.builderProfile.bio,
        headline: dbUser.builderProfile.headline,
        skills: formattedSkills,
        availableForHire: dbUser.builderProfile.availableForHire,
        adhd_focus: dbUser.builderProfile.adhd_focus,
        validationTier: dbUser.builderProfile.validationTier,
        socialLinks: dbUser.builderProfile.socialLinks,
        createdAt: dbUser.builderProfile.createdAt,
        updatedAt: dbUser.builderProfile.updatedAt,
      }
    });

    return addAuthPerformanceMetrics(response, startTime, true, path, method, userId);
  } catch (error) {
    logger.error('Error fetching builder profile', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId,
      path,
      method
    });
    captureException(error);

    return createAuthErrorResponse(
      AuthErrorType.SERVER,
      'Failed to fetch builder profile',
      500,
      path,
      method,
      userId
    );
  }
});

/**
 * POST /api/profiles/builder
 *
 * Update the authenticated user's builder profile
 */
export const POST = withBuilder(async (req: NextRequest, auth: { userId: string; roles: UserRole[] }) => {
  const startTime = performance.now();
  const path = req.nextUrl.pathname;
  const method = req.method;
  const { userId, roles } = auth;

  try {
    logger.debug('Updating builder profile', { userId, path, method });

    // Parse the request body
    const requestBody = await req.json();

    // Validate the request body against the schema
    const result = builderProfileSchema.safeParse(requestBody);

    if (!result.success) {
      logger.warn('Invalid request body for builder profile update', {
        userId,
        path,
        method,
        validationErrors: result.error.format()
      });

      return createAuthErrorResponse(
        'VALIDATION_ERROR',
        'Invalid request body',
        400,
        path,
        method,
        userId
      );
    }

    const validatedData = result.data;

    // First, find the user in our database
    const dbUser = await db.user.findUnique({
      where: { clerkId: userId },
      include: {
        builderProfile: true
      }
    });

    if (!dbUser) {
      logger.warn('User not found when updating builder profile', { userId, path, method });
      return createAuthErrorResponse(
        AuthErrorType.AUTHENTICATION,
        'User not found',
        404,
        path,
        method,
        userId
      );
    }

    if (!dbUser.builderProfile) {
      // If no builder profile exists but user has the builder role, create one
      if (dbUser.roles.includes(UserRole.BUILDER)) {
        logger.info('Creating new builder profile', { userId, path, method });

        const newProfile = await db.builderProfile.create({
          data: {
            userId: dbUser.id,
            bio: validatedData.bio || '',
            headline: validatedData.headline || '',
            availableForHire: validatedData.availableForHire ?? true,
            adhd_focus: validatedData.adhd_focus ?? false,
            socialLinks: validatedData.socialLinks || {},
            validationTier: 1,
          },
        });

        const response = NextResponse.json({
          success: true,
          message: 'Builder profile created successfully',
          data: newProfile,
        });

        return addAuthPerformanceMetrics(response, startTime, true, path, method, userId);
      } else {
        logger.warn('User without builder role attempted to create profile', {
          userId,
          roles,
          path,
          method
        });

        return createAuthErrorResponse(
          AuthErrorType.AUTHORIZATION,
          'User does not have builder role',
          403,
          path,
          method,
          userId
        );
      }
    }

    // Update the builder profile
    const updateData = {
      ...validatedData.bio !== undefined ? { bio: validatedData.bio } : {},
      ...validatedData.headline !== undefined ? { headline: validatedData.headline } : {},
      ...validatedData.availableForHire !== undefined ? { availableForHire: validatedData.availableForHire } : {},
      ...validatedData.adhd_focus !== undefined ? { adhd_focus: validatedData.adhd_focus } : {},
      ...validatedData.socialLinks !== undefined ? { socialLinks: validatedData.socialLinks } : {},
    };

    // Update skills if provided
    if (validatedData.skills && validatedData.skills.length > 0) {
      logger.debug('Updating builder skills', {
        userId,
        profileId: dbUser.builderProfile.id,
        skillCount: validatedData.skills.length
      });

      // First, remove existing skill connections
      await db.builderSkill.deleteMany({
        where: {
          builderId: dbUser.builderProfile.id
        }
      });

      // Then, add new skill connections
      for (const skillName of validatedData.skills) {
        // Find or create the skill
        let skill = await db.skill.findFirst({
          where: { name: skillName }
        });

        if (!skill) {
          skill = await db.skill.create({
            data: {
              name: skillName,
              category: 'other', // Default category
            }
          });
        }

        // Create the connection
        await db.builderSkill.create({
          data: {
            builderId: dbUser.builderProfile.id,
            skillId: skill.id,
            proficiency: 1 // Default proficiency
          }
        });
      }
    }

    // Update the builder profile
    const updatedProfile = await db.builderProfile.update({
      where: { id: dbUser.builderProfile.id },
      data: updateData,
    });

    logger.info('Builder profile updated successfully', {
      userId,
      profileId: dbUser.builderProfile.id,
      path,
      method
    });

    const response = NextResponse.json({
      success: true,
      message: 'Builder profile updated successfully',
      data: updatedProfile,
    });

    return addAuthPerformanceMetrics(response, startTime, true, path, method, userId);
  } catch (error) {
    logger.error('Error updating builder profile', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId,
      path,
      method
    });
    captureException(error);

    return createAuthErrorResponse(
      AuthErrorType.SERVER,
      'Failed to update builder profile',
      500,
      path,
      method,
      userId
    );
  }
});
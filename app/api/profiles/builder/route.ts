/**
 * Builder Profiles API Route
 * Version: 2.0.0
 *
 * API routes for managing builder profiles
 * Updated to use Clerk Express SDK protection helpers
 */

import { NextRequest, NextResponse } from 'next/server';
import { withBuilder } from '@/lib/auth';
import { z } from 'zod';
import { db } from '@/lib/db';
import { captureException } from '@sentry/nextjs';
import { UserRole, AuthObject } from '@/lib/auth/types';
import { AuthErrorType, createAuthErrorResponse, addAuthPerformanceMetrics } from '@/lib/auth/adapters/clerk-express/errors';
import { logger } from '@/lib/logger';

// Simple slugify function
const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
};

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
export const GET = withBuilder(async (req: NextRequest, context: { params?: any }, auth: AuthObject) => {
  const startTime = performance.now();
  const path = req.nextUrl.pathname;
  const method = req.method;

  try {
    logger.debug('Fetching builder profile', { userId: auth.userId, path, method });

    // Look up the user in the database
    const dbUser = await db.user.findUnique({
      where: { clerkId: auth.userId },
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
      logger.warn('User not found when fetching builder profile', { userId: auth.userId, path, method });
      return createAuthErrorResponse(
        AuthErrorType.AUTHENTICATION,
        'User not found',
        404,
        path,
        method,
        auth.userId
      );
    }

    if (!dbUser.builderProfile) {
      logger.warn('Builder profile not found', { userId: auth.userId, path, method });
      return createAuthErrorResponse(
        'RESOURCE_NOT_FOUND',
        'Builder profile not found',
        404,
        path,
        method,
        auth.userId
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

    return addAuthPerformanceMetrics(response, startTime, true, path, method, auth.userId);
  } catch (error) {
    logger.error('Error fetching builder profile', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: auth.userId,
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
      auth.userId
    );
  }
});

/**
 * POST /api/profiles/builder
 *
 * Update the authenticated user's builder profile
 */
export const POST = withBuilder(async (req: NextRequest, context: { params?: any }, auth: AuthObject) => {
  const startTime = performance.now();
  const path = req.nextUrl.pathname;
  const method = req.method;

  try {
    logger.debug('Updating builder profile', { userId: auth.userId, path, method });

    // Parse the request body
    const requestBody = await req.json();

    // Validate the request body against the schema
    const result = builderProfileSchema.safeParse(requestBody);

    if (!result.success) {
      logger.warn('Invalid request body for builder profile update', {
        userId: auth.userId,
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
        auth.userId
      );
    }

    const validatedData = result.data;

    // First, find the user in our database
    const dbUser = await db.user.findUnique({
      where: { clerkId: auth.userId },
      include: {
        builderProfile: true
      }
    });

    if (!dbUser) {
      logger.warn('User not found when updating builder profile', { userId: auth.userId, path, method });
      return createAuthErrorResponse(
        AuthErrorType.AUTHENTICATION,
        'User not found',
        404,
        path,
        method,
        auth.userId
      );
    }

    // Determine if we are creating or updating a profile
    const existingProfile = dbUser.builderProfile;
    let updatedOrCreatedProfile;

    // Handle skills separately
    const skillsToConnect: { id: string }[] = [];
    const skillsToCreate: { name: string; slug: string; domain?: string }[] = [];

    if (validatedData.skills && validatedData.skills.length > 0) {
      for (const skillName of validatedData.skills) {
        const existingSkill = await db.skill.findUnique({
          where: { name: skillName },
        });
        if (existingSkill) {
          skillsToConnect.push({ id: existingSkill.id });
        } else {
          // For now, let's assume new skills are generic if domain isn't provided
          // In a real app, you might have a default domain or require it
          skillsToCreate.push({ name: skillName, slug: slugify(skillName) });
        }
      }
    }

    if (existingProfile) {
      // Update existing profile
      logger.debug('Updating existing builder profile', { userId: auth.userId, profileId: existingProfile.id });
      updatedOrCreatedProfile = await db.builderProfile.update({
        where: { id: existingProfile.id },
        data: {
          bio: validatedData.bio,
          headline: validatedData.headline,
          availableForHire: validatedData.availableForHire,
          adhd_focus: validatedData.adhd_focus,
          socialLinks: validatedData.socialLinks ? validatedData.socialLinks : undefined,
          skills: {
            // First, disconnect all existing skills for this profile if new skills are provided
            ...(validatedData.skills && validatedData.skills.length > 0 ? { set: [] } : {}),
            // Then connect existing or create new ones
            connect: skillsToConnect.map(skill => ({ id: skill.id })),
            create: skillsToCreate.map(skillData => ({ skill: { create: skillData } })),
          },
        },
        include: { skills: { include: { skill: true } } },
      });
    } else {
      // Create new profile
      logger.debug('Creating new builder profile', { userId: auth.userId });
      updatedOrCreatedProfile = await db.builderProfile.create({
        data: {
          userId: dbUser.id, // Link to the User model's ID, not Clerk ID
          bio: validatedData.bio,
          headline: validatedData.headline,
          availableForHire: validatedData.availableForHire,
          adhd_focus: validatedData.adhd_focus,
          socialLinks: validatedData.socialLinks ? validatedData.socialLinks : undefined,
          skills: {
            connect: skillsToConnect.map(skill => ({ id: skill.id })),
            create: skillsToCreate.map(skillData => ({ skill: { create: skillData } })),
          },
        },
        include: { skills: { include: { skill: true } } },
      });
    }

    // Transform skills for the response
    const formattedSkills = updatedOrCreatedProfile.skills.map(skill => ({
      id: skill.skill.id,
      name: skill.skill.name,
      domain: skill.skill.domain,
    }));

    // Return the updated or created profile
    const response = NextResponse.json({
      success: true,
      data: {
        id: updatedOrCreatedProfile.id,
        userId: dbUser.id,
        bio: updatedOrCreatedProfile.bio,
        headline: updatedOrCreatedProfile.headline,
        skills: formattedSkills,
        availableForHire: updatedOrCreatedProfile.availableForHire,
        adhd_focus: updatedOrCreatedProfile.adhd_focus,
        validationTier: updatedOrCreatedProfile.validationTier,
        socialLinks: updatedOrCreatedProfile.socialLinks,
        createdAt: updatedOrCreatedProfile.createdAt,
        updatedAt: updatedOrCreatedProfile.updatedAt,
      }
    });

    return addAuthPerformanceMetrics(response, startTime, true, path, method, auth.userId);
  } catch (error) {
    logger.error('Error updating builder profile', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: auth.userId,
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
      auth.userId
    );
  }
});
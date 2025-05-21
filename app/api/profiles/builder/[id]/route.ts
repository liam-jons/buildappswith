/**
 * Builder Profile by ID API Route
 * Version: 1.1.0
 * 
 * API route for getting a specific builder profile by ID
 * Now with authentication and authorization via the profile-auth middleware
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { captureException } from '@sentry/nextjs';
import { withProfileAccess } from '@/lib/middleware/profile-auth';
import { logger } from '@/lib/logger';

/**
 * GET /api/profiles/builder/[id]
 * 
 * Get a builder profile by ID
 */
export const GET = withProfileAccess(
  async (req: NextRequest, { profileId, isOwner, isAdmin }) => {
    try {
      const id = profileId;
      
      // Log the access attempt
      logger.info('Builder profile fetch', { 
        profileId: id, 
        isOwner, 
        isAdmin 
      });

    if (!id) {
      return NextResponse.json(
        { error: 'Builder ID is required' },
        { status: 400 }
      );
    }

    // Look up the builder profile
    const builderProfile = await db.builderProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            roles: true,
          }
        },
        skills: {
          include: {
            skill: true
          }
        }
      }
    });

    if (!builderProfile) {
      return NextResponse.json(
        { error: 'Builder profile not found' },
        { status: 404 }
      );
    }

    // Transform skills into a more readable format
    const formattedSkills = builderProfile.skills.map(skill => ({
      id: skill.skill.id,
      name: skill.skill.name,
      category: skill.skill.category,
    }));

    // Return the builder profile with user information
    return NextResponse.json({
      id: builderProfile.id,
      user: {
        id: builderProfile.user.id,
        name: builderProfile.user.name,
        email: builderProfile.user.email,
        image: builderProfile.user.image,
      },
      bio: builderProfile.bio,
      headline: builderProfile.headline,
      skills: formattedSkills,
      availableForHire: builderProfile.availableForHire,
      adhdFocus: builderProfile.adhd_focus,
      validationTier: builderProfile.validationTier,
      socialLinks: builderProfile.socialLinks,
      createdAt: builderProfile.createdAt,
      updatedAt: builderProfile.updatedAt,
    });
  } catch (error) {
    logger.error('Error fetching builder profile', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      profileId
    });
    captureException(error);
    
    return NextResponse.json(
      { error: 'Failed to fetch builder profile' },
      { status: 500 }
    );
  }
}, { 
  // Allow public access to view profiles
  requireAuth: false
});
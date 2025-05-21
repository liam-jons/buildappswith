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
import { toStandardResponse, ApiErrorCode } from '@/lib/types/api-types';

/**
 * GET /api/profiles/builder/[id]
 * 
 * Get a builder profile by ID
 */
export const GET = withProfileAccess(
  (async (req: NextRequest, { profileId, isOwner, isAdmin }: { profileId: string; isOwner: boolean; isAdmin: boolean }) => {
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
        toStandardResponse(null, {
          error: {
            code: ApiErrorCode.BAD_REQUEST,
            message: 'Builder ID is required',
            statusCode: 400
          }
        }),
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
            clerkId: true,
            name: true,
            email: true,
            imageUrl: true,
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
        toStandardResponse(null, {
          error: {
            code: ApiErrorCode.NOT_FOUND,
            message: 'Builder profile not found',
            statusCode: 404
          }
        }),
        { status: 404 }
      );
    }

    // Transform skills into a more readable format
    const formattedSkills = builderProfile.skills.map((skillRelation: any) => ({
      id: skillRelation.skill.id,
      name: skillRelation.skill.name,
      category: skillRelation.skill.category,
    }));

    // Create flattened profile response data (for component compatibility)
    const profileData = {
      // User info
      userId: builderProfile.user.id,
      clerkId: builderProfile.user.clerkId,
      email: builderProfile.user.email,
      name: builderProfile.user.name,
      
      // Profile info (flattened)
      id: builderProfile.id,
      bio: builderProfile.bio,
      headline: builderProfile.headline,
      slug: builderProfile.slug,
      tagline: builderProfile.tagline,
      displayName: builderProfile.displayName,
      title: builderProfile.headline, // Map headline to title for component compatibility
      validationTier: builderProfile.validationTier,
      domains: builderProfile.domains || [],
      badges: builderProfile.badges || [],
      completedProjects: builderProfile.completedProjects || 0,
      responseRate: builderProfile.responseRate,
      hourlyRate: builderProfile.hourlyRate,
      availableForHire: builderProfile.availableForHire,
      adhd_focus: builderProfile.adhd_focus,
      expertiseAreas: builderProfile.expertiseAreas || {},
      socialLinks: builderProfile.socialLinks || {},
      portfolioItems: builderProfile.portfolioItems || [],
      featured: builderProfile.featured,
      searchable: builderProfile.searchable,
      availability: builderProfile.availability || 'available',
      topSkills: formattedSkills.map((skill: any) => skill.name),
      
      // Additional properties for component compatibility
      avatarUrl: builderProfile.user.imageUrl,
      coverImageUrl: undefined, // Not available from current schema
      joinDate: builderProfile.createdAt,
      rating: undefined, // Not available from current schema
      
      // Additional properties expected by components
      avatar: builderProfile.user.imageUrl ? { url: builderProfile.user.imageUrl } : undefined,
      specializations: builderProfile.domains || [], // Map domains to specializations
      
      // Related data
      permissions: {
        canView: true,
        canEdit: isOwner,
        canDelete: isOwner || isAdmin,
        canVerify: isAdmin,
      }
    };

    // Return the builder profile with standardized response format
    return NextResponse.json(toStandardResponse(profileData));
  } catch (error) {
    logger.error('Error fetching builder profile', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      profileId
    });
    captureException(error);
    
    return NextResponse.json(
      toStandardResponse(null, {
        error: {
          code: ApiErrorCode.INTERNAL_ERROR,
          message: 'Failed to fetch builder profile',
          statusCode: 500
        }
      }),
      { status: 500 }
    );
  }
  }) as any,
{ 
  // Allow public access to view profiles
  requireAuth: false
});
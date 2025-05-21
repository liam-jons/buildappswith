/**
 * All Builder Profiles API Route
 * Version: 1.0.0
 * 
 * API route for listing all builder profiles with optional filtering
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { captureException } from '@sentry/nextjs';

/**
 * GET /api/profiles/builders
 * 
 * Get all builder profiles with optional filtering
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    
    // Parse query parameters for filtering and pagination
    const featured = url.searchParams.get('featured') === 'true';
    const adhdFocus = url.searchParams.get('adhdFocus') === 'true';
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const page = parseInt(url.searchParams.get('page') || '1');
    const skills = url.searchParams.get('skills')?.split(',') || [];
    const validationTier = url.searchParams.get('validationTier') 
      ? parseInt(url.searchParams.get('validationTier') || '0') 
      : undefined;
    
    // Build the query
    const where = {
      ...(featured ? { featured: true } : {}),
      ...(adhdFocus ? { adhdFocus: true } : {}),
      ...(validationTier ? { validationTier } : {}),
      ...(skills.length > 0 ? {
        skills: {
          some: {
            skill: {
              name: {
                in: skills
              }
            }
          }
        }
      } : {})
    };
    
    // Fetch the builder profiles with pagination
    const builderProfiles = await db.builderProfile.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          }
        },
        skills: {
          include: {
            skill: true
          }
        }
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        validationTier: 'desc', // Order by validation tier by default
      },
    });
    
    // Get the total count for pagination
    const totalCount = await db.builderProfile.count({ where });
    
    // Transform the builder profiles for the response
    const formattedProfiles = builderProfiles.map(profile => ({
      id: profile.id,
      slug: profile.slug || undefined,
      user: {
        id: profile.user.id,
        name: profile.user.name,
        email: profile.user.email,
        image: profile.user.image,
      },
      headline: profile.headline,
      bio: profile.bio,
      skills: profile.skills.map(skill => ({
        id: skill.skill.id,
        name: skill.skill.name,
        category: skill.skill.category,
      })),
      availableForHire: profile.availableForHire,
      adhdFocus: profile.adhd_focus,
      validationTier: profile.validationTier,
      socialLinks: profile.socialLinks,
      featured: profile.featured,
    }));
    
    return NextResponse.json({
      builders: formattedProfiles,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      }
    });
  } catch (error) {
    console.error('Error fetching builder profiles:', error);
    captureException(error);
    
    return NextResponse.json(
      { error: 'Failed to fetch builder profiles' },
      { status: 500 }
    );
  }
}
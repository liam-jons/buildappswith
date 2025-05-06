/**
 * Builder Profile by Slug API Route
 * Version: 1.0.0
 * 
 * API route for getting a specific builder profile by slug
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { captureException } from '@sentry/nextjs';

/**
 * GET /api/profiles/builder/slug/[slug]
 * 
 * Get a builder profile by slug
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;

    if (!slug) {
      return NextResponse.json(
        { error: 'Builder slug is required' },
        { status: 400 }
      );
    }

    // Look up the builder profile by slug
    const builderProfile = await db.builderProfile.findFirst({
      where: { slug },
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
      slug: builderProfile.slug,
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
      adhdFocus: builderProfile.adhdFocus,
      validationTier: builderProfile.validationTier,
      socialLinks: builderProfile.socialLinks,
      createdAt: builderProfile.createdAt,
      updatedAt: builderProfile.updatedAt,
    });
  } catch (error) {
    console.error('Error fetching builder profile by slug:', error);
    captureException(error);
    
    return NextResponse.json(
      { error: 'Failed to fetch builder profile' },
      { status: 500 }
    );
  }
}
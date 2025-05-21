/**
 * Builder Profile by Clerk ID API Route
 * Version: 1.0.0
 * 
 * API route for getting a specific builder profile by Clerk user ID
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { captureException } from '@sentry/nextjs';

/**
 * GET /api/profiles/builder/clerk/[clerkId]
 * 
 * Get a builder profile by Clerk user ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { clerkId: string } }
) {
  try {
    const clerkId = params.clerkId;

    if (!clerkId) {
      return NextResponse.json(
        { error: 'Clerk user ID is required' },
        { status: 400 }
      );
    }

    // First find the user with this Clerk ID
    const user = await db.user.findUnique({
      where: { clerkId },
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

    if (!user) {
      return NextResponse.json(
        { error: 'User not found with the provided Clerk ID' },
        { status: 404 }
      );
    }

    if (!user.builderProfile) {
      return NextResponse.json(
        { error: 'Builder profile not found for this user' },
        { status: 404 }
      );
    }

    // Transform skills into a more readable format
    const formattedSkills = user.builderProfile.skills.map(skill => ({
      id: skill.skill.id,
      name: skill.skill.name,
      category: skill.skill.category,
    }));

    // Return the builder profile with user information
    return NextResponse.json({
      id: user.builderProfile.id,
      slug: user.builderProfile.slug,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      },
      bio: user.builderProfile.bio,
      headline: user.builderProfile.headline,
      skills: formattedSkills,
      availableForHire: user.builderProfile.availableForHire,
      adhdFocus: user.builderProfile.adhd_focus,
      validationTier: user.builderProfile.validationTier,
      socialLinks: user.builderProfile.socialLinks,
      createdAt: user.builderProfile.createdAt,
      updatedAt: user.builderProfile.updatedAt,
    });
  } catch (error) {
    console.error('Error fetching builder profile by Clerk ID:', error);
    captureException(error);
    
    return NextResponse.json(
      { error: 'Failed to fetch builder profile' },
      { status: 500 }
    );
  }
}
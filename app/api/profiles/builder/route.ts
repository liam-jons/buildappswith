/**
 * Builder Profiles API Route
 * Version: 1.0.0
 * 
 * API routes for managing builder profiles
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, withBuilder } from '@/lib/auth/api-auth';
import { z } from 'zod';
import { db } from '@/lib/db';
import { captureException } from '@sentry/nextjs';
import { UserRole } from '@/lib/auth/types';

// Schema for builder profile updates
const builderProfileSchema = z.object({
  bio: z.string().max(1000, { message: "Bio cannot exceed 1000 characters" }).optional(),
  headline: z.string().max(100, { message: "Headline cannot exceed 100 characters" }).optional(),
  skills: z.array(z.string()).optional(),
  availableForHire: z.boolean().optional(),
  adhdFocus: z.boolean().optional(),
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
export const GET = withBuilder(async (req: NextRequest, user) => {
  try {
    // Look up the user in the database
    const dbUser = await db.user.findUnique({
      where: { clerkId: user.id },
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
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (!dbUser.builderProfile) {
      return NextResponse.json(
        { error: 'Builder profile not found' },
        { status: 404 }
      );
    }

    // Transform skills into a more readable format
    const formattedSkills = dbUser.builderProfile.skills.map(skill => ({
      id: skill.skill.id,
      name: skill.skill.name,
      category: skill.skill.category,
    }));

    // Return the builder profile
    return NextResponse.json({
      id: dbUser.builderProfile.id,
      userId: dbUser.id,
      bio: dbUser.builderProfile.bio,
      headline: dbUser.builderProfile.headline,
      skills: formattedSkills,
      availableForHire: dbUser.builderProfile.availableForHire,
      adhdFocus: dbUser.builderProfile.adhdFocus,
      validationTier: dbUser.builderProfile.validationTier,
      socialLinks: dbUser.builderProfile.socialLinks,
      createdAt: dbUser.builderProfile.createdAt,
      updatedAt: dbUser.builderProfile.updatedAt,
    });
  } catch (error) {
    console.error('Error fetching builder profile:', error);
    captureException(error);
    
    return NextResponse.json(
      { error: 'Failed to fetch builder profile' },
      { status: 500 }
    );
  }
});

/**
 * POST /api/profiles/builder
 * 
 * Update the authenticated user's builder profile
 */
export const POST = withBuilder(async (req: NextRequest, user) => {
  try {
    // Parse the request body
    const requestBody = await req.json();
    
    // Validate the request body against the schema
    const result = builderProfileSchema.safeParse(requestBody);
    
    if (!result.success) {
      return NextResponse.json(
        { 
          error: 'Invalid request body', 
          details: result.error.format() 
        },
        { status: 400 }
      );
    }
    
    const validatedData = result.data;
    
    // First, find the user in our database
    const dbUser = await db.user.findUnique({
      where: { clerkId: user.id },
      include: {
        builderProfile: true
      }
    });
    
    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    if (!dbUser.builderProfile) {
      // If no builder profile exists but user has the builder role, create one
      if (dbUser.roles.includes(UserRole.BUILDER)) {
        const newProfile = await db.builderProfile.create({
          data: {
            userId: dbUser.id,
            bio: validatedData.bio || '',
            headline: validatedData.headline || '',
            availableForHire: validatedData.availableForHire || true,
            adhdFocus: validatedData.adhdFocus || false,
            socialLinks: validatedData.socialLinks || {},
            validationTier: 1,
          },
        });
        
        return NextResponse.json({
          message: 'Builder profile created successfully',
          profile: newProfile,
        });
      } else {
        return NextResponse.json(
          { error: 'User does not have builder role' },
          { status: 403 }
        );
      }
    }
    
    // Update the builder profile
    const updateData = {
      ...validatedData.bio !== undefined ? { bio: validatedData.bio } : {},
      ...validatedData.headline !== undefined ? { headline: validatedData.headline } : {},
      ...validatedData.availableForHire !== undefined ? { availableForHire: validatedData.availableForHire } : {},
      ...validatedData.adhdFocus !== undefined ? { adhdFocus: validatedData.adhdFocus } : {},
      ...validatedData.socialLinks !== undefined ? { socialLinks: validatedData.socialLinks } : {},
    };
    
    // Update skills if provided
    if (validatedData.skills && validatedData.skills.length > 0) {
      // First, remove existing skill connections
      await db.builderSkill.deleteMany({
        where: {
          builderProfileId: dbUser.builderProfile.id
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
            builderProfileId: dbUser.builderProfile.id,
            skillId: skill.id
          }
        });
      }
    }
    
    // Update the builder profile
    const updatedProfile = await db.builderProfile.update({
      where: { id: dbUser.builderProfile.id },
      data: updateData,
    });
    
    return NextResponse.json({
      message: 'Builder profile updated successfully',
      profile: updatedProfile,
    });
  } catch (error) {
    console.error('Error updating builder profile:', error);
    captureException(error);
    
    return NextResponse.json(
      { error: 'Failed to update builder profile' },
      { status: 500 }
    );
  }
});
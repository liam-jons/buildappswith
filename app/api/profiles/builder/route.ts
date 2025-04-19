import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth/auth'; // Updated import
import { z } from 'zod';

// Create/update schema validation
const builderProfileSchema = z.object({
  bio: z.string().min(10).max(1000).optional(),
  headline: z.string().min(5).max(100).optional(),
  hourlyRate: z.number().min(0).optional(),
  domains: z.array(z.string()).optional(),
  skills: z.array(z.object({
    name: z.string(),
    proficiency: z.number().min(1).max(5)
  })).optional(),
  availableForHire: z.boolean().optional(),
  portfolioItems: z.array(z.object({
    title: z.string(),
    description: z.string(),
    imageUrl: z.string(),
    outcomes: z.array(z.object({
      label: z.string(),
      value: z.string(),
      trend: z.enum(['up', 'down', 'neutral']).optional()
    })).optional(),
    tags: z.array(z.string()).optional(),
    projectUrl: z.string().url().optional()
  })).optional(),
  socialLinks: z.object({
    website: z.string().url().optional().nullable(),
    linkedin: z.string().url().optional().nullable(),
    github: z.string().url().optional().nullable(),
    twitter: z.string().url().optional().nullable()
  }).optional()
});

/**
 * GET handler for fetching the builder profile of the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth(); // Updated to use auth()
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    // At this point we've verified session.user.id exists
    const userId = session.user.id as string;
    
    // Check if profile exists
    const profile = await db.builderProfile.findUnique({
      where: {
        userId
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true,
            verified: true
          }
        },
        skills: {
          include: {
            skill: true
          }
        }
      }
    });
    
    if (!profile) {
      return NextResponse.json(
        { error: 'Builder profile not found' }, 
        { status: 404 }
      );
    }
    
    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error fetching builder profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch builder profile' }, 
      { status: 500 }
    );
  }
}

/**
 * POST handler for creating/updating a builder profile
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth(); // Updated to use auth()
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    // Parse and validate the request body
    const body = await request.json();
    const result = builderProfileSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: result.error.flatten() }, 
        { status: 400 }
      );
    }
    
    const data = result.data;
    
    // At this point we've verified session.user.id exists
    const userId = session.user.id as string;
    
    // Check if user already has a builder profile
    const existingProfile = await db.builderProfile.findUnique({
      where: {
        userId
      }
    });
    
    // Create or update builder profile
    const profile = await db.builderProfile.upsert({
      where: {
        userId
      },
      create: {
        userId,
        bio: data.bio,
        headline: data.headline,
        hourlyRate: data.hourlyRate,
        domains: data.domains || [],
        availableForHire: data.availableForHire ?? true,
        portfolioItems: data.portfolioItems || [],
        // Set initial validation tier to 1 (Entry)
        validationTier: 1
      },
      update: {
        bio: data.bio !== undefined ? data.bio : undefined,
        headline: data.headline !== undefined ? data.headline : undefined,
        hourlyRate: data.hourlyRate !== undefined ? data.hourlyRate : undefined,
        domains: data.domains !== undefined ? data.domains : undefined,
        availableForHire: data.availableForHire !== undefined ? data.availableForHire : undefined,
        portfolioItems: data.portfolioItems !== undefined ? data.portfolioItems : undefined
      }
    });
    
    // Also update the user role if this is the first time creating a builder profile
    if (!existingProfile) {
      await db.user.update({
        where: {
          id: userId
        },
        data: {
          role: 'BUILDER'
        }
      });
    }
    
    // Handle skill updates if provided
    if (data.skills) {
      // First, remove any existing skills to avoid duplicates
      await db.builderSkill.deleteMany({
        where: {
          builderId: profile.id
        }
      });
      
      // Then, add the new skills
      for (const skillData of data.skills) {
        // Find or create the skill
        const skill = await db.skill.upsert({
          where: {
            slug: skillData.name.toLowerCase().replace(/\s+/g, '-')
          },
          create: {
            name: skillData.name,
            slug: skillData.name.toLowerCase().replace(/\s+/g, '-'),
            domain: 'general', // Default domain
            level: 1 // Default level
          },
          update: {}
        });
        
        // Create the builder skill relationship
        await db.builderSkill.create({
          data: {
            builderId: profile.id,
            skillId: skill.id,
            proficiency: skillData.proficiency,
            verified: false
          }
        });
      }
    }
    
    return NextResponse.json({
      message: existingProfile ? 'Builder profile updated' : 'Builder profile created',
      profile
    });
  } catch (error) {
    console.error('Error creating/updating builder profile:', error);
    return NextResponse.json(
      { error: 'Failed to create/update builder profile' }, 
      { status: 500 }
    );
  }
}
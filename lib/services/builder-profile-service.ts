import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { ValidationTier } from '@/components/profile/validation-tier-badge';
import { portfolioItemsToPrisma, socialLinksToPrisma } from '@/lib/types/builder';
import { getSocialLinks } from '@/lib/prisma-types';
import PrismaExtensions from '@/lib/prisma-extensions';
import '@/lib/prisma-types';

/**
 * Interfaces for builder profile service
 */
export interface SocialLinks {
  website?: string;
  linkedin?: string;
  github?: string;
  twitter?: string;
}

export interface OutcomeMetric {
  label: string;
  value: string;
  trend: 'up' | 'down' | 'neutral';
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  outcomes?: OutcomeMetric[];
  tags?: string[];
  projectUrl?: string;
  createdAt: Date;
}

export interface CreateBuilderProfileData {
  userId: string;
  bio?: string;
  headline?: string;
  hourlyRate?: number;
  domains?: string[];
  badges?: string[];
  availableForHire?: boolean;
  portfolioItems?: PortfolioItem[];
  socialLinks?: SocialLinks;
}

export interface UpdateBuilderProfileData {
  bio?: string;
  headline?: string;
  hourlyRate?: number;
  domains?: string[];
  badges?: string[];
  availableForHire?: boolean;
  portfolioItems?: PortfolioItem[];
  socialLinks?: SocialLinks;
}

export interface BuilderSkillData {
  name: string;
  proficiency: number;
  verified?: boolean;
}

/**
 * Map numeric validation tier to string representation
 */
export function mapValidationTierNumber(tier: number): ValidationTier {
  switch (tier) {
    case 1:
      return 'entry';
    case 2:
      return 'established';
    case 3:
      return 'expert';
    default:
      return 'entry';
  }
}

/**
 * Map string validation tier to numeric representation
 */
export function mapValidationTierString(tier: ValidationTier): number {
  switch (tier) {
    case 'entry':
      return 1;
    case 'established':
      return 2;
    case 'expert':
      return 3;
    default:
      return 1;
  }
}

/**
 * Create a new builder profile
 */
export async function createBuilderProfile(data: CreateBuilderProfileData) {
  try {
    // Check if profile already exists
    const existingProfile = await db.builderProfile.findUnique({
      where: { userId: data.userId }
    });
    
    if (existingProfile) {
      throw new Error('Builder profile already exists for this user');
    }
    
    // Create new profile
    const profile = await db.builderProfile.create({
      data: {
        userId: data.userId,
        bio: data.bio,
        headline: data.headline,
        hourlyRate: data.hourlyRate,
        domains: data.domains || [],
        badges: data.badges || [],
        availableForHire: data.availableForHire ?? true,
        portfolioItems: portfolioItemsToPrisma(data.portfolioItems || []),
        socialLinks: socialLinksToPrisma(data.socialLinks || {}),
        validationTier: 1 // Start at Entry level
      }
    });
    
    // Update user role
    await db.user.update({
      where: { id: data.userId },
      data: { role: 'BUILDER' }
    });
    
    return profile;
  } catch (error) {
    console.error('Error creating builder profile:', error);
    throw new Error('Failed to create builder profile');
  }
}

/**
 * Update an existing builder profile
 */
export async function updateBuilderProfile(userId: string, data: UpdateBuilderProfileData) {
  try {
    // Check if profile exists
    const existingProfile = await db.builderProfile.findUnique({
      where: { userId }
    });
    
    if (!existingProfile) {
      throw new Error('Builder profile not found');
    }
    
    // Update profile
    const updatedProfile = await db.builderProfile.update({
      where: { userId },
      data: {
        bio: data.bio !== undefined ? data.bio : undefined,
        headline: data.headline !== undefined ? data.headline : undefined,
        hourlyRate: data.hourlyRate !== undefined ? data.hourlyRate : undefined,
        domains: data.domains !== undefined ? data.domains : undefined,
        badges: data.badges !== undefined ? data.badges : undefined,
        availableForHire: data.availableForHire !== undefined ? data.availableForHire : undefined,
        portfolioItems: data.portfolioItems !== undefined ? portfolioItemsToPrisma(data.portfolioItems) : undefined,
        socialLinks: data.socialLinks !== undefined ? socialLinksToPrisma(data.socialLinks) : undefined
      }
    });
    
    return updatedProfile;
  } catch (error) {
    console.error('Error updating builder profile:', error);
    throw new Error('Failed to update builder profile');
  }
}

/**
 * Get a builder profile by user ID
 */
export async function getBuilderProfileByUserId(userId: string) {
  try {
    const profile = await db.builderProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            verified: true,
            createdAt: true
          }
        },
        skills: {
          include: {
            skill: true
          }
        }
      }
    });
    
    return profile;
  } catch (error) {
    console.error('Error fetching builder profile:', error);
    throw new Error('Failed to fetch builder profile');
  }
}

/**
 * Add or update skills for a builder
 */
export async function updateBuilderSkills(builderId: string, skills: BuilderSkillData[]) {
  try {
    // First, get the builder profile
    const profile = await db.builderProfile.findUnique({
      where: { id: builderId }
    });
    
    if (!profile) {
      throw new Error('Builder profile not found');
    }
    
    // Remove existing skills
    await db.builderSkill.deleteMany({
      where: { builderId }
    });
    
    // Add new skills
    for (const skillData of skills) {
      // Find or create the skill
      const skill = await db.skill.upsert({
        where: {
          slug: skillData.name.toLowerCase().replace(/\s+/g, '-')
        },
        create: {
          name: skillData.name,
          slug: skillData.name.toLowerCase().replace(/\s+/g, '-'),
          domain: 'general', // Default domain
          level: 1, // Default level
          status: 'ACTIVE' // Default status
        },
        update: {}
      });
      
      // Create the builder skill relationship
      await db.builderSkill.create({
        data: {
          builderId,
          skillId: skill.id,
          proficiency: skillData.proficiency,
          verified: skillData.verified || false
        }
      });
    }
    
    return await db.builderProfile.findUnique({
      where: { id: builderId },
      include: {
        skills: {
          include: {
            skill: true
          }
        }
      }
    });
  } catch (error) {
    console.error('Error updating builder skills:', error);
    throw new Error('Failed to update builder skills');
  }
}

/**
 * Update validation tier for a builder
 */
export async function updateValidationTier(builderId: string, tier: ValidationTier) {
  try {
    const numericTier = mapValidationTierString(tier);
    
    const profile = await db.builderProfile.update({
      where: { id: builderId },
      data: {
        validationTier: numericTier
      }
    });
    
    return profile;
  } catch (error) {
    console.error('Error updating validation tier:', error);
    throw new Error('Failed to update validation tier');
  }
}

/**
 * Update portfolio items for a builder
 */
export async function updatePortfolioItems(builderId: string, portfolioItems: PortfolioItem[]) {
  try {
    const profile = await db.builderProfile.update({
      where: { id: builderId },
      data: {
        portfolioItems: portfolioItemsToPrisma(portfolioItems)
      }
    });
    
    return profile;
  } catch (error) {
    console.error('Error updating portfolio items:', error);
    throw new Error('Failed to update portfolio items');
  }
}

/**
 * Check if a user has completed tier 1 validation requirements
 */
export async function checkTier1ValidationStatus(userId: string) {
  try {
    const profile = await db.builderProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            verified: true
          }
        },
        skills: true
      }
    });
    
    if (!profile) {
      return {
        isComplete: false,
        steps: {
          identityVerified: false,
          competencyQuizCompleted: false,
          codeSampleReviewed: false
        }
      };
    }
    
    // Check for identity verification
    const identityVerified = profile.user.verified;
    
    // Check for competency quiz completion
    // This would typically be stored in a separate table, but for now we'll mock it
    const competencyQuizCompleted = false; // This would be determined from a quiz results table
    
    // Check for code sample review
    // This would also typically be stored in a separate table
    const codeSampleReviewed = profile.portfolioItems.length > 0;
    
    return {
      isComplete: identityVerified && competencyQuizCompleted && codeSampleReviewed,
      steps: {
        identityVerified,
        competencyQuizCompleted,
        codeSampleReviewed
      }
    };
  } catch (error) {
    console.error('Error checking validation status:', error);
    throw new Error('Failed to check validation status');
  }
}

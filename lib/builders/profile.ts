/**
 * Builder Profile Module
 * 
 * Handles loading and managing builder profiles with proper error handling
 * Version: 1.0.40
 */

import { PrismaClient, Prisma, BuilderProfile, App } from '@prisma/client';
import { getSessionTypes } from '../session-types';

// Extended builder profile type with related data
export type ExtendedBuilderProfile = BuilderProfile & {
  user: {
    name: string;
    email: string;
    image: string | null;
    roles: string[];
    isFounder: boolean;
  };
  apps: App[];
  skills: {
    skill: {
      name: string;
      domain: string;
    };
    proficiency: number;
  }[];
};

// Fallback for Liam Jons profile if database record is missing
export const liamJonsFallbackProfile = {
  id: "builder-liam",
  name: "Liam Jons",
  title: "Founder & AI Application Builder",
  bio: "I'm passionate about democratizing AI technology and making it accessible to everyone. With a background in technology and a special focus on helping people with ADHD, I founded Buildappswith to create a platform where people can learn to leverage AI effectively in their daily lives and businesses. My mission is to empower individuals to use technology to save time on mundane tasks so they can focus on what truly matters - human connection and creativity.",
  founderBio: "As the founder of Buildappswith, I created this platform with a clear mission: to help people understand and leverage AI in practical ways. I believe that AI should serve humans, not the other way around, and that technology is at its best when it enhances our human connections rather than replacing them. My focus is especially on helping those who have been traditionally underserved by technology - including people with ADHD and neurodivergent traits - to benefit from the efficiency and personalization AI can provide.",
  avatarUrl: "/assets/liam-profile.jpg",
  validationTier: "expert",
  adhd_focus: true,
  skills: [
    "AI Application Design", 
    "ADHD Productivity Tools", 
    "Human-Centered AI", 
    "Next.js Development",
    "AI Literacy",
    "Tailwind CSS",
    "TypeScript",
    "Practical AI Implementation"
  ],
  socialLinks: {
    website: "https://buildappswith.ai",
    linkedin: "https://linkedin.com/in/liamjons",
    github: "https://github.com/liamjons",
    twitter: "https://twitter.com/buildappswith"
  },
  // Empty arrays that would normally come from the database
  apps: [],
  builderSkills: []
};

/**
 * Get a builder profile by slug
 * @param slug The builder slug (e.g., 'liam-jons')
 * @returns The builder profile or null if not found
 */
export async function getBuilderProfileBySlug(slug: string): Promise<ExtendedBuilderProfile | null> {
  const prisma = new PrismaClient();
  
  try {
    // Special handling for Liam Jons
    if (slug === 'liam-jons') {
      // First, try to find by email
      const liamUser = await prisma.user.findFirst({
        where: {
          email: 'liam.jones@buildappswith.com'
        },
        include: {
          builderProfile: {
            include: {
              apps: true,
              skills: {
                include: {
                  skill: true
                }
              }
            }
          }
        }
      });
      
      if (liamUser && liamUser.builderProfile) {
        // Format the profile
        return {
          ...liamUser.builderProfile,
          user: {
            name: liamUser.name || 'Liam Jons',
            email: liamUser.email,
            image: liamUser.image,
            roles: liamUser.roles,
            isFounder: liamUser.isFounder
          },
          apps: liamUser.builderProfile.apps,
          skills: liamUser.builderProfile.skills.map(s => ({
            skill: {
              name: s.skill.name,
              domain: s.skill.domain
            },
            proficiency: s.proficiency
          }))
        };
      }
      
      // If not found, log an error and use fallback data
      console.error('Liam Jons profile not found in database, using fallback data');
      
      // Return fallback data
      return liamJonsFallbackProfile as unknown as ExtendedBuilderProfile;
    }
    
    // For other builders, find by slug derived from name
    const user = await prisma.user.findFirst({
      where: {
        name: {
          contains: slug.replace('-', ' '),
          mode: 'insensitive'
        },
        roles: {
          hasSome: ['BUILDER']
        }
      },
      include: {
        builderProfile: {
          include: {
            apps: true,
            skills: {
              include: {
                skill: true
              }
            }
          }
        }
      }
    });
    
    if (!user || !user.builderProfile) {
      return null;
    }
    
    return {
      ...user.builderProfile,
      user: {
        name: user.name || '',
        email: user.email,
        image: user.image,
        roles: user.roles,
        isFounder: user.isFounder
      },
      apps: user.builderProfile.apps,
      skills: user.builderProfile.skills.map(s => ({
        skill: {
          name: s.skill.name,
          domain: s.skill.domain
        },
        proficiency: s.proficiency
      }))
    };
  } catch (error) {
    console.error(`Error loading builder profile for ${slug}:`, error);
    
    // For Liam Jons, use fallback data if there's an error
    if (slug === 'liam-jons') {
      return liamJonsFallbackProfile as unknown as ExtendedBuilderProfile;
    }
    
    return null;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Get session types for a builder
 * @param builderSlug The builder slug (e.g., 'liam-jons')
 * @returns Array of session types
 */
export async function getBuilderSessionTypes(builderSlug: string) {
  return getSessionTypes(builderSlug);
}

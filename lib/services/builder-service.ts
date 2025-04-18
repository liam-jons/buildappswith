import { db } from '@/lib/db';
import { UserRole } from '@/lib/auth/types';
import { mapValidationTierNumber } from './builder-profile-service';

/**
 * Create a new prototype builder profile for Liam Jones
 * This is used for the initial builder profile creation
 */
export async function createPrototypeBuilderProfile() {
  // Check if Liam Jones user exists
  const user = await db.user.findFirst({
    where: {
      email: 'liam.jones@buildappswith.com'
    }
  });

  if (!user) {
    // Create Liam Jones user
    const newUser = await db.user.create({
      data: {
        name: 'Liam Jones',
        email: 'liam.jones@buildappswith.com',
        emailVerified: new Date(),
        role: UserRole.BUILDER,
        image: 'https://randomuser.me/api/portraits/men/22.jpg',
        verified: true
      }
    });

    // Create builder profile
    await db.builderProfile.create({
      data: {
        userId: newUser.id,
        bio: "Founder of Buildappswith.com with 15+ years experience in software development. I'm passionate about democratizing AI and helping people leverage technology to solve real problems. My expertise spans web development, AI integration, and building scalable applications.",
        headline: "AI Application Developer & Platform Founder",
        hourlyRate: 120,
        domains: ['AI Integration', 'Web Development', 'Education', 'Entrepreneurship'],
        badges: ['Founder', 'Expert Builder', 'Mentor'],
        rating: 4.9,
        validationTier: 3, // Expert level
        featuredBuilder: true,
        availableForHire: true,
        portfolioItems: [
          {
            id: '1',
            title: 'AI-Powered Learning Platform',
            description: 'An adaptive learning platform that uses AI to personalize educational content for students based on their learning style and progress.',
            imageUrl: 'https://placehold.co/600x400/5271ff/white?text=AI+Learning+Platform',
            outcomes: [
              {
                label: 'User Engagement',
                value: '+45%',
                trend: 'up'
              },
              {
                label: 'Learning Speed',
                value: '+30%',
                trend: 'up'
              },
              {
                label: 'Student Retention',
                value: '92%',
                trend: 'up'
              }
            ],
            tags: ['AI', 'Education', 'Web Application', 'React'],
            projectUrl: 'https://example.com/ai-learning',
            createdAt: new Date('2024-01-15')
          },
          {
            id: '2',
            title: 'Digital Marketplace with AI Recommendations',
            description: 'A marketplace platform with sophisticated AI recommendation engine that significantly improved user discovery and sales.',
            imageUrl: 'https://placehold.co/600x400/5271ff/white?text=AI+Marketplace',
            outcomes: [
              {
                label: 'Conversion Rate',
                value: '+28%',
                trend: 'up'
              },
              {
                label: 'Avg. Order Value',
                value: '+15%',
                trend: 'up'
              },
              {
                label: 'Revenue Growth',
                value: '+40%',
                trend: 'up'
              }
            ],
            tags: ['E-commerce', 'AI', 'Recommendations', 'Next.js'],
            projectUrl: 'https://example.com/marketplace',
            createdAt: new Date('2024-02-10')
          },
          {
            id: '3',
            title: 'AI Content Generation Tool',
            description: 'A content generation tool that helps marketers create optimized content for different platforms using advanced AI.',
            imageUrl: 'https://placehold.co/600x400/5271ff/white?text=Content+Generator',
            outcomes: [
              {
                label: 'Content Production',
                value: '3x faster',
                trend: 'up'
              },
              {
                label: 'Engagement',
                value: '+22%',
                trend: 'up'
              },
              {
                label: 'Time Saved',
                value: '15 hrs/week',
                trend: 'up'
              }
            ],
            tags: ['AI', 'Content Marketing', 'SaaS', 'TypeScript'],
            projectUrl: 'https://example.com/content-ai',
            createdAt: new Date('2024-03-05')
          }
        ],
        socialLinks: {
          website: 'https://buildappswith.com',
          linkedin: 'https://linkedin.com/in/liamjones',
          github: 'https://github.com/liamjones',
          twitter: 'https://twitter.com/liamjones'
        }
      }
    });

    // Create skills for the builder
    const skills = [
      { name: 'React', domain: 'Web Development', level: 5 },
      { name: 'TypeScript', domain: 'Web Development', level: 5 },
      { name: 'Next.js', domain: 'Web Development', level: 5 },
      { name: 'AI Integration', domain: 'AI', level: 5 },
      { name: 'LLM Application Design', domain: 'AI', level: 5 },
      { name: 'API Development', domain: 'Web Development', level: 5 },
      { name: 'UI/UX Design', domain: 'Design', level: 4 },
      { name: 'Database Design', domain: 'Backend', level: 5 },
      { name: 'Node.js', domain: 'Backend', level: 5 },
      { name: 'Prompt Engineering', domain: 'AI', level: 5 }
    ];

    // Create skills and associate with builder profile
    for (const skillData of skills) {
      // Create or find skill
      const skill = await db.skill.upsert({
        where: {
          slug: skillData.name.toLowerCase().replace(/\s+/g, '-')
        },
        create: {
          name: skillData.name,
          slug: skillData.name.toLowerCase().replace(/\s+/g, '-'),
          domain: skillData.domain,
          level: skillData.level,
          status: 'ACTIVE'
        },
        update: {}
      });

      // Associate skill with builder
      await db.builderSkill.create({
        data: {
          builderId: (await db.builderProfile.findUnique({ where: { userId: newUser.id } }))!.id,
          skillId: skill.id,
          proficiency: skillData.level,
          verified: true,
          verifiedAt: new Date()
        }
      });
    }

    return {
      message: 'Prototype builder profile created for Liam Jones',
      userId: newUser.id
    };
  }

  // Check if builder profile exists
  const builderProfile = await db.builderProfile.findUnique({
    where: {
      userId: user.id
    }
  });

  if (builderProfile) {
    return {
      message: 'Prototype builder profile already exists',
      userId: user.id
    };
  }

  // Create builder profile if user exists but profile doesn't
  await db.builderProfile.create({
    data: {
      userId: user.id,
      bio: "Founder of Buildappswith.com with 15+ years experience in software development. I'm passionate about democratizing AI and helping people leverage technology to solve real problems. My expertise spans web development, AI integration, and building scalable applications.",
      headline: "AI Application Developer & Platform Founder",
      hourlyRate: 120,
      domains: ['AI Integration', 'Web Development', 'Education', 'Entrepreneurship'],
      badges: ['Founder', 'Expert Builder', 'Mentor'],
      rating: 4.9,
      validationTier: 3, // Expert level
      featuredBuilder: true,
      availableForHire: true,
      portfolioItems: [
        {
          id: '1',
          title: 'AI-Powered Learning Platform',
          description: 'An adaptive learning platform that uses AI to personalize educational content for students based on their learning style and progress.',
          imageUrl: 'https://placehold.co/600x400/5271ff/white?text=AI+Learning+Platform',
          outcomes: [
            {
              label: 'User Engagement',
              value: '+45%',
              trend: 'up'
            },
            {
              label: 'Learning Speed',
              value: '+30%',
              trend: 'up'
            },
            {
              label: 'Student Retention',
              value: '92%',
              trend: 'up'
            }
          ],
          tags: ['AI', 'Education', 'Web Application', 'React'],
          projectUrl: 'https://example.com/ai-learning',
          createdAt: new Date('2024-01-15')
        },
        {
          id: '2',
          title: 'Digital Marketplace with AI Recommendations',
          description: 'A marketplace platform with sophisticated AI recommendation engine that significantly improved user discovery and sales.',
          imageUrl: 'https://placehold.co/600x400/5271ff/white?text=AI+Marketplace',
          outcomes: [
            {
              label: 'Conversion Rate',
              value: '+28%',
              trend: 'up'
            },
            {
              label: 'Avg. Order Value',
              value: '+15%',
              trend: 'up'
            },
            {
              label: 'Revenue Growth',
              value: '+40%',
              trend: 'up'
            }
          ],
          tags: ['E-commerce', 'AI', 'Recommendations', 'Next.js'],
          projectUrl: 'https://example.com/marketplace',
          createdAt: new Date('2024-02-10')
        },
        {
          id: '3',
          title: 'AI Content Generation Tool',
          description: 'A content generation tool that helps marketers create optimized content for different platforms using advanced AI.',
          imageUrl: 'https://placehold.co/600x400/5271ff/white?text=Content+Generator',
          outcomes: [
            {
              label: 'Content Production',
              value: '3x faster',
              trend: 'up'
            },
            {
              label: 'Engagement',
              value: '+22%',
              trend: 'up'
            },
            {
              label: 'Time Saved',
              value: '15 hrs/week',
              trend: 'up'
            }
          ],
          tags: ['AI', 'Content Marketing', 'SaaS', 'TypeScript'],
          projectUrl: 'https://example.com/content-ai',
          createdAt: new Date('2024-03-05')
        }
      ],
      socialLinks: {
        website: 'https://buildappswith.com',
        linkedin: 'https://linkedin.com/in/liamjones',
        github: 'https://github.com/liamjones',
        twitter: 'https://twitter.com/liamjones'
      }
    }
  });

  // Update user role if needed
  if (user.role !== UserRole.BUILDER) {
    await db.user.update({
      where: { id: user.id },
      data: { role: UserRole.BUILDER }
    });
  }

  return {
    message: 'Prototype builder profile created for existing Liam Jones user',
    userId: user.id
  };
}

/**
 * Get all builder profiles with transformations for the frontend
 */
export async function getAllBuilderProfiles() {
  const builders = await db.builderProfile.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          createdAt: true
        }
      },
      skills: {
        include: {
          skill: true
        }
      }
    },
    orderBy: {
      rating: 'desc'
    }
  });

  return builders.map(builder => ({
    id: builder.id,
    name: builder.user.name || 'Unknown',
    title: builder.headline || 'Builder',
    bio: builder.bio || '',
    avatarUrl: builder.user.image,
    validationTier: mapValidationTierNumber(builder.validationTier),
    joinDate: builder.user.createdAt,
    completedProjects: 0, // This would need to be calculated
    rating: builder.rating || 0,
    responseRate: 0.95, // Placeholder
    skills: builder.skills.map(s => s.skill.name),
    availability: {
      status: builder.availableForHire ? 'available' : 'unavailable'
    },
    portfolio: builder.portfolioItems,
    socialLinks: builder.socialLinks || {}
  }));
}

/**
 * Get builder profiles by validation tier
 */
export async function getBuildersByValidationTier(tier: number) {
  const builders = await db.builderProfile.findMany({
    where: {
      validationTier: tier
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          createdAt: true
        }
      },
      skills: {
        include: {
          skill: true
        }
      }
    },
    orderBy: {
      rating: 'desc'
    }
  });

  return builders.map(builder => ({
    id: builder.id,
    name: builder.user.name || 'Unknown',
    title: builder.headline || 'Builder',
    bio: builder.bio || '',
    avatarUrl: builder.user.image,
    validationTier: mapValidationTierNumber(builder.validationTier),
    joinDate: builder.user.createdAt,
    completedProjects: 0, // This would need to be calculated
    rating: builder.rating || 0,
    responseRate: 0.95, // Placeholder
    skills: builder.skills.map(s => s.skill.name),
    availability: {
      status: builder.availableForHire ? 'available' : 'unavailable'
    },
    portfolio: builder.portfolioItems,
    socialLinks: builder.socialLinks || {}
  }));
}

import { db } from '../../lib/db';
import { UserRole } from '../../lib/auth/types';

/**
 * This script creates builder profiles for the marketplace,
 * including one for Liam Jones and several dummy profiles.
 * 
 * It avoids using the socialLinks field since it's not directly 
 * defined in the Prisma schema.
 */
async function createBuilderProfiles() {
  console.log('Creating builder profiles...');

  // Create Liam Jones profile
  try {
    // Check if user already exists
    let liamUser = await db.user.findFirst({
      where: {
        email: 'liam.jones@buildappswith.com'
      }
    });

    if (!liamUser) {
      // Create new user
      liamUser = await db.user.create({
        data: {
          name: 'Liam Jones',
          email: 'liam.jones@buildappswith.com',
          emailVerified: new Date(),
          roles: [UserRole.BUILDER],
          image: 'https://randomuser.me/api/portraits/men/22.jpg',
          verified: true
        }
      });
      console.log('Created Liam Jones user');
    } else {
      console.log('Liam Jones user already exists');
    }

    // Check if profile already exists
    const liamProfile = await db.builderProfile.findUnique({
      where: { userId: liamUser.id }
    });

    if (!liamProfile) {
      // Create the builder profile
      await db.builderProfile.create({
        data: {
          userId: liamUser.id,
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
          ]
          // socialLinks removed as it's not directly in the Prisma schema
        }
      });

      console.log('Created Liam Jones builder profile');

      // Create skills for Liam
      const liamSkills = [
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

      await addSkillsToBuilder(liamUser.id, liamSkills);
    } else {
      console.log('Liam Jones builder profile already exists');
    }
  } catch (error) {
    console.error('Error creating Liam Jones profile:', error);
  }

  // Create 5 additional dummy profiles
  const dummyBuilders = [
    {
      name: 'Sophie Chen',
      email: 'sophie.chen@example.com',
      image: 'https://randomuser.me/api/portraits/women/22.jpg',
      bio: 'Frontend specialist with expertise in building intuitive AI-powered interfaces. I focus on creating accessible and responsive UIs that make complex AI capabilities easy to use.',
      headline: 'Frontend AI Developer',
      validationTier: 2, // Established
      skills: ['React', 'Next.js', 'Tailwind CSS', 'UX Design', 'AI Interfaces']
    },
    {
      name: 'Michael Rodriguez',
      email: 'michael.rodriguez@example.com',
      image: 'https://randomuser.me/api/portraits/men/34.jpg',
      bio: 'Machine learning engineer turned full-stack developer. I build end-to-end AI applications that solve real business problems, with a focus on data-driven solutions.',
      headline: 'Full-Stack AI Developer',
      validationTier: 3, // Expert
      skills: ['Python', 'TensorFlow', 'Node.js', 'React', 'LLM Integration']
    },
    {
      name: 'Aisha Patel',
      email: 'aisha.patel@example.com',
      image: 'https://randomuser.me/api/portraits/women/67.jpg',
      bio: 'Data scientist with a passion for building practical AI tools. I specialize in turning complex data into actionable insights through accessible applications.',
      headline: 'Data Scientist & AI App Builder',
      validationTier: 2, // Established
      skills: ['Python', 'Data Visualization', 'Machine Learning', 'NLP', 'Dashboard Design']
    },
    {
      name: 'David Kim',
      email: 'david.kim@example.com',
      image: 'https://randomuser.me/api/portraits/men/45.jpg',
      bio: 'Entrepreneurial developer focused on AI for small businesses. I create affordable custom solutions that streamline operations and enhance customer experiences.',
      headline: 'Business AI Solutions Developer',
      validationTier: 1, // Entry
      skills: ['JavaScript', 'React', 'Python', 'Business Process Automation', 'AI Integration']
    },
    {
      name: 'Emma Taylor',
      email: 'emma.taylor@example.com',
      image: 'https://randomuser.me/api/portraits/women/33.jpg',
      bio: 'Creative technologist and AI advocate. I build innovative applications that combine AI with interactive design to create unique user experiences.',
      headline: 'Creative AI Developer',
      validationTier: 2, // Established
      skills: ['React', 'Three.js', 'WebGL', 'Generative AI', 'Creative Coding']
    }
  ];

  for (const builder of dummyBuilders) {
    try {
      // Check if user already exists
      let user = await db.user.findFirst({
        where: { email: builder.email }
      });

      if (!user) {
        // Create new user
        user = await db.user.create({
          data: {
            name: builder.name,
            email: builder.email,
            emailVerified: new Date(),
            roles: [UserRole.BUILDER],
            image: builder.image,
            verified: true
          }
        });
      }

      // Check if profile already exists
      const existingProfile = await db.builderProfile.findUnique({
        where: { userId: user.id }
      });

      if (!existingProfile) {
        // Create builder profile
        await db.builderProfile.create({
          data: {
            userId: user.id,
            bio: builder.bio,
            headline: builder.headline,
            hourlyRate: Math.floor(Math.random() * 50) + 75, // Random rate between 75-125
            domains: ['AI Integration', 'Web Development'],
            badges: [],
            rating: (Math.random() * 1.5) + 3.5, // Random rating between 3.5-5.0
            validationTier: builder.validationTier,
            featuredBuilder: Math.random() > 0.7, // 30% chance of being featured
            availableForHire: true,
            portfolioItems: [
              {
                id: `${user.id}-project-1`,
                title: 'AI-Powered Application',
                description: 'A custom application leveraging AI to solve specific business needs.',
                imageUrl: `https://placehold.co/600x400/5271ff/white?text=${encodeURIComponent(builder.name.split(' ')[0])}'s+Project`,
                outcomes: [
                  {
                    label: 'Efficiency',
                    value: '+30%',
                    trend: 'up'
                  }
                ],
                tags: ['AI', 'Web Development'],
                createdAt: new Date(Date.now() - Math.random() * 10000000000) // Random date in past year
              }
            ]
            // socialLinks removed as it's not directly in the Prisma schema
          }
        });

        // Add skills for the builder
        const skillObjects = builder.skills.map(name => ({ 
          name, 
          domain: 'general', 
          level: Math.floor(Math.random() * 3) + 3 // Random level 3-5
        }));
        
        await addSkillsToBuilder(user.id, skillObjects);

        console.log(`Created profile for ${builder.name}`);
      } else {
        console.log(`Profile for ${builder.name} already exists`);
      }
    } catch (error) {
      console.error(`Error creating profile for ${builder.name}:`, error);
    }
  }

  console.log('Done creating builder profiles!');
}

/**
 * Helper function to add skills to a builder
 */
async function addSkillsToBuilder(userId: string, skills: Array<{ name: string, domain: string, level: number }>) {
  try {
    // Get builder ID from user ID
    const builderProfile = await db.builderProfile.findUnique({
      where: { userId }
    });

    if (!builderProfile) {
      throw new Error(`Builder profile not found for user ${userId}`);
    }

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
          builderId: builderProfile.id,
          skillId: skill.id,
          proficiency: skillData.level,
          verified: true,
          verifiedAt: new Date()
        }
      });
    }

    return true;
  } catch (error) {
    console.error(`Error adding skills to builder ${userId}:`, error);
    throw error;
  }
}

// Execute the function
createBuilderProfiles()
  .then(() => {
    console.log('Seed script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seed script failed:', error);
    process.exit(1);
  });

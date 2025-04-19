import { db } from '@/lib/db';
import { UserRole } from '@/lib/auth/types';
import { createPrototypeBuilderProfile } from '@/lib/services/builder-service';

/**
 * This script creates dummy builder profiles for demonstration purposes.
 * It creates Liam Jones's profile and 5 additional sample profiles.
 */
async function createDummyProfiles() {
  console.log('Creating dummy builder profiles...');

  // Create Liam's profile first
  try {
    const liamResult = await createPrototypeBuilderProfile();
    console.log('Liam Jones profile:', liamResult);
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
      // Create user
      const user = await db.user.create({
        data: {
          name: builder.name,
          email: builder.email,
          emailVerified: new Date(),
          role: UserRole.BUILDER,
          image: builder.image,
          verified: true
        }
      });

      // Create builder profile
      const profile = await db.builderProfile.create({
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
          ],
          // socialLinks field commented out as it's not properly defined in Prisma schema
          // socialLinks: {}
        }
      });

      // Create skills for the builder
      for (const skillName of builder.skills) {
        // Create or find skill
        const skill = await db.skill.upsert({
          where: {
            slug: skillName.toLowerCase().replace(/\s+/g, '-')
          },
          create: {
            name: skillName,
            slug: skillName.toLowerCase().replace(/\s+/g, '-'),
            domain: 'general',
            level: Math.floor(Math.random() * 3) + 3, // Random level 3-5
            status: 'ACTIVE'
          },
          update: {}
        });

        // Associate skill with builder
        await db.builderSkill.create({
          data: {
            builderId: profile.id,
            skillId: skill.id,
            proficiency: Math.floor(Math.random() * 3) + 3, // Random proficiency 3-5
            verified: Math.random() > 0.3, // 70% chance of being verified
            verifiedAt: new Date()
          }
        });
      }

      console.log(`Created profile for ${builder.name}`);
    } catch (error) {
      console.error(`Error creating profile for ${builder.name}:`, error);
    }
  }

  console.log('Done creating dummy profiles!');
}

// Execute the function
createDummyProfiles()
  .then(() => {
    console.log('Seed script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seed script failed:', error);
    process.exit(1);
  });

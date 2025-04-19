#!/usr/bin/env node

/**
 * Builder profile seeding script for Buildappswith
 * 
 * This script properly loads environment variables and creates
 * builder profiles for the marketplace, including Liam Jones and dummy profiles.
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Path to project root
const rootDir = path.resolve(__dirname, '../..');

// Load environment variables from .env files
function loadEnv() {
  // Determine environment
  const NODE_ENV = process.env.NODE_ENV || 'development';
  console.log(`Running in ${NODE_ENV} environment`);

  // Files to load in order of precedence (lowest to highest)
  const envFiles = [
    '.env',
    `.env.${NODE_ENV}`,
    '.env.local',
    `.env.${NODE_ENV}.local`,
  ];

  // Load each environment file if it exists
  envFiles.forEach(file => {
    const filePath = path.resolve(rootDir, file);
    if (fs.existsSync(filePath)) {
      console.log(`Loading environment from ${file}`);
      const envConfig = dotenv.parse(fs.readFileSync(filePath));
      
      // Add each variable to process.env
      for (const key in envConfig) {
        process.env[key] = envConfig[key];
      }
    }
  });

  // Verify DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    console.error('Error: DATABASE_URL environment variable is not set!');
    console.error('Make sure it is defined in your .env.local file');
    process.exit(1);
  } else {
    // Print out the DATABASE_URL for debugging (hiding password)
    const dbUrl = process.env.DATABASE_URL || '';
    const sanitizedUrl = dbUrl.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
    console.log(`Database URL: ${sanitizedUrl}`);
  }
}

// Initialize Prisma client
let prisma;

async function createBuilderProfiles() {
  console.log('Creating builder profiles...');
  
  try {
    // Create Liam Jones profile
    const existingLiam = await prisma.user.findFirst({
      where: { email: 'liam.jones@buildappswith.com' }
    });
    
    let liamUser;
    if (!existingLiam) {
      liamUser = await prisma.user.create({
        data: {
          name: 'Liam Jones',
          email: 'liam.jones@buildappswith.com',
          emailVerified: new Date(),
          role: 'BUILDER',
          image: 'https://randomuser.me/api/portraits/men/22.jpg',
          verified: true
        }
      });
      console.log('Created Liam Jones user');
    } else {
      liamUser = existingLiam;
      console.log('Liam Jones user already exists');
    }
    
    // Check if profile exists
    const liamProfile = await prisma.builderProfile.findUnique({
      where: { userId: liamUser.id }
    });
    
    if (!liamProfile) {
      // Create builder profile
      await prisma.builderProfile.create({
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
        }
      });
      console.log('Created Liam Jones builder profile');
      
      // Add skills for Liam
      await addSkillsToBuilder(liamUser.id, [
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
      ]);
    } else {
      console.log('Liam Jones builder profile already exists');
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
        skills: [
          { name: 'React', domain: 'Web Development', level: 5 },
          { name: 'Next.js', domain: 'Web Development', level: 4 },
          { name: 'Tailwind CSS', domain: 'Web Development', level: 5 },
          { name: 'UX Design', domain: 'Design', level: 4 },
          { name: 'AI Interfaces', domain: 'AI', level: 4 }
        ]
      },
      {
        name: 'Michael Rodriguez',
        email: 'michael.rodriguez@example.com',
        image: 'https://randomuser.me/api/portraits/men/34.jpg',
        bio: 'Machine learning engineer turned full-stack developer. I build end-to-end AI applications that solve real business problems, with a focus on data-driven solutions.',
        headline: 'Full-Stack AI Developer',
        validationTier: 3, // Expert
        skills: [
          { name: 'Python', domain: 'Backend', level: 5 },
          { name: 'TensorFlow', domain: 'AI', level: 5 },
          { name: 'Node.js', domain: 'Backend', level: 4 },
          { name: 'React', domain: 'Web Development', level: 4 },
          { name: 'LLM Integration', domain: 'AI', level: 5 }
        ]
      },
      {
        name: 'Aisha Patel',
        email: 'aisha.patel@example.com',
        image: 'https://randomuser.me/api/portraits/women/67.jpg',
        bio: 'Data scientist with a passion for building practical AI tools. I specialize in turning complex data into actionable insights through accessible applications.',
        headline: 'Data Scientist & AI App Builder',
        validationTier: 2, // Established
        skills: [
          { name: 'Python', domain: 'Backend', level: 5 },
          { name: 'Data Visualization', domain: 'Data Science', level: 5 },
          { name: 'Machine Learning', domain: 'AI', level: 4 },
          { name: 'NLP', domain: 'AI', level: 4 },
          { name: 'Dashboard Design', domain: 'Design', level: 4 }
        ]
      },
      {
        name: 'David Kim',
        email: 'david.kim@example.com',
        image: 'https://randomuser.me/api/portraits/men/45.jpg',
        bio: 'Entrepreneurial developer focused on AI for small businesses. I create affordable custom solutions that streamline operations and enhance customer experiences.',
        headline: 'Business AI Solutions Developer',
        validationTier: 1, // Entry
        skills: [
          { name: 'JavaScript', domain: 'Web Development', level: 4 },
          { name: 'React', domain: 'Web Development', level: 3 },
          { name: 'Python', domain: 'Backend', level: 3 },
          { name: 'Business Process Automation', domain: 'Business', level: 4 },
          { name: 'AI Integration', domain: 'AI', level: 3 }
        ]
      },
      {
        name: 'Emma Taylor',
        email: 'emma.taylor@example.com',
        image: 'https://randomuser.me/api/portraits/women/33.jpg',
        bio: 'Creative technologist and AI advocate. I build innovative applications that combine AI with interactive design to create unique user experiences.',
        headline: 'Creative AI Developer',
        validationTier: 2, // Established
        skills: [
          { name: 'React', domain: 'Web Development', level: 4 },
          { name: 'Three.js', domain: 'Web Development', level: 5 },
          { name: 'WebGL', domain: 'Web Development', level: 4 },
          { name: 'Generative AI', domain: 'AI', level: 5 },
          { name: 'Creative Coding', domain: 'Design', level: 5 }
        ]
      }
    ];
    
    // Process each dummy builder
    for (const builder of dummyBuilders) {
      try {
        // Check if user already exists
        let user = await prisma.user.findFirst({
          where: { email: builder.email }
        });
        
        if (!user) {
          // Create new user
          user = await prisma.user.create({
            data: {
              name: builder.name,
              email: builder.email,
              emailVerified: new Date(),
              role: 'BUILDER',
              image: builder.image,
              verified: true
            }
          });
          console.log(`Created user: ${builder.name}`);
        } else {
          console.log(`User already exists: ${builder.name}`);
        }
        
        // Check if profile exists
        const existingProfile = await prisma.builderProfile.findUnique({
          where: { userId: user.id }
        });
        
        if (!existingProfile) {
          // Create builder profile
          const profile = await prisma.builderProfile.create({
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
            }
          });
          
          // Add skills to the builder profile
          await addSkillsToBuilder(user.id, builder.skills);
          
          console.log(`Created profile for ${builder.name}`);
        } else {
          console.log(`Profile already exists for ${builder.name}`);
        }
      } catch (error) {
        console.error(`Error processing builder ${builder.name}:`, error);
      }
    }
    
    console.log('All builder profiles created successfully!');
  } catch (error) {
    console.error('Error creating builder profiles:', error);
    throw error;
  }
}

/**
 * Helper function to add skills to a builder profile
 */
async function addSkillsToBuilder(userId, skills) {
  try {
    // Get builder profile ID from user ID
    const builderProfile = await prisma.builderProfile.findUnique({
      where: { userId }
    });
    
    if (!builderProfile) {
      throw new Error(`Builder profile not found for user ID: ${userId}`);
    }
    
    for (const skillData of skills) {
      // Create or find skill
      const skill = await prisma.skill.upsert({
        where: {
          slug: skillData.name.toLowerCase().replace(/\s+/g, '-')
        },
        create: {
          name: skillData.name,
          slug: skillData.name.toLowerCase().replace(/\s+/g, '-'),
          domain: skillData.domain || 'general',
          level: skillData.level || 3,
          status: 'ACTIVE'
        },
        update: {}
      });
      
      // Check if the relationship already exists
      const existingSkill = await prisma.builderSkill.findFirst({
        where: {
          builderId: builderProfile.id,
          skillId: skill.id
        }
      });
      
      if (!existingSkill) {
        // Associate skill with builder
        await prisma.builderSkill.create({
          data: {
            builderId: builderProfile.id,
            skillId: skill.id,
            proficiency: skillData.level || 3,
            verified: true,
            verifiedAt: new Date()
          }
        });
        console.log(`Added skill: ${skillData.name} to ${userId}`);
      } else {
        console.log(`Skill ${skillData.name} already associated with builder ${userId}`);
      }
    }
    
    return true;
  } catch (error) {
    console.error(`Error adding skills to builder ${userId}:`, error);
    throw error;
  }
}

/**
 * Main function
 */
async function main() {
  // Load environment variables
  loadEnv();
  
  console.log('Starting builder profile seeding...');
  
  try {
    // Initialize Prisma client after environment variables are loaded
    prisma = new PrismaClient();
    
    await createBuilderProfiles();
    
    console.log('Builder profile seeding completed successfully!');
  } catch (error) {
    console.error('Builder profile seeding failed:', error);
    process.exit(1);
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}

// Execute the main function
main();

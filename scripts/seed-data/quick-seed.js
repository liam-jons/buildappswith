// A simple JS script to create basic profiles without TypeScript complexity
// This can be run with plain Node.js without any special configuration

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createProfiles() {
  console.log('Creating basic profiles...');
  
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
          bio: "Founder of Buildappswith.com with 15+ years experience in software development. I'm passionate about democratizing AI and helping people leverage technology to solve real problems.",
          headline: "AI Application Developer & Platform Founder",
          hourlyRate: 120,
          domains: ['AI Integration', 'Web Development', 'Education'],
          badges: ['Founder', 'Expert Builder', 'Mentor'],
          rating: 4.9,
          validationTier: 3, // Expert level
          featuredBuilder: true,
          availableForHire: true,
          portfolioItems: [
            {
              id: '1',
              title: 'AI-Powered Learning Platform',
              description: 'An adaptive learning platform that uses AI to personalize educational content for students.',
              imageUrl: 'https://placehold.co/600x400/5271ff/white?text=AI+Learning+Platform',
              tags: ['AI', 'Education', 'Web Application'],
              createdAt: new Date('2024-01-15')
            }
          ]
        }
      });
      console.log('Created Liam Jones builder profile');
    } else {
      console.log('Liam Jones profile already exists');
    }
    
    // Create dummy profiles
    const dummyBuilders = [
      {
        name: 'Sophie Chen',
        email: 'sophie.chen@example.com',
        image: 'https://randomuser.me/api/portraits/women/22.jpg',
        bio: 'Frontend specialist with expertise in building intuitive AI-powered interfaces.',
        headline: 'Frontend AI Developer',
        validationTier: 2 // Established
      },
      {
        name: 'Michael Rodriguez',
        email: 'michael.rodriguez@example.com',
        image: 'https://randomuser.me/api/portraits/men/34.jpg',
        bio: 'Machine learning engineer turned full-stack developer.',
        headline: 'Full-Stack AI Developer',
        validationTier: 3 // Expert
      },
      {
        name: 'Aisha Patel',
        email: 'aisha.patel@example.com',
        image: 'https://randomuser.me/api/portraits/women/67.jpg',
        bio: 'Data scientist with a passion for building practical AI tools.',
        headline: 'Data Scientist & AI App Builder',
        validationTier: 2 // Established
      },
      {
        name: 'David Kim',
        email: 'david.kim@example.com',
        image: 'https://randomuser.me/api/portraits/men/45.jpg',
        bio: 'Entrepreneurial developer focused on AI for small businesses.',
        headline: 'Business AI Solutions Developer',
        validationTier: 1 // Entry
      },
      {
        name: 'Emma Taylor',
        email: 'emma.taylor@example.com',
        image: 'https://randomuser.me/api/portraits/women/33.jpg',
        bio: 'Creative technologist and AI advocate.',
        headline: 'Creative AI Developer',
        validationTier: 2 // Established
      }
    ];
    
    // Create each dummy builder
    for (const builder of dummyBuilders) {
      // Check if user exists
      let user = await prisma.user.findFirst({
        where: { email: builder.email }
      });
      
      if (!user) {
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
      }
      
      // Check if profile exists
      const profile = await prisma.builderProfile.findUnique({
        where: { userId: user.id }
      });
      
      if (!profile) {
        // Create profile
        await prisma.builderProfile.create({
          data: {
            userId: user.id,
            bio: builder.bio,
            headline: builder.headline,
            hourlyRate: Math.floor(Math.random() * 50) + 75,
            domains: ['AI Integration', 'Web Development'],
            badges: [],
            rating: (Math.random() * 1.5) + 3.5,
            validationTier: builder.validationTier,
            featuredBuilder: Math.random() > 0.7,
            availableForHire: true,
            portfolioItems: [
              {
                id: `${user.id}-project-1`,
                title: 'AI-Powered Application',
                description: 'A custom application leveraging AI to solve specific business needs.',
                imageUrl: `https://placehold.co/600x400/5271ff/white?text=${encodeURIComponent(builder.name.split(' ')[0])}'s+Project`,
                tags: ['AI', 'Web Development'],
                createdAt: new Date(Date.now() - Math.random() * 10000000000)
              }
            ]
          }
        });
        console.log(`Created profile for ${builder.name}`);
      } else {
        console.log(`Profile for ${builder.name} already exists`);
      }
    }
    
    console.log('All profiles created successfully!');
  } catch (error) {
    console.error('Error creating profiles:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createProfiles();

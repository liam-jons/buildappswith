/**
 * Complete Profile Update Script for Liam
 * 
 * This script ensures Liam's profile has all required fields set correctly
 * and is properly visible in the marketplace.
 */

const { PrismaClient } = require('@prisma/client');

// Create a Prisma client
const prisma = new PrismaClient();

async function updateLiamProfile() {
  try {
    console.log('Starting complete profile update for Liam...');
    
    // 1. Find Liam's user by clerkId - using minimal fields to avoid schema issues
    const liamClerkId = 'user_2wBNHJwI9cJdILyvlRnv4zxu090'; // From the provided Clerk JSON
    
    // Query only the absolute minimum required fields
    const liamUser = await prisma.user.findFirst({
      where: { clerkId: liamClerkId },
      select: {
        id: true,
        name: true,
        email: true
      }
    });
    
    if (!liamUser) {
      console.error('User with Clerk ID not found:', liamClerkId);
      return;
    }
    
    console.log(`Found user: ${liamUser.name || 'Liam Jons'} (ID: ${liamUser.id})`);
    
    // 2. Check if builder profile exists by querying separately
    const existingProfile = await prisma.builderProfile.findUnique({
      where: { userId: liamUser.id }
    });
    
    let builderProfile = existingProfile;
    
    // Skip image update for now to avoid schema issues
    console.log('Note: Image will be set by Clerk integration automatically');
    
    if (!builderProfile) {
      console.log('No builder profile found, creating one...');
      
      builderProfile = await prisma.builderProfile.create({
        data: {
          userId: liamUser.id,
          displayName: 'Liam Jons',
          bio: 'Experienced software engineer and AI application builder.',
          headline: 'Building AI-powered applications',
          tagline: 'Turning ideas into AI-powered solutions',
          searchable: true,
          featuredBuilder: true,
          validationTier: 3, // Expert level
          domains: ['AI', 'Web Development', 'Software Engineering'],
          badges: ['AI Expert', 'Full Stack', 'Mentor'],
          adhd_focus: true,
          topSkills: ['AI Integration', 'Next.js', 'React', 'TypeScript'],
          availability: 'available',
          expertiseAreas: {
            AI: ['Large Language Models', 'AI Integration', 'Prompt Engineering'],
            Web: ['Next.js', 'React', 'TypeScript', 'Node.js'],
            Architecture: ['System Design', 'API Design', 'Database Modeling']
          },
          socialLinks: {
            website: 'https://buildappswith.ai',
            github: 'https://github.com/ljsp',
            linkedin: 'https://linkedin.com/in/liamjons'
          },
          hourlyRate: 150
        }
      });
      
      console.log('Created new builder profile with ID:', builderProfile.id);
    } else {
      // 3. Update existing profile to ensure all fields are set
      console.log('Updating existing builder profile...');
      
      builderProfile = await prisma.builderProfile.update({
        where: { id: builderProfile.id },
        data: {
          displayName: 'Liam Jons',
          bio: builderProfile.bio || 'Experienced software engineer and AI application builder.',
          headline: builderProfile.headline || 'Building AI-powered applications',
          tagline: builderProfile.tagline || 'Turning ideas into AI-powered solutions',
          searchable: true, // Critical for visibility
          featuredBuilder: true,
          validationTier: 3, // Expert level
          domains: builderProfile.domains?.length > 0 ? builderProfile.domains : ['AI', 'Web Development', 'Software Engineering'],
          badges: builderProfile.badges?.length > 0 ? builderProfile.badges : ['AI Expert', 'Full Stack', 'Mentor'],
          adhd_focus: builderProfile.adhd_focus ?? true,
          topSkills: builderProfile.topSkills?.length > 0 ? builderProfile.topSkills : ['AI Integration', 'Next.js', 'React', 'TypeScript'],
          availability: builderProfile.availability || 'available',
          expertiseAreas: builderProfile.expertiseAreas || {
            AI: ['Large Language Models', 'AI Integration', 'Prompt Engineering'],
            Web: ['Next.js', 'React', 'TypeScript', 'Node.js'],
            Architecture: ['System Design', 'API Design', 'Database Modeling']
          },
          socialLinks: builderProfile.socialLinks || {
            website: 'https://buildappswith.ai',
            github: 'https://github.com/ljsp',
            linkedin: 'https://linkedin.com/in/liamjons'
          },
          hourlyRate: builderProfile.hourlyRate || 150
        }
      });
      
      console.log('Updated builder profile with ID:', builderProfile.id);
    }
    
    // 4. Ensure profile has skills
    const existingSkills = await prisma.builderSkill.findMany({
      where: { builderId: builderProfile.id },
      include: { skill: true }
    });
    
    console.log(`Found ${existingSkills.length} existing skills for this profile`);
    
    // Define core skills to ensure they exist
    const coreSkills = [
      { name: 'AI Integration', domain: 'AI', level: 5, proficiency: 5 },
      { name: 'Next.js', domain: 'Web Development', level: 5, proficiency: 5 },
      { name: 'React', domain: 'Web Development', level: 5, proficiency: 5 },
      { name: 'TypeScript', domain: 'Programming', level: 5, proficiency: 5 },
      { name: 'Node.js', domain: 'Backend', level: 5, proficiency: 4 },
      { name: 'AWS', domain: 'Cloud', level: 4, proficiency: 4 }
    ];
    
    // Add skills that don't exist yet
    for (const skillData of coreSkills) {
      // Check if skill already exists
      const existingSkill = existingSkills.find(s => 
        s.skill.name.toLowerCase() === skillData.name.toLowerCase()
      );
      
      if (!existingSkill) {
        // Find or create the skill
        const skill = await prisma.skill.upsert({
          where: {
            slug: skillData.name.toLowerCase().replace(/\s+/g, '-'),
          },
          update: {},
          create: {
            name: skillData.name,
            slug: skillData.name.toLowerCase().replace(/\s+/g, '-'),
            domain: skillData.domain,
            level: skillData.level,
            status: 'ACTIVE',
            prerequisites: [],
          },
        });
        
        // Associate skill with builder
        await prisma.builderSkill.create({
          data: {
            builderId: builderProfile.id,
            skillId: skill.id,
            proficiency: skillData.proficiency,
            verified: true,
            verifiedAt: new Date(),
          },
        });
        
        console.log(`Added skill ${skillData.name} to profile`);
      } else {
        console.log(`Skill ${skillData.name} already exists for this profile`);
      }
    }
    
    // 5. Add session types if none exist
    const existingSessionTypes = await prisma.sessionType.findMany({
      where: { builderId: builderProfile.id }
    });
    
    console.log(`Found ${existingSessionTypes.length} existing session types`);
    
    if (existingSessionTypes.length === 0) {
      // Create default session types
      const sessionTypes = [
        {
          title: 'AI App Consultation',
          description: 'Get help planning and designing your AI application. I will help you understand the possibilities and challenges of your project.',
          durationMinutes: 60,
          price: 150,
          currency: 'USD',
          isActive: true,
          color: '#4F46E5'
        },
        {
          title: 'Technical Review',
          description: 'I will review your codebase, architecture, or technical documentation and provide feedback and recommendations.',
          durationMinutes: 45,
          price: 120,
          currency: 'USD',
          isActive: true,
          color: '#10B981'
        },
        {
          title: 'Implementation Session',
          description: 'Let us work through a specific implementation challenge together, whether it is integrating AI, fixing bugs, or adding features.',
          durationMinutes: 90,
          price: 200,
          currency: 'USD',
          isActive: true,
          color: '#F59E0B'
        }
      ];
      
      for (const sessionData of sessionTypes) {
        await prisma.sessionType.create({
          data: {
            ...sessionData,
            builderId: builderProfile.id
          }
        });
        
        console.log(`Created session type: ${sessionData.title}`);
      }
    }
    
    // 6. Add a portfolio project if none exist
    if (!builderProfile.portfolioItems || builderProfile.portfolioItems.length === 0) {
      console.log('Adding portfolio items...');
      
      await prisma.builderProfile.update({
        where: { id: builderProfile.id },
        data: {
          portfolioItems: [
            {
              title: 'AI-Powered Content Platform',
              description: 'Designed and built a content platform that uses AI to help creators write, edit, and optimize their content.',
              technologies: ['Next.js', 'React', 'OpenAI', 'Node.js', 'PostgreSQL'],
              projectUrl: 'https://example.com/content-platform'
            },
            {
              title: 'Enterprise Data Analysis Dashboard',
              description: 'Created a dashboard for enterprise clients to analyze and visualize their data using custom AI models.',
              technologies: ['TypeScript', 'D3.js', 'Python', 'TensorFlow', 'AWS'],
              projectUrl: 'https://example.com/data-dashboard'
            }
          ]
        }
      });
      
      console.log('Added portfolio items');
    }
    
    // 7. Final verification
    const updatedProfile = await prisma.builderProfile.findUnique({
      where: { id: builderProfile.id },
      include: {
        skills: {
          include: {
            skill: true
          }
        },
        sessionTypes: true,
        user: true
      }
    });
    
    console.log('\nFinal verification:');
    console.log(`- Profile ID: ${updatedProfile.id}`);
    console.log(`- Display Name: ${updatedProfile.displayName}`);
    console.log(`- User Name: ${updatedProfile.user.name}`);
    console.log(`- Searchable: ${updatedProfile.searchable}`);
    console.log(`- Featured: ${updatedProfile.featuredBuilder}`);
    console.log(`- Skills: ${updatedProfile.skills.map(s => s.skill.name).join(', ')}`);
    console.log(`- Session Types: ${updatedProfile.sessionTypes.length}`);
    console.log(`- Portfolio Items: ${updatedProfile.portfolioItems.length}`);
    
    console.log('\nProfile update complete! Your profile should now be visible in the marketplace.');
    
  } catch (error) {
    console.error('Error updating profile:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the function
updateLiamProfile();
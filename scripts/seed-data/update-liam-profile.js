/**
 * Seed script for Liam Jons profile and session types
 * 
 * This script updates Liam Jons's profile with ADHD focus and imports session types
 * from the static JSON file into the database.
 * 
 * Version: 1.0.0
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting Liam Jons profile and session types update...');
  
  try {
    // Find Liam's user profile
    let liamUser = await prisma.user.findFirst({
      where: {
        email: 'liam.jones@buildappswith.com'
      },
      include: {
        builderProfile: true
      }
    });
    
    if (!liamUser) {
      console.log('Liam Jons user not found. Creating user...');
      
      // Create the user
      liamUser = await prisma.user.create({
        data: {
          name: 'Liam Jons',
          email: 'liam.jones@buildappswith.com',
          emailVerified: new Date(),
          image: '/assets/liam-profile.jpg',
          verified: true,
          roles: ['BUILDER', 'ADMIN'],
          isFounder: true
        },
        include: {
          builderProfile: true
        }
      });
      
      console.log(`Created new user for Liam Jons (ID: ${liamUser.id})`);
    }
    
    console.log(`Found Liam Jons user (ID: ${liamUser.id})`);
    
    // Ensure Liam has the correct roles and founder status
    await prisma.user.update({
      where: { id: liamUser.id },
      data: {
        roles: ['BUILDER', 'ADMIN'],
        isFounder: true
      }
    });
    
    console.log('Updated Liam Jons user roles and founder status');
    
    // Create or update builder profile with ADHD focus
    let builderProfile = liamUser.builderProfile;
    
    if (!builderProfile) {
      console.log('Creating new builder profile for Liam Jons');
      
      builderProfile = await prisma.builderProfile.create({
        data: {
          userId: liamUser.id,
          bio: "I'm passionate about democratizing AI technology and making it accessible to everyone. With a background in technology and a special focus on helping people with ADHD, I founded Buildappswith to create a platform where people can learn to leverage AI effectively in their daily lives and businesses. My mission is to empower individuals to use technology to save time on mundane tasks so they can focus on what truly matters - human connection and creativity.",
          headline: "Founder & AI Application Builder",
          hourlyRate: 150,
          featuredBuilder: true,
          domains: ["AI Application Design", "ADHD Productivity", "Human-Centered AI", "Web Development"],
          badges: ["Founder", "Expert", "ADHD Specialist"],
          validationTier: 3,
          availableForHire: true,
          adhd_focus: true,
          socialLinks: JSON.stringify({
            website: "https://buildappswith.ai",
            linkedin: "https://linkedin.com/in/liamjons",
            github: "https://github.com/liamjons",
            twitter: "https://twitter.com/buildappswith"
          })
        }
      });
    } else {
      console.log('Updating existing builder profile for Liam Jons');
      
      builderProfile = await prisma.builderProfile.update({
        where: { id: builderProfile.id },
        data: {
          adhd_focus: true,
          headline: builderProfile.headline || "Founder & AI Application Builder",
          featuredBuilder: true,
          validationTier: 3,
          badges: ['Founder', 'Expert', 'ADHD Specialist'],
          socialLinks: builderProfile.socialLinks || JSON.stringify({
            website: "https://buildappswith.ai",
            linkedin: "https://linkedin.com/in/liamjons",
            github: "https://github.com/liamjons",
            twitter: "https://twitter.com/buildappswith"
          })
        }
      });
    }
    
    console.log(`Builder profile ${builderProfile.id} updated successfully`);
    
    // Load session types from JSON file
    const sessionTypesPath = path.join(process.cwd(), 'data', 'liam-session-types.json');
    
    if (!fs.existsSync(sessionTypesPath)) {
      console.error('Session types JSON file not found:', sessionTypesPath);
      process.exit(1);
    }
    
    const sessionTypesData = JSON.parse(fs.readFileSync(sessionTypesPath, 'utf8'));
    console.log(`Loaded ${sessionTypesData.length} session types from JSON file`);
    
    // Check if session types already exist
    const existingSessionTypes = await prisma.sessionType.findMany({
      where: { builderId: builderProfile.id }
    });
    
    if (existingSessionTypes.length > 0) {
      console.log(`Found ${existingSessionTypes.length} existing session types. Updating with new data...`);
      
      // Map by ID for easier lookup
      const existingSessionTypesMap = existingSessionTypes.reduce((map, st) => {
        map[st.id] = st;
        return map;
      }, {});
      
      for (const sessionType of sessionTypesData) {
        // Ensure builderId matches our profile
        sessionType.builderId = builderProfile.id;
        
        // Either update or create
        if (existingSessionTypesMap[sessionType.id]) {
          console.log(`Updating session type: ${sessionType.title}`);
          
          await prisma.sessionType.update({
            where: { id: sessionType.id },
            data: {
              title: sessionType.title,
              description: sessionType.description,
              durationMinutes: sessionType.durationMinutes,
              price: sessionType.price,
              currency: sessionType.currency,
              isActive: sessionType.isActive,
              color: sessionType.color,
              maxParticipants: sessionType.maxParticipants
            }
          });
        } else {
          console.log(`Creating new session type: ${sessionType.title}`);
          
          await prisma.sessionType.create({
            data: {
              id: sessionType.id,
              builderId: sessionType.builderId,
              title: sessionType.title,
              description: sessionType.description,
              durationMinutes: sessionType.durationMinutes,
              price: sessionType.price,
              currency: sessionType.currency,
              isActive: sessionType.isActive,
              color: sessionType.color,
              maxParticipants: sessionType.maxParticipants
            }
          });
        }
      }
    } else {
      console.log('No existing session types found. Creating them now...');
      
      // Create all session types from the JSON data
      for (const sessionType of sessionTypesData) {
        // Ensure builderId matches our profile
        sessionType.builderId = builderProfile.id;
        
        await prisma.sessionType.create({
          data: sessionType
        });
        
        console.log(`Created session type: ${sessionType.title}`);
      }
    }
    
    console.log('Session types updated successfully');
    
    // Add sample apps if they don't exist yet
    const existingApps = await prisma.app.findMany({
      where: { builderId: builderProfile.id }
    });
    
    if (existingApps.length === 0) {
      console.log('No apps found for Liam Jons. Creating sample apps...');
      
      await prisma.app.createMany({
        data: [
          {
            title: "ADHD Task Manager",
            description: "Custom task management system designed specifically for ADHD brains, with visual cues, dopamine triggers, and adjustable focus modes.",
            technologies: ["Next.js", "TailwindCSS", "GPT-4", "Supabase"],
            status: "LIVE",
            appUrl: "https://adhd-tasks.example.com",
            builderId: builderProfile.id,
            adhd_focused: true
          },
          {
            title: "AI Writing Assistant",
            description: "Specialized AI writing tool that helps users overcome writer's block and organize thoughts, with features designed for neurodivergent thinking patterns.",
            technologies: ["React", "TypeScript", "Claude API", "Prisma"],
            status: "DEMO",
            appUrl: "https://write-assist.example.com",
            builderId: builderProfile.id,
            adhd_focused: true
          },
          {
            title: "Small Business AI Dashboard",
            description: "Comprehensive AI dashboard for small businesses to track key metrics, automate reporting, and receive AI-powered insights for growth.",
            technologies: ["Next.js", "TailwindCSS", "OpenAI API", "PostgreSQL"],
            status: "LIVE",
            appUrl: "https://biz-metrics.example.com",
            builderId: builderProfile.id,
            adhd_focused: false
          }
        ]
      });
      
      console.log('Sample apps created successfully');
    } else {
      console.log(`${existingApps.length} apps already exist for Liam Jons. Skipping app creation.`);
    }
    
    console.log('Liam Jons profile and session types update completed successfully!');
    
  } catch (error) {
    console.error('Error updating Liam Jons profile:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

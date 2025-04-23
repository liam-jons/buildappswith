#!/usr/bin/env node

/**
 * Update Liam Jons Profile Seed Script
 * 
 * This script updates or creates all necessary database records to support
 * the consolidated Liam Jons profile with ADHD focus and session types.
 * 
 * Version: 1.0.40
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

/**
 * Update Liam Jons user and builder profile
 */
async function updateLiamJonsProfile() {
  console.log('Updating Liam Jons profile data...');
  
  try {
    // Create or update Liam Jons user
    const liamEmail = 'liam.jones@buildappswith.com';
    const existingLiam = await prisma.user.findFirst({
      where: { email: liamEmail }
    });
    
    let liamUser;
    if (!existingLiam) {
      liamUser = await prisma.user.create({
        data: {
          name: 'Liam Jons',
          email: liamEmail,
          emailVerified: new Date(),
          roles: ['BUILDER', 'ADMIN'],
          isFounder: true,
          verified: true,
          image: '/assets/liam-profile.jpg',
          stripeCustomerId: 'cus_founder001'
        }
      });
      console.log('Created Liam Jons user account');
    } else {
      liamUser = await prisma.user.update({
        where: { id: existingLiam.id },
        data: {
          name: 'Liam Jons',
          roles: ['BUILDER', 'ADMIN'],
          isFounder: true,
          verified: true,
          image: '/assets/liam-profile.jpg'
        }
      });
      console.log('Updated Liam Jons user account');
    }
    
    // Check if builder profile exists
    const liamProfile = await prisma.builderProfile.findUnique({
      where: { userId: liamUser.id }
    });
    
    const portfolioItems = [
      {
        id: 'success-1',
        title: 'Small Business Transformation',
        description: 'Helped a local retail business implement AI for inventory management and customer recommendations, resulting in significant efficiency gains.',
        imageUrl: '/assets/portfolio/retail-business.jpg',
        outcomes: [
          { label: 'Time Saved', value: '15 hrs/week', trend: 'down' },
          { label: 'Revenue', value: '+22%', trend: 'up' },
          { label: 'Customer Satisfaction', value: '+35%', trend: 'up' }
        ],
        tags: ['Small Business', 'Retail', 'AI Implementation'],
        createdAt: new Date(2024, 3, 15)
      },
      {
        id: 'success-2',
        title: 'Freelancer Productivity System',
        description: 'Designed a custom AI workflow for a freelance designer with ADHD, helping them manage clients and deadlines more effectively.',
        imageUrl: '/assets/portfolio/freelancer.jpg',
        outcomes: [
          { label: 'Missed Deadlines', value: '-80%', trend: 'down' },
          { label: 'Client Capacity', value: '+40%', trend: 'up' },
          { label: 'Stress Level', value: '-65%', trend: 'down' }
        ],
        tags: ['Freelancer', 'ADHD', 'Productivity'],
        createdAt: new Date(2024, 4, 28)
      }
    ];
    
    const socialLinks = {
      website: 'https://buildappswith.ai',
      linkedin: 'https://linkedin.com/in/liamjons',
      github: 'https://github.com/liamjons',
      twitter: 'https://twitter.com/buildappswith'
    };
    
    if (!liamProfile) {
      // Create builder profile
      await prisma.builderProfile.create({
        data: {
          userId: liamUser.id,
          bio: "I'm passionate about democratizing AI technology and making it accessible to everyone. With a background in technology and a special focus on helping people with ADHD, I founded Buildappswith to create a platform where people can learn to leverage AI effectively in their daily lives and businesses. My mission is to empower individuals to use technology to save time on mundane tasks so they can focus on what truly matters - human connection and creativity.",
          headline: "Founder & AI Application Builder",
          hourlyRate: 150,
          domains: ['AI Integration', 'Web Development', 'Education', 'ADHD Solutions', 'Entrepreneurship'],
          badges: ['Founder', 'Expert Builder', 'Mentor', 'ADHD Specialist'],
          rating: 5.0,
          validationTier: 3, // Expert level
          featuredBuilder: true,
          availableForHire: true,
          adhd_focus: true,
          portfolioItems: portfolioItems,
          socialLinks: socialLinks
        }
      });
      console.log('Created Liam Jons builder profile');
    } else {
      // Update builder profile
      await prisma.builderProfile.update({
        where: { id: liamProfile.id },
        data: {
          bio: "I'm passionate about democratizing AI technology and making it accessible to everyone. With a background in technology and a special focus on helping people with ADHD, I founded Buildappswith to create a platform where people can learn to leverage AI effectively in their daily lives and businesses. My mission is to empower individuals to use technology to save time on mundane tasks so they can focus on what truly matters - human connection and creativity.",
          headline: "Founder & AI Application Builder",
          hourlyRate: 150,
          domains: ['AI Integration', 'Web Development', 'Education', 'ADHD Solutions', 'Entrepreneurship'],
          badges: ['Founder', 'Expert Builder', 'Mentor', 'ADHD Specialist'],
          rating: 5.0,
          validationTier: 3,
          featuredBuilder: true,
          adhd_focus: true,
          portfolioItems: portfolioItems,
          socialLinks: socialLinks
        }
      });
      console.log('Updated Liam Jons builder profile');
    }
    
    // Get builder profile ID for further operations
    const builderProfile = await prisma.builderProfile.findUnique({
      where: { userId: liamUser.id }
    });
    
    if (!builderProfile) {
      throw new Error('Failed to find or create builder profile');
    }
    
    return builderProfile;
  } catch (error) {
    console.error('Error updating Liam Jons profile:', error);
    throw error;
  }
}

/**
 * Create ADHD-focused apps for Liam Jons
 */
async function createAdhdApps(builderProfileId) {
  console.log('Creating ADHD-focused apps...');
  
  try {
    const apps = [
      {
        title: 'ADHD Task Manager',
        description: 'AI-powered task management app designed specifically for people with ADHD, featuring intuitive prioritization and time-blocking.',
        imageUrl: '/assets/apps/adhd-task-app.jpg',
        technologies: ['Next.js', 'OpenAI', 'Tailwind CSS', 'TypeScript'],
        status: 'LIVE',
        appUrl: 'https://adhd-tasks.buildappswith.ai',
        adhd_focused: true
      },
      {
        title: 'Focus Flow',
        description: 'A distraction-free writing environment that adapts to your focus levels and helps maintain attention through personalized AI interventions.',
        imageUrl: '/assets/apps/focus-flow.jpg',
        technologies: ['React', 'Anthropic', 'CSS Modules'],
        status: 'DEMO',
        appUrl: 'https://focus-demo.buildappswith.ai',
        adhd_focused: true
      },
      {
        title: 'Memory Assistant',
        description: 'A personal memory augmentation tool that helps users recall information contextually, designed for people with working memory challenges.',
        imageUrl: '/assets/apps/memory-assistant.jpg',
        technologies: ['Next.js', 'Supabase', 'Claude API'],
        status: 'CONCEPT',
        adhd_focused: true
      }
    ];
    
    for (const appData of apps) {
      // Check if app already exists by title
      const existingApp = await prisma.app.findFirst({
        where: {
          builderId: builderProfileId,
          title: appData.title
        }
      });
      
      if (!existingApp) {
        // Create new app
        await prisma.app.create({
          data: {
            builderId: builderProfileId,
            ...appData
          }
        });
        console.log(`Created app: ${appData.title}`);
      } else {
        // Update existing app
        await prisma.app.update({
          where: { id: existingApp.id },
          data: appData
        });
        console.log(`Updated app: ${appData.title}`);
      }
    }
    
    console.log('ADHD-focused apps created successfully');
  } catch (error) {
    console.error('Error creating ADHD-focused apps:', error);
    throw error;
  }
}

/**
 * Create the session types for Liam Jons
 * Note: In a production system, this would be stored in a database table
 * For this MVP stage, we'll define the session types here to match the frontend
 */
async function createSessionTypes(builderProfileId) {
  console.log('Creating session types for Liam Jons...');
  
  try {
    // This simulates storing session types in a database
    // In the next phase, we'll create a proper SessionType model in the database
    
    // Create a JSON file that contains session types configuration
    const sessionTypes = [
      {
        id: "session1",
        builderId: builderProfileId,
        title: "1:1 AI Discovery Session",
        description: "Personalized exploration of how AI can be applied to your unique situation, with tailored recommendations and guidance.",
        durationMinutes: 60,
        price: 150,
        currency: "GBP",
        isActive: true,
        color: "#3B82F6", // blue
        maxParticipants: 1
      },
      {
        id: "session2",
        builderId: builderProfileId,
        title: "ADHD-Focused AI Strategy",
        description: "Specialized session for those with ADHD to develop an AI tool stack that works with your brain's strengths and supports your challenges.",
        durationMinutes: 75,
        price: 185,
        currency: "GBP",
        isActive: true,
        color: "#8B5CF6", // purple
        maxParticipants: 1
      },
      {
        id: "session3",
        builderId: builderProfileId,
        title: "AI Literacy Fundamentals",
        description: "Group workshop covering the essentials of AI: what it can/can't do, how to use it effectively, and ethical considerations.",
        durationMinutes: 90,
        price: 45,
        currency: "GBP",
        isActive: true,
        color: "#F59E0B", // amber
        maxParticipants: 15
      },
      {
        id: "session4",
        builderId: builderProfileId,
        title: "Free Weekly Session for Unemployed",
        description: "Supporting those between jobs with free AI literacy sessions to build valuable skills.",
        durationMinutes: 60,
        price: 0,
        currency: "GBP",
        isActive: true,
        color: "#10B981", // green
        maxParticipants: 20
      }
    ];
    
    // Save to a JSON file that can be loaded by the frontend
    const sessionsDir = path.resolve(rootDir, 'data');
    if (!fs.existsSync(sessionsDir)) {
      fs.mkdirSync(sessionsDir, { recursive: true });
    }
    
    const filePath = path.resolve(sessionsDir, 'liam-session-types.json');
    fs.writeFileSync(filePath, JSON.stringify(sessionTypes, null, 2));
    
    console.log(`Session types saved to ${filePath}`);
    return sessionTypes;
  } catch (error) {
    console.error('Error creating session types:', error);
    throw error;
  }
}

/**
 * Add or update builder skills
 */
async function updateBuilderSkills(userId) {
  try {
    // Get builder profile ID from user ID
    const builderProfile = await prisma.builderProfile.findUnique({
      where: { userId }
    });
    
    if (!builderProfile) {
      throw new Error(`Builder profile not found for user ID: ${userId}`);
    }
    
    const skills = [
      { name: 'AI Application Design', domain: 'AI', level: 5 },
      { name: 'ADHD Productivity Tools', domain: 'Specialized', level: 5 },
      { name: 'Human-Centered AI', domain: 'AI', level: 5 },
      { name: 'Next.js Development', domain: 'Web Development', level: 5 },
      { name: 'AI Literacy', domain: 'Education', level: 5 },
      { name: 'Tailwind CSS', domain: 'Web Development', level: 5 },
      { name: 'TypeScript', domain: 'Programming', level: 5 },
      { name: 'Practical AI Implementation', domain: 'AI', level: 5 },
      { name: 'Prompt Engineering', domain: 'AI', level: 5 },
      { name: 'API Development', domain: 'Web Development', level: 5 }
    ];
    
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
          level: 3,
          status: 'ACTIVE',
          prerequisites: []
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
        // Update the existing skill
        await prisma.builderSkill.update({
          where: { id: existingSkill.id },
          data: {
            proficiency: skillData.level || existingSkill.proficiency,
            verified: true,
            verifiedAt: new Date()
          }
        });
        console.log(`Updated skill: ${skillData.name} for ${userId}`);
      }
    }
    
    return true;
  } catch (error) {
    console.error(`Error updating skills for builder ${userId}:`, error);
    throw error;
  }
}

/**
 * Main function
 */
async function main() {
  // Load environment variables
  loadEnv();
  
  console.log('Starting Liam Jons profile update...');
  
  try {
    // Initialize Prisma client after environment variables are loaded
    prisma = new PrismaClient();
    
    // Update or create Liam Jons profile
    const builderProfile = await updateLiamJonsProfile();
    
    // Create ADHD-focused apps
    await createAdhdApps(builderProfile.id);
    
    // Create session types
    await createSessionTypes(builderProfile.id);
    
    // Update builder skills
    await updateBuilderSkills(builderProfile.userId);
    
    console.log('Liam Jons profile update completed successfully!');
  } catch (error) {
    console.error('Liam Jons profile update failed:', error);
    process.exit(1);
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}

// Execute the main function
main();

#!/usr/bin/env node

/**
 * Seed demo builders for marketplace
 * Simple, maintainable approach for 2-person team
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const demoBuilders = [
  {
    email: 'sarah.chen@demo.buildappswith.ai',
    firstName: 'Sarah',
    lastName: 'Chen',
    builderProfile: {
      expertise: ['React', 'TypeScript', 'AWS'],
      rate: 150,
      availability: 'Full-time',
      searchable: true,
      isDemo: true,
      completedProjects: 42,
      responseRate: 0.98
    }
  },
  {
    email: 'marcus.johnson@demo.buildappswith.ai',
    firstName: 'Marcus',
    lastName: 'Johnson',
    builderProfile: {
      expertise: ['Python', 'Django', 'PostgreSQL'],
      rate: 175,
      availability: 'Part-time',
      searchable: true,
      isDemo: true,
      completedProjects: 67,
      responseRate: 0.95
    }
  },
  // Add more as needed
];

async function seedDemoBuilders() {
  console.log('🌱 Seeding demo builders...');
  
  for (const demo of demoBuilders) {
    try {
      // Create user with builder profile
      const user = await prisma.user.upsert({
        where: { email: demo.email },
        update: {},
        create: {
          email: demo.email,
          firstName: demo.firstName,
          lastName: demo.lastName,
          role: 'BUILDER',
          isDemo: true,
          builderProfile: {
            create: demo.builderProfile
          }
        },
        include: { builderProfile: true }
      });
      
      console.log(`✓ Created demo builder: ${user.firstName} ${user.lastName}`);
    } catch (error) {
      console.error(`Failed to create ${demo.email}:`, error.message);
    }
  }
  
  console.log('✅ Demo seeding complete');
}

seedDemoBuilders()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
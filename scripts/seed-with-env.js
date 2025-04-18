#!/usr/bin/env node

/**
 * Combined environment loader and database seeder for Buildappswith
 * 
 * This script:
 * 1. Loads environment variables from .env files
 * 2. Seeds the database using the Prisma client
 */

// Import required modules
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Path to project root
const rootDir = path.resolve(__dirname, '..');

// Load environment variables
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

  // Print out the DATABASE_URL for debugging (hiding password)
  const dbUrl = process.env.DATABASE_URL || '';
  const sanitizedUrl = dbUrl.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
  console.log(`Database URL: ${sanitizedUrl}`);

  // Verify DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    console.error('Error: DATABASE_URL environment variable is not set!');
    console.error('Make sure it is defined in your .env.local file');
    process.exit(1);
  }
}

// Initialize Prisma client
let prisma;

// Mock capabilities data
const mockCapabilities = [
  {
    id: 'gpt4-release',
    date: '2023-03-14',
    title: 'GPT-4 Release',
    description: 'GPT-4 is OpenAI\'s most advanced system, producing safer and more useful responses.',
    domain: 'general',
    isModelImprovement: true,
    modelName: 'GPT-4',
    examples: [
      {
        title: 'Multimodal Understanding',
        description: 'GPT-4 can accept and process both text and image inputs, allowing for more complex interactions.',
        implementation: 'Using GPT-4 Vision API to analyze images and respond to questions about them.'
      },
      {
        title: 'Enhanced Reasoning',
        description: 'Improved ability to solve complex problems, including in domains like math and coding.',
        implementation: 'Using GPT-4 to debug code or solve mathematical proofs step by step.'
      }
    ],
    limitations: [
      'Limited knowledge of world events after training cutoff',
      'May occasionally generate incorrect information',
      'Limited vision capabilities compared to specialized vision models',
      'Can still exhibit biases present in training data'
    ],
    technicalRequirements: [
      'API access via OpenAI',
      'Higher token costs than previous models',
      'More compute resources for integration'
    ],
    source: 'https://openai.com/research/gpt-4',
    verified: true
  },
  {
    id: 'image-generation',
    date: '2022-11-30',
    title: 'Text-to-Image Generation',
    description: 'AI models that can generate realistic images from text descriptions.',
    domain: 'creative',
    examples: [
      {
        title: 'Product Visualization',
        description: 'Generating product mockups from text descriptions to speed up the design process.',
        implementation: 'Using Midjourney or DALL-E to visualize product concepts before production.'
      },
      {
        title: 'Content Creation',
        description: 'Creating custom illustrations for websites, marketing materials, and publications.',
        implementation: 'Using Stable Diffusion locally to generate custom images while maintaining IP rights.'
      }
    ],
    limitations: [
      'Difficulty with specific details like human hands or text',
      'Style consistency across multiple generations',
      'Copyright and ownership concerns',
      'Potential for generating harmful or biased content'
    ],
    technicalRequirements: [
      'Access to models like DALL-E, Midjourney, or Stable Diffusion',
      'GPU resources for local deployment options',
      'Prompt engineering skills'
    ],
    verified: true
  },
  {
    id: 'claude-3-opus',
    date: '2024-03-04',
    title: 'Claude 3 Opus Release',
    description: 'Anthropic\'s most capable model, with enhanced reasoning and instruction-following abilities.',
    domain: 'general',
    isModelImprovement: true,
    modelName: 'Claude 3 Opus',
    examples: [
      {
        title: 'Complex Task Handling',
        description: 'Handling multi-step tasks with high accuracy and attention to detail.',
        implementation: 'Using Claude 3 Opus for document analysis and extracting structured information.'
      },
      {
        title: 'Enhanced Coding Abilities',
        description: 'Improved code generation and debugging capabilities.',
        implementation: 'Using Claude 3 Opus to generate complete applications with proper error handling.'
      }
    ],
    limitations: [
      'Knowledge cutoff date limitations',
      'Potential for hallucinations in certain contexts',
      'Higher cost compared to smaller models',
      'Lacks specialized capabilities of domain-specific models'
    ],
    technicalRequirements: [
      'API access via Anthropic',
      'Higher token costs than smaller models',
      'Proper prompt engineering for optimal results'
    ],
    source: 'https://www.anthropic.com/news/claude-3-family',
    verified: true
  }
];

/**
 * Seed the database with mock timeline data
 */
async function seedTimelineData() {
  console.log('Seeding timeline data...');
  
  try {
    // Create a default admin user if it doesn't exist
    const adminEmail = 'admin@buildappswith.dev';
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });
    
    if (!existingAdmin) {
      console.log('Creating admin user...');
      await prisma.user.create({
        data: {
          email: adminEmail,
          name: 'Admin User',
          role: 'ADMIN',
          verified: true,
          stripeCustomerId: 'cus_admin123'
        }
      });
    }
    
    // Get admin user ID for reference
    const admin = await prisma.user.findUnique({
      where: { email: adminEmail },
      select: { id: true }
    });
    
    if (!admin) {
      throw new Error('Failed to find or create admin user');
    }
    
    // Seed AI capabilities
    console.log('Seeding AI capabilities...');
    
    for (const capability of mockCapabilities) {
      // Check if capability already exists
      const existingCapability = await prisma.aICapability.findFirst({
        where: {
          title: capability.title
        }
      });
      
      if (existingCapability) {
        console.log(`Capability "${capability.title}" already exists, skipping...`);
        continue;
      }
      
      // Create the capability
      const createdCapability = await prisma.aICapability.create({
        data: {
          date: new Date(capability.date),
          title: capability.title,
          description: capability.description,
          domain: capability.domain,
          isModelImprovement: capability.isModelImprovement || false,
          modelName: capability.modelName,
          source: capability.source,
          verified: capability.verified || false,
          createdById: admin.id
        }
      });
      
      console.log(`Created capability: ${capability.title}`);
      
      // Create examples
      for (const example of capability.examples) {
        await prisma.capabilityExample.create({
          data: {
            capabilityId: createdCapability.id,
            title: example.title,
            description: example.description,
            implementation: example.implementation
          }
        });
      }
      
      // Create limitations
      for (const limitation of capability.limitations) {
        await prisma.capabilityLimitation.create({
          data: {
            capabilityId: createdCapability.id,
            description: limitation
          }
        });
      }
      
      // Create technical requirements
      if (capability.technicalRequirements) {
        for (const requirement of capability.technicalRequirements) {
          await prisma.capabilityRequirement.create({
            data: {
              capabilityId: createdCapability.id,
              description: requirement
            }
          });
        }
      }
    }
    
    console.log('Timeline data seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding timeline data:', error);
    throw error;
  }
}

/**
 * Main function
 */
async function main() {
  // Load environment variables
  loadEnv();
  
  console.log('Starting database seeding...');
  
  try {
    // Initialize Prisma client after environment variables are loaded
    prisma = new PrismaClient();
    
    await seedTimelineData();
    
    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Database seeding failed:', error);
    process.exit(1);
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}

// Execute the main function
main();

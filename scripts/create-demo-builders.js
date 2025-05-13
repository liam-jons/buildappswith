// Script to create demo builder accounts for production marketplace
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Demo builder data - these are representative profiles that will 
// be displayed in production but marked as demo accounts
const DEMO_BUILDERS = [
  {
    name: 'Alex Taylor',
    email: 'alex.taylor@buildappswith.com',
    roles: ['BUILDER', 'CLIENT'],
    bio: 'AI application specialist with expertise in conversational agents and knowledge management.',
    headline: 'AI & Automation Expert',
    featured: true,
    searchable: true,
    validationTier: 2,
    expertiseAreas: {
      BUILDING_WITH_AI: {
        level: 4,
        description: "Creating practical AI workflows for businesses",
        yearsExperience: 5
      },
      DATA_AUTOMATION: {
        level: 3,
        description: "Building data pipelines and automation systems",
        yearsExperience: 4
      }
    }
  },
  {
    name: 'Sam Johnson',
    email: 'sam.johnson@buildappswith.com',
    roles: ['BUILDER'],
    bio: 'Specializing in ADHD-focused productivity tools and AI assistants for neurodivergent workflows.',
    headline: 'Productivity Systems Designer',
    featured: false,
    searchable: true,
    validationTier: 1,
    expertiseAreas: {
      ADHD_PRODUCTIVITY: {
        level: 5,
        description: "Creating specialized tools for ADHD professionals",
        yearsExperience: 3
      },
      BUILDING_WITH_AI: {
        level: 3,
        description: "Integrating AI into productivity workflows",
        yearsExperience: 2
      }
    }
  },
  {
    name: 'Jordan Rivera',
    email: 'jordan.rivera@buildappswith.com',
    roles: ['BUILDER', 'CLIENT'],
    bio: 'AI literacy educator and consultant helping businesses understand and implement generative AI.',
    headline: 'AI Literacy Specialist',
    featured: true,
    searchable: true,
    validationTier: 3,
    expertiseAreas: {
      AI_LITERACY: {
        level: 5,
        description: "Training executives and teams in AI concepts",
        yearsExperience: 4
      },
      BUILDING_WITH_AI: {
        level: 4,
        description: "Designing practical AI applications",
        yearsExperience: 3
      }
    }
  },
  {
    name: 'Morgan Chen',
    email: 'morgan.chen@buildappswith.com',
    roles: ['BUILDER'],
    bio: 'Full-stack developer specializing in AI integrations for startups and SMBs.',
    headline: 'AI Integration Developer',
    featured: false,
    searchable: true,
    validationTier: 2,
    expertiseAreas: {
      BUILDING_WITH_AI: {
        level: 4,
        description: "End-to-end AI application development",
        yearsExperience: 3
      },
      AI_LITERACY: {
        level: 3,
        description: "Technical workshops and implementation",
        yearsExperience: 2
      }
    }
  },
  {
    name: 'Jamie Wilson',
    email: 'jamie.wilson@buildappswith.com',
    roles: ['BUILDER', 'CLIENT'],
    bio: 'AI strategy consultant specializing in business process optimization and workflow redesign.',
    headline: 'AI Process Optimization Expert',
    featured: false,
    searchable: true,
    validationTier: 2,
    expertiseAreas: {
      BUILDING_WITH_AI: {
        level: 4,
        description: "Business workflow automation with AI",
        yearsExperience: 5
      },
      ADHD_PRODUCTIVITY: {
        level: 2,
        description: "ADHD-focused team productivity systems",
        yearsExperience: 1
      }
    }
  }
];

async function createDemoBuilders() {
  try {
    console.log('Starting demo builder creation...');
    
    for (const builderData of DEMO_BUILDERS) {
      // Check if builder already exists
      let dbUser = await prisma.user.findFirst({
        where: { email: builderData.email },
        include: { builderProfile: true }
      });
      
      if (dbUser) {
        console.log(`Updating existing demo builder: ${builderData.email}`);
        
        // Update user data
        dbUser = await prisma.user.update({
          where: { id: dbUser.id },
          data: {
            name: builderData.name,
            roles: builderData.roles,
            isDemo: true  // Mark as demo account
          },
          include: { builderProfile: true }
        });
      } else {
        console.log(`Creating new demo builder: ${builderData.email}`);
        
        // Create new user
        dbUser = await prisma.user.create({
          data: {
            name: builderData.name,
            email: builderData.email,
            roles: builderData.roles,
            isDemo: true  // Mark as demo account
          },
          include: { builderProfile: true }
        });
      }
      
      // Create/update builder profile
      if (!dbUser.builderProfile) {
        console.log(`Creating builder profile for ${builderData.email}`);
        
        await prisma.builderProfile.create({
          data: {
            userId: dbUser.id,
            bio: builderData.bio,
            headline: builderData.headline,
            searchable: builderData.searchable,
            featured: builderData.featured,
            validationTier: builderData.validationTier,
            domains: [],
            badges: [],
            availability: 'available',
            expertiseAreas: builderData.expertiseAreas,
            // Create some session types
            sessionTypes: {
              create: [
                {
                  title: 'Initial Consultation',
                  description: 'Introductory session to discuss your needs and how I can help.',
                  durationMinutes: 30,
                  price: 0,
                  currency: 'USD',
                  isActive: true
                },
                {
                  title: 'Strategy Session',
                  description: 'In-depth strategy discussion for your AI implementation.',
                  durationMinutes: 60,
                  price: 99.99,
                  currency: 'USD',
                  isActive: true
                }
              ]
            }
          }
        });
      } else {
        // Update existing builder profile
        console.log(`Updating builder profile for ${builderData.email}`);
        
        await prisma.builderProfile.update({
          where: { id: dbUser.builderProfile.id },
          data: {
            bio: builderData.bio,
            headline: builderData.headline,
            searchable: builderData.searchable,
            featured: builderData.featured,
            validationTier: builderData.validationTier,
            expertiseAreas: builderData.expertiseAreas
          }
        });
        
        // Check if session types exist, create if not
        const sessionTypes = await prisma.sessionType.findMany({
          where: { builderId: dbUser.builderProfile.id }
        });
        
        if (sessionTypes.length === 0) {
          console.log(`Creating session types for ${builderData.email}`);
          
          await prisma.sessionType.createMany({
            data: [
              {
                builderId: dbUser.builderProfile.id,
                title: 'Initial Consultation',
                description: 'Introductory session to discuss your needs and how I can help.',
                durationMinutes: 30,
                price: 0,
                currency: 'USD',
                isActive: true
              },
              {
                builderId: dbUser.builderProfile.id,
                title: 'Strategy Session',
                description: 'In-depth strategy discussion for your AI implementation.',
                durationMinutes: 60,
                price: 99.99,
                currency: 'USD',
                isActive: true
              }
            ]
          });
        }
      }
    }
    
    console.log('Demo builder creation completed');
    
  } catch (error) {
    console.error('Error creating demo builders:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the creation
createDemoBuilders();
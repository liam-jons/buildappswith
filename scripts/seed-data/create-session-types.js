/**
 * Session Types Creation Script
 * 
 * This script creates standardized session types for builder profiles
 * to enable consistent testing of booking and scheduling features.
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Standard session types for testing
const SESSION_TYPES = [
  {
    title: "Initial Consultation",
    description: "Discuss your project requirements and explore potential solutions.",
    durationMinutes: 30,
    price: 0, // Free
    currency: "USD",
    isActive: true,
    color: "#4F46E5" // Indigo
  },
  {
    title: "Development Planning",
    description: "Detailed planning session to outline technical implementation and architecture.",
    durationMinutes: 60,
    price: 99.99,
    currency: "USD",
    isActive: true,
    color: "#0891B2" // Cyan
  },
  {
    title: "Code Review",
    description: "Review your existing code for quality, security, and performance improvements.",
    durationMinutes: 45,
    price: 79.99,
    currency: "USD",
    isActive: true,
    color: "#059669" // Emerald
  },
  {
    title: "AI Integration Strategy",
    description: "Explore opportunities to integrate AI capabilities into your application.",
    durationMinutes: 90,
    price: 149.99,
    currency: "USD",
    isActive: true,
    color: "#7C3AED" // Violet
  }
];

/**
 * Creates session types for a builder profile
 * @param {string} builderId Builder profile ID
 * @param {Array} sessionTypes Session types to create
 * @returns {Promise<Array>} Created session types
 */
async function createSessionTypesForBuilder(builderId, sessionTypes) {
  console.log(`Creating session types for builder ${builderId}...`);
  const createdTypes = [];
  
  for (const sessionType of sessionTypes) {
    try {
      // Check if a similar session type already exists
      const existingType = await prisma.sessionType.findFirst({
        where: {
          builderId,
          title: sessionType.title
        }
      });
      
      if (existingType) {
        console.log(`Session type "${sessionType.title}" already exists for builder ${builderId}, updating...`);
        const updated = await prisma.sessionType.update({
          where: { id: existingType.id },
          data: {
            description: sessionType.description,
            durationMinutes: sessionType.durationMinutes,
            price: sessionType.price,
            currency: sessionType.currency,
            isActive: sessionType.isActive,
            color: sessionType.color
          }
        });
        createdTypes.push(updated);
      } else {
        console.log(`Creating session type "${sessionType.title}" for builder ${builderId}...`);
        const created = await prisma.sessionType.create({
          data: {
            builderId,
            title: sessionType.title,
            description: sessionType.description,
            durationMinutes: sessionType.durationMinutes,
            price: sessionType.price,
            currency: sessionType.currency,
            isActive: sessionType.isActive,
            color: sessionType.color
          }
        });
        createdTypes.push(created);
      }
    } catch (error) {
      console.error(`Error creating session type "${sessionType.title}":`, error);
    }
  }
  
  return createdTypes;
}

/**
 * Main function to create session types for test builders
 */
async function createSessionTypes() {
  try {
    console.log('Creating session types for test builders...');
    
    // Find builder profiles that should have session types
    const builderProfiles = await prisma.builderProfile.findMany({
      where: {
        OR: [
          { validationTier: { gte: 2 } }, // Established or expert builders
          { user: { email: { contains: 'buildappswith-test.com' } } } // Test builders
        ]
      },
      include: {
        user: {
          select: {
            email: true
          }
        }
      }
    });
    
    console.log(`Found ${builderProfiles.length} builder profiles for session type creation`);
    
    // Create session types for each builder
    let successCount = 0;
    for (const builder of builderProfiles) {
      try {
        // For test builders, create all session types
        // For non-test builders with validation tier >= 2, create a subset
        const typesToCreate = builder.user.email.includes('@buildappswith-test.com')
          ? SESSION_TYPES // All session types for test builders
          : SESSION_TYPES.slice(0, 2); // Just first two for non-test established builders
        
        await createSessionTypesForBuilder(builder.id, typesToCreate);
        successCount++;
      } catch (error) {
        console.error(`Error creating session types for builder ${builder.id}:`, error);
      }
    }
    
    console.log(`Successfully created session types for ${successCount} of ${builderProfiles.length} builders`);
  } catch (error) {
    console.error('Error during session type creation:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Execute if run directly
if (require.main === module) {
  createSessionTypes()
    .then(() => {
      console.log('Session type creation completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('Session type creation failed:', error);
      process.exit(1);
    });
}

// Export for use in other scripts
module.exports = {
  createSessionTypesForBuilder,
  createSessionTypes,
  SESSION_TYPES
};
import { db } from '../../lib/db';
import { mockCapabilities } from '../../lib/timeline/mock-data';

/**
 * Seed the database with mock timeline data
 */
async function seedTimelineData() {
  console.log('Seeding timeline data...');
  
  try {
    // Create a default admin user if it doesn't exist
    const adminEmail = 'admin@buildappswith.dev';
    const existingAdmin = await db.user.findUnique({
      where: { email: adminEmail }
    });
    
    if (!existingAdmin) {
      console.log('Creating admin user...');
      await db.user.create({
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
    const admin = await db.user.findUnique({
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
      const existingCapability = await db.aICapability.findFirst({
        where: {
          title: capability.title
        }
      });
      
      if (existingCapability) {
        console.log(`Capability "${capability.title}" already exists, skipping...`);
        continue;
      }
      
      // Create the capability
      const createdCapability = await db.aICapability.create({
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
        await db.capabilityExample.create({
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
        await db.capabilityLimitation.create({
          data: {
            capabilityId: createdCapability.id,
            description: limitation
          }
        });
      }
      
      // Create technical requirements
      if (capability.technicalRequirements) {
        for (const requirement of capability.technicalRequirements) {
          await db.capabilityRequirement.create({
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
 * Main seed function
 */
async function main() {
  console.log('Starting database seeding...');
  
  try {
    await seedTimelineData();
    
    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Database seeding failed:', error);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

// Execute the main function
main();

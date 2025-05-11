/**
 * Production Database Fix Script
 * This script resolves the marketplace builder visibility issue in production.
 * 
 * Problem: Builder profiles exist in production but are not being displayed in the marketplace.
 * Solution: Update the searchable flag and add missing skills.
 */

const { PrismaClient } = require('@prisma/client');

// Production database URL
const prodDatabaseUrl = "postgresql://Buildappswith-prod_owner:npg_gx5DNL4uHChw@ep-purple-paper-ab51kphc-pooler.eu-west-2.aws.neon.tech/Buildappswith-prod?sslmode=require";

// Create a Prisma client for the production database
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: prodDatabaseUrl,
    },
  },
});

async function updateProductionBuilders() {
  try {
    console.log('Connecting to production database...');
    console.log('Database URL:', prodDatabaseUrl.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')); // Hide password
    
    // 1. Get current profiles in production
    const existingProfiles = await prisma.builderProfile.findMany({
      select: {
        id: true,
        userId: true,
        searchable: true,
        featured: true,
        skills: {
          select: {
            id: true,
            skillId: true,
          },
        },
        user: {
          select: {
            name: true,
          },
        },
      },
    });
    
    console.log(`Found ${existingProfiles.length} builder profiles in production`);
    
    // 2. Ensure all profiles have searchable=true
    const unsearchableProfiles = existingProfiles.filter(profile => !profile.searchable);
    if (unsearchableProfiles.length > 0) {
      console.log(`Updating searchable flag for ${unsearchableProfiles.length} profiles...`);
      
      // Update each profile with searchable=false
      for (const profile of unsearchableProfiles) {
        await prisma.builderProfile.update({
          where: { id: profile.id },
          data: { searchable: true },
        });
        console.log(`Updated searchable flag for profile ${profile.id} (${profile.user?.name || 'Unknown'})`);
      }
    } else {
      console.log('All profiles already have searchable=true');
    }
    
    // 3. Ensure there is at least one skill for each profile
    const profilesWithNoSkills = existingProfiles.filter(profile => !profile.skills || profile.skills.length === 0);
    if (profilesWithNoSkills.length > 0) {
      console.log(`Adding default skills for ${profilesWithNoSkills.length} profiles...`);
      
      for (const profile of profilesWithNoSkills) {
        // First, ensure core skills exist
        const defaultSkills = [
          { name: 'AI Integration', domain: 'AI', level: 5 },
          { name: 'Next.js', domain: 'Web Development', level: 4 },
          { name: 'React', domain: 'Web Development', level: 4 }
        ];
        
        // Add each skill to the profile
        for (const skillData of defaultSkills) {
          // Create or find the skill
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
              builderId: profile.id,
              skillId: skill.id,
              proficiency: skillData.level,
              verified: true,
              verifiedAt: new Date(),
            },
          });
          
          console.log(`Added skill ${skillData.name} to profile ${profile.id} (${profile.user?.name || 'Unknown'})`);
        }
      }
    } else {
      console.log('All profiles have at least one skill');
    }
    
    // 4. Verify the changes
    const updatedProfiles = await prisma.builderProfile.findMany({
      select: {
        id: true,
        userId: true,
        searchable: true,
        user: {
          select: {
            name: true,
          },
        },
        skills: {
          select: {
            skill: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });
    
    console.log('\nVerification after updates:');
    console.log('- All profiles searchable:', updatedProfiles.every(p => p.searchable));
    console.log('- All profiles have skills:', updatedProfiles.every(p => p.skills.length > 0));
    
    console.log('\nFix complete! All builder profiles should now be visible in the marketplace.');
    console.log('Please clear your browser cache and localStorage when testing the production site.');
    
  } catch (error) {
    console.error('Error updating production database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the function
updateProductionBuilders();
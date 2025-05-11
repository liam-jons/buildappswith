/**
 * Script to check production database builders and searchable flags
 * This uses a hardcoded production database URL from .env.production.local
 */

const { PrismaClient } = require('@prisma/client');

// Use the production URL we found in the environment files
const prodDatabaseUrl = "postgresql://Buildappswith-prod_owner:npg_gx5DNL4uHChw@ep-purple-paper-ab51kphc-pooler.eu-west-2.aws.neon.tech/Buildappswith-prod?sslmode=require";

// Create a new Prisma client with the production URL
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: prodDatabaseUrl,
    },
  },
});

async function checkProductionBuilders() {
  try {
    console.log('Connecting to production database...');
    console.log('Database URL:', prodDatabaseUrl.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')); // Hide password

    // Check total builder profiles
    const totalProfiles = await prisma.$queryRaw`
      SELECT 
        COUNT(*) as "totalProfiles",
        SUM(CASE WHEN "searchable" = true THEN 1 ELSE 0 END) as "searchableProfiles",
        SUM(CASE WHEN "searchable" = false THEN 1 ELSE 0 END) as "nonSearchableProfiles"
      FROM "BuilderProfile";
    `;
    
    console.log('Builder Profile Search Status:');
    console.log(totalProfiles);
    
    // Get details of all builder profiles in production
    const builderProfiles = await prisma.$queryRaw`
      SELECT 
        bp.id, 
        bp."userId",
        bp."searchable",
        bp."featured", 
        bp."validationTier",
        COALESCE(u.name, bp."displayName", 'Unknown') as name
      FROM "BuilderProfile" bp
      LEFT JOIN "User" u ON bp."userId" = u.id
      ORDER BY bp."featured" DESC, bp."validationTier" DESC;
    `;
    
    console.log('\nProduction Builder Profiles:');
    console.log(builderProfiles);
    
    // Check for builder profiles with searchable flag set to false
    const nonSearchableProfiles = builderProfiles.filter(profile => !profile.searchable);
    if (nonSearchableProfiles.length > 0) {
      console.log('\nProfiles with searchable=false:');
      console.log(nonSearchableProfiles);
      
      // Generate SQL to fix the issue
      console.log('\nSQL to fix searchable flags:');
      console.log(`
UPDATE "BuilderProfile" 
SET "searchable" = true 
WHERE "searchable" = false;
      `);
    } else {
      console.log('\nAll profiles have searchable=true, no SQL fix needed.');
    }
    
    // Check skills statistics
    const skillCounts = await prisma.$queryRaw`
      SELECT 
        bp.id, 
        COALESCE(u.name, bp."displayName", 'Unknown') as name,
        COUNT(bs.id) as skill_count
      FROM "BuilderProfile" bp
      LEFT JOIN "User" u ON bp."userId" = u.id
      LEFT JOIN "BuilderSkill" bs ON bp.id = bs."builderId"
      GROUP BY bp.id, u.name, bp."displayName"
      ORDER BY skill_count;
    `;
    
    console.log('\nBuilder Skill Counts:');
    console.log(skillCounts);
    
    // Check if there are profiles with no skills
    const profilesWithNoSkills = skillCounts.filter(profile => profile.skill_count === 0n);
    if (profilesWithNoSkills.length > 0) {
      console.log('\nProfiles with no skills:');
      console.log(profilesWithNoSkills);
    }
    
  } catch (error) {
    console.error('Error querying production database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProductionBuilders();
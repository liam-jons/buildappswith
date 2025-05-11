const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkBuilderDetails() {
  try {
    // Count by searchable and featured flags
    const flagCounts = await prisma.$queryRaw`
      SELECT 
        "searchable", 
        "featured", 
        COUNT(*) as count
      FROM "BuilderProfile"
      GROUP BY "searchable", "featured"
      ORDER BY "searchable", "featured";
    `;
    
    console.log('Builder Profile Flag Counts:');
    console.log(flagCounts);
    
    // Get summary of validation tiers
    const validationTiers = await prisma.$queryRaw`
      SELECT 
        "validationTier", 
        COUNT(*) as count
      FROM "BuilderProfile"
      GROUP BY "validationTier"
      ORDER BY "validationTier";
    `;
    
    console.log('\nBuilder Profile Validation Tiers:');
    console.log(validationTiers);
    
    // Check skills association
    const skillCounts = await prisma.$queryRaw`
      SELECT 
        bp.id, 
        bp."userId",
        COALESCE(u.name, bp."displayName", 'Unknown') as name,
        bp."searchable",
        bp."featured", 
        COUNT(bs.id) as skill_count
      FROM "BuilderProfile" bp
      LEFT JOIN "User" u ON bp."userId" = u.id
      LEFT JOIN "BuilderSkill" bs ON bp.id = bs."builderId"
      GROUP BY bp.id, bp."userId", u.name, bp."displayName", bp."searchable", bp."featured"
      ORDER BY skill_count;
    `;
    
    console.log('\nBuilder Profile Skill Counts:');
    console.log(skillCounts);
    
  } catch (error) {
    console.error('Error querying database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkBuilderDetails();
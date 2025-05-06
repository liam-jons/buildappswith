/**
 * Script to check production database schema
 */

const { PrismaClient } = require('@prisma/client');

async function main() {
  console.log('Checking production database schema...');
  
  // Production database
  const prodUrl = process.env.PROD_DATABASE_URL || process.env.DATABASE_URL;
  
  if (!prodUrl) {
    console.error('PROD_DATABASE_URL or DATABASE_URL environment variable is required');
    process.exit(1);
  }
  
  console.log('Using database URL:', prodUrl.substring(0, 25) + '...');
  
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: prodUrl
      }
    }
  });
  
  try {
    // Check User table schema
    console.log('\nUser table schema:');
    const userSchema = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'User'
      ORDER BY column_name
    `;
    
    userSchema.forEach(col => {
      console.log(`  ${col.column_name} (${col.data_type}, nullable: ${col.is_nullable})`);
    });
    
    // Check BuilderProfile table schema
    console.log('\nBuilderProfile table schema:');
    const profileSchema = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'BuilderProfile'
      ORDER BY column_name
    `;
    
    profileSchema.forEach(col => {
      console.log(`  ${col.column_name} (${col.data_type}, nullable: ${col.is_nullable})`);
    });
    
    // Check if Liam's user exists
    console.log('\nChecking for Liam\'s user:');
    const liamUser = await prisma.$queryRaw`
      SELECT id, name, email, "clerkId"
      FROM "User" 
      WHERE email = 'liam@buildappswith.ai'
      LIMIT 1
    `;
    
    if (liamUser.length > 0) {
      console.log(`  Found: ${JSON.stringify(liamUser[0])}`);
      
      // Check if Liam has a builder profile
      const liamProfile = await prisma.$queryRaw`
        SELECT id, "userId", bio, headline
        FROM "BuilderProfile" 
        WHERE "userId" = ${liamUser[0].id}
        LIMIT 1
      `;
      
      if (liamProfile.length > 0) {
        console.log(`  Builder profile: ${JSON.stringify(liamProfile[0])}`);
      } else {
        console.log('  No builder profile found');
      }
    } else {
      console.log('  No user found with email liam@buildappswith.ai');
    }
    
  } catch (error) {
    console.error('Error checking schema:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
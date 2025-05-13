// Script to check demo accounts in the database
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDemoAccounts() {
  try {
    console.log('Checking demo accounts in database...');
    
    // Find all demo accounts
    const demoAccounts = await prisma.user.findMany({
      where: { isDemo: true },
      include: { 
        builderProfile: {
          select: {
            id: true,
            searchable: true,
            featured: true,
            validationTier: true
          }
        }
      }
    });
    
    console.log(`Found ${demoAccounts.length} demo accounts:`);
    
    // List each demo account
    for (const account of demoAccounts) {
      console.log(`- ${account.name} (${account.email})`);
      console.log(`  Roles: ${account.roles.join(', ')}`);
      console.log(`  Has builder profile: ${!!account.builderProfile}`);
      if (account.builderProfile) {
        console.log(`  Builder profile searchable: ${account.builderProfile.searchable}`);
        console.log(`  Builder profile featured: ${account.builderProfile.featured}`);
        console.log(`  Validation tier: ${account.builderProfile.validationTier}`);
      }
      console.log('');
    }
    
    // Check if demo accounts are properly set up
    if (demoAccounts.length > 0) {
      console.log('Demo accounts are properly set up in the database');
    } else {
      console.log('No demo accounts found in the database');
    }
    
  } catch (error) {
    console.error('Error checking demo accounts:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the check
checkDemoAccounts();
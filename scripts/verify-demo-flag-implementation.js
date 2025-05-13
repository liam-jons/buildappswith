// Script to verify demo flag implementation across components
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function verifyImplementation() {
  console.log('Verifying demo flag implementation across the codebase...');
  
  // Part 1: Database verification
  console.log('\n=== Database Verification ===');
  
  // Check if isDemo column exists in User table
  try {
    const columnInfo = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'User' AND column_name = 'isDemo'
    `;
    
    if (columnInfo && columnInfo.length > 0) {
      console.log('✅ isDemo column exists in User table');
    } else {
      console.log('❌ isDemo column missing from User table');
    }
  } catch (error) {
    console.error('Error checking User table schema:', error);
  }
  
  // Check demo accounts in database
  try {
    const demoAccounts = await prisma.user.findMany({
      where: { isDemo: true },
      select: { 
        id: true, 
        name: true, 
        email: true, 
        roles: true,
        builderProfile: {
          select: {
            id: true,
            searchable: true,
            featured: true
          }
        }
      }
    });
    
    console.log(`Found ${demoAccounts.length} demo accounts in database`);
    for (const account of demoAccounts) {
      console.log(`- ${account.name} (${account.email})`);
      console.log(`  Roles: ${account.roles.join(', ')}`);
      console.log(`  Has builder profile: ${!!account.builderProfile}`);
      if (account.builderProfile) {
        console.log(`  Searchable: ${account.builderProfile.searchable}, Featured: ${account.builderProfile.featured}`);
      }
    }
  } catch (error) {
    console.error('Error checking demo accounts:', error);
  }
  
  // Part 2: Code Implementation Verification
  console.log('\n=== Code Implementation Verification ===');
  
  const componentsToVerify = [
    {
      path: 'components/marketplace/builder-card.tsx',
      requiredPatterns: [
        'isDemo', // Property in the component props
        'DemoBadge', // Import for the demo badge
        '{builder.isDemo &&' // Conditional rendering of demo badge
      ]
    },
    {
      path: 'components/marketplace/ui/demo-badge.tsx',
      requiredPatterns: [
        'DemoBadge', // Component name
        'Demo Account' // Text in the badge
      ]
    },
    {
      path: 'components/marketplace/ui/filter-panel.tsx',
      requiredPatterns: [
        'excludeDemo', // Flag to filter out demo accounts
        'hideDemo', // UI element for filtering
        'Hide demo accounts' // Label text
      ]
    },
    {
      path: 'components/profile/builder-profile.tsx',
      requiredPatterns: [
        'isDemo', // Flag in the interface
        '{profile.isDemo &&' // Conditional rendering
      ]
    },
    {
      path: 'lib/marketplace/data/marketplace-service.ts',
      requiredPatterns: [
        'isDemo', // Accessing isDemo property
        'excludeDemo', // Filter parameter
        'enhanceWithDemoStatus' // Function to add demo status
      ]
    }
  ];
  
  for (const component of componentsToVerify) {
    try {
      const fullPath = path.join(process.cwd(), component.path);
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        
        // Check for required patterns
        const foundPatterns = component.requiredPatterns.filter(pattern => 
          content.includes(pattern)
        );
        
        const percentImplemented = Math.round((foundPatterns.length / component.requiredPatterns.length) * 100);
        
        console.log(`${component.path}: ${percentImplemented}% implemented`);
        if (foundPatterns.length === component.requiredPatterns.length) {
          console.log('  ✅ All required patterns found');
        } else {
          console.log('  ⚠️ Missing patterns:');
          component.requiredPatterns.forEach(pattern => {
            if (!foundPatterns.includes(pattern)) {
              console.log(`    - ${pattern}`);
            }
          });
        }
      } else {
        console.log(`❌ File not found: ${component.path}`);
      }
    } catch (error) {
      console.error(`Error checking ${component.path}:`, error);
    }
  }
  
  // Part 3: Check for subscriber role
  console.log('\n=== Subscriber Role Verification ===');
  
  // Check if SUBSCRIBER exists in UserRole enum
  try {
    const userRoleCheck = await prisma.$queryRaw`
      SELECT enum_range(NULL::public."UserRole") as enum_values
    `;
    
    const enumValues = userRoleCheck[0].enum_values;
    if (enumValues.includes('SUBSCRIBER')) {
      console.log('✅ SUBSCRIBER value exists in UserRole enum');
    } else {
      console.log('❌ SUBSCRIBER missing from UserRole enum');
    }
  } catch (error) {
    console.error('Error checking UserRole enum:', error);
  }
  
  // Check if SubscriberProfile table exists
  try {
    const tableCheck = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'SubscriberProfile'
      ) as table_exists
    `;
    
    if (tableCheck[0].table_exists) {
      console.log('✅ SubscriberProfile table exists');
    } else {
      console.log('❌ SubscriberProfile table missing');
    }
  } catch (error) {
    console.error('Error checking SubscriberProfile table:', error);
  }
  
  console.log('\n=== Verification Complete ===');
  
  await prisma.$disconnect();
}

verifyImplementation();
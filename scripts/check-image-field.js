/**
 * Script to analyze database tables for image field inconsistencies
 * 
 * This script checks the User table to detect:
 * 1. If image and imageUrl fields both exist
 * 2. Which field is being used in the data
 * 3. Whether there's a mismatch between schema and data
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkImageFields() {
  console.log('Checking database schema and data for image field inconsistencies...');
  
  try {
    // Get database info using raw query to inspect the actual table structure
    const tableInfo = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'User'
    `;
    
    // Check if both image and imageUrl columns exist
    const hasImageField = tableInfo.some(col => col.column_name === 'image');
    const hasImageUrlField = tableInfo.some(col => col.column_name === 'imageUrl');
    
    console.log('Schema analysis:');
    console.log(`- image field exists: ${hasImageField}`);
    console.log(`- imageUrl field exists: ${hasImageUrlField}`);
    
    if (hasImageField && hasImageUrlField) {
      console.warn('ISSUE DETECTED: Both image and imageUrl fields exist in the schema!');
    }
    
    // Check data using raw queries to handle schema flexibility
    let imageFieldData = [];
    let imageUrlFieldData = [];
    
    if (hasImageField) {
      try {
        // Try to query users with non-null image field
        imageFieldData = await prisma.$queryRaw`
          SELECT id, name, image FROM "User" WHERE image IS NOT NULL LIMIT 5
        `;
        console.log(`Found ${imageFieldData.length} users with data in 'image' field`);
      } catch (e) {
        console.error('Error querying image field:', e.message);
      }
    }
    
    if (hasImageUrlField) {
      try {
        // Try to query users with non-null imageUrl field
        imageUrlFieldData = await prisma.$queryRaw`
          SELECT id, name, "imageUrl" FROM "User" WHERE "imageUrl" IS NOT NULL LIMIT 5
        `;
        console.log(`Found ${imageUrlFieldData.length} users with data in 'imageUrl' field`);
      } catch (e) {
        console.error('Error querying imageUrl field:', e.message);
      }
    }
    
    // Check BuilderProfile table references
    const builderProfileTableInfo = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'BuilderProfile'
    `;
    
    console.log('\nBuilder Profile schema analysis:');
    const hasImageField_BP = builderProfileTableInfo.some(col => col.column_name === 'image');
    const hasImageUrlField_BP = builderProfileTableInfo.some(col => col.column_name === 'imageUrl');
    const hasAvatarUrlField_BP = builderProfileTableInfo.some(col => col.column_name === 'avatarUrl');
    
    console.log(`- image field exists: ${hasImageField_BP}`);
    console.log(`- imageUrl field exists: ${hasImageUrlField_BP}`);
    console.log(`- avatarUrl field exists: ${hasAvatarUrlField_BP}`);
    
    // Sample some builder profiles to check image reference patterns
    const builderProfiles = await prisma.builderProfile.findMany({
      take: 3,
      include: {
        user: true
      }
    });
    
    if (builderProfiles.length > 0) {
      console.log('\nAnalyzing builder profile data:');
      builderProfiles.forEach((profile, i) => {
        console.log(`Builder ${i+1}:`);
        console.log(`- userId: ${profile.userId}`);
        console.log(`- user.image: ${profile.user.image || 'null'}`);
        console.log(`- user.imageUrl: ${profile.user.imageUrl || 'null'}`);
        
        // Check if profile has its own image fields
        if (hasImageField_BP) {
          console.log(`- profile.image: ${profile.image || 'null'}`);
        }
        if (hasImageUrlField_BP) {
          console.log(`- profile.imageUrl: ${profile.imageUrl || 'null'}`);
        }
        if (hasAvatarUrlField_BP) {
          console.log(`- profile.avatarUrl: ${profile.avatarUrl || 'null'}`);
        }
      });
    }
    
    // Recommendations based on findings
    console.log('\nRECOMMENDATIONS:');
    
    if (hasImageField && !hasImageUrlField) {
      console.log('- Schema uses "image" field but code might be looking for "imageUrl"');
      console.log('- Update components to reference "image" instead of "imageUrl"');
    } else if (!hasImageField && hasImageUrlField) {
      console.log('- Schema uses "imageUrl" field but code might be looking for "image"');
      console.log('- Update components to reference "imageUrl" instead of "image"');
    } else if (hasImageField && hasImageUrlField) {
      if (imageFieldData.length > 0 && imageUrlFieldData.length === 0) {
        console.log('- Data exists in "image" field but not in "imageUrl" field');
        console.log('- Update code to use "image" or migrate data to "imageUrl"');
      } else if (imageFieldData.length === 0 && imageUrlFieldData.length > 0) {
        console.log('- Data exists in "imageUrl" field but not in "image" field');
        console.log('- Update code to use "imageUrl" or migrate data to "image"');
      } else if (imageFieldData.length > 0 && imageUrlFieldData.length > 0) {
        console.log('- Data exists in BOTH "image" and "imageUrl" fields!');
        console.log('- Consolidate to a single field to avoid confusion');
      }
    }

  } catch (error) {
    console.error('Error analyzing database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the analysis
checkImageFields().catch(e => {
  console.error('Script execution error:', e);
  process.exit(1);
});
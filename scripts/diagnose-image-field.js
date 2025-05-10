/**
 * Database field diagnosis script
 * 
 * This script validates the User table schema and checks for the presence of
 * image vs imageUrl fields to help diagnose the field discrepancy issue.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function diagnoseUserFields() {
  console.log('🔍 Running database field diagnosis script');
  console.log('------------------------------------------');

  try {
    // Check database connection
    console.log('1. Checking database connection...');
    await prisma.$connect();
    console.log('✅ Database connection successful');

    // Introspect the User table
    console.log('\n2. Introspecting User table schema...');
    const userTableInfo = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'User'
      ORDER BY ordinal_position;
    `;

    console.log('User table columns:');
    console.table(userTableInfo);

    // Check specifically for image/imageUrl fields
    const imageField = userTableInfo.find(field => field.column_name === 'image');
    const imageUrlField = userTableInfo.find(field => field.column_name === 'imageUrl');

    console.log('\n3. Image field status:');
    console.log(`- 'image' field exists: ${!!imageField}`);
    console.log(`- 'imageUrl' field exists: ${!!imageUrlField}`);

    if (imageField) {
      console.log(`- 'image' field data type: ${imageField.data_type}`);
      console.log(`- 'image' field nullable: ${imageField.is_nullable}`);
    }

    // Check for sample data
    console.log('\n4. Checking sample User data...');
    const sampleUsers = await prisma.user.findMany({
      take: 5,
      select: {
        id: true,
        name: true,
        image: true
      }
    });

    console.log(`Sample users (${sampleUsers.length}):`);
    sampleUsers.forEach(user => {
      console.log(`- User ${user.id}: ${user.name || 'No name'}`);
      console.log(`  Image: ${user.image || 'No image'}`);
    });

    // Check builder profiles linked to users
    console.log('\n5. Checking builder profiles linked to users...');
    const builderProfiles = await prisma.builderProfile.findMany({
      take: 5,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    });

    console.log(`Builder profiles (${builderProfiles.length}):`);
    builderProfiles.forEach(profile => {
      console.log(`- Builder ${profile.id}: ${profile.user.name || 'No name'}`);
      console.log(`  User ID: ${profile.userId}`);
      console.log(`  User Image: ${profile.user.image || 'No image'}`);
    });

    console.log('\n✅ Diagnosis completed successfully');
  } catch (error) {
    console.error('❌ Error during diagnosis:', error);
  } finally {
    await prisma.$disconnect();
    console.log('------------------------------------------');
  }
}

// Run the diagnosis
diagnoseUserFields();
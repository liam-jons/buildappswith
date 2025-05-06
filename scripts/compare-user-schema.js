/**
 * Script to compare User table schema between development and production
 */

const { PrismaClient } = require('@prisma/client');

async function main() {
  console.log('Comparing User table schema between environments...');
  
  // Development database
  const devUrl = process.env.DEV_DATABASE_URL;
  
  if (!devUrl) {
    console.error('DEV_DATABASE_URL environment variable is required');
    process.exit(1);
  }
  
  const devPrisma = new PrismaClient({
    datasources: {
      db: {
        url: devUrl
      }
    }
  });
  
  // Production database
  const prodUrl = process.env.PROD_DATABASE_URL || process.env.DATABASE_URL;
  
  if (!prodUrl) {
    console.error('PROD_DATABASE_URL or DATABASE_URL environment variable is required');
    process.exit(1);
  }
  
  const prodPrisma = new PrismaClient({
    datasources: {
      db: {
        url: prodUrl
      }
    }
  });
  
  try {
    // Check User table schema in development
    console.log('Development User table schema:');
    const devSchema = await devPrisma.$queryRaw`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'User'
      ORDER BY column_name
    `;
    
    console.log('Development columns:');
    const devColumns = {};
    devSchema.forEach(col => {
      console.log(`  ${col.column_name} (${col.data_type}, nullable: ${col.is_nullable})`);
      devColumns[col.column_name] = { 
        type: col.data_type, 
        nullable: col.is_nullable === 'YES'
      };
    });
    
    // Check User table schema in production
    console.log('\nProduction User table schema:');
    const prodSchema = await prodPrisma.$queryRaw`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'User'
      ORDER BY column_name
    `;
    
    console.log('Production columns:');
    const prodColumns = {};
    prodSchema.forEach(col => {
      console.log(`  ${col.column_name} (${col.data_type}, nullable: ${col.is_nullable})`);
      prodColumns[col.column_name] = { 
        type: col.data_type, 
        nullable: col.is_nullable === 'YES'
      };
    });
    
    // Find differences
    console.log('\nColumns in dev but not in prod:');
    Object.keys(devColumns).forEach(col => {
      if (!prodColumns[col]) {
        console.log(`  ${col} (${devColumns[col].type})`);
      }
    });
    
    console.log('\nColumns in prod but not in dev:');
    Object.keys(prodColumns).forEach(col => {
      if (!devColumns[col]) {
        console.log(`  ${col} (${prodColumns[col].type})`);
      }
    });
    
    console.log('\nColumns with different types:');
    Object.keys(devColumns).forEach(col => {
      if (prodColumns[col] && devColumns[col].type !== prodColumns[col].type) {
        console.log(`  ${col}: dev=${devColumns[col].type}, prod=${prodColumns[col].type}`);
      }
    });
    
    console.log('\nColumns with different nullability:');
    Object.keys(devColumns).forEach(col => {
      if (prodColumns[col] && devColumns[col].nullable !== prodColumns[col].nullable) {
        console.log(`  ${col}: dev=${devColumns[col].nullable ? 'nullable' : 'not nullable'}, prod=${prodColumns[col].nullable ? 'nullable' : 'not nullable'}`);
      }
    });
    
  } catch (error) {
    console.error('Error comparing schemas:', error);
  } finally {
    await devPrisma.$disconnect();
    await prodPrisma.$disconnect();
  }
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
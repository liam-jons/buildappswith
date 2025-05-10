/**
 * Test Database Reset Script
 * 
 * This script provides a way to reset the test database to a clean state
 * while maintaining test user accounts. It's useful for:
 * 
 * 1. Running before test suites to ensure consistent starting data
 * 2. Creating isolated test environments by schema
 * 3. Reverting test data back to a known state after tests
 * 
 * Usage:
 *   node scripts/seed-data/reset-test-db.js [--preserve-users] [--schema=test_worker_1]
 * 
 * Options:
 *   --preserve-users    Keep test user accounts, clear all other data
 *   --schema=NAME       Use a specific schema for isolation
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  preserveUsers: args.includes('--preserve-users'),
  schema: args.find(arg => arg.startsWith('--schema='))?.split('=')[1] 
};

// Configure database URL
let databaseUrl = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;

// Add schema if specified
if (options.schema) {
  databaseUrl = `${databaseUrl}?schema=${options.schema}`;
}

// Create Prisma client with appropriate URL
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl
    }
  }
});

/**
 * Reset the test database
 * @returns {Promise<void>}
 */
async function resetTestDatabase() {
  console.log('Resetting test database...');
  
  // Confirm we're using the test database
  if (!databaseUrl.includes('test') && !options.schema) {
    console.error('Error: This script should only be run against a test database.');
    console.error('Make sure TEST_DATABASE_URL is set or --schema is provided.');
    process.exit(1);
  }
  
  try {
    // Create schema if it doesn't exist
    if (options.schema) {
      await prisma.$executeRawUnsafe(`CREATE SCHEMA IF NOT EXISTS "${options.schema}"`);
      console.log(`Ensured schema exists: ${options.schema}`);
    }
    
    // Get all tables (excluding Prisma's own tables)
    const tables = await prisma.$queryRaw`
      SELECT tablename FROM pg_tables 
      WHERE schemaname = ${options.schema || 'public'} 
      AND tablename NOT LIKE '_prisma%'
    `;
    
    console.log(`Found ${tables.length} tables to reset`);
    
    // Disable foreign key checks
    await prisma.$executeRaw`SET session_replication_role = 'replica'`;
    
    if (options.preserveUsers) {
      // Clear all tables except User and related auth tables
      const preservedTables = ['User', 'Account', 'Session', 'VerificationToken'];
      
      for (const { tablename } of tables) {
        if (!preservedTables.includes(tablename)) {
          await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${options.schema ? `${options.schema}.` : ''}${tablename}" CASCADE`);
          console.log(`Truncated table: ${tablename}`);
        }
      }
      
      // For User table, keep only test users
      await prisma.$executeRaw`
        DELETE FROM "User" 
        WHERE email NOT LIKE '%@buildappswith-test.com' 
        AND email NOT LIKE '%@example.com'
      `;
      console.log('Kept test users, removed other user records');
    } else {
      // Clear all tables
      for (const { tablename } of tables.reverse()) {
        await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${options.schema ? `${options.schema}.` : ''}${tablename}" CASCADE`);
        console.log(`Truncated table: ${tablename}`);
      }
      console.log('Removed all data including test users');
    }
    
    // Re-enable foreign key checks
    await prisma.$executeRaw`SET session_replication_role = 'origin'`;
    
    console.log('Database reset completed successfully!');
  } catch (error) {
    console.error('Error resetting test database:', error);
    throw error;
  }
}

/**
 * Create an isolated test schema
 * @param {string} schemaName - Schema name to create
 * @returns {Promise<void>}
 */
async function createIsolatedSchema(schemaName) {
  try {
    console.log(`Creating isolated schema: ${schemaName}`);
    
    // Create schema
    await prisma.$executeRawUnsafe(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);
    
    // Get a list of tables from public schema
    const tables = await prisma.$queryRaw`
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename NOT LIKE '_prisma%'
    `;
    
    // Create tables in the new schema
    for (const { tablename } of tables) {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "${schemaName}"."${tablename}" 
        (LIKE "public"."${tablename}" INCLUDING ALL)
      `);
      console.log(`Created table: ${schemaName}.${tablename}`);
    }
    
    console.log(`Isolated schema ${schemaName} created successfully!`);
  } catch (error) {
    console.error(`Error creating isolated schema ${schemaName}:`, error);
    throw error;
  }
}

/**
 * Drop an isolated test schema
 * @param {string} schemaName - Schema name to drop
 * @returns {Promise<void>}
 */
async function dropIsolatedSchema(schemaName) {
  try {
    console.log(`Dropping isolated schema: ${schemaName}`);
    
    // Drop schema
    await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schemaName}" CASCADE`);
    
    console.log(`Isolated schema ${schemaName} dropped successfully!`);
  } catch (error) {
    console.error(`Error dropping isolated schema ${schemaName}:`, error);
    throw error;
  }
}

/**
 * Main function
 */
async function main() {
  try {
    // Execute database reset
    await resetTestDatabase();
    
    // Close Prisma client
    await prisma.$disconnect();
    
    console.log('Database reset completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Database reset failed:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Run the main function
main();

// Export utility functions for use in tests
module.exports = {
  resetTestDatabase,
  createIsolatedSchema,
  dropIsolatedSchema
};
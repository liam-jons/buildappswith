/**
 * Database Reset and Migration Script for Clerk Auth Migration
 * 
 * This script performs a clean reset of the database and applies migrations
 * to support the Clerk authentication system. It ensures that the database
 * schema includes the clerkId field and removes any NextAuth-specific data
 * that is no longer needed.
 * 
 * Usage:
 * - Development: node scripts/reset-database-for-clerk.js
 * - Production: DO NOT RUN DIRECTLY! Use the admin dashboard migration tool
 * 
 * @version 1.0.64
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Check if running in production environment
const isProduction = process.env.NODE_ENV === 'production';

async function confirmReset() {
  return new Promise((resolve) => {
    if (isProduction) {
      console.log('\n⚠️  WARNING: This script should not be run directly in production! ⚠️');
      console.log('Please use the admin dashboard migration tool instead.\n');
      resolve(false);
      return;
    }

    console.log('\n⚠️  WARNING: This will RESET your entire database! ⚠️');
    console.log('All data will be lost, and the database will be recreated with the Clerk schema.\n');
    
    rl.question('Are you sure you want to continue? Type "RESET" to confirm: ', (answer) => {
      resolve(answer === 'RESET');
    });
  });
}

async function directDatabaseReset() {
  try {
    console.log('🗄️  Directly resetting database...');
    
    // Get database URL from environment
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    
    // Create a temporary SQL file with the reset commands
    const tempSqlFile = path.join(__dirname, 'temp_reset.sql');
    const resetSql = `
-- Drop all tables to get a clean slate
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

-- Initialize database with essential tables only
CREATE TABLE public."User" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT,
  "email" TEXT NOT NULL UNIQUE,
  "emailVerified" TIMESTAMP,
  "image" TEXT,
  "roles" TEXT[] DEFAULT ARRAY['CLIENT']::TEXT[],
  "isFounder" BOOLEAN NOT NULL DEFAULT false,
  "stripeCustomerId" TEXT,
  "verified" BOOLEAN NOT NULL DEFAULT false,
  "clerkId" TEXT UNIQUE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create empty _prisma_migrations table
CREATE TABLE IF NOT EXISTS public."_prisma_migrations" (
  "id" VARCHAR(36) NOT NULL,
  "checksum" VARCHAR(64) NOT NULL,
  "finished_at" TIMESTAMP WITH TIME ZONE,
  "migration_name" VARCHAR(255) NOT NULL,
  "logs" TEXT,
  "rolled_back_at" TIMESTAMP WITH TIME ZONE,
  "started_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "applied_steps_count" INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY ("id")
);
`;
    
    fs.writeFileSync(tempSqlFile, resetSql);
    
    // Execute the SQL file directly using psql
    const command = `psql "${dbUrl}" -f "${tempSqlFile}"`;
    execSync(command, { stdio: 'inherit' });
    
    // Remove the temporary file
    fs.unlinkSync(tempSqlFile);
    
    console.log('✅ Database directly reset with minimal schema.');
  } catch (error) {
    console.error('❌ Error during direct database reset:', error);
    console.log('\nTrying alternative reset method...');
    
    try {
      // Alternative method: Use raw queries through Prisma
      await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS public CASCADE;`);
      await prisma.$executeRawUnsafe(`CREATE SCHEMA public;`);
      
      // Generate schema from prisma schema file
      execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
      
      console.log('✅ Database reset using alternative method.');
    } catch (altError) {
      console.error('❌ Alternative reset method also failed:', altError);
      process.exit(1);
    }
  }
}

async function generatePrismaClient() {
  try {
    console.log('🔧 Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('✅ Prisma client generated successfully.');
  } catch (error) {
    console.error('❌ Error generating Prisma client:', error);
    process.exit(1);
  }
}

async function createFounder() {
  try {
    console.log('👤 Creating founder account placeholder...');
    await prisma.user.create({
      data: {
        email: 'founder@buildappswith.dev',
        name: 'Founder',
        roles: ['ADMIN', 'BUILDER'],
        isFounder: true,
        verified: true,
        clerkId: 'placeholder-for-clerk-sync',
        clientProfile: {
          create: {}
        },
        builderProfile: {
          create: {
            headline: 'Founder & Lead Builder',
            bio: 'Founder of Buildappswith platform.',
            featuredBuilder: true,
            availableForHire: true,
            hourlyRate: 150,
            domains: ['AI', 'Productivity', 'Web Development'],
            validationTier: 3,
          }
        }
      }
    });
    console.log('✅ Created founder account placeholder.');
  } catch (error) {
    console.error('❌ Error creating founder account:', error);
    // Continue execution - this is not a critical error
  }
}

async function main() {
  console.log('\n🔄 Clerk Auth Migration - Database Reset & Setup');
  console.log('===============================================\n');

  const shouldContinue = await confirmReset();
  if (!shouldContinue) {
    console.log('❌ Operation cancelled.');
    rl.close();
    process.exit(0);
  }

  try {
    // Step 1: Reset the database directly
    await directDatabaseReset();

    // Step 2: Generate Prisma client
    await generatePrismaClient();

    // Step 3: Create founder account placeholder
    await createFounder();

    console.log('\n✅ Database successfully reset and prepared for Clerk authentication!');
    console.log('\nNext steps:');
    console.log('1. Complete the authentication by signing in with your founder account in Clerk');
    console.log('2. The webhook will automatically update the placeholder with your Clerk ID');
    console.log('3. Verify the database sync by checking the user record has a valid clerkId\n');
  } catch (error) {
    console.error('❌ An unexpected error occurred:', error);
  } finally {
    await prisma.$disconnect();
    rl.close();
  }
}

main();

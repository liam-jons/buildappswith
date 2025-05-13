#!/usr/bin/env node

/**
 * Production Database Schema Verification Script
 * 
 * This script checks the actual schema in the production database
 * to help create compatible scripts for fixing builder profiles.
 * 
 * Usage:
 *   DATABASE_URL=your_production_db_url node scripts/check-prod-schema.js
 */

const { PrismaClient } = require('@prisma/client');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  cyan: '\x1b[36m'
};

// Initialize Prisma client
const prisma = new PrismaClient();

/**
 * Log a message with color
 */
function logColored(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

/**
 * Check database schema by directly querying PostgreSQL
 */
async function checkDatabaseSchema() {
  logColored(`=== Checking Production Database Schema ===`, colors.cyan);
  
  try {
    // Get User table schema
    logColored(`\nChecking User table schema:`, colors.blue);
    const userSchema = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'User'
      ORDER BY ordinal_position;
    `;
    
    console.table(userSchema);
    
    // Get BuilderProfile table schema
    logColored(`\nChecking BuilderProfile table schema:`, colors.blue);
    const profileSchema = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'BuilderProfile'
      ORDER BY ordinal_position;
    `;
    
    console.table(profileSchema);
    
    // Get SessionType table schema
    logColored(`\nChecking SessionType table schema:`, colors.blue);
    const sessionTypeSchema = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'SessionType'
      ORDER BY ordinal_position;
    `;
    
    console.table(sessionTypeSchema);
    
    // Check if there are any users in the database
    logColored(`\nChecking for existing users:`, colors.blue);
    const userCount = await prisma.$queryRaw`SELECT COUNT(*) FROM "User"`;
    console.log(`User count: ${userCount[0].count}`);
    
    if (parseInt(userCount[0].count) > 0) {
      const sampleUsers = await prisma.$queryRaw`
        SELECT id, name, email, "clerkId" 
        FROM "User" 
        LIMIT 5;
      `;
      console.log("Sample users:");
      console.table(sampleUsers);
    }
    
    // Check if there are any builder profiles
    logColored(`\nChecking for existing builder profiles:`, colors.blue);
    const profileCount = await prisma.$queryRaw`SELECT COUNT(*) FROM "BuilderProfile"`;
    console.log(`BuilderProfile count: ${profileCount[0].count}`);
    
    if (parseInt(profileCount[0].count) > 0) {
      const sampleProfiles = await prisma.$queryRaw`
        SELECT id, "userId", "displayName", searchable, featured 
        FROM "BuilderProfile" 
        LIMIT 5;
      `;
      console.log("Sample profiles:");
      console.table(sampleProfiles);
    }
    
    // Check if there are any session types
    logColored(`\nChecking for existing session types:`, colors.blue);
    const sessionCount = await prisma.$queryRaw`SELECT COUNT(*) FROM "SessionType"`;
    console.log(`SessionType count: ${sessionCount[0].count}`);
    
    if (parseInt(sessionCount[0].count) > 0) {
      const sampleSessions = await prisma.$queryRaw`
        SELECT id, "builderId", title, "durationMinutes", price, currency, "isActive" 
        FROM "SessionType" 
        LIMIT 5;
      `;
      console.log("Sample session types:");
      console.table(sampleSessions);
    }
    
    // Check table names to confirm all tables exist
    logColored(`\nChecking all tables in database:`, colors.blue);
    const tables = await prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;
    
    console.log("Tables in database:");
    tables.forEach(t => console.log(`- ${t.table_name}`));
    
  } catch (error) {
    logColored(`Error checking database schema: ${error.message}`, colors.red);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
checkDatabaseSchema().catch(e => {
  console.error(e);
  process.exit(1);
});
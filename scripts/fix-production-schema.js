#!/usr/bin/env node

/**
 * Emergency script to fix production schema mismatch
 * This adds missing columns that are causing the marketplace to fail
 */

require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

async function fixProductionSchema() {
  if (!process.env.DATABASE_URL.includes('neon.tech')) {
    console.error('This script should only run against production database');
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);
  
  try {
    console.log('Starting production schema fix...');
    
    // Add missing BuilderProfile columns
    const alterStatements = [
      // completedProjects column
      `ALTER TABLE "BuilderProfile" 
       ADD COLUMN IF NOT EXISTS "completedProjects" INTEGER DEFAULT 0`,
      
      // responseRate column  
      `ALTER TABLE "BuilderProfile" 
       ADD COLUMN IF NOT EXISTS "responseRate" DECIMAL`,
       
      // Other potentially missing columns
      `ALTER TABLE "BuilderProfile" 
       ADD COLUMN IF NOT EXISTS "slug" TEXT`,
       
      `ALTER TABLE "BuilderProfile" 
       ADD COLUMN IF NOT EXISTS "clerkUserId" TEXT`
    ];
    
    for (const statement of alterStatements) {
      console.log(`Executing: ${statement}`);
      await sql(statement);
    }
    
    // Verify the fix
    const result = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'BuilderProfile'
      AND column_name IN ('completedProjects', 'responseRate', 'slug', 'clerkUserId')
    `;
    
    console.log('Added columns:', result.map(r => r.column_name));
    console.log('Schema fix completed successfully');
    
  } catch (error) {
    console.error('Error fixing schema:', error);
    process.exit(1);
  }
}

fixProductionSchema();
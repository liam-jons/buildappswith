#!/usr/bin/env node

const { execSync } = require('child_process');

// Load environment variables
require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });

console.log('Checking database schema...');

// Check if tables exist
try {
  const tablesQuery = `
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('SessionType', 'Booking');
  `;
  
  const tablesResult = execSync(`pnpm exec prisma db execute --schema=./prisma/schema.prisma --stdin`, {
    input: tablesQuery,
    encoding: 'utf8'
  });
  
  console.log('Tables in database:');
  console.log(tablesResult);
  
  // Check SessionType columns
  const sessionTypeQuery = `
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'SessionType'
    ORDER BY ordinal_position;
  `;
  
  const sessionTypeResult = execSync(`pnpm exec prisma db execute --schema=./prisma/schema.prisma --stdin`, {
    input: sessionTypeQuery,
    encoding: 'utf8'
  });
  
  console.log('\nSessionType columns:');
  console.log(sessionTypeResult);
  
  // Check Booking columns
  const bookingQuery = `
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'Booking'
    ORDER BY ordinal_position;
  `;
  
  const bookingResult = execSync(`pnpm exec prisma db execute --schema=./prisma/schema.prisma --stdin`, {
    input: bookingQuery,
    encoding: 'utf8'
  });
  
  console.log('\nBooking columns:');
  console.log(bookingResult);
  
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}
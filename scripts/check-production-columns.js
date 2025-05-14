#!/usr/bin/env node

/**
 * Check actual column names in production
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

async function checkColumns() {
  const prisma = new PrismaClient();
  
  try {
    // Check User table columns
    const userColumns = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'User'
      ORDER BY ordinal_position
    `;
    
    console.log('User table columns:');
    userColumns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });
    
    // Check BuilderProfile columns
    const builderColumns = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'BuilderProfile'
      ORDER BY ordinal_position
    `;
    
    console.log('\nBuilderProfile table columns:');
    builderColumns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });
    
    // Check a sample user
    const sampleUser = await prisma.$queryRaw`
      SELECT * FROM "User" LIMIT 1
    `;
    
    console.log('\nSample user fields:');
    if (sampleUser.length > 0) {
      console.log(Object.keys(sampleUser[0]));
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkColumns();
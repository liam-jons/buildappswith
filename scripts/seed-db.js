#!/usr/bin/env node

/**
 * Database seeding script for Buildappswith
 * 
 * This script loads environment variables and runs the seeding process.
 * It's more reliable than using ts-node directly through the environment script.
 */

const { execSync } = require('child_process');
const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');

// Determine environment
const NODE_ENV = process.env.NODE_ENV || 'development';
console.log(`Running in ${NODE_ENV} environment`);

// Files to load in order of precedence (lowest to highest)
const envFiles = [
  '.env',
  `.env.${NODE_ENV}`,
  '.env.local',
  `.env.${NODE_ENV}.local`,
];

// Path to project root
const rootDir = path.resolve(__dirname, '..');

// Load each environment file if it exists
envFiles.forEach(file => {
  const filePath = path.resolve(rootDir, file);
  if (fs.existsSync(filePath)) {
    console.log(`Loading environment from ${file}`);
    const envConfig = dotenv.parse(fs.readFileSync(filePath));
    
    // Add each variable to process.env
    for (const key in envConfig) {
      process.env[key] = envConfig[key];
    }
  }
});

// Verify DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error('Error: DATABASE_URL environment variable is not set!');
  process.exit(1);
}

console.log('Starting database seeding...');

try {
  // Execute the JS seed file directly
  execSync('node prisma/seed/seed.js', {
    stdio: 'inherit',
    env: process.env
  });
  
  console.log('Database seeding completed successfully!');
} catch (error) {
  console.error('Database seeding failed:', error.message);
  process.exit(1);
}

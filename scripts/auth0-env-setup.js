#!/usr/bin/env node

/**
 * Auth0 Environment Variables Setup Script
 * 
 * This script helps manage Auth0 environment variables for different environments
 * (development, staging, production) and ensures consistency across deployments.
 * 
 * Usage:
 *   node scripts/auth0-env-setup.js check - Check if required Auth0 variables are set
 *   node scripts/auth0-env-setup.js create - Create a template .env.local file 
 *   node scripts/auth0-env-setup.js validate - Validate your Auth0 configuration
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Load environment variables from .env.local
const dotenvPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(dotenvPath)) {
  require('dotenv').config({ path: dotenvPath });
}

// Required Auth0 environment variables
const requiredVariables = [
  'AUTH0_SECRET',
  'AUTH0_BASE_URL',
  'AUTH0_ISSUER_BASE_URL',
  'AUTH0_CLIENT_ID',
  'AUTH0_CLIENT_SECRET'
];

// Optional Auth0 environment variables
const optionalVariables = [
  'AUTH0_SCOPE',
  'AUTH0_AUDIENCE',
  'AUTH0_ORGANIZATION_ID'
];

// Template for .env.local file
const envTemplate = `# Auth0 Configuration
# Required variables
AUTH0_SECRET=                                 # A long, secret value used to encrypt the session cookie
AUTH0_BASE_URL=http://localhost:3000          # The base URL of your application
AUTH0_ISSUER_BASE_URL=                        # The URL of your Auth0 tenant domain
AUTH0_CLIENT_ID=                              # Your Auth0 application's Client ID
AUTH0_CLIENT_SECRET=                          # Your Auth0 application's Client Secret

# Optional variables
AUTH0_SCOPE=openid profile email              # The scopes to request when authenticating
AUTH0_AUDIENCE=                               # The audience for your API
AUTH0_ORGANIZATION_ID=                        # The ID of your Auth0 organization (if using)
`;

// Main function
function main() {
  const command = process.argv[2];

  switch (command) {
    case 'check':
      checkEnvironmentVariables();
      break;
    case 'create':
      createEnvTemplate();
      break;
    case 'validate':
      validateAuth0Config();
      break;
    default:
      console.log(`
Auth0 Environment Variables Setup Script

Usage:
  node scripts/auth0-env-setup.js check    - Check if required Auth0 variables are set
  node scripts/auth0-env-setup.js create   - Create a template .env.local file
  node scripts/auth0-env-setup.js validate - Validate your Auth0 configuration
      `);
      break;
  }
}

// Check if required environment variables are set
function checkEnvironmentVariables() {
  console.log('\nChecking Auth0 environment variables:\n');
  
  let missingVars = [];
  let allPresent = true;

  for (const variable of requiredVariables) {
    if (process.env[variable]) {
      console.log(`✅ ${variable} is set`);
    } else {
      console.log(`❌ ${variable} is missing`);
      missingVars.push(variable);
      allPresent = false;
    }
  }

  console.log('\nOptional variables:');
  for (const variable of optionalVariables) {
    if (process.env[variable]) {
      console.log(`✅ ${variable} is set`);
    } else {
      console.log(`⚠️ ${variable} is not set (optional)`);
    }
  }

  if (allPresent) {
    console.log('\n✅ All required Auth0 environment variables are set.');
  } else {
    console.log(`\n❌ Missing required variables: ${missingVars.join(', ')}`);
    console.log('\nRun "node scripts/auth0-env-setup.js create" to create a template .env.local file');
  }
}

// Create a template .env.local file
function createEnvTemplate() {
  const envPath = path.join(process.cwd(), '.env.local');
  
  if (fs.existsSync(envPath)) {
    const answer = readInput('⚠️ .env.local already exists. Overwrite? (y/N): ');
    if (answer.toLowerCase() !== 'y') {
      console.log('Operation cancelled.');
      return;
    }
  }

  fs.writeFileSync(envPath, envTemplate);
  console.log('✅ Created .env.local template for Auth0 configuration.');
  console.log('➡️ Please fill in the values in .env.local');
}

// Validate Auth0 configuration by making a test request
function validateAuth0Config() {
  console.log('\nValidating Auth0 configuration...\n');
  
  // Check if required variables are set first
  let missingVars = [];
  for (const variable of requiredVariables) {
    if (!process.env[variable]) {
      missingVars.push(variable);
    }
  }

  if (missingVars.length > 0) {
    console.log(`❌ Cannot validate: Missing required variables: ${missingVars.join(', ')}`);
    return;
  }

  console.log('Attempting to validate configuration...');
  
  try {
    // This would be replaced with actual validation logic
    // For now, we just check if variables are present and have correct format
    
    // Check if ISSUER_BASE_URL is a valid URL
    try {
      new URL(process.env.AUTH0_ISSUER_BASE_URL);
      console.log('✅ AUTH0_ISSUER_BASE_URL is a valid URL');
    } catch (e) {
      console.log('❌ AUTH0_ISSUER_BASE_URL is not a valid URL');
      return;
    }
    
    // Check if BASE_URL is a valid URL
    try {
      new URL(process.env.AUTH0_BASE_URL);
      console.log('✅ AUTH0_BASE_URL is a valid URL');
    } catch (e) {
      console.log('❌ AUTH0_BASE_URL is not a valid URL');
      return;
    }
    
    // Check if SECRET is sufficiently long
    if (process.env.AUTH0_SECRET && process.env.AUTH0_SECRET.length >= 32) {
      console.log('✅ AUTH0_SECRET is sufficiently long');
    } else {
      console.log('⚠️ AUTH0_SECRET should be at least 32 characters long');
    }
    
    console.log('\n✅ Basic Auth0 configuration validation passed.');
    console.log('ℹ️ For a complete validation, start the application and test the login flow.');
  } catch (error) {
    console.error('❌ Failed to validate Auth0 configuration:');
    console.error(error);
  }
}

// Helper function to read user input
function readInput(question) {
  const { execSync } = require('child_process');
  process.stdout.write(question);
  return execSync('read reply; echo $reply', { shell: true }).toString().trim();
}

// Run the main function
main();

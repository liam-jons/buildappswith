#!/usr/bin/env node

/**
 * Environment setup script for Buildappswith
 * 
 * This script ensures that the appropriate environment variables are loaded
 * based on the current environment (development, production, staging).
 * 
 * Usage:
 *   node scripts/setup-env.js [command]
 * 
 * Example:
 *   node scripts/setup-env.js prisma:migrate:dev
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const dotenv = require('dotenv');

// Determine environment
const NODE_ENV = process.env.NODE_ENV || 'development';
console.log(`Running in ${NODE_ENV} environment`);

// Files to load in order of precedence (lowest to highest)
const envFiles = [
  '.env',                    // Base defaults for all environments
  `.env.${NODE_ENV}`,        // Environment-specific defaults
  '.env.local',              // Local overrides for all environments
  `.env.${NODE_ENV}.local`,  // Local overrides for specific environment
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

// Verify critical environment variables are set
const criticalVars = ['DATABASE_URL', 'NEXTAUTH_SECRET'];
let missingVars = false;

criticalVars.forEach(varName => {
  if (!process.env[varName]) {
    console.error(`Error: ${varName} environment variable is not set!`);
    missingVars = true;
  }
});

if (missingVars) {
  console.error('\nMissing critical environment variables. Please check your .env files.');
  process.exit(1);
}

// If command was provided, run it with the loaded environment
if (process.argv.length > 2) {
  const command = process.argv[2];
  console.log(`Running command: ${command}`);
  
  // Parse the command - if it contains : we assume it's an npm/pnpm script
  if (command.includes(':')) {
    // For npm/pnpm scripts
    const npmCmd = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
    const child = spawn(npmCmd, ['run', command], { 
      stdio: 'inherit',
      env: process.env
    });
    
    child.on('exit', code => {
      process.exit(code);
    });
  } else {
    // For direct shell commands
    const [cmd, ...args] = command.split(' ');
    const child = spawn(cmd, args, { 
      stdio: 'inherit',
      env: process.env,
      shell: true
    });
    
    child.on('exit', code => {
      process.exit(code);
    });
  }
} else {
  console.log('Environment variables loaded successfully!');
  console.log('DATABASE_URL is properly configured.');
}

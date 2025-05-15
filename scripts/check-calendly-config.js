#!/usr/bin/env node

/**
 * Check Calendly configuration
 */

console.log('🔍 Checking Calendly Configuration...\n');

// Check environment variables
const calendlyVars = {
  API_TOKEN: process.env.CALENDLY_API_TOKEN,
  API_TOKEN_SECONDARY: process.env.CALENDLY_API_TOKEN_SECONDARY,
  WEBHOOK_SIGNING_KEY: process.env.CALENDLY_WEBHOOK_SIGNING_KEY,
  WEBHOOK_BASE_URL: process.env.CALENDLY_WEBHOOK_BASE_URL,
  ENABLE_CACHING: process.env.CALENDLY_ENABLE_CACHING,
  DEBUG_MODE: process.env.CALENDLY_DEBUG_MODE,
  NODE_ENV: process.env.NODE_ENV
};

console.log('Environment Variables:');
Object.entries(calendlyVars).forEach(([key, value]) => {
  const display = value ? (key.includes('TOKEN') || key.includes('KEY') ? '********' : value) : 'Not Set';
  console.log(`  ${key}: ${display}`);
});

// Check if .env files exist
const fs = require('fs');
const path = require('path');

console.log('\n.env Files:');
const envFiles = ['.env', '.env.local', '.env.development', '.env.production'];
envFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    const hasCalendly = content.includes('CALENDLY');
    console.log(`  ${file}: ${hasCalendly ? '✓ Contains CALENDLY vars' : '✗ No CALENDLY vars'}`);
  } else {
    console.log(`  ${file}: Not found`);
  }
});

console.log('\n📌 Next Steps:');
if (!calendlyVars.API_TOKEN) {
  console.log('1. Set CALENDLY_API_TOKEN in your .env.local file');
  console.log('2. Get your API token from: https://calendly.com/integrations/api_webhooks');
  console.log('3. Example: CALENDLY_API_TOKEN=your_token_here');
}

console.log('\n🚀 For local development, add to .env.local:');
console.log('CALENDLY_API_TOKEN=your_calendly_api_token');
console.log('CALENDLY_DEBUG_MODE=true');
console.log('CALENDLY_ENABLE_CACHING=false');
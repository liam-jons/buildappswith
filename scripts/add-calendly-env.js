#!/usr/bin/env node

/**
 * Add Calendly environment variables to .env.local
 */

const fs = require('fs');
const path = require('path');

const envLocalPath = path.join(__dirname, '..', '.env.local');

// Calendly configuration for development
const calendlyConfig = `
# Calendly Integration (Development)
# Get your API token from: https://calendly.com/integrations/api_webhooks
CALENDLY_API_TOKEN=your_calendly_api_token_here
CALENDLY_DEBUG_MODE=true
CALENDLY_ENABLE_CACHING=false

# Optional: If you have webhook signing configured
# CALENDLY_WEBHOOK_SIGNING_KEY=your_webhook_signing_key
`;

console.log('📝 Adding Calendly configuration to .env.local...\n');

try {
  // Check if .env.local exists
  let existingContent = '';
  if (fs.existsSync(envLocalPath)) {
    existingContent = fs.readFileSync(envLocalPath, 'utf8');
    
    // Check if Calendly config already exists
    if (existingContent.includes('CALENDLY_')) {
      console.log('⚠️  Calendly configuration already exists in .env.local');
      console.log('   Please update the values manually if needed.');
      process.exit(0);
    }
  }
  
  // Append Calendly config
  const newContent = existingContent + calendlyConfig;
  fs.writeFileSync(envLocalPath, newContent);
  
  console.log('✅ Added Calendly configuration to .env.local');
  console.log('\n📌 Next steps:');
  console.log('1. Get your API token from: https://calendly.com/integrations/api_webhooks');
  console.log('2. Update CALENDLY_API_TOKEN in .env.local with your actual token');
  console.log('3. Restart your development server');
  console.log('\n💡 For now, the Calendly embed will work without the API token');
  console.log('   The API token is only needed for advanced features like:');
  console.log('   - Dynamic event type loading');
  console.log('   - Webhook verification');
  console.log('   - Programmatic booking creation');
  
} catch (error) {
  console.error('❌ Error adding Calendly configuration:', error);
  process.exit(1);
}
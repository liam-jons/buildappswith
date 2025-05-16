require('dotenv').config();
const fetch = require('node-fetch');

async function createCalendlyWebhook() {
  console.log('Creating Calendly webhook subscription...\n');
  
  try {
    // Step 1: Get current user to find organization URI
    console.log('1. Getting current user information...');
    const userResponse = await fetch('https://api.calendly.com/users/me', {
      headers: {
        'Authorization': `Bearer ${process.env.CALENDLY_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!userResponse.ok) {
      throw new Error(`Failed to get user: ${userResponse.status} ${userResponse.statusText}`);
    }
    
    const userData = await userResponse.json();
    const organizationUri = userData.resource.current_organization;
    
    console.log('User:', userData.resource.name);
    console.log('Organization URI:', organizationUri);
    
    // Step 2: Create webhook subscription
    console.log('\n2. Creating webhook subscription...');
    
    const webhookData = {
      url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.buildappswith.com'}/api/webhooks/calendly`,
      events: [
        'invitee.created',
        'invitee.canceled',
        'invitee_no_show.created',
        'invitee_no_show.deleted',
        'routing_form_submission.created'
      ],
      organization: organizationUri,
      scope: 'organization',
      signing_key: generateSigningKey() // Optional but recommended
    };
    
    console.log('Webhook configuration:');
    console.log('- URL:', webhookData.url);
    console.log('- Events:', webhookData.events.join(', '));
    console.log('- Scope:', webhookData.scope);
    
    const createResponse = await fetch('https://api.calendly.com/webhook_subscriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CALENDLY_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(webhookData)
    });
    
    if (!createResponse.ok) {
      const errorData = await createResponse.json();
      throw new Error(`Failed to create webhook: ${createResponse.status} ${JSON.stringify(errorData)}`);
    }
    
    const webhookResult = await createResponse.json();
    
    console.log('\n✅ Webhook created successfully!');
    console.log('Webhook URI:', webhookResult.resource.uri);
    console.log('Callback URL:', webhookResult.resource.callback_url);
    console.log('State:', webhookResult.resource.state);
    
    // Step 3: Important - Save the signing key
    console.log('\n⚠️  IMPORTANT: Add this to your environment variables:');
    console.log(`CALENDLY_WEBHOOK_SIGNING_KEY=${webhookData.signing_key}`);
    console.log('\nAdd this to:');
    console.log('1. Your .env file (for development)');
    console.log('2. Vercel environment variables (for production)');
    
    // Step 4: Test the webhook
    console.log('\n3. Testing webhook endpoint...');
    const testResponse = await fetch(webhookData.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'calendly-webhook-signature': 'test-signature'
      },
      body: JSON.stringify({
        event: 'test',
        payload: { test: true }
      })
    });
    
    console.log('Test response status:', testResponse.status);
    
    return webhookResult;
    
  } catch (error) {
    console.error('\n❌ Error creating webhook:', error.message);
    
    // If webhook already exists, provide instructions to view existing webhooks
    if (error.message.includes('409')) {
      console.log('\nWebhook may already exist. To view existing webhooks:');
      console.log('Run: node scripts/list-calendly-webhooks.js');
    }
    
    process.exit(1);
  }
}

// Generate a secure random signing key
function generateSigningKey() {
  const crypto = require('crypto');
  return crypto.randomBytes(32).toString('base64');
}

// Run the script
createCalendlyWebhook();
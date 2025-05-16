require('dotenv').config();
const fetch = require('node-fetch');

async function updateCalendlyWebhook() {
  console.log('Updating Calendly webhook subscription...\n');
  
  try {
    // Step 1: List existing webhooks
    console.log('1. Finding existing webhook...');
    const userResponse = await fetch('https://api.calendly.com/users/me', {
      headers: {
        'Authorization': `Bearer ${process.env.CALENDLY_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    const userData = await userResponse.json();
    const organizationUri = userData.resource.current_organization;
    
    // Get webhooks
    const webhooksResponse = await fetch(`https://api.calendly.com/webhook_subscriptions?organization=${encodeURIComponent(organizationUri)}&scope=organization`, {
      headers: {
        'Authorization': `Bearer ${process.env.CALENDLY_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    const webhooksData = await webhooksResponse.json();
    
    if (webhooksData.collection.length === 0) {
      console.log('No webhooks found');
      return;
    }
    
    // Find our webhook
    const webhook = webhooksData.collection.find(w => 
      w.callback_url === 'https://www.buildappswith.com/api/webhooks/calendly'
    );
    
    if (!webhook) {
      console.log('Webhook not found for our URL');
      return;
    }
    
    console.log('Found webhook:', webhook.uri);
    console.log('Current events:', webhook.events.join(', '));
    
    // Step 2: Delete the existing webhook
    console.log('\n2. Deleting existing webhook...');
    const deleteResponse = await fetch(webhook.uri, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${process.env.CALENDLY_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (deleteResponse.status !== 204) {
      throw new Error(`Failed to delete webhook: ${deleteResponse.status}`);
    }
    
    console.log('Webhook deleted successfully');
    
    // Step 3: Create new webhook with all events
    console.log('\n3. Creating new webhook with all events...');
    
    const newWebhookData = {
      url: 'https://www.buildappswith.com/api/webhooks/calendly',
      events: [
        'invitee.created',
        'invitee.canceled',
        'invitee_no_show.created',
        'invitee_no_show.deleted',
        'routing_form_submission.created'
      ],
      organization: organizationUri,
      scope: 'organization',
      signing_key: generateSigningKey()
    };
    
    const createResponse = await fetch('https://api.calendly.com/webhook_subscriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CALENDLY_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newWebhookData)
    });
    
    if (!createResponse.ok) {
      const errorData = await createResponse.json();
      throw new Error(`Failed to create webhook: ${createResponse.status} ${JSON.stringify(errorData)}`);
    }
    
    const newWebhook = await createResponse.json();
    
    console.log('\n✅ Webhook updated successfully!');
    console.log('New webhook URI:', newWebhook.resource.uri);
    console.log('Events:', newWebhook.resource.events.join(', '));
    
    console.log('\n⚠️  IMPORTANT: Update your environment variables with the new signing key:');
    console.log(`CALENDLY_WEBHOOK_SIGNING_KEY=${newWebhookData.signing_key}`);
    console.log('\nAdd this to:');
    console.log('1. Your .env file (for development)');
    console.log('2. Vercel environment variables (for production)');
    
  } catch (error) {
    console.error('\n❌ Error updating webhook:', error.message);
    process.exit(1);
  }
}

// Generate a secure random signing key
function generateSigningKey() {
  const crypto = require('crypto');
  return crypto.randomBytes(32).toString('base64');
}

// Run the script
updateCalendlyWebhook();
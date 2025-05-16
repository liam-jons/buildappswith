require('dotenv').config();
const fetch = require('node-fetch');

async function updateCalendlyWebhookEvents() {
  console.log('Updating Calendly webhook events (keeping existing key)...\n');
  
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
    
    // Note: Calendly API doesn't support PATCH to update webhooks
    // We need to delete and recreate, but we'll keep the same signing key
    
    console.log('\n2. Recreating webhook with all events...');
    console.log('Note: Using existing signing key from environment');
    
    // Step 2: Delete the existing webhook
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
    
    console.log('Existing webhook deleted');
    
    // Step 3: Create new webhook with all events using the same signing key
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
      signing_key: process.env.CALENDLY_WEBHOOK_SIGNING_KEY // Use existing key
    };
    
    if (!newWebhookData.signing_key) {
      console.error('❌ CALENDLY_WEBHOOK_SIGNING_KEY not found in environment');
      console.log('Please ensure you have the signing key from your existing webhook');
      process.exit(1);
    }
    
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
    console.log('State:', newWebhook.resource.state);
    
    console.log('\n✅ Your signing key remains the same - no environment updates needed!');
    
  } catch (error) {
    console.error('\n❌ Error updating webhook:', error.message);
    process.exit(1);
  }
}

// Run the script
updateCalendlyWebhookEvents();
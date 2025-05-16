require('dotenv').config();
const fetch = require('node-fetch');

async function listCalendlyWebhooks() {
  console.log('Listing Calendly webhook subscriptions...\n');
  
  try {
    // Get current user to find organization URI
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
    
    // List webhooks - need to properly encode the URI and add scope
    const encodedOrgUri = encodeURIComponent(organizationUri);
    const webhooksUrl = `https://api.calendly.com/webhook_subscriptions?organization=${encodedOrgUri}&scope=organization`;
    
    console.log('Fetching webhooks for organization...');
    
    const webhooksResponse = await fetch(webhooksUrl, {
      headers: {
        'Authorization': `Bearer ${process.env.CALENDLY_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!webhooksResponse.ok) {
      const errorBody = await webhooksResponse.text();
      console.log('Error response:', errorBody);
      throw new Error(`Failed to list webhooks: ${webhooksResponse.status} ${webhooksResponse.statusText}`);
    }
    
    const webhooksData = await webhooksResponse.json();
    
    if (webhooksData.collection.length === 0) {
      console.log('No webhooks found.');
      return;
    }
    
    console.log(`Found ${webhooksData.collection.length} webhook(s):\n`);
    
    webhooksData.collection.forEach((webhook, index) => {
      console.log(`Webhook ${index + 1}:`);
      console.log('- URI:', webhook.uri);
      console.log('- URL:', webhook.callback_url);
      console.log('- State:', webhook.state);
      console.log('- Events:', webhook.events.join(', '));
      console.log('- Scope:', webhook.scope);
      console.log('- Created:', webhook.created_at);
      console.log('');
    });
    
  } catch (error) {
    console.error('Error listing webhooks:', error.message);
    process.exit(1);
  }
}

// Run the script
listCalendlyWebhooks();
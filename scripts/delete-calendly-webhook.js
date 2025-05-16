require('dotenv').config();
const fetch = require('node-fetch');

async function deleteCalendlyWebhook(webhookUri) {
  if (!webhookUri) {
    console.error('Please provide a webhook URI as an argument');
    console.log('Usage: node scripts/delete-calendly-webhook.js <webhook-uri>');
    console.log('Example: node scripts/delete-calendly-webhook.js https://api.calendly.com/webhook_subscriptions/AAAAAAAAAAAAAAAA');
    process.exit(1);
  }
  
  console.log(`Deleting webhook: ${webhookUri}\n`);
  
  try {
    const response = await fetch(webhookUri, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${process.env.CALENDLY_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.status === 204) {
      console.log('✅ Webhook deleted successfully!');
    } else {
      const errorData = await response.json();
      throw new Error(`Failed to delete webhook: ${response.status} ${JSON.stringify(errorData)}`);
    }
    
  } catch (error) {
    console.error('Error deleting webhook:', error.message);
    process.exit(1);
  }
}

// Run the script with command line argument
const webhookUri = process.argv[2];
deleteCalendlyWebhook(webhookUri);
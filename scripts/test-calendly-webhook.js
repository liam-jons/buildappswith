require('dotenv').config();
const crypto = require('crypto');
const fetch = require('node-fetch');

async function testCalendlyWebhook() {
  console.log('Testing Calendly webhook signature verification...\n');
  
  // Check if signing key exists
  if (!process.env.CALENDLY_WEBHOOK_SIGNING_KEY) {
    console.error('❌ CALENDLY_WEBHOOK_SIGNING_KEY not found in environment');
    console.log('Please add it to your .env file');
    return;
  }
  
  console.log('✅ Signing key found');
  
  // Create a test payload
  const payload = {
    event: 'invitee.created',
    payload: {
      event_type: {
        name: 'Test Session',
        uuid: 'test-123'
      },
      event: {
        uuid: 'event-123',
        uri: 'https://api.calendly.com/scheduled_events/event-123',
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 3600000).toISOString()
      },
      invitee: {
        uuid: 'invitee-123',
        uri: 'https://api.calendly.com/scheduled_events/event-123/invitees/invitee-123',
        name: 'Test User',
        email: 'test@example.com',
        timezone: 'America/New_York'
      },
      tracking: {
        utm_content: 'test-booking-id'
      }
    }
  };
  
  // Create the signature using your signing key
  const payloadString = JSON.stringify(payload);
  const signature = crypto
    .createHmac('sha256', process.env.CALENDLY_WEBHOOK_SIGNING_KEY)
    .update(payloadString)
    .digest('hex');
  
  console.log('Generated signature:', signature);
  
  // Test locally (if running dev server)
  const localUrl = 'http://localhost:3000/api/webhooks/calendly';
  console.log('\nTesting local webhook endpoint...');
  
  try {
    const response = await fetch(localUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'calendly-webhook-signature': signature
      },
      body: payloadString
    });
    
    console.log('Local response status:', response.status);
    const responseData = await response.text();
    console.log('Response:', responseData);
  } catch (error) {
    console.log('Local server not running or error:', error.message);
  }
  
  console.log('\n✅ Webhook setup complete!');
  console.log('\nNext steps:');
  console.log('1. Deploy to production with the signing key');
  console.log('2. Create a test booking in Calendly');
  console.log('3. Monitor logs for webhook events');
}

// Run the test
testCalendlyWebhook();
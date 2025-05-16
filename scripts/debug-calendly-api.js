require('dotenv').config();
const fetch = require('node-fetch');

async function debugCalendlyApi() {
  console.log('Testing Calendly API connection...\n');
  
  // Check if we have the API token
  if (!process.env.CALENDLY_API_TOKEN) {
    console.error('❌ CALENDLY_API_TOKEN not found in environment variables');
    return;
  }
  
  console.log('✅ API Token found (first 10 chars):', process.env.CALENDLY_API_TOKEN.substring(0, 10) + '...');
  
  try {
    // Step 1: Test basic API connection
    console.log('\n1. Testing /users/me endpoint...');
    const userResponse = await fetch('https://api.calendly.com/users/me', {
      headers: {
        'Authorization': `Bearer ${process.env.CALENDLY_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response status:', userResponse.status);
    
    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      console.log('Error response:', errorText);
      throw new Error(`Failed to get user: ${userResponse.status}`);
    }
    
    const userData = await userResponse.json();
    console.log('User:', userData.resource.name);
    console.log('Email:', userData.resource.email);
    console.log('Organization URI:', userData.resource.current_organization);
    
    // Step 2: Try to list webhooks without organization parameter
    console.log('\n2. Testing webhook list without organization...');
    const webhooksResponse1 = await fetch('https://api.calendly.com/webhook_subscriptions', {
      headers: {
        'Authorization': `Bearer ${process.env.CALENDLY_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response status:', webhooksResponse1.status);
    
    if (!webhooksResponse1.ok) {
      const errorText = await webhooksResponse1.text();
      console.log('Error response:', errorText);
    } else {
      const data = await webhooksResponse1.json();
      console.log('Success! Found', data.collection.length, 'webhooks');
    }
    
    // Step 3: Try with organization parameter
    console.log('\n3. Testing webhook list with organization...');
    const orgUri = userData.resource.current_organization;
    const webhooksResponse2 = await fetch(`https://api.calendly.com/webhook_subscriptions?organization=${encodeURIComponent(orgUri)}`, {
      headers: {
        'Authorization': `Bearer ${process.env.CALENDLY_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response status:', webhooksResponse2.status);
    
    if (!webhooksResponse2.ok) {
      const errorText = await webhooksResponse2.text();
      console.log('Error response:', errorText);
    } else {
      const data = await webhooksResponse2.json();
      console.log('Success! Found', data.collection.length, 'webhooks');
    }
    
    // Step 4: Check permissions
    console.log('\n4. Checking API token permissions...');
    console.log('Token should have webhook:read and webhook:write permissions');
    console.log('Please verify in Calendly dashboard: Settings > Integrations > API & Webhooks');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
}

// Run the debug script
debugCalendlyApi();
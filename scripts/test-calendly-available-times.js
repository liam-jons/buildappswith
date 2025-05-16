const fetch = require('node-fetch');
require('dotenv').config();

const API_BASE = 'http://localhost:3000';

async function testAvailableTimes() {
  console.log('Testing Calendly Available Times API...');
  
  try {
    // Start time should be tomorrow to ensure it's in the future
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 1);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7);

    // Use a real session type URI from the database
    const eventTypeUri = 'https://api.calendly.com/event_types/7a2dc7f8-7171-45f7-97b5-e4f5a8b09bf2';

    console.log('Request body:', {
      eventTypeUri,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });

    const response = await fetch(`${API_BASE}/api/scheduling/calendly/available-times`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        eventTypeUri,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      }),
    });

    console.log('Response status:', response.status);
    
    const data = await response.json();
    console.log('Response data:', JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log('✅ Available times fetched successfully');
      console.log(`Found ${data.timeSlots?.length || 0} available time slots`);
    } else {
      console.error('❌ Failed to fetch available times:', data.error);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Also test direct API calls to Calendly
async function testDirectCalendlyAPI() {
  console.log('\n\nTesting direct Calendly API calls...');
  
  const token = process.env.CALENDLY_API_TOKEN;
  if (!token) {
    console.error('❌ CALENDLY_API_TOKEN not found in environment');
    return;
  }

  console.log('Token starts with:', token.substring(0, 20) + '...');

  // Test V1 API endpoint - currently used by our client
  try {
    console.log('\nTesting V1 endpoint /v1/users/me...');
    const responseV1 = await fetch('https://api.calendly.com/v1/users/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    console.log('V1 API response status:', responseV1.status);
    const dataV1 = await responseV1.json();
    console.log('V1 API response:', JSON.stringify(dataV1, null, 2));

    if (responseV1.ok) {
      console.log('✅ V1 API call successful');
    } else {
      console.error('❌ V1 API call failed');
    }
  } catch (error) {
    console.error('❌ V1 Error:', error.message);
  }

  // Test V2 API endpoint - need to use correct endpoint
  try {
    console.log('\nTesting V2 endpoint /users/me...');
    const responseV2 = await fetch('https://api.calendly.com/users/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    console.log('V2 API response status:', responseV2.status);
    const dataV2 = await responseV2.json();
    console.log('V2 API response:', JSON.stringify(dataV2, null, 2));

    if (responseV2.ok) {
      console.log('✅ V2 API call successful');
    } else {
      console.error('❌ V2 API call failed');
    }
  } catch (error) {
    console.error('❌ V2 Error:', error.message);
  }

  // Test available times endpoint with V1
  try {
    console.log('\nTesting V1 available times endpoint...');
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 1);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7);

    const eventTypeUri = 'https://api.calendly.com/event_types/7a2dc7f8-7171-45f7-97b5-e4f5a8b09bf2';
    
    const url = `https://api.calendly.com/v1/event_type_available_times?event_type=${encodeURIComponent(eventTypeUri)}&start_time=${startDate.toISOString()}&end_time=${endDate.toISOString()}`;
    console.log('Available times URL:', url);

    const responseAvailable = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    console.log('Available times response status:', responseAvailable.status);
    const dataAvailable = await responseAvailable.json();
    console.log('Available times response:', JSON.stringify(dataAvailable, null, 2));

    if (responseAvailable.ok) {
      console.log('✅ Available times API call successful');
      console.log(`Found ${dataAvailable.collection?.length || 0} time slots`);
    } else {
      console.error('❌ Available times API call failed');
    }
  } catch (error) {
    console.error('❌ Available times Error:', error.message);
  }
}

async function main() {
  await testAvailableTimes();
  await testDirectCalendlyAPI();
}

main().catch(console.error);
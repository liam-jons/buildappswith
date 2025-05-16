const fetch = require('node-fetch');
require('dotenv').config();

async function testEventTypes() {
  console.log('Testing Calendly Event Types API...');
  
  const token = process.env.CALENDLY_API_TOKEN;
  if (!token) {
    console.error('❌ CALENDLY_API_TOKEN not found in environment');
    return;
  }

  try {
    // First get the current user
    const userResponse = await fetch('https://api.calendly.com/users/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const userData = await userResponse.json();
    console.log('Current user:', JSON.stringify(userData, null, 2));

    if (!userResponse.ok) {
      console.error('❌ Failed to get current user');
      return;
    }

    // Now get event types
    const url = `https://api.calendly.com/event_types?user=${encodeURIComponent(userData.resource.uri)}`;
    console.log('\nFetching event types from:', url);

    const eventTypesResponse = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    console.log('Event types response status:', eventTypesResponse.status);
    const eventTypesData = await eventTypesResponse.json();
    console.log('Event types response:', JSON.stringify(eventTypesData, null, 2));

    if (eventTypesResponse.ok) {
      console.log('✅ Event types fetched successfully');
      console.log(`Found ${eventTypesData.collection?.length || 0} event types`);

      // If we have event types, try to get the first one's details
      if (eventTypesData.collection && eventTypesData.collection.length > 0) {
        const firstEventType = eventTypesData.collection[0];
        console.log('\nTesting event type details for:', firstEventType.uri);
        
        const eventDetailResponse = await fetch(firstEventType.uri, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const eventDetailData = await eventDetailResponse.json();
        console.log('Event type details:', JSON.stringify(eventDetailData, null, 2));
      }
    } else {
      console.error('❌ Failed to fetch event types');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function testAvailableTimes() {
  console.log('\n\nTesting Calendly Available Times Endpoints...');
  
  const token = process.env.CALENDLY_API_TOKEN;
  
  // Try different endpoint patterns to find the correct one
  const patterns = [
    {
      name: 'V1 Pattern',
      url: (eventType, start, end) => 
        `https://api.calendly.com/v1/event_type_available_times?event_type=${encodeURIComponent(eventType)}&start_time=${start}&end_time=${end}`
    },
    {
      name: 'V2 Pattern with available_times',
      url: (eventType, start, end) => 
        `https://api.calendly.com/event_type_available_times?event_type=${encodeURIComponent(eventType)}&start_time=${start}&end_time=${end}`
    },
    {
      name: 'V2 Pattern with event type UUID',
      url: (eventType, start, end) => {
        const uuid = eventType.split('/').pop();
        return `https://api.calendly.com/event_types/${uuid}/available_times?start_time=${start}&end_time=${end}`;
      }
    },
    {
      name: 'V2 Pattern with availability',
      url: (eventType, start, end) => {
        const uuid = eventType.split('/').pop();
        return `https://api.calendly.com/availability?event_type=${encodeURIComponent(eventType)}&start_time=${start}&end_time=${end}`;
      }
    }
  ];

  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 1);
  startDate.setHours(0, 0, 0, 0);
  
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 7);

  const eventTypeUri = 'https://api.calendly.com/event_types/7a2dc7f8-7171-45f7-97b5-e4f5a8b09bf2';

  for (const pattern of patterns) {
    try {
      const url = pattern.url(eventTypeUri, startDate.toISOString(), endDate.toISOString());
      console.log(`\nTrying ${pattern.name}: ${url}`);

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', JSON.stringify(data, null, 2));

      if (response.ok) {
        console.log(`✅ ${pattern.name} works!`);
        return;
      }
    } catch (error) {
      console.error(`❌ ${pattern.name} error:`, error.message);
    }
  }
}

async function main() {
  await testEventTypes();
  await testAvailableTimes();
}

main().catch(console.error);
const fetch = require('node-fetch');
require('dotenv').config();

async function testAvailableTimesPatterns() {
  console.log('Testing Calendly Available Times with real event types...');
  
  const token = process.env.CALENDLY_API_TOKEN;
  
  // Use a real event type URI from the list we got
  const eventTypeUri = 'https://api.calendly.com/event_types/1efa1318-0ec2-4c9b-acf5-7743df6c8641'; // Getting Started - Individuals
  const eventTypeUuid = '1efa1318-0ec2-4c9b-acf5-7743df6c8641';
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 1);
  startDate.setHours(0, 0, 0, 0);
  
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 7);

  // Try different patterns from the Calendly API documentation
  const patterns = [
    {
      name: 'Event Availability (documented pattern)',
      url: `https://api.calendly.com/event_type_available_times?event_type=${encodeURIComponent(eventTypeUri)}&start_time=${startDate.toISOString()}&end_time=${endDate.toISOString()}`
    },
    {
      name: 'UUID-based availability',
      url: `https://api.calendly.com/event_types/${eventTypeUuid}/available_times?start_time=${startDate.toISOString()}&end_time=${endDate.toISOString()}`
    },
    {
      name: 'User Availability',
      url: `https://api.calendly.com/user_availability_schedules?user=https://api.calendly.com/users/b208f5d0-f5aa-471b-9455-4e28942d1a31`
    },
    {
      name: 'Scheduling Link',
      url: eventTypeUri.replace('/event_types/', '/scheduling_links/')
    },
    {
      name: 'Event Type slots',
      url: `https://api.calendly.com/event_types/${eventTypeUuid}/slots?start_time=${startDate.toISOString()}&end_time=${endDate.toISOString()}`
    }
  ];

  for (const pattern of patterns) {
    try {
      console.log(`\nTrying ${pattern.name}:`);
      console.log('URL:', pattern.url);

      const response = await fetch(pattern.url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', JSON.stringify(data, null, 2));

      if (response.ok) {
        console.log(`✅ ${pattern.name} works!`);
      }
    } catch (error) {
      console.error(`❌ ${pattern.name} error:`, error.message);
    }
  }
}

// Check the Calendly API docs
async function checkSchedulingLinks() {
  console.log('\n\nTesting Calendly Scheduling Links...');
  
  const token = process.env.CALENDLY_API_TOKEN;
  
  try {
    // Create a scheduling link
    const createResponse = await fetch('https://api.calendly.com/scheduling_links', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        max_event_count: 1,
        owner: 'https://api.calendly.com/users/b208f5d0-f5aa-471b-9455-4e28942d1a31',
        owner_type: 'User'
      }),
    });

    console.log('Create scheduling link status:', createResponse.status);
    const createData = await createResponse.json();
    console.log('Create response:', JSON.stringify(createData, null, 2));
  } catch (error) {
    console.error('Error creating scheduling link:', error.message);
  }
}

async function main() {
  await testAvailableTimesPatterns();
  await checkSchedulingLinks();
}

main().catch(console.error);
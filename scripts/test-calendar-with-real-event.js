const fetch = require('node-fetch');
require('dotenv').config();

const API_BASE = 'http://localhost:3000';

async function testCalendarWithRealEvent() {
  console.log('Testing Calendar with real Calendly event type...');
  
  try {
    // Use a real event type URI from our tests
    const eventTypeUri = 'https://api.calendly.com/event_types/1efa1318-0ec2-4c9b-acf5-7743df6c8641';
    
    // Start tomorrow to ensure it's in the future
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 1);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7);

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
      console.log('✅ Available times fetched successfully via our API');
      console.log(`Found ${data.timeSlots?.length || 0} available time slots`);
      
      // Show first few time slots
      if (data.timeSlots && data.timeSlots.length > 0) {
        console.log('\nFirst 5 time slots:');
        data.timeSlots.slice(0, 5).forEach((slot, i) => {
          console.log(`${i + 1}. ${new Date(slot.startTime).toLocaleString()} - ${new Date(slot.endTime).toLocaleString()}`);
        });
      }
    } else {
      console.error('❌ Failed to fetch available times:', data.error);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

main().catch(console.error);

async function main() {
  await testCalendarWithRealEvent();
}
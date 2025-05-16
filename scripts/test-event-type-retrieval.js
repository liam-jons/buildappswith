require('dotenv').config();
const { CalendlyApiClient, getCalendlyApiClient } = require('../lib/scheduling/calendly/api-client');

async function testEventTypeRetrieval() {
  console.log('Testing event type retrieval...\n');
  
  try {
    const client = getCalendlyApiClient();
    
    // Test 1: Get current user
    console.log('1. Getting current user...');
    const user = await client.getCurrentUser();
    console.log('User:', {
      name: user.resource.name,
      email: user.resource.email,
      scheduling_url: user.resource.scheduling_url
    });
    
    // Test 2: Get event types
    console.log('\n2. Getting event types...');
    const eventTypes = await client.getEventTypes();
    console.log(`Found ${eventTypes.collection.length} event types`);
    
    // List each event type
    eventTypes.collection.forEach((eventType, index) => {
      console.log(`\nEvent Type ${index + 1}:`, {
        name: eventType.name,
        slug: eventType.slug,
        duration: eventType.duration,
        active: eventType.active,
        scheduling_url: eventType.scheduling_url,
        uri: eventType.uri
      });
    });
    
    // Test 3: Get available times for first event type
    if (eventTypes.collection.length > 0) {
      console.log('\n3. Testing available times for first event type...');
      const eventType = eventTypes.collection[0];
      const startTime = new Date();
      const endTime = new Date();
      endTime.setDate(endTime.getDate() + 7);
      
      const availableTimes = await client.getEventTypeAvailableTimes(
        eventType.uri,
        startTime,
        endTime
      );
      
      console.log(`Found ${availableTimes.collection.length} available time slots`);
      
      // Show first 5 time slots
      availableTimes.collection.slice(0, 5).forEach((slot, index) => {
        console.log(`\nSlot ${index + 1}:`, {
          start_time: slot.start_time,
          status: slot.status,
          invitees_remaining: slot.invitees_remaining,
          scheduling_url: slot.scheduling_url
        });
      });
    }
    
    console.log('\n✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.statusCode) {
      console.error('Status code:', error.statusCode);
    }
    if (error.errorCode) {
      console.error('Error code:', error.errorCode);
    }
  }
}

// Run the test
testEventTypeRetrieval();
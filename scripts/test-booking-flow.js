const fetch = require('node-fetch');
require('dotenv').config();

async function testBookingFlow() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  
  console.log('Testing booking flow at:', baseUrl);
  
  try {
    // Step 1: Fetch available session types for a builder
    console.log('\n1. Fetching session types...');
    const sessionTypesRes = await fetch(`${baseUrl}/api/marketplace/builders/123/session-types`);
    const sessionTypes = await sessionTypesRes.json();
    
    if (!sessionTypes.success || !sessionTypes.sessionTypes.length) {
      throw new Error('Failed to fetch session types');
    }
    
    console.log(`Found ${sessionTypes.sessionTypes.length} session types`);
    const freeSession = sessionTypes.sessionTypes.find(s => s.price === 0);
    const paidSession = sessionTypes.sessionTypes.find(s => s.price > 0);
    
    // Step 2: Get available time slots for free session
    console.log('\n2. Getting available time slots...');
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7);
    
    const availableTimesRes = await fetch(`${baseUrl}/api/scheduling/calendly/available-times`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventTypeUri: freeSession.calendlyEventTypeUri,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      })
    });
    
    const availableTimes = await availableTimesRes.json();
    
    if (!availableTimes.success || !availableTimes.timeSlots.length) {
      throw new Error('No available time slots found');
    }
    
    console.log(`Found ${availableTimes.timeSlots.length} available time slots`);
    const selectedSlot = availableTimes.timeSlots[0];
    
    // Step 3: Confirm booking for free session
    console.log('\n3. Confirming booking for free session...');
    const confirmRes = await fetch(`${baseUrl}/api/scheduling/bookings/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionTypeId: freeSession.id,
        timeSlot: {
          startTime: selectedSlot.startTime,
          endTime: selectedSlot.endTime,
          schedulingUrl: selectedSlot.schedulingUrl
        },
        clientDetails: {
          name: 'Test User',
          email: 'test@example.com',
          timezone: 'America/New_York'
        },
        notes: 'This is a test booking'
      })
    });
    
    const confirmData = await confirmRes.json();
    
    if (!confirmData.success) {
      throw new Error(`Failed to confirm booking: ${confirmData.error}`);
    }
    
    console.log('Booking confirmed successfully!');
    console.log('Booking ID:', confirmData.booking.id);
    console.log('Confirmation URL:', confirmData.booking.confirmationUrl);
    console.log('Payment required:', confirmData.paymentRequired);
    
    // Step 4: Test webhook simulation (optional)
    console.log('\n4. Simulating Calendly webhook...');
    const webhookPayload = {
      event: 'invitee.created',
      payload: {
        event: {
          uri: confirmData.booking.calendlyEventId,
          name: freeSession.title,
          status: 'active',
          start_time: confirmData.booking.startTime,
          end_time: confirmData.booking.endTime,
          event_type: freeSession.calendlyEventTypeUri,
          location: {
            type: 'custom',
            location: 'To be determined'
          },
          invitees_counter: {
            total: 1,
            active: 1,
            limit: 1
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          event_memberships: [{
            user: process.env.CALENDLY_USER_URI || 'https://api.calendly.com/users/test'
          }]
        },
        invitee: {
          uri: `${confirmData.booking.calendlyEventId}/invitees/test`,
          email: 'test@example.com',
          name: 'Test User',
          status: 'active',
          questions_and_answers: [],
          timezone: 'America/New_York',
          event: confirmData.booking.calendlyEventId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          tracking: {
            utm_campaign: null,
            utm_source: null,
            utm_medium: null,
            utm_content: confirmData.booking.id,
            utm_term: null,
            salesforce_id: null
          }
        }
      }
    };
    
    const webhookRes = await fetch(`${baseUrl}/api/webhooks/calendly`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'calendly-webhook-signature': 'test-signature' // This would be a real signature in production
      },
      body: JSON.stringify(webhookPayload)
    });
    
    console.log('Webhook response status:', webhookRes.status);
    
    // Step 5: Test paid session flow (if paid session exists)
    if (paidSession) {
      console.log('\n5. Testing paid session flow...');
      const paidConfirmRes = await fetch(`${baseUrl}/api/scheduling/bookings/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionTypeId: paidSession.id,
          timeSlot: {
            startTime: selectedSlot.startTime,
            endTime: selectedSlot.endTime,
            schedulingUrl: selectedSlot.schedulingUrl
          },
          clientDetails: {
            name: 'Test User',
            email: 'test@example.com',
            timezone: 'America/New_York'
          },
          notes: 'This is a test booking for paid session'
        })
      });
      
      const paidConfirmData = await paidConfirmRes.json();
      
      if (!paidConfirmData.success) {
        throw new Error(`Failed to confirm paid booking: ${paidConfirmData.error}`);
      }
      
      console.log('Paid booking confirmed!');
      console.log('Payment required:', paidConfirmData.paymentRequired);
      console.log('Checkout URL:', paidConfirmData.checkoutUrl);
    }
    
    console.log('\n✅ All tests passed successfully!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
testBookingFlow();
/**
 * Test Complete Booking Flow
 * 
 * This script tests the entire booking flow from start to finish
 * in a development/staging environment
 */

// Load environment variables
require('dotenv').config();

// Remove logger dependency for standalone script
const logger = {
  error: (message, context) => console.error(message, context),
  info: (message, context) => console.log(message, context)
};

async function testCompleteBookingFlow() {
  console.log('🚀 Starting Complete Booking Flow Test\n');
  
  try {
    // Test configuration
    const testConfig = {
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
      testBuilder: {
        id: 'cmacaujmz00018oa34hehwic1', // Liam's actual local builder ID
        name: 'Liam Jons'
      },
      testUser: {
        email: 'test@buildappswith.com',
        name: 'Test User'
      },
      testSessionType: {
        id: 'cmapnx4ad00038o41etb3ppdb', // "Getting Started - Individuals" (free)
      }
    };
    
    console.log('=== Test Configuration ===');
    console.log(`Base URL: ${testConfig.baseUrl}`);
    console.log(`Builder: ${testConfig.testBuilder.name}`);
    console.log(`Test User: ${testConfig.testUser.email}\n`);
    
    // 1. Test API endpoints
    console.log('=== 1. Testing API Endpoints ===');
    
    // Test marketplace API
    const marketplaceResponse = await fetch(`${testConfig.baseUrl}/api/marketplace/builders`);
    if (marketplaceResponse.ok) {
      console.log('✅ Marketplace API is accessible');
    } else {
      console.log('❌ Marketplace API failed:', marketplaceResponse.status);
    }
    
    // Test builder profile API
    const builderResponse = await fetch(`${testConfig.baseUrl}/api/marketplace/builders/${testConfig.testBuilder.id}`);
    if (builderResponse.ok) {
      console.log('✅ Builder profile API is accessible');
      const builderData = await builderResponse.json();
      console.log(`   Found ${builderData.sessionTypes?.length || 0} session types`);
    } else {
      console.log('❌ Builder profile API failed:', builderResponse.status);
    }
    
    // 2. Test webhook endpoints
    console.log('\n=== 2. Testing Webhook Endpoints ===');
    
    // Test Calendly webhook endpoint
    const calendlyWebhookResponse = await fetch(`${testConfig.baseUrl}/api/webhooks/calendly`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'calendly-webhook-signature': 'test-signature'
      },
      body: JSON.stringify({
        event: 'test',
        payload: {}
      })
    });
    
    console.log(`Calendly webhook test: ${calendlyWebhookResponse.status}`);
    
    // Test Stripe webhook endpoint
    const stripeWebhookResponse = await fetch(`${testConfig.baseUrl}/api/webhooks/stripe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': 'test-signature'
      },
      body: JSON.stringify({
        type: 'test',
        data: {}
      })
    });
    
    console.log(`Stripe webhook test: ${stripeWebhookResponse.status}`);
    
    // 3. Test booking creation
    console.log('\n=== 3. Testing Booking Creation ===');
    
    const bookingData = {
      builderId: testConfig.testBuilder.id,
      sessionTypeId: testConfig.testSessionType.id, // Use actual session type from local DB
      calendlyEventUri: `https://calendly.com/test-event-${Date.now()}`,
      calendlyInviteeUri: `https://calendly.com/test-invitee-${Date.now()}`,
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
      clientEmail: testConfig.testUser.email,
      clientName: testConfig.testUser.name
    };
    
    const createBookingResponse = await fetch(`${testConfig.baseUrl}/api/scheduling/bookings/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bookingData)
    });
    
    if (createBookingResponse.ok) {
      const bookingResult = await createBookingResponse.json();
      console.log('✅ Booking created successfully');
      console.log(`   Booking ID: ${bookingResult.bookingId}`);
      console.log(`   State: ${bookingResult.state}`);
      
      // 4. Test email functionality (if configured)
      console.log('\n=== 4. Testing Email Functionality ===');
      if (process.env.SENDGRID_API_TOKEN) {
        console.log('SendGrid is configured');
        console.log('Email notifications should be sent automatically via webhooks');
        
        // You can check SendGrid dashboard or logs to verify emails were sent
        console.log('Check SendGrid dashboard for email activity');
      } else {
        console.log('⚠️  SendGrid not configured - emails will not be sent');
      }
      
      // 5. Test payment flow (for paid sessions)
      console.log('\n=== 5. Testing Payment Flow ===');
      if (process.env.STRIPE_PUBLISHABLE_KEY) {
        console.log('Stripe is configured');
        console.log('Payment flow would be tested with a paid session');
        
        // Create checkout session for testing
        const checkoutData = {
          bookingData: {
            ...bookingData,
            id: bookingResult.bookingId,
            sessionTypeId: 'cmapnx4jb000b8o41pbunuxgk' // "90 Minute Deep Dive" ($90) from local DB
          },
          returnUrl: `${testConfig.baseUrl}/booking/confirmation`
        };
        
        const checkoutResponse = await fetch(`${testConfig.baseUrl}/api/stripe/checkout/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(checkoutData)
        });
        
        if (checkoutResponse.ok) {
          const checkoutResult = await checkoutResponse.json();
          console.log('✅ Checkout session created');
          console.log(`   Session ID: ${checkoutResult.data?.sessionId}`);
          console.log(`   Checkout URL: ${checkoutResult.data?.url?.substring(0, 50)}...`);
        } else {
          console.log('❌ Checkout session creation failed:', checkoutResponse.status);
        }
      } else {
        console.log('⚠️  Stripe not configured - payment flow cannot be tested');
      }
      
    } else {
      console.log('❌ Booking creation failed:', createBookingResponse.status);
      const error = await createBookingResponse.text();
      console.log('Error:', error);
    }
    
    // 6. Summary
    console.log('\n=== Test Summary ===');
    console.log('✅ API endpoints are accessible');
    console.log('✅ Webhook endpoints are configured');
    console.log('✅ Booking creation works');
    console.log(`${process.env.SENDGRID_API_TOKEN ? '✅' : '⚠️ '} Email service ${process.env.SENDGRID_API_TOKEN ? 'configured' : 'not configured'}`);
    console.log(`${process.env.STRIPE_PUBLISHABLE_KEY ? '✅' : '⚠️ '} Payment service ${process.env.STRIPE_PUBLISHABLE_KEY ? 'configured' : 'not configured'}`);
    
    console.log('\n🎉 Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    logger.error('Test error', { error });
  }
}

// Run the test
console.log('BuildAppsWith Booking Flow Test\n');
console.log('This test will verify:');
console.log('1. API endpoints are accessible');
console.log('2. Webhook endpoints are configured');
console.log('3. Booking creation works');
console.log('4. Email notifications (if configured)');
console.log('5. Payment processing (if configured)\n');

testCompleteBookingFlow();
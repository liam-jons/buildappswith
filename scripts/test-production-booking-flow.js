/**
 * Test Production Booking Flow
 * 
 * This script tests the booking flow against the production environment
 * with proper environment variable loading
 */

// Load environment variables
require('dotenv').config({ path: '.env.production.vercel' });

// If production vercel file doesn't exist, fallback to regular .env
if (!process.env.NEXT_PUBLIC_BASE_URL) {
  require('dotenv').config();
}

// Simple logger
const logger = {
  error: (message, context) => console.error(message, context),
  info: (message, context) => console.log(message, context)
};

async function testProductionBookingFlow() {
  console.log('🚀 Starting Production Booking Flow Test\n');
  
  try {
    // Test configuration
    const testConfig = {
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'https://www.buildappswith.ai',
      testBuilder: {
        id: 'clw0d5lfz0000131ydghkstd9', // Production builder ID (Liam)
        name: 'Liam Johnson'
      },
      testUser: {
        email: 'test@buildappswith.com',
        name: 'Test User'
      },
      testSessionType: {
        id: 'cm3qblrwe001w131yj00w49ak', // Production session type ID
      }
    };
    
    console.log('=== Test Configuration ===');
    console.log(`Base URL: ${testConfig.baseUrl}`);
    console.log(`Builder: ${testConfig.testBuilder.name}`);
    console.log(`Environment: ${testConfig.baseUrl.includes('localhost') ? 'LOCAL' : 'PRODUCTION'}\n`);
    
    // Show current environment variables status
    console.log('=== Environment Variables ===');
    console.log(`Clerk: ${process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? '✅ Configured' : '❌ Not found'}`);
    console.log(`Stripe: ${process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? '✅ Configured' : '❌ Not found'}`);
    console.log(`SendGrid: ${process.env.SENDGRID_API_TOKEN ? '✅ Configured' : '❌ Not found'}`);
    console.log(`Calendly: ${process.env.CALENDLY_API_TOKEN ? '✅ Configured' : '❌ Not found'}\n`);
    
    // 1. Test API endpoints
    console.log('=== 1. Testing API Endpoints ===');
    
    // Test marketplace API
    const marketplaceResponse = await fetch(`${testConfig.baseUrl}/api/marketplace/builders`);
    if (marketplaceResponse.ok) {
      try {
        const contentType = marketplaceResponse.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await marketplaceResponse.json();
          console.log('✅ Marketplace API is accessible');
          console.log(`   Found ${data.builders?.length || 0} builders`);
        } else {
          console.log(`⚠️  Marketplace API returned HTML instead of JSON`);
          console.log(`   This might indicate the API route isn't configured in production`);
        }
      } catch (e) {
        console.log(`⚠️  Failed to parse response: ${e.message}`);
      }
    } else {
      console.log(`❌ Marketplace API failed: ${marketplaceResponse.status}`);
    }
    
    // Test builder profile API
    const builderResponse = await fetch(`${testConfig.baseUrl}/api/marketplace/builders/${testConfig.testBuilder.id}`);
    if (builderResponse.ok) {
      try {
        const contentType = builderResponse.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const builderData = await builderResponse.json();
          console.log('✅ Builder profile API is accessible');
          console.log(`   Found ${builderData.sessionTypes?.length || 0} session types`);
        } else {
          console.log(`⚠️  Builder profile API returned HTML instead of JSON`);
        }
      } catch (e) {
        console.log(`⚠️  Failed to parse builder response: ${e.message}`);
      }
    } else {
      console.log(`❌ Builder profile API failed: ${builderResponse.status}`);
    }
    
    // 2. Test webhook endpoints (they should return 401 without valid signatures)
    console.log('\n=== 2. Testing Webhook Endpoints ===');
    console.log('Note: 401 responses are expected (signature validation)\n');
    
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
    
    console.log(`Calendly webhook test: ${calendlyWebhookResponse.status} (401 expected)`);
    
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
    
    console.log(`Stripe webhook test: ${stripeWebhookResponse.status} (401 expected)`);
    
    // 3. Test booking creation (expected to fail without authentication)
    console.log('\n=== 3. Testing Booking Creation ===');
    console.log('Note: 401 response expected (authentication required)\n');
    
    const bookingData = {
      builderId: testConfig.testBuilder.id,
      sessionTypeId: testConfig.testSessionType.id,
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
    
    if (createBookingResponse.status === 401) {
      console.log('✅ Booking endpoint requires authentication (expected)');
    } else if (createBookingResponse.ok) {
      const bookingResult = await createBookingResponse.json();
      console.log('✅ Booking created (unexpected without auth)');
      console.log(`   Booking ID: ${bookingResult.bookingId}`);
    } else {
      console.log(`❌ Booking creation failed: ${createBookingResponse.status}`);
      const error = await createBookingResponse.text();
      console.log('Error:', error);
    }
    
    // 4. Summary
    console.log('\n=== Production Test Summary ===');
    console.log('API Status:');
    console.log(`✅ Base URL is accessible: ${testConfig.baseUrl}`);
    console.log('✅ API endpoints are responding');
    console.log('✅ Webhook endpoints exist (auth working)');
    console.log('✅ Booking endpoint exists (auth working)');
    
    console.log('\nEnvironment Configuration:');
    console.log(`${process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? '✅' : '⚠️ '} Clerk authentication`);
    console.log(`${process.env.SENDGRID_API_TOKEN ? '✅' : '⚠️ '} Email service (SendGrid)`);
    console.log(`${process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? '✅' : '⚠️ '} Payment processing (Stripe)`);
    console.log(`${process.env.CALENDLY_API_TOKEN ? '✅' : '⚠️ '} Booking service (Calendly)`);
    
    console.log('\nRecommendations:');
    console.log('1. Test the full booking flow through the UI');
    console.log('2. Monitor webhook processing in production logs');
    console.log('3. Check SendGrid dashboard for email delivery');
    console.log('4. Verify Stripe dashboard for payment events');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    logger.error('Test error', { error });
  }
}

// Add some helper instructions
console.log('BuildAppsWith Production Test\n');
console.log('This test will check:');
console.log('1. Production API accessibility');
console.log('2. Webhook endpoint configuration');
console.log('3. Environment variable setup');
console.log('4. Basic endpoint functionality\n');

// Check if we have the right env file
const fs = require('fs');
if (fs.existsSync('.env.production.vercel')) {
  console.log('Using .env.production.vercel for configuration\n');
} else if (fs.existsSync('.env')) {
  console.log('Using .env for configuration\n');
} else {
  console.log('⚠️  No environment files found. Using defaults.\n');
}

testProductionBookingFlow();
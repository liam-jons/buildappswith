/**
 * Test Booking Flow - Local Development
 * 
 * This script tests the booking flow in local development
 * accounting for authentication and data requirements
 */

const https = require('https');
const http = require('http');

// Simple logger
const logger = {
  error: (message, context) => console.error(message, context),
  info: (message, context) => console.log(message, context)
};

async function makeRequest(url, options = {}) {
  const protocol = url.startsWith('https') ? https : http;
  const urlObj = new URL(url);
  
  const defaultOptions = {
    hostname: urlObj.hostname,
    port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
    path: urlObj.pathname + urlObj.search,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  };
  
  const requestOptions = { ...defaultOptions, ...options };
  
  return new Promise((resolve, reject) => {
    const req = protocol.request(requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          ok: res.statusCode >= 200 && res.statusCode < 300,
          text: () => Promise.resolve(data),
          json: () => Promise.resolve(JSON.parse(data || '{}'))
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function testBookingFlowLocal() {
  console.log('🚀 Starting Local Booking Flow Test\n');
  
  try {
    // Test configuration
    const testConfig = {
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
      // Use a builder ID that should exist in your local database
      testBuilder: {
        id: 'clw0d5lfz0000131ydghkstd9', // This might not exist locally
        name: 'Test Builder'
      },
      testUser: {
        email: 'test@buildappswith.com',
        name: 'Test User'
      }
    };
    
    console.log('=== Test Configuration ===');
    console.log(`Base URL: ${testConfig.baseUrl}`);
    console.log(`NOTE: Make sure your local server is running on port 3000\n`);
    
    // 1. Test basic connectivity
    console.log('=== 1. Testing Basic Connectivity ===');
    
    try {
      const homeResponse = await makeRequest(`${testConfig.baseUrl}/`);
      if (homeResponse.ok) {
        console.log('✅ Server is running and accessible');
      } else {
        console.log(`⚠️  Server responded with status: ${homeResponse.status}`);
      }
    } catch (error) {
      console.log('❌ Server is not accessible. Make sure it\'s running.');
      console.log('   Run: pnpm dev');
      return;
    }
    
    // 2. Test public API endpoints
    console.log('\n=== 2. Testing Public API Endpoints ===');
    
    // Test marketplace API (should be public)
    try {
      const marketplaceResponse = await makeRequest(`${testConfig.baseUrl}/api/marketplace/builders`);
      if (marketplaceResponse.ok) {
        console.log('✅ Marketplace API is accessible');
        const data = await marketplaceResponse.json();
        console.log(`   Found ${data.builders?.length || 0} builders`);
        
        // If we have builders, use the first one for testing
        if (data.builders && data.builders.length > 0) {
          testConfig.testBuilder.id = data.builders[0].id;
          console.log(`   Using builder ID: ${testConfig.testBuilder.id}`);
        }
      } else {
        console.log(`⚠️  Marketplace API returned: ${marketplaceResponse.status}`);
      }
    } catch (error) {
      console.log('❌ Error accessing marketplace API:', error.message);
    }
    
    // 3. Test webhook endpoints (expected to fail without proper signatures)
    console.log('\n=== 3. Testing Webhook Endpoints ===');
    console.log('NOTE: Webhooks should return 401 without valid signatures - this is expected\n');
    
    // Test Calendly webhook
    try {
      const calendlyResponse = await makeRequest(`${testConfig.baseUrl}/api/webhooks/calendly`, {
        method: 'POST',
        body: JSON.stringify({ event: 'test', payload: {} })
      });
      console.log(`Calendly webhook: ${calendlyResponse.status} (401 is expected)`);
    } catch (error) {
      console.log('Calendly webhook error:', error.message);
    }
    
    // Test Stripe webhook
    try {
      const stripeResponse = await makeRequest(`${testConfig.baseUrl}/api/webhooks/stripe`, {
        method: 'POST',
        body: JSON.stringify({ type: 'test', data: {} })
      });
      console.log(`Stripe webhook: ${stripeResponse.status} (401 is expected)`);
    } catch (error) {
      console.log('Stripe webhook error:', error.message);
    }
    
    // 4. Test authenticated endpoints
    console.log('\n=== 4. Testing Authenticated Endpoints ===');
    console.log('NOTE: These endpoints require authentication and will fail without it\n');
    
    // Test booking creation (will fail without auth)
    try {
      const bookingData = {
        builderId: testConfig.testBuilder.id,
        sessionTypeId: 'test-session-type',
        calendlyEventUri: `https://calendly.com/test-event-${Date.now()}`,
        calendlyInviteeUri: `https://calendly.com/test-invitee-${Date.now()}`,
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
        clientEmail: testConfig.testUser.email,
        clientName: testConfig.testUser.name
      };
      
      const bookingResponse = await makeRequest(`${testConfig.baseUrl}/api/scheduling/bookings/create`, {
        method: 'POST',
        body: JSON.stringify(bookingData)
      });
      
      if (bookingResponse.ok) {
        console.log('✅ Booking creation endpoint is accessible (unexpected)');
      } else if (bookingResponse.status === 401) {
        console.log('✅ Booking creation requires authentication (expected)');
      } else {
        console.log(`⚠️  Booking creation returned: ${bookingResponse.status}`);
        const error = await bookingResponse.text();
        console.log('   Response:', error);
      }
    } catch (error) {
      console.log('Booking creation error:', error.message);
    }
    
    // 5. Environment check
    console.log('\n=== 5. Environment Configuration ===');
    
    const envChecks = {
      'Clerk Auth': !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
      'Database': !!process.env.DATABASE_URL,
      'Calendly': !!process.env.CALENDLY_API_TOKEN,
      'Stripe': !!process.env.STRIPE_PUBLISHABLE_KEY,
      'SendGrid': !!process.env.SENDGRID_API_TOKEN
    };
    
    Object.entries(envChecks).forEach(([service, configured]) => {
      console.log(`${configured ? '✅' : '⚠️ '} ${service}: ${configured ? 'Configured' : 'Not configured'}`);
    });
    
    // 6. Database check
    console.log('\n=== 6. Database Check ===');
    console.log('To verify your database has the correct data:');
    console.log('1. Run: npx prisma studio');
    console.log('2. Check that you have:');
    console.log('   - At least one Builder record');
    console.log('   - Session types associated with builders');
    console.log('   - User records for testing');
    
    // Summary
    console.log('\n=== Test Summary ===');
    console.log('This test verifies:');
    console.log('✅ Server connectivity');
    console.log('✅ Public API endpoints');
    console.log('✅ Webhook endpoints exist (auth required)');
    console.log('✅ Authenticated endpoints exist (auth required)');
    console.log('\nFor full testing with authentication:');
    console.log('1. Use the web UI to test the complete flow');
    console.log('2. Check browser console for API calls');
    console.log('3. Monitor server logs for details');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Add some helper instructions
console.log('BuildAppsWith Local Development Test\n');
console.log('Prerequisites:');
console.log('1. Local server running (pnpm dev)');
console.log('2. Database migrated and seeded');
console.log('3. Environment variables configured\n');

console.log('To seed your database with test data:');
console.log('1. npx prisma migrate dev');
console.log('2. npx prisma db seed');
console.log('3. Check data with: npx prisma studio\n');

testBookingFlowLocal();
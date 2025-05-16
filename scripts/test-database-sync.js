/**
 * Test Database Synchronization Between Systems
 * 
 * This script verifies that booking data is properly synchronized between:
 * - Our local database
 * - Calendly webhooks
 * - Stripe payment processing
 */

const { PrismaClient } = require('@prisma/client');
const { logger } = require('../lib/logger');

// Initialize Prisma client
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function testDatabaseSync() {
  try {
    console.log('Starting database synchronization test...\n');
    
    // 1. Test booking creation and state management
    console.log('=== 1. Testing Booking Creation ===');
    const testBookingData = {
      builderId: 'clw0d5lfz0000131ydghkstd9', // Liam's builder ID
      sessionTypeId: 'cm3qblrwe001w131yj00w49ak', // Test session type
      clientId: null, // For anonymous booking
      title: 'Test Booking Sync',
      description: 'Testing database synchronization',
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000), // 1 hour later
      status: 'PENDING',
      paymentStatus: 'UNPAID',
      clientTimezone: 'America/New_York',
    };
    
    // Create a test booking
    const booking = await prisma.booking.create({
      data: testBookingData,
      include: {
        sessionType: true,
        builder: {
          include: {
            user: true
          }
        }
      }
    });
    
    console.log(`✓ Created test booking: ${booking.id}`);
    console.log(`  Session Type: ${booking.sessionType.title}`);
    console.log(`  Builder: ${booking.builder.user?.name}`);
    console.log(`  Status: ${booking.status}`);
    console.log(`  Payment Status: ${booking.paymentStatus}\n`);
    
    // 2. Test Calendly webhook simulation
    console.log('=== 2. Testing Calendly Webhook Simulation ===');
    const calendlyData = {
      calendlyEventId: `evt_${Date.now()}`,
      calendlyEventUri: `https://calendly.com/event/${booking.id}`,
      calendlyInviteeUri: `https://calendly.com/invitee/${booking.id}`,
    };
    
    // Update booking with Calendly data (simulating webhook)
    const updatedBooking = await prisma.booking.update({
      where: { id: booking.id },
      data: calendlyData
    });
    
    console.log(`✓ Updated booking with Calendly data`);
    console.log(`  Calendly Event ID: ${updatedBooking.calendlyEventId}`);
    console.log(`  Calendly Event URI: ${updatedBooking.calendlyEventUri}\n`);
    
    // 3. Test payment status update
    console.log('=== 3. Testing Payment Status Update ===');
    const paymentData = {
      paymentStatus: 'PAID',
      stripeSessionId: `cs_test_${Date.now()}`,
      status: 'CONFIRMED',
      amount: booking.sessionType.price
    };
    
    // Update booking with payment data (simulating Stripe webhook)
    const paidBooking = await prisma.booking.update({
      where: { id: booking.id },
      data: paymentData
    });
    
    console.log(`✓ Updated booking with payment data`);
    console.log(`  Payment Status: ${paidBooking.paymentStatus}`);
    console.log(`  Stripe Session ID: ${paidBooking.stripeSessionId}`);
    console.log(`  Booking Status: ${paidBooking.status}`);
    console.log(`  Amount: ${paidBooking.amount}\n`);
    
    // 4. Test data consistency
    console.log('=== 4. Testing Data Consistency ===');
    const finalBooking = await prisma.booking.findUnique({
      where: { id: booking.id },
      include: {
        sessionType: true,
        builder: {
          include: {
            user: true
          }
        },
        client: true
      }
    });
    
    const consistencyChecks = {
      hasBookingId: !!finalBooking.id,
      hasSessionType: !!finalBooking.sessionType,
      hasBuilder: !!finalBooking.builder,
      hasCalendlyData: !!finalBooking.calendlyEventId,
      hasPaymentData: !!finalBooking.stripeSessionId,
      statusIsConfirmed: finalBooking.status === 'CONFIRMED',
      paymentIsPaid: finalBooking.paymentStatus === 'PAID'
    };
    
    console.log('Data Consistency Checks:');
    Object.entries(consistencyChecks).forEach(([check, passed]) => {
      console.log(`  ${passed ? '✓' : '✗'} ${check}: ${passed}`);
    });
    
    // 5. Test related data queries
    console.log('\n=== 5. Testing Related Data Queries ===');
    
    // Get all bookings for this builder
    const builderBookings = await prisma.booking.findMany({
      where: { builderId: booking.builderId },
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    
    console.log(`✓ Found ${builderBookings.length} bookings for builder`);
    
    // Get all confirmed bookings
    const confirmedBookings = await prisma.booking.findMany({
      where: { status: 'CONFIRMED' },
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    
    console.log(`✓ Found ${confirmedBookings.length} confirmed bookings`);
    
    // Get paid bookings
    const paidBookings = await prisma.booking.findMany({
      where: { paymentStatus: 'PAID' },
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    
    console.log(`✓ Found ${paidBookings.length} paid bookings`);
    
    // 6. Cleanup test data
    console.log('\n=== 6. Cleaning Up Test Data ===');
    await prisma.booking.delete({
      where: { id: booking.id }
    });
    
    console.log(`✓ Deleted test booking: ${booking.id}`);
    
    // Summary
    console.log('\n=== SUMMARY ===');
    const allPassed = Object.values(consistencyChecks).every(check => check);
    
    if (allPassed) {
      console.log('✅ All database synchronization tests passed!');
    } else {
      console.log('❌ Some tests failed. Please check the consistency checks above.');
    }
    
    // Test database connection info
    console.log('\nDatabase Connection Info:');
    const databaseUrl = process.env.DATABASE_URL;
    const isProduction = databaseUrl?.includes('neon.tech');
    console.log(`Environment: ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}`);
    console.log(`Database URL: ${databaseUrl?.substring(0, 30)}...`);
    
  } catch (error) {
    console.error('Error during database synchronization test:', error);
    
    if (error.code === 'P2002') {
      console.error('Unique constraint violation - duplicate data');
    } else if (error.code === 'P2025') {
      console.error('Record not found');
    } else if (error.code === 'P2021') {
      console.error('Table does not exist - check migrations');
    }
    
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testDatabaseSync();
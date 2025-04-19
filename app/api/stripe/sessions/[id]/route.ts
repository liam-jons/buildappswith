import { NextRequest, NextResponse } from 'next/server';
import { Stripe } from 'stripe';

// Initialize Stripe with the secret key from environment variables
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: '2025-03-31.basil' as const, // Updated to match expected version format
});

/**
 * GET handler for retrieving a Stripe session
 * Updated to use Next.js 15 promise-based params
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // Await the params to get the id
  const params = await context.params;
  const sessionId = params.id;

  if (!sessionId) {
    return NextResponse.json(
      { error: 'Session ID is required' },
      { status: 400 }
    );
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent', 'customer'],
    });

    // In a real implementation, you would also fetch the booking details from your database
    // using the metadata from the session

    return NextResponse.json({
      id: session.id,
      status: session.status,
      customerEmail: session.customer_details?.email,
      paymentStatus: session.payment_status,
      // This would come from your database in a real implementation
      booking: {
        id: session.metadata?.bookingId,
        sessionType: 'Featured Builder Consultation', // This would come from your database
        startTime: session.metadata?.startTime,
        endTime: session.metadata?.endTime,
        builderId: session.metadata?.builderId,
        clientId: session.metadata?.clientId,
        builderName: 'Featured Builder', // This would come from your database
      },
    });
  } catch (error: any) {
    console.error('Error retrieving Stripe session:', error);
    
    // Check if it's a Stripe error
    if (error.type === 'StripeInvalidRequestError') {
      return NextResponse.json(
        { error: 'Invalid session ID' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Error retrieving session details' },
      { status: 500 }
    );
  }
}
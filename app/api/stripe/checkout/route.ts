import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialize Stripe with the secret key from environment variables
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10', // Use the latest API version
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingData, returnUrl } = body;

    if (!bookingData || !returnUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Extract session type information from booking data
    const { sessionTypeId, startTime, endTime } = bookingData;

    // TODO: In a real implementation, fetch the actual session type from a database
    // For now, we'll use a mock session type based on the ID
    const sessionType = {
      id: sessionTypeId,
      title: 'Featured Builder Consultation',
      description: 'One-on-one session with a featured AI app builder',
      price: 9900, // $99.00 in cents
      currency: 'usd',
    };

    // Format the booking date/time for display in Stripe
    const startDate = new Date(startTime);
    const formattedDateTime = startDate.toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    // Create a Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: sessionType.currency,
            product_data: {
              name: sessionType.title,
              description: `${sessionType.description} (${formattedDateTime})`,
            },
            unit_amount: sessionType.price,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${returnUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${returnUrl}/cancel`,
      metadata: {
        bookingId: bookingData.id,
        sessionTypeId: sessionTypeId,
        startTime,
        endTime,
        builderId: bookingData.builderId,
        clientId: bookingData.clientId,
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Error creating checkout session' },
      { status: 500 }
    );
  }
}

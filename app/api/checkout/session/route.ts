import { auth } from "@/lib/auth/auth";
import { createBookingCheckoutSession } from "@/lib/stripe/stripe-server";
import { NextRequest, NextResponse } from "next/server";

// Mock builder data - In a real implementation, this would come from a database
const builders = {
  "builder-id": {
    id: "builder-id",
    name: "Aisha Builder",
    sessionTypes: {
      "initial-consultation": {
        name: "Initial Consultation",
        description: "Discuss your project requirements and get a quote",
        duration: 60, // minutes
        price: 50, // USD
      },
      "development-session": {
        name: "Development Session",
        description: "Work on your project with real-time feedback",
        duration: 120, // minutes
        price: 100, // USD
      },
    },
  },
};

export async function POST(req: NextRequest) {
  try {
    // Authenticate the user
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    // Get the user from the session
    const user = session.user;
    
    // Get the request body
    const {
      builderId,
      sessionType,
      startTime,
      endTime,
      timeZone,
    } = await req.json();
    
    // Validate required fields
    if (!builderId || !sessionType || !startTime || !endTime || !timeZone) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // Find the builder
    const builder = builders[builderId];
    if (!builder) {
      return NextResponse.json(
        { error: "Builder not found" },
        { status: 404 }
      );
    }
    
    // Find the session type
    const sessionTypeDetails = builder.sessionTypes[sessionType];
    if (!sessionTypeDetails) {
      return NextResponse.json(
        { error: "Session type not found" },
        { status: 404 }
      );
    }
    
    // Create the checkout session
    const checkoutSession = await createBookingCheckoutSession({
      builderId: builder.id,
      builderName: builder.name,
      sessionType: sessionTypeDetails.name,
      sessionPrice: sessionTypeDetails.price,
      startTime,
      endTime,
      timeZone,
      customerId: user.stripeCustomerId,
      userId: user.id,
      userEmail: user.email || "",
      userName: user.name,
      successUrl: `${req.nextUrl.origin}/bookings/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${req.nextUrl.origin}/bookings/cancel`,
    });
    
    // Return the checkout session ID
    return NextResponse.json({ id: checkoutSession.id });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}

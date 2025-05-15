import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { db } from "@/lib/db";
import { z } from "zod";

const createBookingSchema = z.object({
  sessionTypeId: z.string(),
  builderId: z.string(),
  clientEmail: z.string().email(),
  clientName: z.string(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  pathway: z.string().optional(),
  customQuestionResponse: z.object({
    question: z.string(),
    answer: z.string(),
    metadata: z.any().optional(),
  }).optional(),
  calendlyEventId: z.string().optional(),
  calendlyEventUri: z.string().optional(),
  calendlyInviteeUri: z.string().optional(),
  clientTimezone: z.string().optional(),
  builderTimezone: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();
    const body = await req.json();
    
    // Validate request body
    const validatedData = createBookingSchema.parse(body);

    // Check if session type exists and get its details
    const sessionType = await db.sessionType.findUnique({
      where: { id: validatedData.sessionTypeId },
      include: {
        builder: {
          select: {
            id: true,
            user: {
              select: {
                email: true,
                name: true,
              }
            }
          }
        }
      }
    });

    if (!sessionType) {
      return NextResponse.json({ error: "Session type not found" }, { status: 404 });
    }

    // Check if authentication is required for this session type
    if (sessionType.requiresAuth && !userId) {
      return NextResponse.json({ 
        error: "Authentication required for this session type" 
      }, { status: 401 });
    }

    // Get or create client user
    let clientUser;
    if (userId) {
      // Authenticated user
      clientUser = await db.user.findUnique({
        where: { clerkId: userId },
        include: { clientProfile: true }
      });
    } else {
      // Unauthenticated user - find or create by email
      clientUser = await db.user.findUnique({
        where: { email: validatedData.clientEmail }
      });

      if (!clientUser) {
        // Create new user for unauthenticated booking
        clientUser = await db.user.create({
          data: {
            email: validatedData.clientEmail,
            name: validatedData.clientName,
            roles: ['CLIENT'],
          }
        });
      }
    }

    if (!clientUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create or update client profile if pathway is specified
    if (validatedData.pathway && !clientUser.clientProfile) {
      await db.clientProfile.create({
        data: {
          userId: clientUser.id,
          pathways: [{
            name: validatedData.pathway,
            startDate: new Date(),
            status: 'active',
            builderId: validatedData.builderId,
            progress: { tier1: [], tier2: [], tier3: [] }
          }]
        }
      });
    } else if (validatedData.pathway && clientUser.clientProfile) {
      // Update existing client profile with new pathway if not already present
      const currentPathways = clientUser.clientProfile.pathways as any[] || [];
      const hasPathway = currentPathways.some(p => p.name === validatedData.pathway);
      
      if (!hasPathway) {
        currentPathways.push({
          name: validatedData.pathway,
          startDate: new Date(),
          status: 'active',
          builderId: validatedData.builderId,
          progress: { tier1: [], tier2: [], tier3: [] }
        });

        await db.clientProfile.update({
          where: { id: clientUser.clientProfile.id },
          data: { pathways: currentPathways }
        });
      }
    }

    // Create the booking
    const booking = await db.booking.create({
      data: {
        builderId: validatedData.builderId,
        clientId: clientUser.id,
        sessionTypeId: validatedData.sessionTypeId,
        title: sessionType.title,
        description: sessionType.description,
        startTime: new Date(validatedData.startTime),
        endTime: new Date(validatedData.endTime),
        status: 'PENDING',
        paymentStatus: sessionType.price.toNumber() > 0 ? 'UNPAID' : 'PAID',
        amount: sessionType.price,
        pathway: validatedData.pathway,
        customQuestionResponse: validatedData.customQuestionResponse,
        calendlyEventId: validatedData.calendlyEventId,
        calendlyEventUri: validatedData.calendlyEventUri,
        calendlyInviteeUri: validatedData.calendlyInviteeUri,
        clientTimezone: validatedData.clientTimezone,
        builderTimezone: validatedData.builderTimezone,
      },
      include: {
        sessionType: true,
        builder: {
          select: {
            id: true,
            displayName: true,
            user: {
              select: {
                name: true,
                email: true,
              }
            }
          }
        },
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    // If this is a free session, automatically confirm it
    if (sessionType.price.toNumber() === 0) {
      await db.booking.update({
        where: { id: booking.id },
        data: { 
          status: 'CONFIRMED',
          paymentStatus: 'PAID'
        }
      });
    }

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        status: booking.status,
        paymentRequired: sessionType.price.toNumber() > 0,
        sessionType: {
          title: booking.sessionType.title,
          duration: booking.sessionType.durationMinutes,
          price: booking.sessionType.price.toNumber(),
          currency: booking.sessionType.currency,
        },
        builder: {
          name: booking.builder.displayName || booking.builder.user.name,
          email: booking.builder.user.email,
        },
        client: {
          name: booking.client.name,
          email: booking.client.email,
        },
        pathway: booking.pathway,
        startTime: booking.startTime,
        endTime: booking.endTime,
      }
    });

  } catch (error) {
    console.error('Error creating booking:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create booking" },
      { status: 500 }
    );
  }
}
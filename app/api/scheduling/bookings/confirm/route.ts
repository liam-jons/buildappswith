import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { logger } from '@/lib/logger';
import { db } from '@/lib/db';
import { sendBookingConfirmationEmail } from '@/lib/scheduling/email';
import { z } from 'zod';
import { toStandardResponse, ApiErrorCode } from '@/lib/types/api-types';

// Request validation schema
const BookingConfirmSchema = z.object({
  sessionTypeId: z.string(),
  timeSlot: z.object({
    startTime: z.string().transform(val => new Date(val)),
    endTime: z.string().transform(val => new Date(val)),
    schedulingUrl: z.string().optional()
  }),
  clientDetails: z.object({
    name: z.string(),
    email: z.string().email(),
    timezone: z.string()
  }),
  notes: z.string().optional(),
  bookingId: z.string().optional(), // Optional for unauthenticated users
  pathway: z.string().optional()
});

// Error response helper
function errorResponse(message: string, status: number = 400) {
  return NextResponse.json(
    toStandardResponse(null, {
      error: {
        code: status === 400 ? ApiErrorCode.BAD_REQUEST : 
              status === 404 ? ApiErrorCode.NOT_FOUND :
              status === 401 ? ApiErrorCode.UNAUTHORIZED :
              ApiErrorCode.INTERNAL_ERROR,
        message,
        statusCode: status
      }
    }),
    { status }
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate request body
    const validationResult = BookingConfirmSchema.safeParse(body);
    if (!validationResult.success) {
      logger.warn('Invalid booking confirmation request', {
        errors: validationResult.error.errors
      });
      return errorResponse('Invalid request data', 400);
    }
    
    const { sessionTypeId, timeSlot, clientDetails, notes, bookingId: providedBookingId, pathway } = validationResult.data;
    
    // Get current user (may be null for unauthenticated users)
    const user = await currentUser();
    const userId = user?.id;
    
    logger.info('Creating booking confirmation', {
      sessionTypeId,
      userId,
      clientEmail: clientDetails.email,
      startTime: timeSlot.startTime,
      bookingId: providedBookingId
    });
    
    // Fetch session type details
    const sessionType = await db.sessionType.findUnique({
      where: { id: sessionTypeId },
      include: { 
        builder: {
          include: {
            user: true
          }
        }
      }
    });
    
    if (!sessionType) {
      logger.error('Session type not found', { sessionTypeId });
      return errorResponse('Session type not found', 404);
    }
    
    // Check if session requires authentication
    if (sessionType.requiresAuth && !userId) {
      logger.warn('Authentication required for session', {
        sessionTypeId,
        sessionTitle: sessionType.title
      });
      return errorResponse('Authentication required for this session', 401);
    }
    
    // Check if session requires pathway selection
    if (sessionType.requiresAuth && sessionType.eventTypeCategory === 'pathway' && !pathway) {
      logger.warn('Pathway required for session', {
        sessionTypeId,
        sessionTitle: sessionType.title
      });
      return errorResponse('Pathway selection required for this session', 400);
    }
    
    // Find or create booking record
    let booking;
    if (providedBookingId) {
      // Update existing booking
      booking = await db.booking.findUnique({
        where: { id: providedBookingId }
      });
      
      if (!booking) {
        logger.error('Booking not found', { bookingId: providedBookingId });
        return errorResponse('Booking not found', 404);
      }
    } else {
      // Create new booking (for unauthenticated users)
      booking = await db.booking.create({
        data: {
          builderId: sessionType.builderId,
          sessionTypeId,
          clientId: userId,
          title: `Booking with ${sessionType.title}`,
          status: 'PENDING',
          startTime: new Date(),
          endTime: new Date(Date.now() + 60 * 60 * 1000),
          pathway,
          customQuestionResponse: notes ? { notes } : undefined
        }
      });
    }
    
    // Prepare Calendly invitee data
    const inviteeData = {
      email: clientDetails.email,
      name: clientDetails.name,
      timezone: clientDetails.timezone,
      custom_questions: notes ? [
        {
          question: 'Additional Notes',
          answer: notes
        }
      ] : undefined
    };
    
    // Create booking through Calendly scheduling URL
    let calendlyBooking;
    try {
      // Since Calendly doesn't have a direct API for creating bookings,
      // we create our own booking record and will sync with Calendly through webhooks
      const eventTypeUri = sessionType.calendlyEventTypeUri;
      const eventTypeId = sessionType.calendlyEventTypeId || eventTypeUri?.split('/').pop();
      
      if (!eventTypeId) {
        throw new Error('Missing Calendly event type ID');
      }
      
      // Generate a unique event URI for this booking
      const eventUri = `https://api.calendly.com/scheduled_events/${booking.id}`;
      
      // Create the booking structure that will be synced with Calendly later
      calendlyBooking = {
        uri: eventUri,
        start_time: timeSlot.startTime.toISOString(),
        end_time: timeSlot.endTime.toISOString(),
        event_type: eventTypeUri,
        invitees_counter: { total: 1, active: 1 },
        status: 'pending',
        location: {
          type: 'custom',
          location: 'To be determined'
        }
      };
      
      // Generate Calendly scheduling URL for the user
      const calendlyUsername = process.env.CALENDLY_USERNAME || 'liam-buildappswith';
      const schedulingUrl = `https://calendly.com/${calendlyUsername}/${eventTypeId}?month=${timeSlot.startTime.getMonth() + 1}&date=${timeSlot.startTime.getDate()}&time=${timeSlot.startTime.getHours()}%3A${timeSlot.startTime.getMinutes()}`;
      
      logger.info('Booking created, awaiting Calendly webhook confirmation', {
        bookingId: booking.id,
        eventUri: calendlyBooking.uri,
        startTime: calendlyBooking.start_time,
        schedulingUrl
      });
      
      // Store the scheduling URL for the user to complete booking if needed
      (calendlyBooking as any).scheduling_url = schedulingUrl;
      
    } catch (error) {
      logger.error('Failed to create booking structure', {
        error,
        sessionTypeId,
        eventTypeId: sessionType.calendlyEventTypeId
      });
      
      // Update booking status to failed
      await db.booking.update({
        where: { id: booking.id },
        data: { status: 'CANCELLED' }
      });
      
      return errorResponse('Failed to create booking', 500);
    }
    
    // Update booking with Calendly details
    const updatedBooking = await db.booking.update({
      where: { id: booking.id },
      data: {
        calendlyEventUri: calendlyBooking.uri,
        startTime: timeSlot.startTime,
        endTime: timeSlot.endTime,
        status: sessionType.price.toNumber() > 0 ? 'PENDING' : 'CONFIRMED',
        clientTimezone: clientDetails.timezone
      }
    });
    
    // Send confirmation email (for free sessions)
    if (Number(sessionType.price) === 0) {
      try {
        await sendBookingConfirmationEmail({
          to: clientDetails.email,
          clientName: clientDetails.name,
          sessionTitle: sessionType.title,
          builderName: sessionType.builder.user?.name || 'Builder',
          startTime: timeSlot.startTime,
          endTime: timeSlot.endTime,
          timezone: clientDetails.timezone,
          bookingId: booking.id
        });
      } catch (emailError) {
        logger.error('Failed to send confirmation email', {
          error: emailError,
          bookingId: booking.id
        });
        // Don't fail the booking if email fails
      }
    }
    
    // Prepare response
    const responseData = {
      booking: {
        id: updatedBooking.id,
        calendlyEventId: calendlyBooking.uri,
        confirmationUrl: `/booking/confirmation?bookingId=${updatedBooking.id}`,
        schedulingUrl: (calendlyBooking as any).scheduling_url,
        startTime: timeSlot.startTime.toISOString(),
        endTime: timeSlot.endTime.toISOString(),
        sessionType: {
          title: sessionType.title,
          price: sessionType.price,
          duration: sessionType.durationMinutes
        },
        builder: {
          name: sessionType.builder.user?.name || 'Builder',
          email: sessionType.builder.user?.email || ''
        }
      },
      paymentRequired: sessionType.price.toNumber() > 0,
      checkoutUrl: Number(sessionType.price) > 0 ? `/api/payment/create-checkout?bookingId=${updatedBooking.id}` : undefined
    };
    
    logger.info('Booking confirmation created successfully', {
      bookingId: updatedBooking.id,
      sessionTypeId,
      paymentRequired: sessionType.price.toNumber() > 0
    });
    
    return NextResponse.json(toStandardResponse(responseData));
    
  } catch (error) {
    logger.error('Error confirming booking', { error });
    return errorResponse('Failed to confirm booking', 500);
  }
}
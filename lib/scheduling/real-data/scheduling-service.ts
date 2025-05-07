/**
 * Scheduling Service Implementation
 * 
 * This service provides functionality for managing bookings, availability,
 * and time slots in the booking system. It interfaces with the database
 * through Prisma to handle booking operations.
 * 
 * Version: 1.0.0
 */

import { PrismaClient, Prisma } from '@prisma/client';
import { logger } from '@/lib/logger';
import type { 
  BookingStatus, 
  Booking, 
  SessionType, 
  BookingRequest,
  PaymentStatus
} from '../types';
import { getCalendlyService } from '../calendly';
import { trackBookingEvent, AnalyticsEventType } from '../calendly/analytics';

// Initialize Prisma client
const prisma = new PrismaClient();

/**
 * Get a booking by ID
 * 
 * @param bookingId - The ID of the booking to retrieve
 * @returns The booking if found, null otherwise
 */
export async function getBookingById(bookingId: string): Promise<Booking | null> {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        sessionType: true,
        builder: {
          include: {
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
            name: true,
            email: true,
          }
        }
      }
    });

    if (!booking) {
      return null;
    }

    // Transform the database booking to our API type
    return {
      id: booking.id,
      builderId: booking.builderId,
      clientId: booking.clientId,
      sessionTypeId: booking.sessionTypeId || undefined,
      title: booking.title,
      description: booking.description || undefined,
      startTime: booking.startTime.toISOString(),
      endTime: booking.endTime.toISOString(),
      status: booking.status as BookingStatus,
      paymentStatus: booking.paymentStatus as PaymentStatus,
      amount: booking.amount ? booking.amount.toNumber() : undefined,
      stripeSessionId: booking.stripeSessionId || undefined,
      clientTimezone: booking.clientTimezone || undefined,
      builderTimezone: booking.builderTimezone || undefined,
      calendlyEventId: booking.calendlyEventId || undefined,
      calendlyEventUri: booking.calendlyEventUri || undefined,
      calendlyInviteeUri: booking.calendlyInviteeUri || undefined,
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt.toISOString(),
    };
  } catch (error) {
    logger.error('Error retrieving booking', { error, bookingId });
    throw new Error('Failed to retrieve booking');
  }
}

/**
 * Create a new booking
 * 
 * @param bookingData - The data for the new booking
 * @returns The created booking
 */
export async function createBooking(bookingData: BookingRequest): Promise<Booking> {
  try {
    // Validate session type exists and is active
    const sessionType = await prisma.sessionType.findUnique({
      where: { 
        id: bookingData.sessionTypeId,
        builderId: bookingData.builderId,
        isActive: true
      }
    });

    if (!sessionType) {
      throw new Error('Session type not found or not active');
    }

    // Validate builder exists
    const builder = await prisma.builderProfile.findUnique({
      where: { id: bookingData.builderId }
    });

    if (!builder) {
      throw new Error('Builder not found');
    }

    // Validate client exists
    const client = await prisma.user.findUnique({
      where: { id: bookingData.clientId }
    });

    if (!client) {
      throw new Error('Client not found');
    }

    // Check for scheduling conflicts
    // For Calendly integrations, we'll rely on Calendly to handle conflicts
    if (!bookingData.calendlyEventId) {
      const conflictingBookings = await prisma.booking.findMany({
        where: {
          builderId: bookingData.builderId,
          status: { in: ['PENDING', 'CONFIRMED'] },
          OR: [
            {
              // Starts during existing booking
              startTime: {
                gte: new Date(bookingData.startTime),
                lt: new Date(bookingData.endTime)
              }
            },
            {
              // Ends during existing booking
              endTime: {
                gt: new Date(bookingData.startTime),
                lte: new Date(bookingData.endTime)
              }
            },
            {
              // Completely contains existing booking
              startTime: { lte: new Date(bookingData.startTime) },
              endTime: { gte: new Date(bookingData.endTime) }
            }
          ]
        }
      });

      if (conflictingBookings.length > 0) {
        throw new Error('The selected time slot is no longer available');
      }
    }

    // Create the booking
    const booking = await prisma.booking.create({
      data: {
        builderId: bookingData.builderId,
        clientId: bookingData.clientId,
        sessionTypeId: bookingData.sessionTypeId,
        title: sessionType.title,
        description: bookingData.notes || sessionType.description,
        startTime: new Date(bookingData.startTime),
        endTime: new Date(bookingData.endTime),
        status: 'PENDING',
        paymentStatus: 'UNPAID',
        amount: sessionType.price,
        clientTimezone: bookingData.clientTimezone,
        // Add Calendly fields if provided
        ...(bookingData.calendlyEventId && { 
          calendlyEventId: bookingData.calendlyEventId,
          ...(bookingData.calendlyEventUri && { calendlyEventUri: bookingData.calendlyEventUri }),
          ...(bookingData.calendlyInviteeUri && { calendlyInviteeUri: bookingData.calendlyInviteeUri })
        })
      },
      include: {
        sessionType: true
      }
    });

    logger.info('Created booking', { 
      bookingId: booking.id,
      builderId: booking.builderId,
      clientId: booking.clientId,
      isCalendly: !!bookingData.calendlyEventId
    });

    // Track booking creation in analytics
    trackBookingEvent(AnalyticsEventType.BOOKING_CREATED, {
      bookingId: booking.id,
      builderId: booking.builderId,
      clientId: booking.clientId,
      sessionTypeId: booking.sessionTypeId || '',
      startTime: booking.startTime.toISOString(),
      amount: booking.amount?.toNumber(),
      isCalendly: !!bookingData.calendlyEventId,
      calendlyEventId: bookingData.calendlyEventId
    });

    // Transform the database booking to our API type
    return {
      id: booking.id,
      builderId: booking.builderId,
      clientId: booking.clientId,
      sessionTypeId: booking.sessionTypeId || undefined,
      title: booking.title,
      description: booking.description || undefined,
      startTime: booking.startTime.toISOString(),
      endTime: booking.endTime.toISOString(),
      status: booking.status as BookingStatus,
      paymentStatus: booking.paymentStatus as PaymentStatus,
      amount: booking.amount ? booking.amount.toNumber() : undefined,
      stripeSessionId: booking.stripeSessionId || undefined,
      clientTimezone: booking.clientTimezone || undefined,
      calendlyEventId: booking.calendlyEventId || undefined,
      calendlyEventUri: booking.calendlyEventUri || undefined,
      calendlyInviteeUri: booking.calendlyInviteeUri || undefined,
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt.toISOString(),
    };
  } catch (error) {
    logger.error('Error creating booking', { error, bookingData });
    throw new Error(error instanceof Error ? error.message : 'Failed to create booking');
  }
}

/**
 * Create a booking from Calendly event data
 * 
 * @param calendlyData The Calendly event data
 * @returns The created booking
 */
export async function createBookingFromCalendly(calendlyData: {
  builderId: string;
  clientId: string;
  sessionTypeId: string;
  calendlyEventId: string;
  calendlyEventUri: string;
  calendlyInviteeUri: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  clientTimezone?: string;
  builderTimezone?: string;
}): Promise<Booking> {
  try {
    // Check if booking already exists with this Calendly event ID
    const existingBooking = await prisma.booking.findFirst({
      where: { calendlyEventId: calendlyData.calendlyEventId }
    });

    if (existingBooking) {
      logger.info('Booking already exists for Calendly event', {
        bookingId: existingBooking.id,
        calendlyEventId: calendlyData.calendlyEventId
      });

      // Return the existing booking since it's already created
      return await getBookingById(existingBooking.id) as Booking;
    }

    // Create a new booking from the Calendly data
    return await createBooking({
      builderId: calendlyData.builderId,
      clientId: calendlyData.clientId,
      sessionTypeId: calendlyData.sessionTypeId,
      startTime: calendlyData.startTime,
      endTime: calendlyData.endTime,
      notes: calendlyData.description,
      clientTimezone: calendlyData.clientTimezone,
      calendlyEventId: calendlyData.calendlyEventId,
      calendlyEventUri: calendlyData.calendlyEventUri,
      calendlyInviteeUri: calendlyData.calendlyInviteeUri
    });
  } catch (error) {
    logger.error('Error creating booking from Calendly', { error, calendlyData });
    throw new Error('Failed to create booking from Calendly data');
  }
}

/**
 * Update a booking's payment status
 * 
 * @param bookingId - The ID of the booking to update
 * @param paymentStatus - The new payment status
 * @param stripeSessionId - Optional Stripe session ID
 * @returns The updated booking
 */
export async function updateBookingPayment(
  bookingId: string,
  paymentStatus: string,
  stripeSessionId?: string
): Promise<Booking> {
  try {
    // Verify the booking exists
    const existingBooking = await prisma.booking.findUnique({
      where: { id: bookingId }
    });

    if (!existingBooking) {
      throw new Error('Booking not found');
    }

    // Update the booking with the new payment status
    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        paymentStatus: paymentStatus as PaymentStatus,
        ...(stripeSessionId && { stripeSessionId })
      }
    });

    logger.info('Updated booking payment status', { 
      bookingId, 
      paymentStatus,
      stripeSessionId
    });

    // Track payment status update in analytics
    trackBookingEvent(AnalyticsEventType.PAYMENT_STATUS_UPDATED, {
      bookingId,
      oldStatus: existingBooking.paymentStatus,
      newStatus: paymentStatus,
      stripeSessionId
    });

    // If payment is successful, update booking status to CONFIRMED if it's still PENDING
    if (paymentStatus === 'PAID' && existingBooking.status === 'PENDING') {
      await updateBookingStatus(bookingId, 'CONFIRMED' as BookingStatus);
    }

    // Transform the database booking to our API type
    return {
      id: booking.id,
      builderId: booking.builderId,
      clientId: booking.clientId,
      sessionTypeId: booking.sessionTypeId || undefined,
      title: booking.title,
      description: booking.description || undefined,
      startTime: booking.startTime.toISOString(),
      endTime: booking.endTime.toISOString(),
      status: booking.status as BookingStatus,
      paymentStatus: booking.paymentStatus as PaymentStatus,
      amount: booking.amount ? booking.amount.toNumber() : undefined,
      stripeSessionId: booking.stripeSessionId || undefined,
      clientTimezone: booking.clientTimezone || undefined,
      builderTimezone: booking.builderTimezone || undefined,
      calendlyEventId: booking.calendlyEventId || undefined,
      calendlyEventUri: booking.calendlyEventUri || undefined,
      calendlyInviteeUri: booking.calendlyInviteeUri || undefined,
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt.toISOString(),
    };
  } catch (error) {
    logger.error('Error updating booking payment', { error, bookingId, paymentStatus });
    throw new Error('Failed to update booking payment status');
  }
}

/**
 * Update a booking's status
 * 
 * @param bookingId - The ID of the booking to update
 * @param status - The new booking status
 * @returns The updated booking
 */
export async function updateBookingStatus(
  bookingId: string,
  status: BookingStatus
): Promise<Booking> {
  try {
    // Verify the booking exists
    const existingBooking = await prisma.booking.findUnique({
      where: { id: bookingId }
    });

    if (!existingBooking) {
      throw new Error('Booking not found');
    }

    // Update the booking with the new status
    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: status as string }
    });

    logger.info('Updated booking status', { bookingId, status });

    // Track booking status update in analytics
    trackBookingEvent(AnalyticsEventType.BOOKING_STATUS_UPDATED, {
      bookingId,
      oldStatus: existingBooking.status,
      newStatus: status
    });

    // Transform the database booking to our API type
    return {
      id: booking.id,
      builderId: booking.builderId,
      clientId: booking.clientId,
      sessionTypeId: booking.sessionTypeId || undefined,
      title: booking.title,
      description: booking.description || undefined,
      startTime: booking.startTime.toISOString(),
      endTime: booking.endTime.toISOString(),
      status: booking.status as BookingStatus,
      paymentStatus: booking.paymentStatus as PaymentStatus,
      amount: booking.amount ? booking.amount.toNumber() : undefined,
      stripeSessionId: booking.stripeSessionId || undefined,
      clientTimezone: booking.clientTimezone || undefined,
      builderTimezone: booking.builderTimezone || undefined,
      calendlyEventId: booking.calendlyEventId || undefined,
      calendlyEventUri: booking.calendlyEventUri || undefined,
      calendlyInviteeUri: booking.calendlyInviteeUri || undefined,
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt.toISOString(),
    };
  } catch (error) {
    logger.error('Error updating booking status', { error, bookingId, status });
    throw new Error('Failed to update booking status');
  }
}

/**
 * Get all session types for a builder
 * 
 * @param builderId - The ID of the builder
 * @returns Array of session types
 */
export async function getSessionTypes(builderId: string): Promise<SessionType[]> {
  try {
    // Get session types from the database
    const sessionTypes = await prisma.sessionType.findMany({
      where: {
        builderId,
        isActive: true
      },
      orderBy: {
        price: 'asc'
      }
    });

    // Transform database types to our API types
    return sessionTypes.map(st => ({
      id: st.id,
      builderId: st.builderId,
      title: st.title,
      description: st.description,
      durationMinutes: st.durationMinutes,
      price: st.price.toNumber(),
      currency: st.currency,
      isActive: st.isActive,
      color: st.color || undefined,
      maxParticipants: st.maxParticipants || undefined,
      calendlyEventTypeId: st.calendlyEventTypeId || undefined,
      calendlyEventTypeUri: st.calendlyEventTypeUri || undefined,
      createdAt: st.createdAt.toISOString(),
      updatedAt: st.updatedAt.toISOString(),
    }));
  } catch (error) {
    logger.error('Error retrieving session types', { error, builderId });
    throw new Error('Failed to retrieve session types');
  }
}

/**
 * Get Calendly session types for a builder
 * 
 * This function fetches and syncs Calendly event types with our system
 * 
 * @param builderId - The ID of the builder
 * @returns Array of session types
 */
export async function getCalendlySessionTypes(builderId: string): Promise<SessionType[]> {
  try {
    // Get the Calendly service
    const calendlyService = getCalendlyService();
    
    // Get event types from Calendly
    const eventTypes = await calendlyService.getEventTypes();
    
    // Get existing session types for this builder
    const existingTypes = await prisma.sessionType.findMany({
      where: {
        builderId,
        calendlyEventTypeId: { not: null }
      }
    });
    
    // Create a map of existing types by Calendly event type ID
    const existingTypeMap = new Map(
      existingTypes.map(type => [type.calendlyEventTypeId, type])
    );
    
    // Process each Calendly event type
    const processedTypes = [];
    
    for (const eventType of eventTypes) {
      // Check if this event type already exists
      const existingType = existingTypeMap.get(eventType.calendlyEventTypeId);
      
      if (existingType) {
        // Update the existing type if needed
        if (
          existingType.title !== eventType.title ||
          existingType.description !== eventType.description ||
          existingType.durationMinutes !== eventType.durationMinutes ||
          existingType.calendlyEventTypeUri !== eventType.calendlyEventTypeUri
        ) {
          // Update the session type
          await prisma.sessionType.update({
            where: { id: existingType.id },
            data: {
              title: eventType.title,
              description: eventType.description,
              durationMinutes: eventType.durationMinutes,
              calendlyEventTypeUri: eventType.calendlyEventTypeUri,
              color: eventType.color,
              isActive: eventType.isActive
            }
          });
        }
        
        // Add to processed types
        processedTypes.push({
          id: existingType.id,
          builderId,
          title: eventType.title,
          description: eventType.description,
          durationMinutes: eventType.durationMinutes,
          price: existingType.price.toNumber(),
          currency: existingType.currency,
          isActive: eventType.isActive,
          color: eventType.color || undefined,
          maxParticipants: existingType.maxParticipants || undefined,
          calendlyEventTypeId: eventType.calendlyEventTypeId,
          calendlyEventTypeUri: eventType.calendlyEventTypeUri,
          createdAt: existingType.createdAt.toISOString(),
          updatedAt: existingType.updatedAt.toISOString()
        });
      } else {
        // Create a new session type
        const newType = await prisma.sessionType.create({
          data: {
            builderId,
            title: eventType.title,
            description: eventType.description,
            durationMinutes: eventType.durationMinutes,
            price: 0, // Default price
            currency: 'USD', // Default currency
            isActive: eventType.isActive,
            color: eventType.color,
            calendlyEventTypeId: eventType.calendlyEventTypeId,
            calendlyEventTypeUri: eventType.calendlyEventTypeUri
          }
        });
        
        // Add to processed types
        processedTypes.push({
          id: newType.id,
          builderId,
          title: newType.title,
          description: newType.description,
          durationMinutes: newType.durationMinutes,
          price: newType.price.toNumber(),
          currency: newType.currency,
          isActive: newType.isActive,
          color: newType.color || undefined,
          maxParticipants: newType.maxParticipants || undefined,
          calendlyEventTypeId: newType.calendlyEventTypeId || undefined,
          calendlyEventTypeUri: newType.calendlyEventTypeUri || undefined,
          createdAt: newType.createdAt.toISOString(),
          updatedAt: newType.updatedAt.toISOString()
        });
      }
    }
    
    return processedTypes;
  } catch (error) {
    logger.error('Error retrieving Calendly session types', { error, builderId });
    throw new Error('Failed to retrieve Calendly session types');
  }
}

/**
 * Get all bookings for a user (either as builder or client)
 * 
 * @param userId - The ID of the user
 * @param role - Whether to get bookings as builder or client
 * @returns Array of bookings
 */
export async function getUserBookings(
  userId: string,
  role: 'builder' | 'client'
): Promise<Booking[]> {
  try {
    let whereClause: Prisma.BookingWhereInput = {};
    
    if (role === 'builder') {
      // Find the builder profile first
      const builderProfile = await prisma.builderProfile.findUnique({
        where: { userId }
      });
      
      if (!builderProfile) {
        throw new Error('Builder profile not found for user');
      }
      
      whereClause = { builderId: builderProfile.id };
    } else {
      // Client role
      whereClause = { clientId: userId };
    }
    
    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        sessionType: true,
        builder: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        },
        client: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        startTime: 'desc'
      }
    });

    // Transform database types to our API types
    return bookings.map(booking => ({
      id: booking.id,
      builderId: booking.builderId,
      clientId: booking.clientId,
      sessionTypeId: booking.sessionTypeId || undefined,
      title: booking.title,
      description: booking.description || undefined,
      startTime: booking.startTime.toISOString(),
      endTime: booking.endTime.toISOString(),
      status: booking.status as BookingStatus,
      paymentStatus: booking.paymentStatus as PaymentStatus,
      amount: booking.amount ? booking.amount.toNumber() : undefined,
      stripeSessionId: booking.stripeSessionId || undefined,
      clientTimezone: booking.clientTimezone || undefined,
      builderTimezone: booking.builderTimezone || undefined,
      calendlyEventId: booking.calendlyEventId || undefined,
      calendlyEventUri: booking.calendlyEventUri || undefined,
      calendlyInviteeUri: booking.calendlyInviteeUri || undefined,
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt.toISOString(),
    }));
  } catch (error) {
    logger.error('Error retrieving user bookings', { error, userId, role });
    throw new Error('Failed to retrieve user bookings');
  }
}
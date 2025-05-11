/**
 * Scheduling Service Implementation
 *
 * This service provides functionality for managing bookings, availability,
 * and time slots in the booking system. It interfaces with the database
 * through Prisma to handle booking operations.
 *
 * It primarily uses Calendly for scheduling but maintains a local data model
 * for integration with other system components like payments.
 *
 * Version: 1.1.0
 */

// Re-export additional session type functions
export {
  getSessionTypeById,
  createSessionType,
  updateSessionType,
  deleteSessionType
} from './scheduling-service-ext';

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

/**
 * Get availability exceptions for a builder
 *
 * @param builderId - The ID of the builder
 * @param startDate - Optional start date filter (YYYY-MM-DD)
 * @param endDate - Optional end date filter (YYYY-MM-DD)
 * @returns Array of availability exceptions
 */
export async function getAvailabilityExceptions(
  builderId: string,
  startDate?: string,
  endDate?: string
): Promise<any[]> {
  try {
    // Prepare where clause
    let whereClause: Prisma.AvailabilityExceptionWhereInput = {
      builderId
    };

    // Add date filters if provided
    if (startDate) {
      whereClause.date = {
        gte: startDate
      };
    }

    if (endDate) {
      whereClause.date = {
        ...whereClause.date,
        lte: endDate
      };
    }

    // Query database
    const exceptions = await prisma.availabilityException.findMany({
      where: whereClause,
      orderBy: {
        date: 'asc'
      }
    });

    // Transform to API type
    return exceptions.map(exception => ({
      id: exception.id,
      builderId: exception.builderId,
      date: exception.date,
      isAvailable: exception.isAvailable,
      slots: exception.slots || [],
      reason: exception.reason || undefined,
      createdAt: exception.createdAt.toISOString(),
      updatedAt: exception.updatedAt.toISOString()
    }));
  } catch (error) {
    logger.error('Error retrieving availability exceptions', { error, builderId });
    throw new Error('Failed to retrieve availability exceptions');
  }
}

/**
 * Get an availability exception by ID
 *
 * @param id - The ID of the availability exception
 * @returns The availability exception if found, null otherwise
 */
export async function getAvailabilityExceptionById(id: string): Promise<any | null> {
  try {
    const exception = await prisma.availabilityException.findUnique({
      where: { id }
    });

    if (!exception) {
      return null;
    }

    // Transform to API type
    return {
      id: exception.id,
      builderId: exception.builderId,
      date: exception.date,
      isAvailable: exception.isAvailable,
      slots: exception.slots || [],
      reason: exception.reason || undefined,
      createdAt: exception.createdAt.toISOString(),
      updatedAt: exception.updatedAt.toISOString()
    };
  } catch (error) {
    logger.error('Error retrieving availability exception by ID', { error, id });
    throw new Error('Failed to retrieve availability exception');
  }
}

/**
 * Create a new availability exception
 *
 * @param data - The availability exception data
 * @returns The created availability exception
 */
export async function createAvailabilityException(data: {
  builderId: string;
  date: string;
  isAvailable: boolean;
  slots?: { startTime: string; endTime: string; isBooked?: boolean }[];
  reason?: string;
}): Promise<any> {
  try {
    // Create the exception
    const exception = await prisma.availabilityException.create({
      data: {
        builderId: data.builderId,
        date: data.date,
        isAvailable: data.isAvailable,
        slots: data.slots || [],
        reason: data.reason
      }
    });

    logger.info('Created availability exception', {
      exceptionId: exception.id,
      builderId: exception.builderId,
      date: exception.date
    });

    // Transform to API type
    return {
      id: exception.id,
      builderId: exception.builderId,
      date: exception.date,
      isAvailable: exception.isAvailable,
      slots: exception.slots || [],
      reason: exception.reason || undefined,
      createdAt: exception.createdAt.toISOString(),
      updatedAt: exception.updatedAt.toISOString()
    };
  } catch (error) {
    logger.error('Error creating availability exception', { error, data });
    throw new Error('Failed to create availability exception');
  }
}

/**
 * Update an existing availability exception
 *
 * @param id - The ID of the availability exception to update
 * @param data - The partial availability exception data to update
 * @returns The updated availability exception
 */
export async function updateAvailabilityException(
  id: string,
  data: Partial<{
    isAvailable: boolean;
    slots: { startTime: string; endTime: string; isBooked?: boolean }[];
    reason: string;
  }>
): Promise<any> {
  try {
    // Update the exception
    const exception = await prisma.availabilityException.update({
      where: { id },
      data
    });

    logger.info('Updated availability exception', {
      exceptionId: exception.id,
      builderId: exception.builderId,
      date: exception.date
    });

    // Transform to API type
    return {
      id: exception.id,
      builderId: exception.builderId,
      date: exception.date,
      isAvailable: exception.isAvailable,
      slots: exception.slots || [],
      reason: exception.reason || undefined,
      createdAt: exception.createdAt.toISOString(),
      updatedAt: exception.updatedAt.toISOString()
    };
  } catch (error) {
    logger.error('Error updating availability exception', { error, id, data });
    throw new Error('Failed to update availability exception');
  }
}

/**
 * Delete an availability exception
 *
 * @param id - The ID of the availability exception to delete
 * @returns True if deletion was successful
 */
export async function deleteAvailabilityException(id: string): Promise<boolean> {
  try {
    // Delete the exception
    await prisma.availabilityException.delete({
      where: { id }
    });

    logger.info('Deleted availability exception', { exceptionId: id });

    return true;
  } catch (error) {
    logger.error('Error deleting availability exception', { error, id });
    throw new Error('Failed to delete availability exception');
  }
}

/**
 * Get availability rules for a builder
 *
 * @param builderId - The ID of the builder, or 'all' to get all rules
 * @returns Array of availability rules
 */
export async function getAvailabilityRules(builderId: string): Promise<any[]> {
  try {
    // For Calendly integration, we're using the Calendly API for scheduling,
    // so this is mostly a pass-through that returns default rules
    if (builderId === 'all') {
      // If requesting all rules, fetch from database
      const rules = await prisma.availabilityRule.findMany({
        orderBy: [
          { dayOfWeek: 'asc' },
          { startTime: 'asc' }
        ]
      });

      // Format and return
      return rules.map(rule => ({
        id: rule.id,
        builderId: rule.builderId,
        dayOfWeek: rule.dayOfWeek,
        startTime: rule.startTime,
        endTime: rule.endTime,
        isRecurring: rule.isRecurring,
        createdAt: rule.createdAt.toISOString(),
        updatedAt: rule.updatedAt.toISOString()
      }));
    }

    // Check if the builder uses Calendly integration
    const builder = await prisma.builderProfile.findUnique({
      where: { id: builderId },
      include: {
        schedulingSettings: true
      }
    });

    if (!builder) {
      throw new Error('Builder not found');
    }

    // If builder uses Calendly, return empty rules since Calendly manages availability
    if (builder.schedulingSettings?.useCalendly) {
      logger.info('Builder uses Calendly for availability', { builderId });
      return [];
    }

    // Otherwise get rules from database
    const rules = await prisma.availabilityRule.findMany({
      where: { builderId },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' }
      ]
    });

    return rules.map(rule => ({
      id: rule.id,
      builderId: rule.builderId,
      dayOfWeek: rule.dayOfWeek,
      startTime: rule.startTime,
      endTime: rule.endTime,
      isRecurring: rule.isRecurring,
      createdAt: rule.createdAt.toISOString(),
      updatedAt: rule.updatedAt.toISOString()
    }));
  } catch (error) {
    logger.error('Error retrieving availability rules', { error, builderId });
    throw new Error('Failed to retrieve availability rules');
  }
}

/**
 * Create a new availability rule
 *
 * @param data - The availability rule data
 * @returns The created availability rule
 */
export async function createAvailabilityRule(data: {
  builderId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isRecurring?: boolean;
}): Promise<any> {
  try {
    // Check if the builder uses Calendly integration
    const builder = await prisma.builderProfile.findUnique({
      where: { id: data.builderId },
      include: {
        schedulingSettings: true
      }
    });

    if (!builder) {
      throw new Error('Builder not found');
    }

    if (builder.schedulingSettings?.useCalendly) {
      throw new Error('Builder uses Calendly for availability management. Please update availability in Calendly.');
    }

    // Create the rule
    const rule = await prisma.availabilityRule.create({
      data: {
        builderId: data.builderId,
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
        isRecurring: data.isRecurring ?? true
      }
    });

    logger.info('Created availability rule', {
      ruleId: rule.id,
      builderId: rule.builderId,
      dayOfWeek: rule.dayOfWeek
    });

    // Transform to API type
    return {
      id: rule.id,
      builderId: rule.builderId,
      dayOfWeek: rule.dayOfWeek,
      startTime: rule.startTime,
      endTime: rule.endTime,
      isRecurring: rule.isRecurring,
      createdAt: rule.createdAt.toISOString(),
      updatedAt: rule.updatedAt.toISOString()
    };
  } catch (error) {
    logger.error('Error creating availability rule', { error, data });
    throw new Error(error instanceof Error ? error.message : 'Failed to create availability rule');
  }
}

/**
 * Update an existing availability rule
 *
 * @param id - The ID of the availability rule to update
 * @param data - The partial availability rule data to update
 * @returns The updated availability rule
 */
export async function updateAvailabilityRule(
  id: string,
  data: Partial<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isRecurring: boolean;
    builderId: string;
  }>
): Promise<any> {
  try {
    // Get the existing rule
    const existingRule = await prisma.availabilityRule.findUnique({
      where: { id },
      include: {
        builder: {
          include: {
            schedulingSettings: true
          }
        }
      }
    });

    if (!existingRule) {
      throw new Error('Availability rule not found');
    }

    // Check if the builder uses Calendly integration
    if (existingRule.builder?.schedulingSettings?.useCalendly) {
      throw new Error('Builder uses Calendly for availability management. Please update availability in Calendly.');
    }

    // Update the rule
    const rule = await prisma.availabilityRule.update({
      where: { id },
      data
    });

    logger.info('Updated availability rule', {
      ruleId: rule.id,
      builderId: rule.builderId,
      dayOfWeek: rule.dayOfWeek
    });

    // Transform to API type
    return {
      id: rule.id,
      builderId: rule.builderId,
      dayOfWeek: rule.dayOfWeek,
      startTime: rule.startTime,
      endTime: rule.endTime,
      isRecurring: rule.isRecurring,
      createdAt: rule.createdAt.toISOString(),
      updatedAt: rule.updatedAt.toISOString()
    };
  } catch (error) {
    logger.error('Error updating availability rule', { error, id, data });
    throw new Error(error instanceof Error ? error.message : 'Failed to update availability rule');
  }
}

/**
 * Delete an availability rule
 *
 * @param id - The ID of the availability rule to delete
 * @returns True if deletion was successful
 */
export async function deleteAvailabilityRule(id: string): Promise<boolean> {
  try {
    // Get the existing rule
    const existingRule = await prisma.availabilityRule.findUnique({
      where: { id },
      include: {
        builder: {
          include: {
            schedulingSettings: true
          }
        }
      }
    });

    if (!existingRule) {
      throw new Error('Availability rule not found');
    }

    // Check if the builder uses Calendly integration
    if (existingRule.builder?.schedulingSettings?.useCalendly) {
      throw new Error('Builder uses Calendly for availability management. Please update availability in Calendly.');
    }

    // Delete the rule
    await prisma.availabilityRule.delete({
      where: { id }
    });

    logger.info('Deleted availability rule', { ruleId: id });

    return true;
  } catch (error) {
    logger.error('Error deleting availability rule', { error, id });
    throw new Error(error instanceof Error ? error.message : 'Failed to delete availability rule');
  }
}

/**
 * Get available time slots for a builder
 *
 * This function will use Calendly for builders with Calendly integration
 * and fallback to our system for others.
 *
 * @param builderId - The ID of the builder
 * @param startDate - Start date for the search range (YYYY-MM-DD)
 * @param endDate - End date for the search range (YYYY-MM-DD)
 * @param sessionTypeId - Optional session type ID for filtering
 * @param timezone - Optional timezone for the client
 * @returns Array of available time slots
 */
export async function getAvailableTimeSlots(
  builderId: string,
  startDate: string,
  endDate: string,
  sessionTypeId?: string,
  timezone?: string
): Promise<any[]> {
  try {
    // Check if the builder exists
    const builder = await prisma.builderProfile.findUnique({
      where: { id: builderId },
      include: {
        schedulingSettings: true
      }
    });

    if (!builder) {
      throw new Error('Builder not found');
    }

    // For Calendly integration, delegate to Calendly service
    if (builder.schedulingSettings?.useCalendly) {
      logger.info('Using Calendly for time slots', { builderId, sessionTypeId });

      // If no session type provided, we can't get time slots from Calendly
      if (!sessionTypeId) {
        logger.warn('Session type ID required for Calendly time slots', { builderId });
        return [];
      }

      try {
        // Get session type to obtain Calendly event type ID
        const sessionType = await prisma.sessionType.findUnique({
          where: { id: sessionTypeId }
        });

        if (!sessionType || !sessionType.calendlyEventTypeId) {
          logger.warn('Session type not found or not linked to Calendly', { sessionTypeId });
          return [];
        }

        // For Calendly integration, we return an empty array as the actual slots
        // are fetched directly by the Calendly embed on the client side
        logger.info('Calendly embed will fetch time slots directly', {
          builderId,
          sessionTypeId,
          calendlyEventTypeId: sessionType.calendlyEventTypeId
        });

        return [];
      } catch (error) {
        logger.error('Error getting Calendly session type', { error, sessionTypeId });
        return [];
      }
    }

    // For non-Calendly builders, we would use our own availability system
    // This is not fully implemented since Calendly is the primary scheduling system
    logger.warn('Non-Calendly time slot fetching is not fully supported', { builderId });

    // Return empty slots for now
    return [];
  } catch (error) {
    logger.error('Error getting available time slots', {
      error, builderId, startDate, endDate, sessionTypeId
    });
    throw new Error('Failed to get available time slots');
  }
}

/**
 * Get builder scheduling profile and settings
 *
 * @param builderId - The ID of the builder
 * @returns Builder scheduling profile and settings
 */
export async function getBuilderSchedulingProfile(builderId: string): Promise<any> {
  try {
    // Get the builder profile with scheduling settings
    const builder = await prisma.builderProfile.findUnique({
      where: { id: builderId },
      include: {
        schedulingSettings: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!builder) {
      throw new Error('Builder not found');
    }

    // If no scheduling settings exist, create default settings with Calendly enabled
    if (!builder.schedulingSettings) {
      const newSettings = await prisma.schedulingSettings.create({
        data: {
          builderId,
          timezone: 'UTC',
          bufferBefore: 15,
          bufferAfter: 15,
          useCalendly: true
        }
      });

      // Return builder with newly created settings
      return {
        id: builder.id,
        userId: builder.userId,
        name: builder.user.name,
        email: builder.user.email,
        schedulingSettings: {
          timezone: newSettings.timezone,
          bufferBefore: newSettings.bufferBefore,
          bufferAfter: newSettings.bufferAfter,
          useCalendly: newSettings.useCalendly,
          calendlyUsername: newSettings.calendlyUsername || undefined,
          calendlyUserId: newSettings.calendlyUserId || undefined,
          defaultAvailability: newSettings.defaultAvailability || undefined,
          createdAt: newSettings.createdAt.toISOString(),
          updatedAt: newSettings.updatedAt.toISOString()
        }
      };
    }

    // Transform to API type
    return {
      id: builder.id,
      userId: builder.userId,
      name: builder.user.name,
      email: builder.user.email,
      schedulingSettings: {
        timezone: builder.schedulingSettings.timezone,
        bufferBefore: builder.schedulingSettings.bufferBefore,
        bufferAfter: builder.schedulingSettings.bufferAfter,
        useCalendly: builder.schedulingSettings.useCalendly,
        calendlyUsername: builder.schedulingSettings.calendlyUsername || undefined,
        calendlyUserId: builder.schedulingSettings.calendlyUserId || undefined,
        defaultAvailability: builder.schedulingSettings.defaultAvailability || undefined,
        createdAt: builder.schedulingSettings.createdAt.toISOString(),
        updatedAt: builder.schedulingSettings.updatedAt.toISOString()
      }
    };
  } catch (error) {
    logger.error('Error getting builder scheduling profile', { error, builderId });
    throw new Error('Failed to get builder scheduling profile');
  }
}

/**
 * Update builder scheduling settings
 *
 * @param builderId - The ID of the builder
 * @param settings - The partial settings to update
 * @returns Updated builder scheduling profile
 */
export async function updateBuilderSchedulingSettings(
  builderId: string,
  settings: Partial<{
    timezone: string;
    bufferBefore: number;
    bufferAfter: number;
    useCalendly: boolean;
    calendlyUsername: string;
    calendlyUserId: string;
    defaultAvailability: { dayOfWeek: number; startTime: string; endTime: string }[];
  }>
): Promise<any> {
  try {
    // Check if settings exist
    const existingSettings = await prisma.schedulingSettings.findUnique({
      where: { builderId }
    });

    if (existingSettings) {
      // Update existing settings
      await prisma.schedulingSettings.update({
        where: { builderId },
        data: settings
      });
    } else {
      // Create new settings with defaults
      await prisma.schedulingSettings.create({
        data: {
          builderId,
          timezone: settings.timezone || 'UTC',
          bufferBefore: settings.bufferBefore ?? 15,
          bufferAfter: settings.bufferAfter ?? 15,
          useCalendly: settings.useCalendly ?? true,
          calendlyUsername: settings.calendlyUsername,
          calendlyUserId: settings.calendlyUserId,
          defaultAvailability: settings.defaultAvailability || []
        }
      });
    }

    logger.info('Updated builder scheduling settings', { builderId });

    // Get the updated profile
    return getBuilderSchedulingProfile(builderId);
  } catch (error) {
    logger.error('Error updating builder scheduling settings', { error, builderId, settings });
    throw new Error('Failed to update builder scheduling settings');
  }
}
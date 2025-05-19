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

import { 
  PrismaClient, 
  Prisma, 
  BookingStatus as PrismaBookingStatus, 
  PaymentStatus as PrismaPaymentStatus,
  AvailabilityException as PrismaAvailabilityException,
  AvailabilityRule as PrismaAvailabilityRule,
  BuilderProfile as PrismaBuilderProfile,
  User as PrismaUser, // For BuilderProfile.user relation
  SessionType as PrismaSessionType // For SessionType mapping
} from '@prisma/client'; 
import { logger } from '@/lib/logger'; // Assuming logger is in @/lib/logger
import type { 
  Booking, 
  BookingRequest,
  SessionType as LocalSessionType, // Aliased to avoid conflict
  AvailabilityRule as LocalAvailabilityRule,
  AvailabilityException as LocalAvailabilityException,
  TimeSlot as LocalTimeSlot, // Assuming LocalTimeSlot is defined for slots array elements
  SchedulingSettings as LocalSchedulingSettings,
  CreateAvailabilityExceptionInput,
  UpdateAvailabilityExceptionInput,
  CreateAvailabilityRuleInput,
  UpdateAvailabilityRuleInput,
  UpdateSchedulingSettingsInput, 
  TimeSlotInput,
  BookingStatus as LocalBookingStatus,
  PaymentStatus as LocalPaymentStatus,
  BuilderProfile as LocalBuilderProfile, // Aliased for clarity
  DayOfWeek, // For AvailabilityRule.daysOfWeek
  WeeklySlot 
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
      status: booking.status as LocalBookingStatus,
      paymentStatus: booking.paymentStatus as LocalPaymentStatus,
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
      status: booking.status as LocalBookingStatus,
      paymentStatus: booking.paymentStatus as LocalPaymentStatus,
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
  paymentStatus: PrismaPaymentStatus,
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
        paymentStatus,
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
    if (paymentStatus === PrismaPaymentStatus.PAID && existingBooking.status === PrismaBookingStatus.PENDING) {
      await updateBookingStatus(bookingId, PrismaBookingStatus.CONFIRMED);
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
      status: booking.status as LocalBookingStatus,
      paymentStatus: booking.paymentStatus as LocalPaymentStatus,
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
  status: PrismaBookingStatus
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
      data: {
        status: status
      }
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
      status: booking.status as LocalBookingStatus,
      paymentStatus: booking.paymentStatus as LocalPaymentStatus,
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
      sessionTypeId: booking.sessionTypeId || '',
      title: booking.title,
      description: booking.description || undefined,
      startTime: booking.startTime.toISOString(),
      endTime: booking.endTime.toISOString(),
      status: booking.status as LocalBookingStatus,
      paymentStatus: booking.paymentStatus as LocalPaymentStatus,
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
): Promise<LocalAvailabilityException[]> {
  try {
    const whereClause: Prisma.AvailabilityExceptionWhereInput = {
      builderId,
    };
    if (startDate || endDate) {
      whereClause.AND = [];
      if (startDate) {
        whereClause.AND.push({ date: { gte: new Date(startDate) } });
      }
      if (endDate) {
        whereClause.AND.push({ date: { lte: new Date(endDate) } });
      }
    }

    const dbExceptions = await prisma.availabilityException.findMany({
      where: whereClause,
    });

    return dbExceptions.map(mapToLocalAvailabilityException);
  } catch (error) {
    logger.error('Error retrieving availability exceptions', { error, builderId, startDate, endDate });
    throw new Error('Failed to retrieve availability exceptions');
  }
}

export async function getAvailabilityExceptionById(id: string): Promise<LocalAvailabilityException | null> {
  try {
    const prismaException = await prisma.availabilityException.findUnique({
      where: { id },
    });

    if (!prismaException) return null;

    return mapToLocalAvailabilityException(prismaException);
  } catch (error) {
    logger.error('Error retrieving availability exception by ID', { error, id });
    throw new Error('Failed to retrieve availability exception by ID');
  }
}

export async function createAvailabilityException(
  builderId: string,
  data: CreateAvailabilityExceptionInput
): Promise<LocalAvailabilityException> {
  logger.info(`Creating availability exception for builder ${builderId} with data: ${JSON.stringify(data)}`);
  try {
    const newPrismaException = await prisma.availabilityException.create({
      data: {
        builderId,
        date: new Date(data.date),
        isAvailable: data.isAvailable,
        // Ensure slots are correctly formatted as Prisma.InputJsonValue
        // Prisma expects a JsonValue, which can be string, number, boolean, null, array of JsonValue, or object with string keys and JsonValue values.
        slots: data.slots ? (data.slots as unknown as Prisma.InputJsonValue) : Prisma.JsonNull,
        reason: data.reason,
      },
    });
    logger.info(`Successfully created availability exception with ID: ${newPrismaException.id}`);
    return mapToLocalAvailabilityException(newPrismaException);
  } catch (error) {
    logger.error(`Error creating availability exception for builder ${builderId}: ${error}`);
    throw error; // Re-throw the error to be handled by the caller
  }
}

export async function updateAvailabilityException(
  id: string,
  data: UpdateAvailabilityExceptionInput
): Promise<LocalAvailabilityException> {
  logger.info(`Updating availability exception with ID: ${id} with data: ${JSON.stringify(data)}`);
  
  const prismaUpdateData: Prisma.AvailabilityExceptionUpdateInput = {};
  // Only include fields in prismaUpdateData if they are actually provided in 'data'
  if (data.isAvailable !== undefined) {
    prismaUpdateData.isAvailable = data.isAvailable;
  }
  if (data.slots !== undefined) {
    prismaUpdateData.slots = data.slots ? (data.slots as unknown as Prisma.InputJsonValue) : Prisma.JsonNull;
  }
  if (data.reason !== undefined) {
    prismaUpdateData.reason = data.reason;
  }
  // Note: 'date' and 'builderId' are typically not part of an update operation for an existing exception.
  // If 'date' were updatable, it would be: if (data.date) prismaUpdateData.date = new Date(data.date);

  try {
    const updatedPrismaException = await prisma.availabilityException.update({
      where: { id },
      data: prismaUpdateData,
    });
    logger.info(`Successfully updated availability exception with ID: ${id}`);
    return mapToLocalAvailabilityException(updatedPrismaException);
  } catch (error) {
    logger.error(`Error updating availability exception with ID ${id}: ${error}`);
    throw error; // Re-throw the error to be handled by the caller
  }
}

/**
 * Helper function to map Prisma AvailabilityException to local type
 */
export function mapToLocalAvailabilityException(
  prismaException: PrismaAvailabilityException
): LocalAvailabilityException {
  let parsedSlots: TimeSlot[] = [];
  if (prismaException.slots && typeof prismaException.slots === 'object' && prismaException.slots !== null) {
    try {
      // Assuming prismaException.slots is an array of TimeSlot compatible objects or can be cast
      const slotsFromJson = prismaException.slots as unknown as TimeSlotInput[]; 
      if (Array.isArray(slotsFromJson)) {
        parsedSlots = slotsFromJson.map(slot => ({ 
          startTime: slot.startTime, 
          endTime: slot.endTime, 
          isBooked: slot.isBooked ?? false 
        }));
      }
    } catch (e) {
      logger.error(`Error parsing slots JSON for AvailabilityException ${prismaException.id}: ${e}`);
      // Decide if to throw, or return empty, or a default based on requirements
    }
  }
  return {
    id: prismaException.id,
    builderId: prismaException.builderId,
    date: prismaException.date.toISOString().split('T')[0], // Format as YYYY-MM-DD string
    isAvailable: prismaException.isAvailable,
    slots: parsedSlots,
    reason: prismaException.reason ?? undefined,
    createdAt: prismaException.createdAt.toISOString(),
    updatedAt: prismaException.updatedAt.toISOString(),
  };
}

/**
 * Get availability rules for a builder
 * 
 * @param builderId - The ID of the builder, or 'all' to get all rules
 * @returns Array of availability rules
 */
export async function getAvailabilityRules(builderId: string): Promise<LocalAvailabilityRule[]> {
  try {
    const dbRules = await prisma.availabilityRule.findMany({
      where: { builderId },
    });
    return dbRules.map(mapToLocalAvailabilityRule);
  } catch (error) {
    logger.error('Error retrieving availability rules', { error, builderId });
    throw new Error('Failed to retrieve availability rules');
  }
}

export async function getAvailabilityRuleById(id: string): Promise<LocalAvailabilityRule | null> {
  try {
    const rule = await prisma.availabilityRule.findUnique({
      where: { id },
    });
    return rule ? mapToLocalAvailabilityRule(rule) : null;
  } catch (error) {
    logger.error('Error retrieving availability rule by ID', { error, id });
    throw new Error('Failed to retrieve availability rule by ID');
  }
}

export async function createAvailabilityRule(
  builderId: string,
  data: CreateAvailabilityRuleInput
): Promise<LocalAvailabilityRule> {
  logger.info(`Creating availability rule for builder ${builderId} with data: ${JSON.stringify(data)}`);
  // const { slots, ...prismaData } = data; // 'slots' is not part of AvailabilityRule
  try {
    const newPrismaRule = await prisma.availabilityRule.create({
      data: {
        builderId: data.builderId,
        dayOfWeek: data.dayOfWeek as number, // Prisma expects Int
        startTime: data.startTime,
        endTime: data.endTime,
        isRecurring: data.isRecurring ?? false, // Default to false if not provided
        effectiveDate: data.effectiveDate ? new Date(data.effectiveDate) : null,
        expirationDate: data.expirationDate ? new Date(data.expirationDate) : null,
      },
    });
    logger.info(`Successfully created availability rule with ID: ${newPrismaRule.id}`);
    return mapToLocalAvailabilityRule(newPrismaRule);
  } catch (error) {
    logger.error(`Error creating availability rule for builder ${builderId}: ${error}`);
    throw error; // Re-throw the error to be handled by the caller
  }
}

export async function updateAvailabilityRule(
  id: string,
  data: UpdateAvailabilityRuleInput
): Promise<LocalAvailabilityRule> {
  logger.info(`Updating availability rule with ID: ${id} with data: ${JSON.stringify(data)}`);
  // const { slots, ...prismaData } = data; // 'slots' is not part of AvailabilityRule

  const prismaUpdateData: Prisma.AvailabilityRuleUpdateInput = {};
  if (data.dayOfWeek !== undefined) prismaUpdateData.dayOfWeek = data.dayOfWeek as number;
  if (data.startTime !== undefined) prismaUpdateData.startTime = data.startTime;
  if (data.endTime !== undefined) prismaUpdateData.endTime = data.endTime;
  if (data.isRecurring !== undefined) prismaUpdateData.isRecurring = data.isRecurring;
  if (data.effectiveDate !== undefined) {
    prismaUpdateData.effectiveDate = data.effectiveDate ? new Date(data.effectiveDate) : null;
  }
  if (data.expirationDate !== undefined) {
    prismaUpdateData.expirationDate = data.expirationDate ? new Date(data.expirationDate) : null;
  }

  try {
    const updatedPrismaRule = await prisma.availabilityRule.update({
      where: { id },
      data: prismaUpdateData,
    });
    logger.info(`Successfully updated availability rule with ID: ${id}`);
    return mapToLocalAvailabilityRule(updatedPrismaRule);
  } catch (error) {
    logger.error(`Error updating availability rule with ID ${id}: ${error}`);
    throw error; // Re-throw the error to be handled by the caller
  }
}

export async function deleteAvailabilityRule(id: string): Promise<LocalAvailabilityRule> {
  try {
    const deletedRule = await prisma.availabilityRule.delete({
      where: { id },
    });
    logger.info(`Successfully deleted availability rule with ID: ${id}`);
    return mapToLocalAvailabilityRule(deletedRule);
  } catch (error) {
    logger.error(`Error deleting availability rule with ID ${id}: ${error}`);
    throw error; // Re-throw the error to be handled by the caller
  }
}

/**
 * Helper function to map Prisma AvailabilityRule to local type
 */
export function mapToLocalAvailabilityRule(
  prismaRule: PrismaAvailabilityRule
): LocalAvailabilityRule {
  return {
    id: prismaRule.id,
    builderId: prismaRule.builderId,
    dayOfWeek: prismaRule.dayOfWeek as DayOfWeek, // Assuming DayOfWeek is a compatible number type
    startTime: prismaRule.startTime,
    endTime: prismaRule.endTime,
    isRecurring: prismaRule.isRecurring ?? false, // Prisma's Boolean? to boolean
    effectiveDate: prismaRule.effectiveDate?.toISOString().split('T')[0],
    expirationDate: prismaRule.expirationDate?.toISOString().split('T')[0],
    createdAt: prismaRule.createdAt.toISOString(),
    updatedAt: prismaRule.updatedAt.toISOString(),
  };
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
export async function getBuilderSchedulingProfile(builderId: string): Promise<{
  profile: LocalBuilderProfile | null;
  settings: LocalSchedulingSettings | null;
}> {
  try {
    const prismaProfileWithIncludes = await prisma.builderProfile.findUnique({
      where: { id: builderId },
      include: {
        user: true, 
        schedulingSettings: true, // This relation should now be valid with regenerated client
      },
    });

    if (!prismaProfileWithIncludes) {
      logger.warn(`Builder profile not found for id: ${builderId}`);
      return { profile: null, settings: null };
    }

    // Destructure carefully to avoid type issues
    const {
      schedulingSettings: prismaSchedulingSettings,
      user: prismaUser,
      ...restOfPrismaProfile // Contains fields of PrismaBuilderProfile
    } = prismaProfileWithIncludes;

    // Map PrismaBuilderProfile to LocalBuilderProfile
    const localProfile: LocalBuilderProfile = {
      id: restOfPrismaProfile.id,
      userId: restOfPrismaProfile.userId,
      bio: restOfPrismaProfile.bio,
      website: restOfPrismaProfile.website,
      linkedinUrl: restOfPrismaProfile.linkedinUrl,
      githubUrl: restOfPrismaProfile.githubUrl,
      twitterUrl: restOfPrismaProfile.twitterUrl,
      calendlyUrl: restOfPrismaProfile.calendlyUrl, // Make sure this is part of your PrismaBuilderProfile
      // Map 'user' if its structure/type differs in LocalBuilderProfile
      user: prismaUser ? { 
        id: prismaUser.id,
        name: prismaUser.name,
        email: prismaUser.email,
        // Add other fields from PrismaUser to LocalUser as needed by LocalBuilderProfile.user
       } : null,
      createdAt: restOfPrismaProfile.createdAt.toISOString(),
      updatedAt: restOfPrismaProfile.updatedAt.toISOString(),
      // Add any other fields expected by LocalBuilderProfile
    };

    let localSettings: LocalSchedulingSettings | null = null;
    if (prismaSchedulingSettings) {
      localSettings = {
        id: prismaSchedulingSettings.id,
        builderId: prismaSchedulingSettings.builderId,
        timeZone: prismaSchedulingSettings.timeZone,
        defaultAvailability: prismaSchedulingSettings.defaultAvailability as WeeklySlot[], // Cast JsonValue
        minBookingNotice: prismaSchedulingSettings.minBookingNotice,
        minCancellationNotice: prismaSchedulingSettings.minCancellationNotice,
        createdAt: prismaSchedulingSettings.createdAt.toISOString(),
        updatedAt: prismaSchedulingSettings.updatedAt.toISOString(),
      };
    } else {
      logger.info(`No scheduling settings found for builder ${builderId}, creating default settings.`);
      // Ensure defaultAvailability is a valid Prisma.InputJsonValue. Example: empty array or default structure
      const defaultWeeklyAvailability: WeeklySlot[] = []; // Or your default structure
      const createdSettings = await prisma.schedulingSettings.create({
        data: {
          builder: { connect: { id: builderId } }, 
          timeZone: 'UTC', // Sensible default
          defaultAvailability: defaultWeeklyAvailability as Prisma.InputJsonValue, 
          minBookingNotice: 24, // Default in hours
          minCancellationNotice: 24, // Default in hours
        }
      });
      localSettings = {
        id: createdSettings.id,
        builderId: createdSettings.builderId,
        timeZone: createdSettings.timeZone,
        defaultAvailability: createdSettings.defaultAvailability as WeeklySlot[],
        minBookingNotice: createdSettings.minBookingNotice,
        minCancellationNotice: createdSettings.minCancellationNotice,
        createdAt: createdSettings.createdAt.toISOString(),
        updatedAt: createdSettings.updatedAt.toISOString(),
      };
    }

    return { profile: localProfile, settings: localSettings };
  } catch (error) {
    logger.error(`Error fetching builder scheduling profile for ${builderId}:`, { error });
    throw new Error('Failed to fetch builder scheduling profile.');
  }
}

export async function updateBuilderSchedulingSettings(
  builderId: string, 
  settingsData: UpdateSchedulingSettingsInput
): Promise<LocalSchedulingSettings> {
  try {
    // Construct the update payload carefully to avoid sending undefined fields that Prisma might misinterpret
    const dataToUpdate: Prisma.SchedulingSettingsUpdateInput = {};
    if (settingsData.timeZone !== undefined) dataToUpdate.timeZone = settingsData.timeZone;
    if (settingsData.defaultAvailability !== undefined) {
      dataToUpdate.defaultAvailability = settingsData.defaultAvailability as Prisma.InputJsonValue;
    }
    if (settingsData.minBookingNotice !== undefined) dataToUpdate.minBookingNotice = settingsData.minBookingNotice;
    if (settingsData.minCancellationNotice !== undefined) dataToUpdate.minCancellationNotice = settingsData.minCancellationNotice;

    // Find existing settings first to ensure we're updating the correct record associated with the builderId.
    // This assumes builderId is unique on SchedulingSettings. If not, adjust the where clause.
    const existingSettings = await prisma.schedulingSettings.findUnique({
      where: { builderId: builderId },
    });

    if (!existingSettings) {
      // Option 1: Throw an error if settings are expected to exist
      // throw new Error(`Scheduling settings not found for builder ${builderId}`);
      
      // Option 2: Create settings if they don't exist (upsert-like behavior)
      // This requires all necessary fields for creation.
      logger.info(`No scheduling settings found for builder ${builderId} during update, creating new settings.`);
      const defaultWeeklyAvailability: WeeklySlot[] = []; // Or your default structure
      const createdSettings = await prisma.schedulingSettings.create({
        data: {
          builder: { connect: { id: builderId } },
          timeZone: 'UTC', // Sensible default
          defaultAvailability: defaultWeeklyAvailability as Prisma.InputJsonValue, 
          minBookingNotice: 24, // Default in hours
          minCancellationNotice: 24, // Default in hours
        }
      });
      return {
        id: createdSettings.id,
        builderId: createdSettings.builderId,
        timeZone: createdSettings.timeZone,
        defaultAvailability: createdSettings.defaultAvailability as WeeklySlot[],
        minBookingNotice: createdSettings.minBookingNotice,
        minCancellationNotice: createdSettings.minCancellationNotice,
        createdAt: createdSettings.createdAt.toISOString(),
        updatedAt: createdSettings.updatedAt.toISOString(),
      };
    }

    // If settings exist, update them.
    const updatedSettings = await prisma.schedulingSettings.update({
      where: { builderId: builderId }, 
      data: dataToUpdate,
    });

    return {
      id: updatedSettings.id,
      builderId: updatedSettings.builderId,
      timeZone: updatedSettings.timeZone,
      defaultAvailability: updatedSettings.defaultAvailability as WeeklySlot[], // Cast back to local type
      minBookingNotice: updatedSettings.minBookingNotice,
      minCancellationNotice: updatedSettings.minCancellationNotice,
      createdAt: updatedSettings.createdAt.toISOString(),
      updatedAt: updatedSettings.updatedAt.toISOString(),
    };
  } catch (error) {
    logger.error(`Error updating builder scheduling settings for ${builderId}:`, { error, settingsData });
    throw new Error('Failed to update builder scheduling settings.');
  }
}

/**
 * Retrieves the scheduling settings for a builder.
 * 
 * @param builderId - The ID of the builder.
 * @returns The scheduling settings if found, null otherwise.
 */
export async function getBuilderSchedulingSettings(builderId: string): Promise<LocalSchedulingSettings | null> {
  logger.info(`Fetching scheduling settings for builder ${builderId}`);
  try {
    const builderProfile = await prisma.builderProfile.findUnique({
      where: { userId: builderId }, // Assuming builderId in function maps to userId in BuilderProfile
    });

    if (!builderProfile) {
      logger.warn(`Builder profile not found for builder ID: ${builderId}`);
      return null;
    }

    if (!builderProfile.schedulingSettings) {
      logger.info(`Scheduling settings not set for builder ID: ${builderId}`);
      // Return a default or empty LocalSchedulingSettings structure if appropriate, or null
      // For now, returning null if no settings JSON is present.
      // Consider if a default object should be returned, e.g.:
      // return { id: builderProfile.id, builderId, timezone: 'UTC', defaultAvailability: [] };
      return null; 
    }

    try {
      // Assuming builderProfile.schedulingSettings is a JSON object that matches LocalSchedulingSettings structure
      // Need to be careful with type assertion here.
      const settings = builderProfile.schedulingSettings as unknown as Omit<LocalSchedulingSettings, 'id' | 'builderId'>;
      
      // Ensure all fields from LocalSchedulingSettings are present, even if undefined from JSON
      return {
        id: builderProfile.id, // Use builderProfile.id as the id for settings
        builderId: builderId,
        timezone: settings.timezone, // Check for 'timeZone' vs 'timezone' consistency
        bufferBefore: settings.bufferBefore,
        bufferAfter: settings.bufferAfter,
        useCalendly: settings.useCalendly,
        calendlyUsername: settings.calendlyUsername,
        calendlyUserId: settings.calendlyUserId,
        defaultAvailability: settings.defaultAvailability || [],
        // createdAt and updatedAt would not typically be part of the JSON blob but the BuilderProfile record itself
      };
    } catch (parseError) {
      logger.error(`Error parsing schedulingSettings JSON for builder ${builderId}:`, { parseError, settingsJson: builderProfile.schedulingSettings });
      throw new Error('Failed to parse scheduling settings JSON.');
    }

  } catch (error) {
    logger.error(`Error retrieving scheduling settings for builder ${builderId}:`, { error });
    throw new Error('Failed to retrieve scheduling settings.');
  }
}

/**
 * Updates the scheduling settings for a builder, including their availability rules and exceptions.
 * This function handles the orchestration of updating the main settings JSON blob on BuilderProfile
 * and managing related AvailabilityRule and AvailabilityException records.
 *
 * @param builderId - The ID of the builder (maps to BuilderProfile.userId).
 * @param settingsData - The scheduling settings data to update, including rules and exceptions.
 * @returns The updated scheduling settings.
 */
export async function updateBuilderSchedulingSettings(
  builderId: string,
  settingsData: UpdateSchedulingSettingsInput & {
    availabilityRulesToCreate?: CreateAvailabilityRuleInput[];
    availabilityRulesToUpdate?: (UpdateAvailabilityRuleInput & { id: string })[];
    availabilityRuleIdsToDelete?: string[];
    availabilityExceptionsToCreate?: CreateAvailabilityExceptionInput[];
    availabilityExceptionsToUpdate?: (UpdateAvailabilityExceptionInput & { id: string })[];
    availabilityExceptionIdsToDelete?: string[];
  }
): Promise<LocalSchedulingSettings> {
  logger.info(`Updating builder scheduling settings for ${builderId} with data: ${JSON.stringify(settingsData)}`);

  try {
    // Step 1: Fetch current BuilderProfile to get existing schedulingSettings JSON
    const builderProfile = await prisma.builderProfile.findUnique({
      where: { userId: builderId },
    });

    if (!builderProfile) {
      logger.error(`Builder profile not found for ID: ${builderId} during update.`);
      throw new Error(`Builder profile not found for ID: ${builderId}.`);
    }

    // Step 2: Parse existing settings or initialize if null
    let currentSettingsJson: any = {};
    if (builderProfile.schedulingSettings) {
      try {
        currentSettingsJson = JSON.parse(JSON.stringify(builderProfile.schedulingSettings)); // Deep clone
      } catch (e) {
        logger.error(`Failed to parse existing schedulingSettings JSON for builder ${builderId}. Initializing fresh.`, e);
        currentSettingsJson = {}; // Default to empty if parsing fails
      }
    }
    
    // Step 3: Merge with new settingsData (excluding rules/exceptions which are handled separately)
    const { 
      availabilityRulesToCreate,
      availabilityRulesToUpdate,
      availabilityRuleIdsToDelete,
      availabilityExceptionsToCreate,
      availabilityExceptionsToUpdate,
      availabilityExceptionIdsToDelete,
      ...mainSettingsInput // a.k.a. UpdateSchedulingSettingsInput fields
    } = settingsData;

    const newSettingsJson = { ...currentSettingsJson, ...mainSettingsInput };

    // Step 4: Update BuilderProfile with the new schedulingSettings JSON
    // Note: Prisma expects a JsonValue, so newSettingsJson should be fine directly
    await prisma.builderProfile.update({
      where: { userId: builderId },
      data: {
        schedulingSettings: newSettingsJson as Prisma.InputJsonValue,
      },
    });

    // Step 5: Orchestrate AvailabilityRules CRUD operations
    if (availabilityRulesToCreate) {
      for (const ruleData of availabilityRulesToCreate) {
        await createAvailabilityRule(builderId, ruleData); // createAvailabilityRule expects builderId as first param
      }
    }
    if (availabilityRulesToUpdate) {
      for (const ruleData of availabilityRulesToUpdate) {
        const { id, ...updateData } = ruleData;
        await updateAvailabilityRule(id, updateData);
      }
    }
    if (availabilityRuleIdsToDelete) {
      for (const ruleId of availabilityRuleIdsToDelete) {
        await deleteAvailabilityRule(ruleId);
      }
    }

    // Step 6: Orchestrate AvailabilityExceptions CRUD operations
    if (availabilityExceptionsToCreate) {
      for (const exData of availabilityExceptionsToCreate) {
        await createAvailabilityException(builderId, exData); // createAvailabilityException expects builderId as first param
      }
    }
    if (availabilityExceptionsToUpdate) {
      for (const exData of availabilityExceptionsToUpdate) {
        const { id, ...updateData } = exData;
        await updateAvailabilityException(id, updateData);
      }
    }
    if (availabilityExceptionIdsToDelete) {
      for (const exId of availabilityExceptionIdsToDelete) {
        await deleteAvailabilityException(exId);
      }
    }

    // Step 7: Fetch and return the updated LocalSchedulingSettings representation
    // This will reflect the JSON blob update and implicitly the rule/exception changes via relations if fetched together
    const updatedProfile = await prisma.builderProfile.findUnique({ where: { userId: builderId } });
    if (!updatedProfile || !updatedProfile.schedulingSettings) {
        logger.error(`Failed to retrieve updated scheduling settings for builder ${builderId} after update.`);
        throw new Error('Failed to retrieve updated scheduling settings after update.');
    }
    
    // Re-map from the potentially updated JSON blob
    const finalSettings = updatedProfile.schedulingSettings as unknown as Omit<LocalSchedulingSettings, 'id' | 'builderId'>;
    return {
      id: updatedProfile.id,
      builderId: builderId,
      timezone: finalSettings.timezone,
      bufferBefore: finalSettings.bufferBefore,
      bufferAfter: finalSettings.bufferAfter,
      useCalendly: finalSettings.useCalendly,
      calendlyUsername: finalSettings.calendlyUsername,
      calendlyUserId: finalSettings.calendlyUserId,
      defaultAvailability: finalSettings.defaultAvailability || [],
      // createdAt/updatedAt are not part of the JSON blob itself
    };

  } catch (error) {
    logger.error(`Error updating builder scheduling settings for ${builderId}:`, { error, settingsData });
    throw new Error('Failed to update builder scheduling settings.');
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
export async function getCalendlySessionTypes(builderId: string): Promise<LocalSessionType[]> {
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
          updatedAt: existingType.updatedAt.toISOString(),
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
          updatedAt: newType.updatedAt.toISOString(),
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
 * Get session types for a builder
 * 
 * @param builderId - The ID of the builder
 * @returns Array of session types
 */
export async function getSessionTypes(builderId: string): Promise<LocalSessionType[]> {
  try {
    const sessionTypes = await prisma.sessionType.findMany({
      where: { builderId },
    });

    return sessionTypes.map(mapToLocalSessionType);
  } catch (error) {
    logger.error('Error retrieving session types', { error, builderId });
    throw new Error('Failed to retrieve session types');
  }
}

/**
 * Get a session type by ID
 * 
 * @param id - The ID of the session type
 * @returns The session type if found, null otherwise
 */
export async function getSessionTypeById(id: string): Promise<LocalSessionType | null> {
  try {
    const sessionType = await prisma.sessionType.findUnique({
      where: { id },
    });
    return sessionType ? mapToLocalSessionType(sessionType) : null;
  } catch (error) {
    logger.error('Error retrieving session type by ID', { error, id });
    throw new Error('Failed to retrieve session type by ID');
  }
}

/**
 * Create a new session type
 * 
 * @param builderId - The ID of the builder
 * @param data - The data for the new session type
 * @returns The created session type
 */
export async function createSessionType(
  builderId: string,
  data: Partial<Omit<LocalSessionType, 'id' | 'builderId' | 'createdAt' | 'updatedAt'>> & { title: string; description: string; durationMinutes: number; price: number; currency: string; }
): Promise<LocalSessionType> {
  logger.info(`Creating session type for builder ${builderId} with data: ${JSON.stringify(data)}`);
  try {
    const newPrismaSessionType = await prisma.sessionType.create({
      data: {
        builderId,
        title: data.title,
        description: data.description,
        durationMinutes: data.durationMinutes,
        price: new Prisma.Decimal(data.price), // Convert number to Decimal
        currency: data.currency,
        isActive: data.isActive !== undefined ? data.isActive : true, // Default to true
        timeZone: data.timeZone, // Added field
        isRecurring: data.isRecurring, // Added field
        calendlyEventTypeId: data.calendlyEventTypeId,
        calendlyEventTypeUri: data.calendlyEventTypeUri,
        // Fields like color, maxParticipants, requiresAuth, eventTypeCategory, effectiveDate, expirationDate are not in Prisma SessionType model
      } as any, // Type assertion added here
    });
    logger.info(`Successfully created session type with ID: ${newPrismaSessionType.id}`);
    return mapToLocalSessionType(newPrismaSessionType);
  } catch (error) {
    logger.error(`Error creating session type for builder ${builderId}: ${error}`);
    throw error; // Re-throw the error to be handled by the caller
  }
}

/**
 * Update a session type
 * 
 * @param id - The ID of the session type
 * @param data - The updated data for the session type
 * @returns The updated session type
 */
export async function updateSessionType(
  id: string,
  data: Partial<Omit<LocalSessionType, 'id' | 'builderId' | 'createdAt' | 'updatedAt'>>
): Promise<LocalSessionType> {
  logger.info(`Updating session type with ID: ${id} with data: ${JSON.stringify(data)}`);
  
  const prismaUpdateData: Prisma.SessionTypeUpdateInput = {};
  if (data.title !== undefined) prismaUpdateData.title = data.title;
  if (data.description !== undefined) prismaUpdateData.description = data.description;
  if (data.durationMinutes !== undefined) prismaUpdateData.durationMinutes = data.durationMinutes;
  if (data.price !== undefined) prismaUpdateData.price = new Prisma.Decimal(data.price);
  if (data.currency !== undefined) prismaUpdateData.currency = data.currency;
  if (data.isActive !== undefined) prismaUpdateData.isActive = data.isActive;
  if (data.timeZone !== undefined) prismaUpdateData.timeZone = data.timeZone; // Added field
  if (data.isRecurring !== undefined) prismaUpdateData.isRecurring = data.isRecurring; // Added field
  if (data.calendlyEventTypeId !== undefined) prismaUpdateData.calendlyEventTypeId = data.calendlyEventTypeId;
  if (data.calendlyEventTypeUri !== undefined) prismaUpdateData.calendlyEventTypeUri = data.calendlyEventTypeUri;
  // Fields like color, maxParticipants, requiresAuth, eventTypeCategory, effectiveDate, expirationDate might not be in Prisma SessionType model or handled differently

  try {
    const updatedPrismaSessionType = await prisma.sessionType.update({
      where: { id },
      data: prismaUpdateData as any, // Type assertion added here
    });
    logger.info(`Successfully updated session type with ID: ${id}`);
    return mapToLocalSessionType(updatedPrismaSessionType);
  } catch (error) {
    logger.error(`Error updating session type with ID ${id}: ${error}`);
    throw error; // Re-throw the error to be handled by the caller
  }
}

/**
 * Delete a session type
 * 
 * @param id - The ID of the session type
 * @returns The deleted session type
 */
export async function deleteSessionType(id: string): Promise<LocalSessionType> {
  try {
    const deletedSessionType = await prisma.sessionType.delete({
      where: { id },
    });
    logger.info(`Successfully deleted session type with ID: ${id}`);
    return mapToLocalSessionType(deletedSessionType);
  } catch (error) {
    logger.error(`Error deleting session type with ID ${id}: ${error}`);
    throw error; // Re-throw the error to be handled by the caller
  }
}

/**
 * Helper function to map Prisma SessionType to local type
 */
export function mapToLocalSessionType(
  prismaSessionType: PrismaSessionType
): LocalSessionType {
  return {
    id: prismaSessionType.id,
    builderId: prismaSessionType.builderId,
    title: prismaSessionType.title,
    description: prismaSessionType.description,
    durationMinutes: prismaSessionType.durationMinutes,
    price: prismaSessionType.price.toNumber(), // Convert Decimal to number
    currency: prismaSessionType.currency,
    timeZone: (prismaSessionType as any).timeZone ?? undefined, // Corrected mapping with type assertion
    isRecurring: (prismaSessionType as any).isRecurring ?? undefined, // Corrected mapping with type assertion
    isActive: prismaSessionType.isActive,
    calendlyEventTypeId: prismaSessionType.calendlyEventTypeId ?? undefined,
    calendlyEventTypeUri: prismaSessionType.calendlyEventTypeUri ?? undefined,
    createdAt: prismaSessionType.createdAt.toISOString(),
    updatedAt: prismaSessionType.updatedAt.toISOString(),
    // Fields not in Prisma's base SessionType model - these will be undefined or need default values if required by LocalSessionType
    // color: undefined, 
    // maxParticipants: undefined,
    // requiresAuth: undefined,
    // eventTypeCategory: undefined,
    // effectiveDate: undefined,
    // expirationDate: undefined,
  };
}
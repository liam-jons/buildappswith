import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { 
  AvailabilityRule,
  AvailabilityException,
  SessionType,
  Booking,
  BuilderSchedulingProfile,
  TimeSlot,
  ClientSchedulingProfile
} from '../types';
import { formatISO, parseISO, addMinutes, format, eachDayOfInterval, startOfDay, endOfDay } from 'date-fns';

/**
 * Transform raw database Booking to match our Booking interface
 */
function transformBooking(booking: any): Booking {
  return {
    id: booking.id,
    sessionTypeId: booking.sessionTypeId || '',
    builderId: booking.builderId,
    clientId: booking.clientId,
    startTime: booking.startTime.toISOString(),
    endTime: booking.endTime.toISOString(),
    status: booking.status.toLowerCase(),
    paymentStatus: booking.paymentStatus?.toLowerCase(),
    paymentId: booking.stripeSessionId,
    checkoutSessionId: booking.stripeSessionId,
    clientTimezone: booking.clientTimezone || 'Etc/UTC',
    builderTimezone: booking.builderTimezone || 'Etc/UTC',
    notes: booking.description,
    createdAt: booking.createdAt.toISOString(),
    updatedAt: booking.updatedAt.toISOString()
  };
}

/**
 * Get all session types for a specific builder
 * 
 * @param builderId Builder unique identifier
 * @returns List of session types offered by the builder
 */
export async function getSessionTypes(builderId: string): Promise<SessionType[]> {
  try {
    // Get session types from the database
    const sessionTypes = await db.sessionType.findMany({
      where: {
        builderId,
        isActive: true
      },
      orderBy: {
        price: 'asc'
      }
    });
    
    // Transform them to the interface expected by the application
    return sessionTypes.map(st => ({
      id: st.id,
      builderId: st.builderId,
      title: st.title,
      description: st.description,
      durationMinutes: st.durationMinutes,
      price: Number(st.price), // Convert Decimal to number
      currency: st.currency,
      isActive: st.isActive,
      color: st.color || undefined,
      maxParticipants: st.maxParticipants || undefined
    }));
  } catch (error) {
    console.error(`Error fetching session types for builder ${builderId}:`, error);
    throw new Error('Failed to fetch session types');
  }
}

/**
 * Create a new session type for a builder
 * 
 * @param sessionType Session type data to create
 * @returns The created session type
 */
export async function createSessionType(sessionType: Omit<SessionType, 'id'>): Promise<SessionType> {
  try {
    // Create the session type in the database
    const newSessionType = await db.sessionType.create({
      data: {
        builderId: sessionType.builderId,
        title: sessionType.title,
        description: sessionType.description,
        durationMinutes: sessionType.durationMinutes,
        price: sessionType.price as unknown as Prisma.Decimal, // Convert to Prisma.Decimal
        currency: sessionType.currency,
        isActive: sessionType.isActive,
        color: sessionType.color,
        maxParticipants: sessionType.maxParticipants
      }
    });
    
    // Return the created session type with the interface expected by the application
    return {
      id: newSessionType.id,
      builderId: newSessionType.builderId,
      title: newSessionType.title,
      description: newSessionType.description,
      durationMinutes: newSessionType.durationMinutes,
      price: Number(newSessionType.price), // Convert Decimal to number
      currency: newSessionType.currency,
      isActive: newSessionType.isActive,
      color: newSessionType.color || undefined,
      maxParticipants: newSessionType.maxParticipants || undefined
    };
  } catch (error) {
    console.error('Error creating session type:', error);
    throw new Error('Failed to create session type');
  }
}

/**
 * Update an existing session type
 * 
 * @param id Session type ID
 * @param sessionType Updated session type data
 * @returns The updated session type
 */
export async function updateSessionType(
  id: string, 
  sessionType: Partial<Omit<SessionType, 'id'>>
): Promise<SessionType> {
  try {
    // Prepare the data - handle price conversion if provided
    const data: any = { ...sessionType };
    if (data.price !== undefined && typeof data.price === 'number') {
      data.price = data.price as unknown as Prisma.Decimal;
    }
    
    // Update the session type in the database
    const updatedSessionType = await db.sessionType.update({
      where: { id },
      data: data
    });
    
    // Return the updated session type with the interface expected by the application
    return {
      id: updatedSessionType.id,
      builderId: updatedSessionType.builderId,
      title: updatedSessionType.title,
      description: updatedSessionType.description,
      durationMinutes: updatedSessionType.durationMinutes,
      price: Number(updatedSessionType.price), // Convert Decimal to number
      currency: updatedSessionType.currency,
      isActive: updatedSessionType.isActive,
      color: updatedSessionType.color || undefined,
      maxParticipants: updatedSessionType.maxParticipants || undefined
    };
  } catch (error) {
    console.error(`Error updating session type ${id}:`, error);
    throw new Error('Failed to update session type');
  }
}

/**
 * Delete a session type
 * 
 * @param id Session type ID
 * @returns Boolean indicating success
 */
export async function deleteSessionType(id: string): Promise<boolean> {
  try {
    // Delete the session type from the database
    await db.sessionType.delete({
      where: { id }
    });
    
    return true;
  } catch (error) {
    console.error(`Error deleting session type ${id}:`, error);
    throw new Error('Failed to delete session type');
  }
}

/**
 * Get availability rules for a builder
 * 
 * @param builderId Builder ID
 * @returns List of availability rules
 */
export async function getAvailabilityRules(builderId: string): Promise<AvailabilityRule[]> {
  try {
    // This is a placeholder for the real implementation
    throw new Error('AvailabilityRule database implementation required');
    
    // Future implementation will be similar to:
    // const rules = await db.availabilityRule.findMany({
    //   where: { builderId }
    // });
    // 
    // return rules.map(rule => ({
    //   id: rule.id,
    //   builderId: rule.builderId,
    //   dayOfWeek: rule.dayOfWeek as 0 | 1 | 2 | 3 | 4 | 5 | 6,
    //   startTime: rule.startTime,
    //   endTime: rule.endTime,
    //   isRecurring: rule.isRecurring
    // }));
  } catch (error) {
    console.error(`Error fetching availability rules for builder ${builderId}:`, error);
    throw new Error('Failed to fetch availability rules');
  }
}

/**
 * Create a new availability rule
 * 
 * @param rule Availability rule data
 * @returns The created rule
 */
export async function createAvailabilityRule(
  rule: Omit<AvailabilityRule, 'id'>
): Promise<AvailabilityRule> {
  try {
    // This is a placeholder for the real implementation
    throw new Error('AvailabilityRule database implementation required');
    
    // Future implementation will be similar to:
    // const newRule = await db.availabilityRule.create({
    //   data: {
    //     builderId: rule.builderId,
    //     dayOfWeek: rule.dayOfWeek,
    //     startTime: rule.startTime,
    //     endTime: rule.endTime,
    //     isRecurring: rule.isRecurring
    //   }
    // });
    // 
    // return {
    //   id: newRule.id,
    //   builderId: newRule.builderId,
    //   dayOfWeek: newRule.dayOfWeek as 0 | 1 | 2 | 3 | 4 | 5 | 6,
    //   startTime: newRule.startTime,
    //   endTime: newRule.endTime,
    //   isRecurring: newRule.isRecurring
    // };
  } catch (error) {
    console.error('Error creating availability rule:', error);
    throw new Error('Failed to create availability rule');
  }
}

/**
 * Update an existing availability rule
 * 
 * @param id Rule ID
 * @param rule Updated rule data
 * @returns The updated rule
 */
export async function updateAvailabilityRule(
  id: string,
  rule: Partial<Omit<AvailabilityRule, 'id'>>
): Promise<AvailabilityRule> {
  try {
    // This is a placeholder for the real implementation
    throw new Error('AvailabilityRule database implementation required');
    
    // Future implementation will be similar to:
    // const updatedRule = await db.availabilityRule.update({
    //   where: { id },
    //   data: rule
    // });
    // 
    // return {
    //   id: updatedRule.id,
    //   builderId: updatedRule.builderId,
    //   dayOfWeek: updatedRule.dayOfWeek as 0 | 1 | 2 | 3 | 4 | 5 | 6,
    //   startTime: updatedRule.startTime,
    //   endTime: updatedRule.endTime,
    //   isRecurring: updatedRule.isRecurring
    // };
  } catch (error) {
    console.error(`Error updating availability rule ${id}:`, error);
    throw new Error('Failed to update availability rule');
  }
}

/**
 * Delete an availability rule
 * 
 * @param id Rule ID
 * @returns Boolean indicating success
 */
export async function deleteAvailabilityRule(id: string): Promise<boolean> {
  try {
    // This is a placeholder for the real implementation
    throw new Error('AvailabilityRule database implementation required');
    
    // Future implementation will be similar to:
    // await db.availabilityRule.delete({
    //   where: { id }
    // });
    // 
    // return true;
  } catch (error) {
    console.error(`Error deleting availability rule ${id}:`, error);
    throw new Error('Failed to delete availability rule');
  }
}

/**
 * Get availability exceptions for a builder
 * 
 * @param builderId Builder ID
 * @param startDate Optional start date for filtering
 * @param endDate Optional end date for filtering
 * @returns List of availability exceptions
 */
export async function getAvailabilityExceptions(
  builderId: string,
  startDate?: string,
  endDate?: string
): Promise<AvailabilityException[]> {
  try {
    // This is a placeholder for the real implementation
    throw new Error('AvailabilityException database implementation required');
    
    // Future implementation will be similar to:
    // let where: any = { builderId };
    // 
    // if (startDate && endDate) {
    //   where.date = {
    //     gte: startDate,
    //     lte: endDate
    //   };
    // }
    // 
    // const exceptions = await db.availabilityException.findMany({
    //   where,
    //   include: {
    //     slots: true
    //   }
    // });
    // 
    // return exceptions.map(ex => ({
    //   id: ex.id,
    //   builderId: ex.builderId,
    //   date: ex.date,
    //   isAvailable: ex.isAvailable,
    //   slots: ex.slots?.map(slot => ({
    //     id: slot.id,
    //     startTime: slot.startTime.toISOString(),
    //     endTime: slot.endTime.toISOString(),
    //     isBooked: slot.isBooked
    //   }))
    // }));
  } catch (error) {
    console.error(`Error fetching availability exceptions for builder ${builderId}:`, error);
    throw new Error('Failed to fetch availability exceptions');
  }
}

/**
 * Create a new availability exception
 * 
 * @param exception Exception data
 * @returns The created exception
 */
export async function createAvailabilityException(
  exception: Omit<AvailabilityException, 'id'>
): Promise<AvailabilityException> {
  try {
    // This is a placeholder for the real implementation
    throw new Error('AvailabilityException database implementation required');
    
    // Future implementation will be similar to:
    // const newException = await db.availabilityException.create({
    //   data: {
    //     builderId: exception.builderId,
    //     date: exception.date,
    //     isAvailable: exception.isAvailable,
    //     slots: exception.isAvailable && exception.slots 
    //       ? {
    //           createMany: {
    //             data: exception.slots.map(slot => ({
    //               startTime: slot.startTime,
    //               endTime: slot.endTime,
    //               isBooked: slot.isBooked
    //             }))
    //           }
    //         }
    //       : undefined
    //   },
    //   include: {
    //     slots: true
    //   }
    // });
    // 
    // return {
    //   id: newException.id,
    //   builderId: newException.builderId,
    //   date: newException.date,
    //   isAvailable: newException.isAvailable,
    //   slots: newException.slots?.map(slot => ({
    //     id: slot.id,
    //     startTime: slot.startTime.toISOString(),
    //     endTime: slot.endTime.toISOString(),
    //     isBooked: slot.isBooked
    //   }))
    // };
  } catch (error) {
    console.error('Error creating availability exception:', error);
    throw new Error('Failed to create availability exception');
  }
}

/**
 * Delete an availability exception
 * 
 * @param id Exception ID
 * @returns Boolean indicating success
 */
export async function deleteAvailabilityException(id: string): Promise<boolean> {
  try {
    // This is a placeholder for the real implementation
    throw new Error('AvailabilityException database implementation required');
    
    // Future implementation will be similar to:
    // await db.availabilityException.delete({
    //   where: { id }
    // });
    // 
    // return true;
  } catch (error) {
    console.error(`Error deleting availability exception ${id}:`, error);
    throw new Error('Failed to delete availability exception');
  }
}

/**
 * Get available time slots for a builder
 * 
 * @param builderId Builder ID
 * @param startDate Start date for the range (YYYY-MM-DD)
 * @param endDate End date for the range (YYYY-MM-DD)
 * @param sessionTypeId Optional session type ID for duration calculation
 * @returns List of available time slots
 */
export async function getAvailableTimeSlots(
  builderId: string,
  startDate: string,
  endDate: string,
  sessionTypeId?: string
): Promise<TimeSlot[]> {
  try {
    // This is a placeholder for the real implementation that will:
    // 1. Get builder's availability rules
    // 2. Get builder's availability exceptions
    // 3. Get builder's existing bookings in the date range
    // 4. Calculate available time slots based on the above

    // For now, we'll throw an error to indicate implementation is needed
    throw new Error('TimeSlot generation implementation required');
    
    // Future implementation would generate available slots based on:
    // - Builder's weekly availability rules
    // - Any exceptions (days off or special hours)
    // - Existing bookings
    // - Session duration + buffer time
  } catch (error) {
    console.error(`Error generating available time slots for builder ${builderId}:`, error);
    throw new Error('Failed to generate available time slots');
  }
}

/**
 * Get all bookings for a builder
 * 
 * @param builderId Builder ID
 * @param startDate Optional start date for filtering
 * @param endDate Optional end date for filtering
 * @param status Optional booking status for filtering
 * @returns List of bookings
 */
export async function getBuilderBookings(
  builderId: string,
  startDate?: string,
  endDate?: string,
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
): Promise<Booking[]> {
  try {
    let whereClause: Prisma.BookingWhereInput = {
      builderId
    };
    
    // Add date range filter if provided
    if (startDate && endDate) {
      whereClause.startTime = {
        gte: new Date(startDate),
      };
      whereClause.endTime = {
        lte: new Date(endDate),
      };
    }
    
    // Add status filter if provided
    if (status) {
      whereClause.status = status.toUpperCase() as any;
    }
    
    const bookings = await db.booking.findMany({
      where: whereClause,
      orderBy: {
        startTime: 'asc'
      }
    });
    
    return bookings.map(transformBooking);
  } catch (error) {
    console.error(`Error fetching bookings for builder ${builderId}:`, error);
    throw new Error('Failed to fetch builder bookings');
  }
}

/**
 * Get all bookings for a client
 * 
 * @param clientId Client ID
 * @param startDate Optional start date for filtering
 * @param endDate Optional end date for filtering
 * @param status Optional booking status for filtering
 * @returns List of bookings
 */
export async function getClientBookings(
  clientId: string,
  startDate?: string,
  endDate?: string,
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
): Promise<Booking[]> {
  try {
    let whereClause: Prisma.BookingWhereInput = {
      clientId
    };
    
    // Add date range filter if provided
    if (startDate && endDate) {
      whereClause.startTime = {
        gte: new Date(startDate),
      };
      whereClause.endTime = {
        lte: new Date(endDate),
      };
    }
    
    // Add status filter if provided
    if (status) {
      whereClause.status = status.toUpperCase() as any;
    }
    
    const bookings = await db.booking.findMany({
      where: whereClause,
      orderBy: {
        startTime: 'asc'
      }
    });
    
    return bookings.map(transformBooking);
  } catch (error) {
    console.error(`Error fetching bookings for client ${clientId}:`, error);
    throw new Error('Failed to fetch client bookings');
  }
}

/**
 * Get a specific booking by ID
 * 
 * @param bookingId Booking ID
 * @returns The booking or null if not found
 */
export async function getBookingById(bookingId: string): Promise<Booking | null> {
  try {
    const booking = await db.booking.findUnique({
      where: { id: bookingId }
    });
    
    if (!booking) {
      return null;
    }
    
    return transformBooking(booking);
  } catch (error) {
    console.error(`Error fetching booking ${bookingId}:`, error);
    throw new Error('Failed to fetch booking');
  }
}

/**
 * Create a new booking
 * 
 * @param bookingData Booking data
 * @returns The created booking
 */
export async function createBooking(
  bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Booking> {
  try {
    // Check if slot is available first
    // This would involve checking existing bookings for conflicts
    // and verifying against builder availability
    
    const newBooking = await db.booking.create({
      data: {
        builderId: bookingData.builderId,
        clientId: bookingData.clientId,
        title: bookingData.sessionTypeId, // This is temporary until we implement session types
        description: bookingData.notes,
        startTime: new Date(bookingData.startTime),
        endTime: new Date(bookingData.endTime),
        status: bookingData.status.toUpperCase() as any,
        paymentStatus: (bookingData.paymentStatus?.toUpperCase() as any) || 'UNPAID',
        stripeSessionId: bookingData.checkoutSessionId,
        amount: 0, // This would come from the session type price
      }
    });
    
    return transformBooking(newBooking);
  } catch (error) {
    console.error('Error creating booking:', error);
    throw new Error('Failed to create booking');
  }
}

/**
 * Update a booking status
 * 
 * @param bookingId Booking ID
 * @param status New booking status
 * @returns The updated booking
 */
export async function updateBookingStatus(
  bookingId: string,
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
): Promise<Booking> {
  try {
    const updatedBooking = await db.booking.update({
      where: { id: bookingId },
      data: {
        status: status.toUpperCase() as any
      }
    });
    
    return transformBooking(updatedBooking);
  } catch (error) {
    console.error(`Error updating booking status ${bookingId}:`, error);
    throw new Error('Failed to update booking status');
  }
}

/**
 * Update booking payment status
 * 
 * @param bookingId Booking ID
 * @param paymentStatus New payment status
 * @param paymentId Optional payment ID
 * @returns The updated booking
 */
export async function updateBookingPayment(
  bookingId: string,
  paymentStatus: 'unpaid' | 'pending' | 'paid' | 'failed',
  paymentId?: string
): Promise<Booking> {
  try {
    const updatedBooking = await db.booking.update({
      where: { id: bookingId },
      data: {
        paymentStatus: paymentStatus.toUpperCase() as any,
        stripeSessionId: paymentId
      }
    });
    
    return transformBooking(updatedBooking);
  } catch (error) {
    console.error(`Error updating booking payment ${bookingId}:`, error);
    throw new Error('Failed to update booking payment');
  }
}

/**
 * Get the full scheduling profile for a builder
 * 
 * @param builderId Builder ID
 * @returns Complete builder scheduling profile
 */
export async function getBuilderSchedulingProfile(builderId: string): Promise<BuilderSchedulingProfile | null> {
  try {
    // This is a placeholder for the real implementation
    // In the full implementation, we would:
    // 1. Get the builder's profile from the database
    // 2. Get their availability rules
    // 3. Get their availability exceptions
    // 4. Get their session types
    // 5. Combine all this into a complete scheduling profile
    
    throw new Error('BuilderSchedulingProfile implementation required');
    
    // Future implementation would return a complete profile
  } catch (error) {
    console.error(`Error fetching scheduling profile for builder ${builderId}:`, error);
    throw new Error('Failed to fetch builder scheduling profile');
  }
}

/**
 * Get the scheduling profile for a client
 * 
 * @param clientId Client ID
 * @returns Client scheduling profile
 */
export async function getClientSchedulingProfile(clientId: string): Promise<ClientSchedulingProfile | null> {
  try {
    // Get client bookings
    const bookings = await getClientBookings(clientId);
    
    // For now, we'll construct a minimal client profile
    // In the future, we would add client preferences from the database
    return {
      clientId,
      timezone: 'Etc/UTC', // Default timezone (would come from user preferences)
      preferredSessionTypes: [],
      bookings
    };
  } catch (error) {
    console.error(`Error fetching scheduling profile for client ${clientId}:`, error);
    throw new Error('Failed to fetch client scheduling profile');
  }
}

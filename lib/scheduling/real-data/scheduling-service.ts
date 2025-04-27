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
import * as Sentry from '@sentry/nextjs';

/**
 * Transform raw database Booking to match our Booking interface
 */
function transformBooking(booking: any): Booking {
  try {
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
  } catch (error) {
    console.error('Error transforming booking:', error);
    Sentry.captureException(error);
    
    // Return a minimal valid booking object to prevent cascading failures
    return {
      id: booking.id || 'unknown',
      sessionTypeId: booking.sessionTypeId || '',
      builderId: booking.builderId || 'unknown',
      clientId: booking.clientId || 'unknown',
      startTime: booking.startTime?.toISOString() || new Date().toISOString(),
      endTime: booking.endTime?.toISOString() || new Date().toISOString(),
      status: 'pending',
      clientTimezone: 'Etc/UTC',
      builderTimezone: 'Etc/UTC',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
}

/**
 * Transform raw database SessionType to match our SessionType interface
 */
function transformSessionType(sessionType: any): SessionType {
  return {
    id: sessionType.id,
    builderId: sessionType.builderId,
    title: sessionType.title,
    description: sessionType.description,
    durationMinutes: sessionType.durationMinutes,
    price: Number(sessionType.price), // Convert Decimal to number
    currency: sessionType.currency,
    isActive: sessionType.isActive,
    color: sessionType.color || undefined,
    maxParticipants: sessionType.maxParticipants || undefined
  };
}

/**
 * Get all session types for a specific builder
 * 
 * @param builderId Builder unique identifier or 'all' to get all session types
 * @returns List of session types offered by the builder(s)
 */
export async function getSessionTypes(builderId: string): Promise<SessionType[]> {
  try {
    // Get session types from the database
    const whereClause = builderId === 'all' 
      ? {} 
      : { builderId, isActive: true };
      
    const sessionTypes = await db.sessionType.findMany({
      where: whereClause,
      orderBy: {
        price: 'asc'
      }
    });
    
    // Transform them to the interface expected by the application
    return sessionTypes.map(transformSessionType);
  } catch (error) {
    console.error(`Error fetching session types for builder ${builderId}:`, error);
    Sentry.captureException(error);
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
    // Convert price to Prisma.Decimal for database storage
    const priceDecimal = sessionType.price as unknown as Prisma.Decimal;
    
    // Create the session type in the database
    const newSessionType = await db.sessionType.create({
      data: {
        builderId: sessionType.builderId,
        title: sessionType.title,
        description: sessionType.description,
        durationMinutes: sessionType.durationMinutes,
        price: priceDecimal,
        currency: sessionType.currency,
        isActive: sessionType.isActive,
        color: sessionType.color,
        maxParticipants: sessionType.maxParticipants
      }
    });
    
    // Return the created session type with the interface expected by the application
    return transformSessionType(newSessionType);
  } catch (error) {
    console.error('Error creating session type:', error);
    Sentry.captureException(error);
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
      data
    });
    
    // Return the updated session type with the interface expected by the application
    return transformSessionType(updatedSessionType);
  } catch (error) {
    console.error(`Error updating session type ${id}:`, error);
    Sentry.captureException(error);
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
    Sentry.captureException(error);
    throw new Error('Failed to delete session type');
  }
}

/**
 * Transform raw database AvailabilityRule to match our AvailabilityRule interface
 */
function transformAvailabilityRule(rule: any): AvailabilityRule {
  try {
    return {
      id: rule.id,
      builderId: rule.builderId,
      dayOfWeek: rule.dayOfWeek as 0 | 1 | 2 | 3 | 4 | 5 | 6,
      startTime: rule.startTime,
      endTime: rule.endTime,
      isRecurring: rule.isRecurring
    };
  } catch (error) {
    console.error('Error transforming availability rule:', error);
    Sentry.captureException(error);
    
    // Return a minimal valid rule object to prevent cascading failures
    return {
      id: rule.id || 'unknown',
      builderId: rule.builderId || 'unknown',
      dayOfWeek: 0,
      startTime: '09:00',
      endTime: '17:00',
      isRecurring: true
    };
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
    const rules = await db.availabilityRule.findMany({
      where: { builderId },
      orderBy: {
        dayOfWeek: 'asc'
      }
    });
    
    return rules.map(transformAvailabilityRule);
  } catch (error) {
    console.error(`Error fetching availability rules for builder ${builderId}:`, error);
    Sentry.captureException(error);
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
    // Validate time format
    if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(rule.startTime) || 
        !/^([01]\d|2[0-3]):([0-5]\d)$/.test(rule.endTime)) {
      throw new Error('Time must be in 24-hour format "HH:MM"');
    }
    
    // Validate that startTime is before endTime
    if (rule.startTime >= rule.endTime) {
      throw new Error('Start time must be before end time');
    }
    
    // Validate dayOfWeek is between 0-6
    if (rule.dayOfWeek < 0 || rule.dayOfWeek > 6) {
      throw new Error('Day of week must be between 0 (Sunday) and 6 (Saturday)');
    }
    
    // Create the rule in the database
    const newRule = await db.availabilityRule.create({
      data: {
        builderId: rule.builderId,
        dayOfWeek: rule.dayOfWeek,
        startTime: rule.startTime,
        endTime: rule.endTime,
        isRecurring: rule.isRecurring
      }
    });
    
    return transformAvailabilityRule(newRule);
  } catch (error) {
    console.error('Error creating availability rule:', error);
    Sentry.captureException(error);
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
    // Validate time format if provided
    if (rule.startTime && !/^([01]\d|2[0-3]):([0-5]\d)$/.test(rule.startTime)) {
      throw new Error('Start time must be in 24-hour format "HH:MM"');
    }
    
    if (rule.endTime && !/^([01]\d|2[0-3]):([0-5]\d)$/.test(rule.endTime)) {
      throw new Error('End time must be in 24-hour format "HH:MM"');
    }
    
    // If both start and end time are provided, validate that start is before end
    if (rule.startTime && rule.endTime && rule.startTime >= rule.endTime) {
      throw new Error('Start time must be before end time');
    }
    
    // Validate dayOfWeek is between 0-6 if provided
    if (rule.dayOfWeek !== undefined && (rule.dayOfWeek < 0 || rule.dayOfWeek > 6)) {
      throw new Error('Day of week must be between 0 (Sunday) and 6 (Saturday)');
    }
    
    // Get the existing rule to make date validation possible with partial data
    const existingRule = await db.availabilityRule.findUnique({
      where: { id }
    });
    
    if (!existingRule) {
      throw new Error(`Availability rule with ID ${id} not found`);
    }
    
    // Update the rule in the database
    const updatedRule = await db.availabilityRule.update({
      where: { id },
      data: rule
    });
    
    return transformAvailabilityRule(updatedRule);
  } catch (error) {
    console.error(`Error updating availability rule ${id}:`, error);
    Sentry.captureException(error);
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
    // Check if the rule exists before attempting to delete
    const rule = await db.availabilityRule.findUnique({
      where: { id }
    });
    
    if (!rule) {
      throw new Error(`Availability rule with ID ${id} not found`);
    }
    
    // Delete the rule from the database
    await db.availabilityRule.delete({
      where: { id }
    });
    
    return true;
  } catch (error) {
    console.error(`Error deleting availability rule ${id}:`, error);
    Sentry.captureException(error);
    throw new Error('Failed to delete availability rule');
  }
}

/**
 * Transform raw database AvailabilityException to match our AvailabilityException interface
 */
function transformAvailabilityException(exception: any): AvailabilityException {
  try {
    return {
      id: exception.id,
      builderId: exception.builderId,
      date: exception.date.toISOString().split('T')[0], // Format as YYYY-MM-DD
      isAvailable: exception.isAvailable,
      slots: exception.slots?.map((slot: any) => ({
        id: slot.id,
        startTime: slot.startTime.toISOString(),
        endTime: slot.endTime.toISOString(),
        isBooked: slot.isBooked
      }))
    };
  } catch (error) {
    console.error('Error transforming availability exception:', error);
    Sentry.captureException(error);
    
    // Return a minimal valid exception object to prevent cascading failures
    return {
      id: exception.id || 'unknown',
      builderId: exception.builderId || 'unknown',
      date: exception.date?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
      isAvailable: exception.isAvailable || false,
      slots: []
    };
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
    let where: any = { builderId };
    
    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }
    
    const exceptions = await db.availabilityException.findMany({
      where,
      include: {
        slots: true
      },
      orderBy: {
        date: 'asc'
      }
    });
    
    return exceptions.map(transformAvailabilityException);
  } catch (error) {
    console.error(`Error fetching availability exceptions for builder ${builderId}:`, error);
    Sentry.captureException(error);
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
    // Validate the date format
    const dateObj = new Date(exception.date);
    if (isNaN(dateObj.getTime())) {
      throw new Error('Invalid date format. Please use YYYY-MM-DD');
    }
    
    // Check for existing exception on the same date for the builder
    const existingException = await db.availabilityException.findFirst({
      where: {
        builderId: exception.builderId,
        date: {
          gte: startOfDay(dateObj),
          lte: endOfDay(dateObj)
        }
      }
    });
    
    if (existingException) {
      throw new Error(`An availability exception already exists for this date`);
    }
    
    // Validate slots if available
    if (exception.isAvailable && exception.slots && exception.slots.length > 0) {
      // Validate each slot
      for (const slot of exception.slots) {
        const startTime = new Date(slot.startTime);
        const endTime = new Date(slot.endTime);
        
        if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
          throw new Error('Invalid time format in slots');
        }
        
        if (startTime >= endTime) {
          throw new Error('Slot start time must be before end time');
        }
      }
    }
    
    // Create the exception in the database
    const newException = await db.availabilityException.create({
      data: {
        builderId: exception.builderId,
        date: dateObj,
        isAvailable: exception.isAvailable,
        slots: exception.isAvailable && exception.slots 
          ? {
              createMany: {
                data: exception.slots.map(slot => ({
                  startTime: new Date(slot.startTime),
                  endTime: new Date(slot.endTime),
                  isBooked: slot.isBooked || false
                }))
              }
            }
          : undefined
      },
      include: {
        slots: true
      }
    });
    
    return transformAvailabilityException(newException);
  } catch (error) {
    console.error('Error creating availability exception:', error);
    Sentry.captureException(error);
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
    // Check if the exception exists before attempting to delete
    const exception = await db.availabilityException.findUnique({
      where: { id }
    });
    
    if (!exception) {
      throw new Error(`Availability exception with ID ${id} not found`);
    }
    
    // Delete the exception from the database
    // Note: Related slots will be automatically deleted due to the cascade delete in the schema
    await db.availabilityException.delete({
      where: { id }
    });
    
    return true;
  } catch (error) {
    console.error(`Error deleting availability exception ${id}:`, error);
    Sentry.captureException(error);
    throw new Error('Failed to delete availability exception');
  }
}

/**
 * Get an availability exception by ID
 * 
 * @param id Exception ID
 * @returns The exception or null if not found
 */
export async function getAvailabilityExceptionById(id: string): Promise<AvailabilityException | null> {
  try {
    const exception = await db.availabilityException.findUnique({
      where: { id },
      include: {
        slots: true
      }
    });
    
    if (!exception) {
      return null;
    }
    
    return transformAvailabilityException(exception);
  } catch (error) {
    console.error(`Error fetching availability exception ${id}:`, error);
    Sentry.captureException(error);
    throw new Error('Failed to fetch availability exception');
  }
}

/**
 * Update an existing availability exception
 * 
 * @param id Exception ID
 * @param exception Updated exception data
 * @returns The updated exception
 */
export async function updateAvailabilityException(
  id: string,
  exception: Partial<Omit<AvailabilityException, 'id'>>
): Promise<AvailabilityException> {
  try {
    // Get the existing exception
    const existingException = await db.availabilityException.findUnique({
      where: { id },
      include: {
        slots: true
      }
    });
    
    if (!existingException) {
      throw new Error(`Availability exception with ID ${id} not found`);
    }
    
    // If updating date, validate the format
    let dateObj: Date | undefined;
    if (exception.date) {
      dateObj = new Date(exception.date);
      if (isNaN(dateObj.getTime())) {
        throw new Error('Invalid date format. Please use YYYY-MM-DD');
      }
      
      // Check if another exception exists on this date
      const conflictingException = await db.availabilityException.findFirst({
        where: {
          builderId: existingException.builderId,
          date: {
            gte: startOfDay(dateObj),
            lte: endOfDay(dateObj)
          },
          id: { not: id } // Exclude the current exception
        }
      });
      
      if (conflictingException) {
        throw new Error(`Another availability exception already exists for this date`);
      }
    }
    
    // Prepare the transaction
    // 1. Update the exception
    // 2. If slots are provided and the exception is available, update the slots
    const isAvailable = exception.isAvailable !== undefined ? exception.isAvailable : existingException.isAvailable;
    
    // Start the transaction
    const updatedException = await db.$transaction(async (prisma) => {
      // Update the exception
      const updated = await prisma.availabilityException.update({
        where: { id },
        data: {
          date: dateObj,
          isAvailable,
        },
        include: {
          slots: true
        }
      });
      
      // If slots are provided and the exception is available, update the slots
      if (exception.slots && isAvailable) {
        // Delete existing slots
        await prisma.exceptionTimeSlot.deleteMany({
          where: { availabilityExceptionId: id }
        });
        
        // Create new slots
        for (const slot of exception.slots) {
          await prisma.exceptionTimeSlot.create({
            data: {
              availabilityExceptionId: id,
              startTime: new Date(slot.startTime),
              endTime: new Date(slot.endTime),
              isBooked: slot.isBooked || false
            }
          });
        }
      }
      
      // Get the updated exception with slots
      return await prisma.availabilityException.findUnique({
        where: { id },
        include: {
          slots: true
        }
      });
    });
    
    return transformAvailabilityException(updatedException);
  } catch (error) {
    console.error(`Error updating availability exception ${id}:`, error);
    Sentry.captureException(error);
    throw new Error('Failed to update availability exception');
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
    // 1. Get builder's profile for settings
    const builderProfile = await db.builderProfile.findFirst({
      where: { id: builderId }
    });
    
    if (!builderProfile) {
      throw new Error(`Builder with ID ${builderId} not found`);
    }
    
    if (!builderProfile.isAcceptingBookings) {
      return []; // Builder is not accepting bookings
    }
    
    // 2. Get session type if provided for duration calculation
    let sessionDuration = 60; // Default 60 minutes if no session type provided
    if (sessionTypeId) {
      const sessionType = await db.sessionType.findUnique({
        where: { id: sessionTypeId }
      });
      
      if (sessionType) {
        sessionDuration = sessionType.durationMinutes;
      }
    }
    
    // 3. Get builder's availability rules
    const availabilityRules = await getAvailabilityRules(builderId);
    
    // 4. Get builder's availability exceptions in the date range
    const availabilityExceptions = await getAvailabilityExceptions(builderId, startDate, endDate);
    
    // 5. Get builder's existing bookings in the date range
    const existingBookings = await getBuilderBookings(builderId, startDate, endDate, 'confirmed');
    
    // 6. Convert date strings to Date objects
    const startDateTime = new Date(startDate);
    const endDateTime = new Date(endDate);
    
    // 7. Get all days in the range
    const days = eachDayOfInterval({ start: startDateTime, end: endDateTime });
    
    // 8. Initialize array for available time slots
    const availableTimeSlots: TimeSlot[] = [];
    
    // 9. For each day in the range, generate available time slots
    for (const day of days) {
      // Check if this day has an exception
      const dateString = format(day, 'yyyy-MM-dd');
      const exception = availabilityExceptions.find(ex => ex.date === dateString);
      
      if (exception) {
        // If this is a blocked day, skip it
        if (!exception.isAvailable) {
          continue;
        }
        
        // If this is a special availability day, use the exception slots
        if (exception.slots && exception.slots.length > 0) {
          for (const slot of exception.slots) {
            if (!slot.isBooked) {
              availableTimeSlots.push({
                id: `${dateString}-${slot.startTime}-${slot.endTime}`,
                startTime: slot.startTime,
                endTime: slot.endTime,
                isBooked: false
              });
            }
          }
        }
        
        // Move to the next day since we've handled this exception
        continue;
      }
      
      // Check if this day has a regular availability rule
      const dayOfWeek = day.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6;
      const rulesForDay = availabilityRules.filter(rule => rule.dayOfWeek === dayOfWeek);
      
      if (rulesForDay.length === 0) {
        continue; // No availability for this day
      }
      
      // Generate slots for each availability rule for this day
      for (const rule of rulesForDay) {
        // Parse the start and end times of the rule
        const [startHour, startMinute] = rule.startTime.split(':').map(Number);
        const [endHour, endMinute] = rule.endTime.split(':').map(Number);
        
        // Create date objects for the start and end of the availability
        const ruleStartDateTime = new Date(day);
        ruleStartDateTime.setHours(startHour, startMinute, 0, 0);
        
        const ruleEndDateTime = new Date(day);
        ruleEndDateTime.setHours(endHour, endMinute, 0, 0);
        
        // Generate slots with the session duration + buffer
        let slotStart = new Date(ruleStartDateTime);
        while (addMinutes(slotStart, sessionDuration + builderProfile.bufferBetweenSessions) <= ruleEndDateTime) {
          const slotEnd = addMinutes(slotStart, sessionDuration);
          
          // Check if this slot overlaps with any existing bookings
          const isOverlapping = existingBookings.some(booking => {
            const bookingStart = new Date(booking.startTime);
            const bookingEnd = new Date(booking.endTime);
            return (
              (slotStart >= bookingStart && slotStart < bookingEnd) ||
              (slotEnd > bookingStart && slotEnd <= bookingEnd) ||
              (slotStart <= bookingStart && slotEnd >= bookingEnd)
            );
          });
          
          if (!isOverlapping) {
            availableTimeSlots.push({
              id: `${dateString}-${slotStart.toISOString()}-${slotEnd.toISOString()}`,
              startTime: slotStart.toISOString(),
              endTime: slotEnd.toISOString(),
              isBooked: false
            });
          }
          
          // Move to the next slot
          slotStart = addMinutes(slotStart, sessionDuration + builderProfile.bufferBetweenSessions);
        }
      }
    }
    
    // 10. Apply minimum notice and maximum advance booking constraints
    const now = new Date();
    const minimumNoticeTime = addMinutes(now, builderProfile.minimumNotice);
    const maximumAdvanceDate = addMinutes(now, builderProfile.maximumAdvanceBooking * 24 * 60);
    
    return availableTimeSlots.filter(slot => {
      const slotStartTime = new Date(slot.startTime);
      return slotStartTime >= minimumNoticeTime && slotStartTime <= maximumAdvanceDate;
    });
  } catch (error) {
    console.error(`Error generating available time slots for builder ${builderId}:`, error);
    Sentry.captureException(error);
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
    Sentry.captureException(error);
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
    Sentry.captureException(error);
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
    Sentry.captureException(error);
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
    // In a complete implementation, we would:
    // 1. Check if the time slot is available
    // 2. Check if the session type exists and is valid
    // 3. Calculate the correct price based on the session type
    
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
        clientTimezone: bookingData.clientTimezone,
        builderTimezone: bookingData.builderTimezone,
      }
    });
    
    return transformBooking(newBooking);
  } catch (error) {
    console.error('Error creating booking:', error);
    Sentry.captureException(error);
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
    Sentry.captureException(error);
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
    Sentry.captureException(error);
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
    // 1. Get the builder's profile from the database
    const builderProfile = await db.builderProfile.findFirst({
      where: { id: builderId }
    });
    
    if (!builderProfile) {
      return null;
    }
    
    // 2. Get their availability rules
    const availabilityRules = await getAvailabilityRules(builderId);
    
    // 3. Get their availability exceptions (next 3 months)
    const startDate = new Date().toISOString().split('T')[0];
    const endDate = addMinutes(new Date(), 90 * 24 * 60).toISOString().split('T')[0]; // 90 days
    const availabilityExceptions = await getAvailabilityExceptions(builderId, startDate, endDate);
    
    // 4. Get their session types
    const sessionTypes = await getSessionTypes(builderId);
    
    // 5. Combine all this into a complete scheduling profile
    return {
      builderId,
      minimumNotice: builderProfile.minimumNotice,
      bufferBetweenSessions: builderProfile.bufferBetweenSessions,
      maximumAdvanceBooking: builderProfile.maximumAdvanceBooking,
      availabilityRules,
      exceptions: availabilityExceptions,
      sessionTypes,
      timezone: builderProfile.timezone,
      isAcceptingBookings: builderProfile.isAcceptingBookings
    };
  } catch (error) {
    console.error(`Error fetching scheduling profile for builder ${builderId}:`, error);
    Sentry.captureException(error);
    throw new Error('Failed to fetch builder scheduling profile');
  }
}

/**
 * Update a builder's scheduling profile settings
 * 
 * @param builderId Builder ID
 * @param settings Settings to update
 * @returns Updated scheduling profile
 */
export async function updateBuilderSchedulingSettings(
  builderId: string,
  settings: {
    minimumNotice?: number;
    bufferBetweenSessions?: number;
    maximumAdvanceBooking?: number;
    timezone?: string;
    isAcceptingBookings?: boolean;
  }
): Promise<BuilderSchedulingProfile> {
  try {
    // Validate settings
    if (settings.minimumNotice !== undefined && settings.minimumNotice < 0) {
      throw new Error('Minimum notice cannot be negative');
    }
    
    if (settings.bufferBetweenSessions !== undefined && settings.bufferBetweenSessions < 0) {
      throw new Error('Buffer between sessions cannot be negative');
    }
    
    if (settings.maximumAdvanceBooking !== undefined && settings.maximumAdvanceBooking < 1) {
      throw new Error('Maximum advance booking must be at least 1 day');
    }
    
    // Update the builder profile
    await db.builderProfile.update({
      where: { id: builderId },
      data: settings
    });
    
    // Return the updated scheduling profile
    const updatedProfile = await getBuilderSchedulingProfile(builderId);
    
    if (!updatedProfile) {
      throw new Error(`Builder with ID ${builderId} not found`);
    }
    
    return updatedProfile;
  } catch (error) {
    console.error(`Error updating builder scheduling settings for ${builderId}:`, error);
    Sentry.captureException(error);
    throw new Error('Failed to update builder scheduling settings');
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
    Sentry.captureException(error);
    throw new Error('Failed to fetch client scheduling profile');
  }
}
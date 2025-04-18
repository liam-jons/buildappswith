import { 
  addMinutes, 
  format, 
  parse, 
  parseISO, 
  startOfDay, 
  endOfDay,
  eachDayOfInterval,
  addDays,
  isSameDay,
  isWithinInterval
} from 'date-fns';
import { zonedTimeToUtc, utcToZonedTime, format as formatTz } from 'date-fns-tz';
import { AvailabilityRule, AvailabilityException, TimeSlot, BuilderSchedulingProfile } from './types';

/**
 * Generate available time slots based on availability rules, exceptions, and bookings
 * @param date The day to generate slots for
 * @param profile The builder's scheduling profile
 * @param bookedSlots Array of already booked slots
 * @param clientTimezone IANA timezone of the client
 * @returns Array of available time slots
 */
export const generateAvailableTimeSlots = (
  date: Date, 
  profile: BuilderSchedulingProfile,
  bookedSlots: TimeSlot[] = [],
  clientTimezone: string = 'UTC'
): TimeSlot[] => {
  const dayOfWeek = date.getDay();
  const dateStr = format(date, 'yyyy-MM-dd');
  
  // Check if this date has an exception
  const exception = profile.exceptions.find(
    e => format(parseISO(e.date), 'yyyy-MM-dd') === dateStr
  );
  
  // If date is explicitly marked as unavailable, return empty array
  if (exception && !exception.isAvailable) {
    return [];
  }
  
  // If there's a special availability for this date, use that
  if (exception && exception.isAvailable && exception.slots) {
    return exception.slots.filter(slot => {
      return !isSlotBooked(slot, bookedSlots);
    });
  }
  
  // Otherwise, use recurring availability rules
  const rules = profile.availabilityRules.filter(
    rule => rule.dayOfWeek === dayOfWeek && rule.isRecurring
  );
  
  // Generate slots based on rules
  let availableSlots: TimeSlot[] = [];
  
  rules.forEach(rule => {
    const slots = generateSlotsFromRule(rule, date, profile.bufferBetweenSessions, profile.timezone, clientTimezone);
    availableSlots = [...availableSlots, ...slots];
  });
  
  // Filter out booked slots
  return availableSlots.filter(slot => !isSlotBooked(slot, bookedSlots));
};

/**
 * Generate time slots from an availability rule
 */
const generateSlotsFromRule = (
  rule: AvailabilityRule,
  date: Date,
  bufferMinutes: number,
  builderTimezone: string,
  clientTimezone: string
): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const dateStr = format(date, 'yyyy-MM-dd');
  
  // Parse the start and end times in builder's timezone
  const startTime = parse(`${dateStr} ${rule.startTime}`, 'yyyy-MM-dd HH:mm', new Date());
  const endTime = parse(`${dateStr} ${rule.endTime}`, 'yyyy-MM-dd HH:mm', new Date());
  
  // Convert to builder's timezone
  const startTimeInBuilderTz = zonedTimeToUtc(startTime, builderTimezone);
  const endTimeInBuilderTz = zonedTimeToUtc(endTime, builderTimezone);
  
  // Generate 30-minute slots (adjust duration as needed)
  const slotDurationMinutes = 30;
  let currentSlotStart = startTimeInBuilderTz;
  
  while (addMinutes(currentSlotStart, slotDurationMinutes) <= endTimeInBuilderTz) {
    const slotEnd = addMinutes(currentSlotStart, slotDurationMinutes);
    
    // Convert times to client's timezone for display
    const clientStartTime = utcToZonedTime(currentSlotStart, clientTimezone);
    const clientEndTime = utcToZonedTime(slotEnd, clientTimezone);
    
    slots.push({
      id: `${format(currentSlotStart, 'yyyy-MM-dd-HH-mm')}-${format(slotEnd, 'HH-mm')}`,
      startTime: clientStartTime.toISOString(),
      endTime: clientEndTime.toISOString(),
      isBooked: false
    });
    
    // Add buffer between slots
    currentSlotStart = addMinutes(currentSlotStart, slotDurationMinutes + bufferMinutes);
  }
  
  return slots;
};

/**
 * Check if a slot is already booked
 */
const isSlotBooked = (slot: TimeSlot, bookedSlots: TimeSlot[]): boolean => {
  return bookedSlots.some(bookedSlot => {
    const slotStart = parseISO(slot.startTime);
    const slotEnd = parseISO(slot.endTime);
    const bookedStart = parseISO(bookedSlot.startTime);
    const bookedEnd = parseISO(bookedSlot.endTime);
    
    // Check for any overlap
    return (
      (slotStart >= bookedStart && slotStart < bookedEnd) ||
      (slotEnd > bookedStart && slotEnd <= bookedEnd) ||
      (slotStart <= bookedStart && slotEnd >= bookedEnd)
    );
  });
};

/**
 * Get a list of dates that are unavailable (for blocking calendar)
 */
export const getUnavailableDates = (
  startDate: Date,
  endDate: Date,
  profile: BuilderSchedulingProfile
): Date[] => {
  const allDates = eachDayOfInterval({ start: startDate, end: endDate });
  
  return allDates.filter(date => {
    const dayOfWeek = date.getDay();
    const dateStr = format(date, 'yyyy-MM-dd');
    
    // Check if this date has an exception
    const exception = profile.exceptions.find(
      e => format(parseISO(e.date), 'yyyy-MM-dd') === dateStr
    );
    
    // If explicitly marked unavailable
    if (exception && !exception.isAvailable) {
      return true;
    }
    
    // If explicitly marked available
    if (exception && exception.isAvailable) {
      return false;
    }
    
    // Check if there are any recurring rules for this day
    const hasAvailability = profile.availabilityRules.some(
      rule => rule.dayOfWeek === dayOfWeek && rule.isRecurring
    );
    
    // If no availability rules, the day is unavailable
    return !hasAvailability;
  });
};

/**
 * Detect client's timezone (browser-only)
 */
export const detectClientTimezone = (): string => {
  if (typeof Intl !== 'undefined' && Intl.DateTimeFormat) {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }
  return 'UTC';
};

/**
 * Format a date for display with timezone consideration
 */
export const formatInTimezone = (
  date: Date | string,
  format: string,
  timezone: string
): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const zonedDate = utcToZonedTime(dateObj, timezone);
  return formatTz(zonedDate, format, { timeZone: timezone });
};

/**
 * Get common IANA timezones for selector
 */
export const getCommonTimezones = (): { value: string; label: string }[] => {
  return [
    { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
    { value: 'America/New_York', label: 'Eastern Time (US & Canada)' },
    { value: 'America/Chicago', label: 'Central Time (US & Canada)' },
    { value: 'America/Denver', label: 'Mountain Time (US & Canada)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (US & Canada)' },
    { value: 'Europe/London', label: 'London (GMT/BST)' },
    { value: 'Europe/Paris', label: 'Paris, Berlin, Rome (CET/CEST)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
    { value: 'Asia/Shanghai', label: 'Beijing, Shanghai (CST)' },
    { value: 'Asia/Kolkata', label: 'Mumbai, New Delhi (IST)' },
    { value: 'Australia/Sydney', label: 'Sydney (AEST/AEDT)' }
  ];
};
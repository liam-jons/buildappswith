/**
 * Timezone Utilities
 * Version: 1.0.0
 * 
 * Utilities for handling timezone conversions and formatting
 */

import { logger } from '@/lib/logger'

// List of valid IANA timezone identifiers
// This is not a complete list, but includes common ones
const COMMON_TIMEZONES = [
  'UTC',
  'GMT',
  'America/New_York',
  'America/Los_Angeles',
  'America/Chicago',
  'America/Denver',
  'America/Phoenix',
  'America/Anchorage',
  'America/Honolulu',
  'America/Toronto',
  'America/Vancouver',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Moscow',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Singapore',
  'Asia/Dubai',
  'Australia/Sydney',
  'Australia/Melbourne',
  'Pacific/Auckland'
]

// Map of common timezone abbreviations to IANA timezone identifiers
const TIMEZONE_ABBREVIATIONS: Record<string, string> = {
  'EST': 'America/New_York',
  'EDT': 'America/New_York',
  'CST': 'America/Chicago',
  'CDT': 'America/Chicago',
  'MST': 'America/Denver',
  'MDT': 'America/Denver',
  'PST': 'America/Los_Angeles',
  'PDT': 'America/Los_Angeles',
  'GMT': 'UTC',
  'UTC': 'UTC',
  'BST': 'Europe/London',
  'CET': 'Europe/Paris',
  'CEST': 'Europe/Paris',
  'IST': 'Asia/Kolkata',
  'JST': 'Asia/Tokyo',
  'AEST': 'Australia/Sydney',
  'AEDT': 'Australia/Sydney',
  'NZST': 'Pacific/Auckland',
  'NZDT': 'Pacific/Auckland'
}

/**
 * Timezone error
 */
export class TimezoneError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'TimezoneError'
  }
}

/**
 * Convert a timezone to a valid IANA timezone identifier
 * 
 * @param timezone Timezone to normalize
 * @returns Normalized IANA timezone identifier
 */
export function normalizeTimezone(timezone: string): string {
  // If already a valid IANA timezone, return as is
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone })
    return timezone
  } catch (e) {
    // Not a valid IANA timezone, try to convert from abbreviation
  }
  
  // Check if it's a known abbreviation
  const normalized = TIMEZONE_ABBREVIATIONS[timezone.toUpperCase()]
  if (normalized) {
    return normalized
  }
  
  // Fallback to UTC
  logger.warn(`Unknown timezone: ${timezone}, falling back to UTC`)
  return 'UTC'
}

/**
 * Get the current offset in minutes for a timezone
 * 
 * @param timezone Timezone to get offset for
 * @returns Offset in minutes
 */
export function getTimezoneOffset(timezone: string): number {
  const normalizedTimezone = normalizeTimezone(timezone)
  const date = new Date()
  
  // Get the UTC time in milliseconds
  const utcTime = date.getTime() + date.getTimezoneOffset() * 60000
  
  // Create a date object for the target timezone
  const tzDate = new Date(utcTime)
  
  try {
    // Format the date in the target timezone
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: normalizedTimezone,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false
    })
    
    // Parse the formatted date back into a date object
    const parts = formatter.formatToParts(tzDate)
    const dateParts: Record<string, string> = {}
    parts.forEach(part => {
      if (part.type !== 'literal') {
        dateParts[part.type] = part.value
      }
    })
    
    // Create a date object from the parsed parts
    const targetDate = new Date(
      parseInt(dateParts.year),
      parseInt(dateParts.month) - 1,
      parseInt(dateParts.day),
      parseInt(dateParts.hour),
      parseInt(dateParts.minute),
      parseInt(dateParts.second)
    )
    
    // Calculate the offset in minutes
    return (targetDate.getTime() - date.getTime()) / 60000
  } catch (error) {
    logger.error('Error getting timezone offset', { timezone, error })
    throw new TimezoneError(`Unable to get offset for timezone: ${timezone}`)
  }
}

/**
 * Format a date in a specific timezone
 * 
 * @param date Date to format
 * @param timezone Timezone to format date in
 * @param options Format options
 * @returns Formatted date string
 */
export function formatDateInTimezone(
  date: Date,
  timezone: string,
  options: Intl.DateTimeFormatOptions = { 
    dateStyle: 'full', 
    timeStyle: 'long'
  }
): string {
  const normalizedTimezone = normalizeTimezone(timezone)
  
  try {
    return new Intl.DateTimeFormat('en-US', {
      ...options,
      timeZone: normalizedTimezone
    }).format(date)
  } catch (error) {
    logger.error('Error formatting date in timezone', { date, timezone, error })
    throw new TimezoneError(`Unable to format date in timezone: ${timezone}`)
  }
}

/**
 * Convert a date from one timezone to another
 * 
 * @param date Date to convert
 * @param fromTimezone Source timezone
 * @param toTimezone Target timezone
 * @returns Converted date
 */
export function convertDateBetweenTimezones(
  date: Date,
  fromTimezone: string,
  toTimezone: string
): Date {
  const normalizedFromTz = normalizeTimezone(fromTimezone)
  const normalizedToTz = normalizeTimezone(toTimezone)
  
  try {
    // Get the ISO string without the Z (UTC) suffix
    const localISOString = date.toISOString().slice(0, -1)
    
    // Create formatter for source timezone
    const fromFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: normalizedFromTz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })
    
    // Format the date in the source timezone
    const parts = fromFormatter.formatToParts(date)
    const dateParts: Record<string, string> = {}
    parts.forEach(part => {
      if (part.type !== 'literal') {
        dateParts[part.type] = part.value
      }
    })
    
    // Create a date string in the source timezone
    const fromDateString = `${dateParts.year}-${dateParts.month}-${dateParts.day}T${dateParts.hour}:${dateParts.minute}:${dateParts.second}`
    
    // Calculate the offset between the two timezones
    const fromOffset = getTimezoneOffset(normalizedFromTz)
    const toOffset = getTimezoneOffset(normalizedToTz)
    const offsetDiff = toOffset - fromOffset
    
    // Create a new date with the adjusted offset
    const fromDate = new Date(fromDateString)
    const toDate = new Date(fromDate.getTime() + offsetDiff * 60000)
    
    return toDate
  } catch (error) {
    logger.error('Error converting date between timezones', {
      date,
      fromTimezone,
      toTimezone,
      error
    })
    throw new TimezoneError(
      `Unable to convert date from ${fromTimezone} to ${toTimezone}`
    )
  }
}

/**
 * Check if a timezone is valid
 * 
 * @param timezone Timezone to check
 * @returns Whether timezone is valid
 */
export function isValidTimezone(timezone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone })
    return true
  } catch (e) {
    return false
  }
}

/**
 * Get a list of common timezones with their offsets
 * 
 * @returns Array of timezone objects with name and offset
 */
export function getCommonTimezones(): Array<{
  name: string
  offset: string
  current: string
}> {
  const now = new Date()
  
  return COMMON_TIMEZONES.map(timezone => {
    try {
      // Calculate the offset
      const offsetMinutes = getTimezoneOffset(timezone)
      const offsetHours = Math.floor(Math.abs(offsetMinutes) / 60)
      const offsetMinutesPart = Math.abs(offsetMinutes) % 60
      
      // Format the offset
      const offsetSign = offsetMinutes >= 0 ? '+' : '-'
      const offset = `${offsetSign}${offsetHours.toString().padStart(2, '0')}:${offsetMinutesPart.toString().padStart(2, '0')}`
      
      // Format the current time in this timezone
      const current = formatDateInTimezone(now, timezone, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
      
      return {
        name: timezone,
        offset,
        current
      }
    } catch (error) {
      logger.error('Error calculating timezone info', { timezone, error })
      return {
        name: timezone,
        offset: 'Error',
        current: 'Error'
      }
    }
  })
}

/**
 * Format a date range in a specific timezone
 * 
 * @param startDate Start date
 * @param endDate End date
 * @param timezone Timezone to format dates in
 * @returns Formatted date range string
 */
export function formatDateRangeInTimezone(
  startDate: Date,
  endDate: Date,
  timezone: string
): string {
  const normalizedTimezone = normalizeTimezone(timezone)
  
  try {
    // Check if dates are on the same day
    const sameDay = startDate.toDateString() === endDate.toDateString()
    
    if (sameDay) {
      // Format as "Day, Month Date, Year from StartTime to EndTime"
      const dayFormat = formatDateInTimezone(startDate, normalizedTimezone, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
      
      const startTimeFormat = formatDateInTimezone(startDate, normalizedTimezone, {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
      
      const endTimeFormat = formatDateInTimezone(endDate, normalizedTimezone, {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZoneName: 'short'
      })
      
      return `${dayFormat} from ${startTimeFormat} to ${endTimeFormat}`
    } else {
      // Format as "StartDay, Month Date, Year at StartTime to EndDay, Month Date, Year at EndTime"
      const startFormat = formatDateInTimezone(startDate, normalizedTimezone, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
      
      const endFormat = formatDateInTimezone(endDate, normalizedTimezone, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZoneName: 'short'
      })
      
      return `${startFormat} to ${endFormat}`
    }
  } catch (error) {
    logger.error('Error formatting date range in timezone', {
      startDate,
      endDate,
      timezone,
      error
    })
    throw new TimezoneError(`Unable to format date range in timezone: ${timezone}`)
  }
}
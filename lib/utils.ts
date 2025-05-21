import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parseISO } from "date-fns"

// Re-export all utilities from utils/api-utils.ts
export * from './utils/api-utils';

// Re-export all utilities from utils/type-converters.ts
export * from './utils/type-converters';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Animation helper for framer-motion
export function easeOutCubic(x: number): number {
  return 1 - Math.pow(1 - x, 3);
}

/**
 * Format a date string to a human-readable format
 *
 * @param dateString ISO date string to format
 * @param formatStr Optional format string (defaults to 'PPP p')
 * @returns Formatted date string
 */
export function formatDate(dateString: string, formatStr = 'PPP p') {
  try {
    if (!dateString) return '';
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return format(date, formatStr);
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
}

/**
 * Format a date to display time only in 12-hour format
 *
 * @param dateObj Date object or string to format
 * @returns Formatted time string (e.g., "2:30 PM")
 */
export function formatTime(dateObj: Date | string) {
  try {
    const date = typeof dateObj === 'string' ? parseISO(dateObj) : dateObj;
    return format(date, 'h:mm a');
  } catch (error) {
    console.error('Error formatting time:', error);
    return '';
  }
}
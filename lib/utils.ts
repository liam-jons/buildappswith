import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parseISO } from "date-fns"

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

/**
 * Scheduling utilities
 * Version: 1.0.0
 * 
 * Utility functions for scheduling
 */

// Placeholder exports to make this a valid module
export const schedulingUtilsPlaceholder = true;

/**
 * Format a time slot for display
 */
export function formatTimeSlot(startTime: string, endTime: string): string {
  const start = new Date(startTime);
  const end = new Date(endTime);
  
  return `${start.toLocaleTimeString()} - ${end.toLocaleTimeString()}`;
}

/**
 * Check if two time ranges overlap
 */
export function timeRangesOverlap(
  start1: string | Date, 
  end1: string | Date, 
  start2: string | Date, 
  end2: string | Date
): boolean {
  const startTime1 = new Date(start1);
  const endTime1 = new Date(end1);
  const startTime2 = new Date(start2);
  const endTime2 = new Date(end2);
  
  return startTime1 < endTime2 && startTime2 < endTime1;
}
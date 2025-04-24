import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAvailableTimeSlots } from '@/lib/scheduling/real-data/scheduling-service';
import { addDays, subDays, format, parseISO, isValid } from 'date-fns';

// Validation schema for query parameters
const querySchema = z.object({
  builderId: z.string(),
  startDate: z.string().refine(val => {
    const date = parseISO(val);
    return isValid(date);
  }, { message: 'Invalid start date format. Use YYYY-MM-DD' }),
  endDate: z.string().refine(val => {
    const date = parseISO(val);
    return isValid(date);
  }, { message: 'Invalid end date format. Use YYYY-MM-DD' }),
  sessionTypeId: z.string().optional(),
});

/**
 * GET handler for fetching available time slots for a builder
 */
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const rawParams = Object.fromEntries(searchParams.entries());
    
    // Parse and validate parameters
    const result = querySchema.safeParse(rawParams);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: result.error.flatten() }, 
        { status: 400 }
      );
    }
    
    const { builderId, startDate, endDate, sessionTypeId } = result.data;
    
    // Check date range (limit to 30 days to prevent excessive processing)
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    
    const daysDifference = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDifference < 0) {
      return NextResponse.json(
        { error: 'End date must be after start date' }, 
        { status: 400 }
      );
    }
    
    if (daysDifference > 30) {
      return NextResponse.json(
        { error: 'Date range cannot exceed 30 days' }, 
        { status: 400 }
      );
    }
    
    // Fetch available time slots
    try {
      const timeSlots = await getAvailableTimeSlots(builderId, startDate, endDate, sessionTypeId);
      return NextResponse.json({ timeSlots });
    } catch (error: any) {
      // If the service is not fully implemented, generate mock data
      if (error.message === 'TimeSlot generation implementation required') {
        // Generate mock time slots for the date range
        const mockTimeSlots: TimeSlot[] = generateMockTimeSlots(builderId, startDate, endDate);
        
        return NextResponse.json({ 
          timeSlots: mockTimeSlots,
          warning: 'Using mock data - implementation pending'
        });
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error('Error in time slots endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to fetch available time slots' }, 
      { status: 500 }
    );
  }
}

// Define types for the mock availability data
type MockAvailabilityRule = {
  builderId: string;
  dayOfWeek: number; // 0-6 for Sunday-Saturday
  startTime: string; // Format: HH:MM
  endTime: string; // Format: HH:MM
};

// Define a type for time slots
type TimeSlot = {
  id: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
};

/**
 * Helper function to generate mock time slots
 */
function generateMockTimeSlots(builderId: string, startDate: string, endDate: string): TimeSlot[] {
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  
  const timeSlots: TimeSlot[] = [];
  let currentDate = start;
  
  // Import mock rules to determine which days have availability
  const { mockAvailabilityRules } = require('@/lib/scheduling/mock-data') as { 
    mockAvailabilityRules: MockAvailabilityRule[] 
  };
  
  // Get rules for this builder
  const builderRules = mockAvailabilityRules.filter((rule: MockAvailabilityRule) => rule.builderId === builderId);
  
  // Generate time slots for each day in the range
  while (currentDate <= end) {
    const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 6 = Saturday
    
    // Check if this day of week has any availability rules
    const rulesForThisDay = builderRules.filter((rule: MockAvailabilityRule) => rule.dayOfWeek === dayOfWeek);
    
    if (rulesForThisDay.length > 0) {
      // Generate slots for each rule period
      for (const rule of rulesForThisDay) {
        const [startHour, startMinute] = rule.startTime.split(':').map(Number);
        const [endHour, endMinute] = rule.endTime.split(':').map(Number);
        
        // Create 30-minute slots
        for (let hour = startHour; hour < endHour || (hour === endHour && startMinute < endMinute); hour++) {
          for (let minute = (hour === startHour ? startMinute : 0); minute < 60; minute += 30) {
            // Skip if we've passed the end time
            if (hour > endHour || (hour === endHour && minute >= endMinute)) {
              continue;
            }
            
            const slotDate = new Date(currentDate);
            slotDate.setHours(hour, minute, 0, 0);
            
            const endSlotDate = new Date(slotDate);
            endSlotDate.setMinutes(slotDate.getMinutes() + 30);
            
            // Add some randomness to availability
            const isBooked = Math.random() < 0.3; // 30% chance of being booked
            
            timeSlots.push({
              id: `mock-slot-${slotDate.getTime()}`,
              startTime: slotDate.toISOString(),
              endTime: endSlotDate.toISOString(),
              isBooked
            });
          }
        }
      }
    }
    
    // Move to next day
    currentDate = addDays(currentDate, 1);
  }
  
  return timeSlots;
}

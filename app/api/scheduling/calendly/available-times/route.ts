import { NextRequest, NextResponse } from 'next/server';
import { getCalendlyApiClient } from '@/lib/scheduling/calendly/api-client';
import { CalendlyService } from '@/lib/scheduling/calendly/service';
import { logger } from '@/lib/logger';

/**
 * GET /api/scheduling/calendly/available-times
 * 
 * Get available time slots for a Calendly event type
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventTypeUri, startDate, endDate } = body;

    // Validate required parameters
    if (!eventTypeUri || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required parameters: eventTypeUri, startDate, endDate' },
        { status: 400 }
      );
    }

    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);

    // Validate date objects
    if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      );
    }

    // Validate date range (max 7 days)
    const daysDiff = (endDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24);
    if (daysDiff > 7) {
      return NextResponse.json(
        { error: 'Date range cannot exceed 7 days' },
        { status: 400 }
      );
    }

    // Get Calendly API client
    const apiClient = getCalendlyApiClient();
    const calendlyService = new CalendlyService(apiClient);

    // Fetch available time slots
    const timeSlots = await calendlyService.getAvailableTimeSlots(
      eventTypeUri,
      startDateObj,
      endDateObj
    );

    logger.info('Available time slots fetched', {
      eventTypeUri,
      startDate,
      endDate,
      slotsCount: timeSlots.length
    });

    return NextResponse.json({
      success: true,
      timeSlots: timeSlots.map(slot => ({
        startTime: slot.startTime.toISOString(),
        endTime: slot.endTime.toISOString(),
        schedulingUrl: slot.schedulingUrl,
        inviteesRemaining: slot.inviteesRemaining
      }))
    });
  } catch (error) {
    logger.error('Error fetching Calendly available times', { error });
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false 
      },
      { status: 500 }
    );
  }
}
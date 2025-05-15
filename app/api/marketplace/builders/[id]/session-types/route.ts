import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';

/**
 * GET /api/marketplace/builders/[id]/session-types
 * 
 * Public endpoint to get session types for a builder
 * Used by the marketplace booking flow
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const builderId = params.id;
    
    // Get session types for the builder
    const sessionTypes = await db.sessionType.findMany({
      where: {
        builderId,
        isActive: true
      },
      select: {
        id: true,
        title: true,
        description: true,
        durationMinutes: true,
        price: true,
        currency: true,
        color: true,
        requiresAuth: true,
        eventTypeCategory: true,
        calendlyEventTypeUri: true,
        maxParticipants: true,
        displayOrder: true
      },
      orderBy: [
        { displayOrder: 'asc' },
        { title: 'asc' }
      ]
    });
    
    logger.info('Fetched session types for marketplace', {
      builderId,
      count: sessionTypes.length
    });
    
    return NextResponse.json({
      success: true,
      sessionTypes
    });
    
  } catch (error) {
    logger.error('Error fetching marketplace session types', {
      error: error instanceof Error ? error.message : String(error),
      builderId: params.id
    });
    
    return NextResponse.json(
      { error: 'Failed to fetch session types' },
      { status: 500 }
    );
  }
}
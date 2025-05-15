import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';

interface CalendlyEventType {
  uri: string;
  name: string;
  active: boolean;
  slug: string;
  scheduling_url: string;
  duration: number;
  description_plain: string;
  description_html: string;
}

/**
 * GET /api/scheduling/calendly/sync-event-types
 * 
 * Syncs Calendly event types with our database
 * This is a simplified version for now
 */
export async function GET(request: NextRequest) {
  try {
    // For now, we'll use the data we already have in the database
    // In a full implementation, this would fetch from Calendly API
    
    const builderId = request.nextUrl.searchParams.get('builderId') || 'cmacaujmz00018oa34hehwic1';
    
    const sessionTypes = await db.sessionType.findMany({
      where: {
        builderId,
        isActive: true
      },
      orderBy: { displayOrder: 'asc' }
    });
    
    logger.info('Synced Calendly event types', {
      builderId,
      count: sessionTypes.length
    });
    
    return NextResponse.json({
      success: true,
      eventTypes: sessionTypes.map(st => ({
        uri: st.calendlyEventTypeUri,
        name: st.title,
        active: st.isActive,
        duration: st.durationMinutes,
        description_plain: st.description,
        price: st.price.toNumber(),
        requiresAuth: st.requiresAuth,
        category: st.eventTypeCategory
      }))
    });
    
  } catch (error) {
    logger.error('Error syncing Calendly event types', {
      error: error instanceof Error ? error.message : String(error)
    });
    
    return NextResponse.json(
      { error: 'Failed to sync event types' },
      { status: 500 }
    );
  }
}
import { NextResponse } from 'next/server';
import { getTimelineRange } from '@/lib/timeline/real-data/timeline-service';

/**
 * GET handler for fetching the timeline date range
 */
export async function GET() {
  try {
    const range = await getTimelineRange();
    
    return NextResponse.json(range);
  } catch (error) {
    console.error('Error in timeline range endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to fetch timeline range' }, 
      { status: 500 }
    );
  }
}

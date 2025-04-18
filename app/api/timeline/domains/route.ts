import { NextResponse } from 'next/server';
import { getAvailableDomains } from '@/lib/timeline/real-data/timeline-service';

/**
 * GET handler for fetching available domains for filtering
 */
export async function GET() {
  try {
    const domains = await getAvailableDomains();
    
    return NextResponse.json({ domains });
  } catch (error) {
    console.error('Error in timeline domains endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to fetch available domains' }, 
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getBuilderAnalyticsSummary, getBuilderAnalyticsTimeseries, getBuilderSuccessMetrics } from '@/lib/marketplace/data/analytics-service';
import { getCurrentUserId } from '@/lib/auth/actions';
import { getBuilderProfileByUserId } from '@/lib/marketplace/data/marketplace-service';

/**
 * GET /api/marketplace/builders/analytics
 * 
 * Returns analytics data for the builder dashboard
 * Protected endpoint - only accessible by builders for their own data
 */
export async function GET(request: NextRequest) {
  try {
    // Get the current user ID from auth
    const userId = await getCurrentUserId();
    
    // If no authenticated user, return 401
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const period = parseInt(searchParams.get('period') || '30', 10);
    const metrics = searchParams.get('metrics') || 'summary';
    
    // Get builder profile for the current user
    const builderProfile = await getBuilderProfileByUserId(userId);
    
    // If user doesn't have a builder profile, return 403
    if (!builderProfile) {
      return NextResponse.json(
        { error: 'You do not have a builder profile' },
        { status: 403 }
      );
    }
    
    // Fetch requested analytics data
    const builderId = builderProfile.id;
    let result: Record<string, any> = {};
    
    // Determine which data to fetch based on the metrics parameter
    if (metrics === 'summary' || metrics === 'all') {
      result.summary = await getBuilderAnalyticsSummary(builderId, period);
    }
    
    if (metrics === 'timeseries' || metrics === 'all') {
      result.timeseries = await getBuilderAnalyticsTimeseries(builderId, period);
    }
    
    if (metrics === 'success' || metrics === 'all') {
      result.success = await getBuilderSuccessMetrics(builderId);
    }
    
    // Return the analytics data
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in builder analytics endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}
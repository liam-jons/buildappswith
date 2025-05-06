import { prisma } from '@/lib/db';
import {
  MarketplaceEventType,
  MarketplaceEvent
} from '../types';

/**
 * Dashboard Analytics Types
 */
export interface AnalyticsPeriod {
  days: number;
  label: string;
}

export interface AnalyticsSummary {
  profileViews: number;
  profileViewsChange: number;
  searchAppearances: number;
  searchAppearancesChange: number;
  bookingRequests: number;
  bookingRequestsChange: number;
  conversionRate: number;
  conversionRateChange: number;
}

export interface AnalyticsTimeseriesPoint {
  date: string;
  value: number;
}

export interface AnalyticsTimeseries {
  profileViews: AnalyticsTimeseriesPoint[];
  searchAppearances: AnalyticsTimeseriesPoint[];
  bookingRequests: AnalyticsTimeseriesPoint[];
}

/**
 * Get analytics summary for a builder dashboard
 * 
 * @param builderId - The ID of the builder
 * @param period - The time period for analytics (days)
 * @returns Analytics summary with current values and period-over-period changes
 */
export async function getBuilderAnalyticsSummary(
  builderId: string,
  period: number = 30
): Promise<AnalyticsSummary> {
  try {
    // In a real implementation, you would query the database for actual analytics data
    // For now, this is a mock implementation
    
    // Calculate date ranges for current and previous periods
    const now = new Date();
    const currentPeriodStart = new Date();
    currentPeriodStart.setDate(now.getDate() - period);
    
    const previousPeriodStart = new Date(currentPeriodStart);
    previousPeriodStart.setDate(previousPeriodStart.getDate() - period);
    
    // Mock values for demonstration
    // In a real implementation, you would query analytics events from the database
    const profileViews = 182;
    const previousProfileViews = 163;
    
    const searchAppearances = 524;
    const previousSearchAppearances = 485;
    
    const bookingRequests = 28;
    const previousBookingRequests = 23;
    
    // Calculate conversion rate (booking requests / profile views)
    const conversionRate = (bookingRequests / profileViews) * 100;
    const previousConversionRate = (previousBookingRequests / previousProfileViews) * 100;
    
    // Calculate period-over-period changes
    const profileViewsChange = calculatePercentChange(profileViews, previousProfileViews);
    const searchAppearancesChange = calculatePercentChange(searchAppearances, previousSearchAppearances);
    const bookingRequestsChange = calculatePercentChange(bookingRequests, previousBookingRequests);
    const conversionRateChange = calculatePercentChange(conversionRate, previousConversionRate);
    
    return {
      profileViews,
      profileViewsChange,
      searchAppearances,
      searchAppearancesChange,
      bookingRequests,
      bookingRequestsChange,
      conversionRate,
      conversionRateChange
    };
  } catch (error) {
    console.error(`Error fetching analytics summary for builder ${builderId}:`, error);
    throw error;
  }
}

/**
 * Get time series analytics data for a builder dashboard
 * 
 * @param builderId - The ID of the builder
 * @param period - The time period for analytics (days)
 * @returns Time series data for various metrics
 */
export async function getBuilderAnalyticsTimeseries(
  builderId: string,
  period: number = 30
): Promise<AnalyticsTimeseries> {
  try {
    // In a real implementation, you would query the database for actual analytics data
    // For now, this is a mock implementation that generates realistic looking time series data
    
    // Calculate start date
    const now = new Date();
    const startDate = new Date();
    startDate.setDate(now.getDate() - period);
    
    // Generate mock time series data
    const profileViews = generateMockTimeseries(startDate, period, 3, 10);
    const searchAppearances = generateMockTimeseries(startDate, period, 10, 30);
    const bookingRequests = generateMockTimeseries(startDate, period, 0, 3);
    
    return {
      profileViews,
      searchAppearances,
      bookingRequests
    };
  } catch (error) {
    console.error(`Error fetching analytics timeseries for builder ${builderId}:`, error);
    throw error;
  }
}

/**
 * Get success metrics for a builder
 * 
 * @param builderId - The ID of the builder
 * @returns Verified success metrics for dashboard display
 */
export async function getBuilderSuccessMetrics(builderId: string) {
  try {
    // In a real implementation, you would fetch verified metrics from the database
    // These would come from client feedback, project outcomes, etc.
    
    // For now, return mock data
    return {
      metrics: [
        {
          id: "impact",
          name: "Client Impact",
          metrics: [
            {
              label: "Time Saved for Clients",
              value: "245+ hours",
              description: "Total time saved across all client projects",
              trend: "up",
              isHighlighted: true
            },
            {
              label: "Efficiency Improvements",
              value: "32%",
              description: "Average improvement in client workflow efficiency",
              trend: "up"
            },
            {
              label: "Decision Quality",
              value: "27%",
              description: "Average improvement in decision quality",
              trend: "up"
            }
          ]
        },
        {
          id: "performance",
          name: "Builder Performance",
          metrics: [
            {
              label: "Client Satisfaction",
              value: "4.8/5.0",
              description: "Average rating from client feedback",
              trend: "up"
            },
            {
              label: "On-Time Delivery",
              value: "97%",
              description: "Percentage of projects delivered on schedule",
              trend: "neutral"
            },
            {
              label: "Return Clients",
              value: "78%",
              description: "Percentage of clients who book multiple sessions",
              trend: "up"
            }
          ]
        }
      ]
    };
  } catch (error) {
    console.error(`Error fetching success metrics for builder ${builderId}:`, error);
    throw error;
  }
}

/**
 * Track a marketplace event
 * 
 * @param event - The event to track
 */
export async function trackMarketplaceEvent(event: Omit<MarketplaceEvent, 'timestamp'>): Promise<void> {
  try {
    // Add timestamp to event
    const fullEvent: MarketplaceEvent = {
      ...event,
      timestamp: new Date()
    };
    
    // In a real implementation, you would store this event in the database
    // For now, just log it
    console.log('Tracking marketplace event:', fullEvent);
    
    // Example database call (commented out for now)
    /*
    await prisma.marketplaceEvent.create({
      data: {
        type: fullEvent.type,
        userId: fullEvent.userId,
        builderId: fullEvent.builderId,
        searchQuery: fullEvent.searchQuery,
        filters: fullEvent.filters,
        metadata: fullEvent.metadata,
        timestamp: fullEvent.timestamp
      }
    });
    */
  } catch (error) {
    // Non-blocking error handling for analytics
    console.error('Error tracking marketplace event:', error);
  }
}

/**
 * Helper function to calculate period-over-period percent change
 */
function calculatePercentChange(current: number, previous: number): number {
  if (previous === 0) return 0;
  return Math.round(((current - previous) / previous) * 100);
}

/**
 * Helper function to generate mock time series data
 */
function generateMockTimeseries(
  startDate: Date,
  days: number,
  minValue: number,
  maxValue: number
): AnalyticsTimeseriesPoint[] {
  const result: AnalyticsTimeseriesPoint[] = [];
  
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    
    const value = Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue;
    
    result.push({
      date: date.toISOString().split('T')[0], // Format as YYYY-MM-DD
      value
    });
  }
  
  return result;
}

/**
 * Get available analytics time periods
 */
export function getAnalyticsPeriods(): AnalyticsPeriod[] {
  return [
    { days: 7, label: '7 days' },
    { days: 30, label: '30 days' },
    { days: 90, label: '3 months' },
    { days: 365, label: '12 months' }
  ];
}
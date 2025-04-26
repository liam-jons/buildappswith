/**
 * Middleware Performance Monitoring
 * Version: 1.0.77
 * 
 * Provides utilities for monitoring middleware performance:
 * - Execution time tracking
 * - Component-specific timing
 * - Request path categorization
 * 
 * Used for performance optimization and monitoring
 */

import { NextRequest, NextResponse } from 'next/server';

// Performance entry structure
export type PerformanceEntry = {
  component: string;
  path: string;
  startTime: number;
  endTime: number;
  duration: number;
  metadata?: Record<string, any>;
};

// Global storage for performance data (in memory)
// In a production environment, this would be connected to 
// a monitoring/analytics system
const performanceStore: PerformanceEntry[] = [];

/**
 * Track performance of a middleware component
 * @param component Component name
 * @param req Request object
 * @param fn Function to track
 * @param metadata Additional metadata to store
 * @returns Result of the tracked function
 */
export async function trackPerformance<T>(
  component: string,
  req: NextRequest,
  fn: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<T> {
  const path = req.nextUrl.pathname;
  const startTime = performance.now();
  
  try {
    // Execute the function
    const result = await fn();
    return result;
  } finally {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    // Store performance data
    performanceStore.push({
      component,
      path,
      startTime,
      endTime,
      duration,
      metadata
    });
    
    // Log performance data (in development)
    if (process.env.NODE_ENV === 'development') {
      console.log(`Middleware Performance - ${component}: ${duration.toFixed(2)}ms [${path}]`);
    }
  }
}

/**
 * Track performance of multiple middleware components
 * @param components Object mapping component names to functions
 * @param req Request object
 * @returns Object with results of each component
 */
export async function trackMultipleComponents<T extends Record<string, () => Promise<any>>>(
  components: T,
  req: NextRequest
): Promise<{ [K in keyof T]: Awaited<ReturnType<T[K]>> }> {
  const results: any = {};
  
  for (const [name, fn] of Object.entries(components)) {
    results[name] = await trackPerformance(name, req, fn);
  }
  
  return results as { [K in keyof T]: Awaited<ReturnType<T[K]>> };
}

/**
 * Add performance headers to response
 * @param response Next.js response
 * @param entries Performance entries to include
 * @returns Response with performance headers
 */
export function addPerformanceHeaders(
  response: NextResponse,
  entries: PerformanceEntry[]
): NextResponse {
  // Only add in development or when explicitly enabled
  if (process.env.NODE_ENV === 'development' || process.env.ENABLE_PERFORMANCE_HEADERS === 'true') {
    // Calculate total duration
    const totalDuration = entries.reduce((sum, entry) => sum + entry.duration, 0);
    
    // Add headers
    response.headers.set('X-Middleware-Time', `${totalDuration.toFixed(2)}ms`);
    
    // Add component-specific timings
    entries.forEach(entry => {
      response.headers.set(
        `X-Middleware-Component-${entry.component}`, 
        `${entry.duration.toFixed(2)}ms`
      );
    });
  }
  
  return response;
}

/**
 * Get performance entries for analysis
 * @param limit Maximum number of entries to return (default: 100)
 * @param component Optional component filter
 * @returns Array of performance entries
 */
export function getPerformanceEntries(
  limit: number = 100,
  component?: string
): PerformanceEntry[] {
  let entries = performanceStore;
  
  // Filter by component if specified
  if (component) {
    entries = entries.filter(entry => entry.component === component);
  }
  
  // Return most recent entries
  return entries.slice(-limit);
}

/**
 * Calculate performance statistics for a component
 * @param component Component name
 * @param limit Maximum number of entries to consider (default: 100)
 * @returns Performance statistics
 */
export function getComponentStats(
  component: string,
  limit: number = 100
): {
  count: number;
  avgDuration: number;
  minDuration: number;
  maxDuration: number;
  p95Duration: number;
  p99Duration: number;
} {
  const entries = getPerformanceEntries(limit, component);
  
  if (entries.length === 0) {
    return {
      count: 0,
      avgDuration: 0,
      minDuration: 0,
      maxDuration: 0,
      p95Duration: 0,
      p99Duration: 0
    };
  }
  
  // Sort entries by duration
  const sortedDurations = entries.map(entry => entry.duration).sort((a, b) => a - b);
  
  // Calculate statistics
  const count = entries.length;
  const totalDuration = sortedDurations.reduce((sum, duration) => sum + duration, 0);
  const avgDuration = totalDuration / count;
  const minDuration = sortedDurations[0];
  const maxDuration = sortedDurations[count - 1];
  
  // Calculate percentiles
  const p95Index = Math.floor(count * 0.95);
  const p99Index = Math.floor(count * 0.99);
  const p95Duration = sortedDurations[p95Index];
  const p99Duration = sortedDurations[p99Index];
  
  return {
    count,
    avgDuration,
    minDuration,
    maxDuration,
    p95Duration,
    p99Duration
  };
}

/**
 * Reset performance store (useful for testing)
 */
export function resetPerformanceStore(): void {
  performanceStore.length = 0;
}

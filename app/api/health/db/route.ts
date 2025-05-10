/**
 * Database Health Check API
 * 
 * This endpoint provides information about the database connection health.
 * It can be used by monitoring systems to verify the database is operational.
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkDatabaseHealth } from '@/lib/db-monitoring';
import { enhancedLogger } from '@/lib/enhanced-logger';

const healthLogger = enhancedLogger.child({ domain: 'health-api' });

/**
 * GET /api/health/db
 * 
 * Returns the current database health status
 */
export async function GET(request: NextRequest) {
  try {
    const health = await checkDatabaseHealth();
    
    // Log health check access
    healthLogger.info('Database health check accessed', {
      requestPath: request.nextUrl.pathname,
      status: health.status,
      connectionOk: health.connectionOk,
      responseTime: health.responseTime,
    });
    
    // Return appropriate status code based on health status
    const statusCode = health.status === 'healthy' ? 200 : 
                      health.status === 'degraded' ? 503 : 500;
    
    return NextResponse.json(health, { status: statusCode });
  } catch (error) {
    // Log error
    healthLogger.error('Database health check failed', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    // Return error response
    return NextResponse.json({
      isHealthy: false,
      status: 'unhealthy',
      connectionOk: false,
      responseTime: -1,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}
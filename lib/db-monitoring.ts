/**
 * Database Monitoring Utilities
 * @module lib/db-monitoring
 *
 * Provides tools for monitoring database health and performance.
 */

import { db, checkDatabaseConnection } from './db';
import { createDomainLogger } from './logger';
import * as Sentry from '@sentry/nextjs';

const monitoringLogger = createDomainLogger('database-monitoring');

/**
 * Database health check result
 */
export interface DatabaseHealthCheck {
  isHealthy: boolean;
  status: 'healthy' | 'degraded' | 'unhealthy';
  connectionOk: boolean;
  responseTime: number;
  timestamp: string;
  details?: Record<string, any>;
}

/**
 * Database performance metrics
 */
export interface DatabasePerformanceMetrics {
  queryCount: number;
  totalQueryTime: number;
  averageQueryTime: number;
  slowestQuery: {
    query: string;
    time: number;
  } | null;
  timestamp: string;
}

// In-memory storage for query metrics
const queryMetrics = {
  queries: [] as Array<{ query: string; time: number; timestamp: Date }>,
  resetTime: new Date(),
};

// Register query performance monitoring
if (process.env.NODE_ENV !== 'production') {
  db.$on('query', (e) => {
    queryMetrics.queries.push({
      query: e.query,
      time: e.duration,
      timestamp: new Date(),
    });
    
    // Keep only the last 1000 queries to prevent memory leaks
    if (queryMetrics.queries.length > 1000) {
      queryMetrics.queries.shift();
    }
    
    // Log slow queries (over 500ms)
    if (e.duration > 500) {
      monitoringLogger.warn('Slow database query detected', {
        query: e.query,
        params: e.params,
        duration: e.duration,
      });
      
      // Report to Sentry for analysis
      Sentry.addBreadcrumb({
        category: 'database',
        message: 'Slow database query',
        data: {
          query: e.query,
          duration: e.duration,
        },
        level: 'warning',
      });
    }
  });
}

/**
 * Performs a comprehensive database health check
 * @returns Database health status
 */
export async function checkDatabaseHealth(): Promise<DatabaseHealthCheck> {
  const startTime = Date.now();
  let isHealthy = false;
  let details: Record<string, any> = {};
  let connectionOk = false;
  
  try {
    // Check basic connection
    connectionOk = await checkDatabaseConnection();
    
    if (connectionOk) {
      // Check schema access
      try {
        // Run a simple metadata query
        const result = await db.$queryRaw`
          SELECT
            table_name
          FROM
            information_schema.tables
          WHERE
            table_schema = 'public'
          LIMIT 5;
        `;
        
        details.accessibleTables = Array.isArray(result) ? result.length : 0;
        details.schemaAccessOk = true;
      } catch (schemaError) {
        details.schemaAccessOk = false;
        details.schemaError = schemaError instanceof Error ? schemaError.message : String(schemaError);
      }
    }
    
    // Determine overall health
    isHealthy = connectionOk && details.schemaAccessOk === true;
    
  } catch (error) {
    monitoringLogger.error('Database health check failed', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    details.error = error instanceof Error ? error.message : String(error);
  }
  
  const responseTime = Date.now() - startTime;
  
  // Determine status based on health indicators
  let status: 'healthy' | 'degraded' | 'unhealthy';
  
  if (isHealthy) {
    // Healthy if everything is working and response time is acceptable
    status = responseTime < 500 ? 'healthy' : 'degraded';
  } else if (connectionOk) {
    // Degraded if we can connect but other issues exist
    status = 'degraded';
  } else {
    // Unhealthy if we can't even connect
    status = 'unhealthy';
  }
  
  const healthCheck: DatabaseHealthCheck = {
    isHealthy,
    status,
    connectionOk,
    responseTime,
    timestamp: new Date().toISOString(),
    details,
  };
  
  // Log health check results
  const logLevel = status === 'healthy' ? 'info' : status === 'degraded' ? 'warn' : 'error';
  monitoringLogger[logLevel]('Database health check completed', healthCheck);
  
  return healthCheck;
}

/**
 * Calculates database performance metrics
 * @param timeWindow Optional time window in milliseconds (default: 15 minutes)
 * @returns Database performance metrics
 */
export function getDatabasePerformanceMetrics(timeWindow: number = 15 * 60 * 1000): DatabasePerformanceMetrics {
  const now = new Date();
  const cutoffTime = new Date(now.getTime() - timeWindow);
  
  // Filter queries within the time window
  const recentQueries = queryMetrics.queries.filter(q => q.timestamp >= cutoffTime);
  
  // Calculate metrics
  const queryCount = recentQueries.length;
  const totalQueryTime = recentQueries.reduce((sum, q) => sum + q.time, 0);
  const averageQueryTime = queryCount > 0 ? totalQueryTime / queryCount : 0;
  
  // Find slowest query
  let slowestQuery = null;
  if (queryCount > 0) {
    const slowest = recentQueries.reduce((prev, current) => 
      prev.time > current.time ? prev : current
    );
    
    slowestQuery = {
      query: slowest.query,
      time: slowest.time,
    };
  }
  
  return {
    queryCount,
    totalQueryTime,
    averageQueryTime,
    slowestQuery,
    timestamp: now.toISOString(),
  };
}

/**
 * Resets the query metrics tracking
 */
export function resetQueryMetrics(): void {
  queryMetrics.queries = [];
  queryMetrics.resetTime = new Date();
  
  monitoringLogger.info('Database query metrics reset', {
    resetTime: queryMetrics.resetTime.toISOString(),
  });
}

/**
 * Schedules periodic database health checks
 * @param intervalMs Interval between checks in milliseconds (default: 5 minutes)
 * @returns Cleanup function to stop health checks
 */
export function scheduleHealthChecks(intervalMs: number = 5 * 60 * 1000): () => void {
  monitoringLogger.info('Starting scheduled database health checks', {
    intervalMs,
  });
  
  const intervalId = setInterval(async () => {
    try {
      await checkDatabaseHealth();
    } catch (error) {
      monitoringLogger.error('Scheduled health check failed', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }, intervalMs);
  
  // Return cleanup function
  return () => {
    clearInterval(intervalId);
    monitoringLogger.info('Stopped scheduled database health checks');
  };
}

/**
 * Creates a database health check API route handler
 * @returns Handler function for API routes
 */
export function createHealthCheckHandler() {
  return async () => {
    const health = await checkDatabaseHealth();
    
    return {
      status: health.status === 'healthy' ? 200 : health.status === 'degraded' ? 503 : 500,
      body: health,
    };
  };
}
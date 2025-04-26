/**
 * Middleware Logging
 * Version: 1.0.78
 * 
 * Provides structured logging for middleware components
 * with environment-aware detail levels and telemetry integration.
 */

import { NextRequest, NextResponse } from 'next/server';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export type LogEntry = {
  level: LogLevel;
  category: string;
  message: string;
  data?: Record<string, any>;
  timestamp: string;
  requestId?: string;
  userId?: string;
  path?: string;
  method?: string;
};

/**
 * Creates a structured log entry
 */
export function createLogEntry(
  level: LogLevel,
  category: string,
  message: string,
  data?: Record<string, any>,
  request?: NextRequest
): LogEntry {
  // Extract request details if available
  const requestDetails = request ? {
    requestId: request.headers.get('x-request-id') || undefined,
    userId: request.headers.get('x-user-id') || undefined,
    path: request.nextUrl.pathname,
    method: request.method,
  } : {};
  
  return {
    level,
    category,
    message,
    data,
    timestamp: new Date().toISOString(),
    ...requestDetails,
  };
}

/**
 * Logs a structured entry with appropriate formatting based on environment
 */
export function logEntry(entry: LogEntry): void {
  // In production, we would send this to a centralized logging service
  if (process.env.NODE_ENV === 'production') {
    // This is where you'd integrate with your logging service
    // Example: datadogLogs.logger.info(entry);
    console[entry.level](`[${entry.category}] ${entry.message}`);
    return;
  }
  
  // In development, use more verbose console logging
  const timestamp = entry.timestamp.split('T')[1].split('.')[0]; // HH:MM:SS
  const reqDetails = entry.path ? `${entry.method} ${entry.path}` : '';
  const prefix = `[${timestamp}] [${entry.category}]${reqDetails ? ` [${reqDetails}]` : ''}`;
  
  console[entry.level](`${prefix} ${entry.message}`, entry.data || '');
}

/**
 * Middleware logger with convenience methods
 */
export const middlewareLogger = {
  debug: (category: string, message: string, data?: Record<string, any>, request?: NextRequest) => 
    logEntry(createLogEntry('debug', category, message, data, request)),
    
  info: (category: string, message: string, data?: Record<string, any>, request?: NextRequest) => 
    logEntry(createLogEntry('info', category, message, data, request)),
    
  warn: (category: string, message: string, data?: Record<string, any>, request?: NextRequest) => 
    logEntry(createLogEntry('warn', category, message, data, request)),
    
  error: (category: string, message: string, data?: Record<string, any>, request?: NextRequest) => 
    logEntry(createLogEntry('error', category, message, data, request)),
  
  /**
   * Log middleware request details
   */
  logRequest: (request: NextRequest) => {
    // Only log requests in development or if explicitly enabled
    if (process.env.NODE_ENV !== 'production' || process.env.LOG_MIDDLEWARE_REQUESTS === 'true') {
      const url = new URL(request.url);
      
      middlewareLogger.debug('middleware', `Request: ${request.method} ${url.pathname}`, {
        query: Object.fromEntries(url.searchParams.entries()),
        headers: Object.fromEntries(
          Array.from(request.headers.entries())
            .filter(([key]) => !key.toLowerCase().includes('auth') && !key.toLowerCase().includes('cookie'))
        ),
      }, request);
    }
  },
  
  /**
   * Log middleware response details
   */
  logResponse: (response: NextResponse, request: NextRequest, duration?: number) => {
    // Only log responses in development or if explicitly enabled
    if (process.env.NODE_ENV !== 'production' || process.env.LOG_MIDDLEWARE_RESPONSES === 'true') {
      const url = new URL(request.url);
      
      middlewareLogger.debug('middleware', `Response: ${response.status} for ${request.method} ${url.pathname}`, {
        duration: duration ? `${duration}ms` : undefined,
        headers: Object.fromEntries(
          Array.from(response.headers.entries())
            .filter(([key]) => !key.toLowerCase().includes('auth') && !key.toLowerCase().includes('cookie'))
        ),
      }, request);
    }
  }
};

/**
 * Higher-order function that wraps middleware with request/response logging
 */
export function withRequestLogging(
  middlewareFn: (req: NextRequest) => Promise<NextResponse> | NextResponse
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const startTime = performance.now();
    middlewareLogger.logRequest(req);
    
    const response = await middlewareFn(req);
    
    const duration = Math.round(performance.now() - startTime);
    middlewareLogger.logResponse(response, req, duration);
    
    return response;
  };
}

/**
 * Middleware Error Handling
 * Version: 1.0.78
 * 
 * Provides standardized error handling for middleware components
 * with detailed logging and telemetry integration.
 */

import { NextRequest, NextResponse } from 'next/server';

export type MiddlewareError = {
  code: string;
  message: string;
  details?: Record<string, any>;
  statusCode?: number;
};

/**
 * Handles errors in middleware components with standardized logging and responses
 * @param error Error object
 * @param request Original request
 * @returns NextResponse with appropriate error details
 */
export function handleMiddlewareError(
  error: Error | MiddlewareError,
  request: NextRequest
): NextResponse {
  // Determine if this is an API request
  const isApiRequest = request.nextUrl.pathname.startsWith('/api/');
  
  // Format error for logging
  const errorDetails = {
    url: request.url,
    method: request.method,
    path: request.nextUrl.pathname,
    timestamp: new Date().toISOString(),
    error: formatError(error),
  };
  
  // Log the error (this would ideally use a structured logger)
  console.error('[Middleware Error]', JSON.stringify(errorDetails, null, 2));
  
  // In production, we would send this to a monitoring service like Datadog or Sentry
  if (process.env.NODE_ENV === 'production') {
    // Example: datadogRum.addError(error);
    // This would be implemented with your actual monitoring service
  }
  
  // Handle API requests with JSON responses
  if (isApiRequest) {
    return NextResponse.json(
      {
        error: isMiddlewareError(error) ? error.code : 'middleware_error',
        message: error.message || 'An error occurred processing your request',
      },
      { 
        status: (isMiddlewareError(error) && error.statusCode) ? error.statusCode : 500 
      }
    );
  }
  
  // For non-API requests, redirect to error page
  // This could be customized based on the error type
  const errorUrl = new URL('/error', request.url);
  errorUrl.searchParams.set('code', isMiddlewareError(error) ? error.code : 'middleware_error');
  
  return NextResponse.redirect(errorUrl);
}

/**
 * Format error for logging, redacting sensitive information
 */
function formatError(error: Error | MiddlewareError): Record<string, any> {
  if (isMiddlewareError(error)) {
    return {
      code: error.code,
      message: error.message,
      details: error.details,
      statusCode: error.statusCode,
    };
  }
  
  return {
    name: error.name,
    message: error.message,
    stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined,
  };
}

/**
 * Type guard for MiddlewareError
 */
function isMiddlewareError(error: any): error is MiddlewareError {
  return error && typeof error === 'object' && 'code' in error;
}

/**
 * Creates a standard middleware error
 */
export function createMiddlewareError(
  code: string,
  message: string,
  details?: Record<string, any>,
  statusCode = 500
): MiddlewareError {
  return {
    code,
    message,
    details,
    statusCode,
  };
}

/**
 * Wraps a middleware function with error handling
 */
export function withErrorHandling<T>(
  middlewareFn: (req: NextRequest) => Promise<T | NextResponse> | T | NextResponse
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      const result = await middlewareFn(req);
      return result instanceof NextResponse ? result : NextResponse.next();
    } catch (error) {
      return handleMiddlewareError(error as Error, req);
    }
  };
}

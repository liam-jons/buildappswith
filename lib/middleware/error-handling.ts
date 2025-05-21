/**
 * Middleware Error Handling
 * Version: 1.1.0
 * 
 * Provides standardized error handling for middleware components
 * with detailed logging and telemetry integration.
 * Updated to use standardized API response types.
 */

import { NextRequest, NextResponse } from 'next/server';
import { ApiError, ApiErrorCode } from '../types/api-types';
import { createErrorResponse } from '../utils/api-utils';
import { logger } from '../logger';

export type MiddlewareError = ApiError & {
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
  
  // Log the error using structured logger
  logger.error('[Middleware Error]', errorDetails);
  
  // In production, we would send this to a monitoring service like Datadog or Sentry
  if (process.env.NODE_ENV === 'production') {
    // Example: datadogRum.addError(error);
    // This would be implemented with your actual monitoring service
  }
  
  // Handle API requests with JSON responses
  if (isApiRequest) {
    const errorCode = isMiddlewareError(error) ? error.code : ApiErrorCode.INTERNAL_ERROR;
    const errorMessage = error.message || 'An error occurred processing your request';
    const statusCode = (isMiddlewareError(error) && error.statusCode) ? error.statusCode : 500;
    const details = isMiddlewareError(error) ? error.details : undefined;
    
    const errorResponse = createErrorResponse(errorCode, errorMessage, details, statusCode);
    
    return NextResponse.json(
      errorResponse,
      { status: statusCode }
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
 * Creates a standard middleware not found error
 */
export function createMiddlewareNotFoundError(
  message: string = 'Resource not found',
  details?: Record<string, any>
): MiddlewareError {
  return createMiddlewareError(ApiErrorCode.NOT_FOUND, message, details, 404);
}

/**
 * Creates a standard middleware unauthorized error
 */
export function createMiddlewareUnauthorizedError(
  message: string = 'Unauthorized',
  details?: Record<string, any>
): MiddlewareError {
  return createMiddlewareError(ApiErrorCode.UNAUTHORIZED, message, details, 401);
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
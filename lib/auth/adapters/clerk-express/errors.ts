/**
 * Authentication Error Types
 * Version: 2.0.0
 *
 * This file defines typed error classes and utilities for authentication-related errors,
 * enabling consistent error handling and standardized responses.
 * Enhanced with detailed performance tracking and monitoring integration.
 */

import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { captureException } from '@sentry/nextjs';
import { startAuthSpan, finishAuthSpan } from '@/lib/datadog/server-tracer';

/**
 * Error type definitions for standardized responses
 */
export enum AuthErrorType {
  AUTHENTICATION = 'AUTHENTICATION_ERROR',
  AUTHORIZATION = 'AUTHORIZATION_ERROR',
  CONFIGURATION = 'CONFIGURATION_ERROR',
  RATE_LIMIT = 'RATE_LIMIT_ERROR',
  SESSION = 'SESSION_ERROR',
  TOKEN = 'TOKEN_ERROR',
  SERVER = 'SERVER_ERROR',
  VALIDATION = 'VALIDATION_ERROR',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
}

/**
 * Base authentication error class
 */
export class AuthError extends Error {
  statusCode: number;
  code: string;

  constructor(message: string, statusCode: number = 401, code: string = 'auth_error') {
    super(message);
    this.name = 'AuthError';
    this.statusCode = statusCode;
    this.code = code;
  }

  /**
   * Convert to a standardized error response object
   */
  toJSON() {
    return {
      error: {
        message: this.message,
        code: this.code,
        type: this.name
      }
    };
  }
}

/**
 * Authentication error for unauthorized access attempts
 */
export class AuthenticationError extends AuthError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'auth_required');
    this.name = 'AuthenticationError';
  }
}

/**
 * Authorization error for insufficient permissions
 */
export class AuthorizationError extends AuthError {
  constructor(message: string = 'Insufficient permissions', role?: string) {
    const msg = role ? `Insufficient permissions: ${role} role required` : message;
    super(msg, 403, 'auth_forbidden');
    this.name = 'AuthorizationError';
  }
}

/**
 * Configuration error for auth setup issues
 */
export class AuthConfigurationError extends AuthError {
  constructor(message: string = 'Authentication configuration error') {
    super(message, 500, 'auth_config_error');
    this.name = 'AuthConfigurationError';
  }
}

/**
 * Rate limit error for too many auth attempts
 */
export class AuthRateLimitError extends AuthError {
  constructor(message: string = 'Too many authentication attempts', retryAfter?: number) {
    super(message, 429, 'auth_rate_limited');
    this.name = 'AuthRateLimitError';
  }
}

/**
 * Session error for invalid or expired sessions
 */
export class SessionError extends AuthError {
  constructor(message: string = 'Invalid or expired session') {
    super(message, 401, 'auth_session_error');
    this.name = 'SessionError';
  }
}

/**
 * Token error for invalid or expired tokens
 */
export class TokenError extends AuthError {
  constructor(message: string = 'Invalid or expired token') {
    super(message, 401, 'auth_token_error');
    this.name = 'TokenError';
  }
}

/**
 * Validation error for invalid input data
 */
export class ValidationError extends AuthError {
  constructor(message: string = 'Invalid input data') {
    super(message, 400, 'validation_error');
    this.name = 'ValidationError';
  }
}

/**
 * Resource not found error
 */
export class ResourceNotFoundError extends AuthError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'resource_not_found');
    this.name = 'ResourceNotFoundError';
  }
}

/**
 * Create a standardized authentication error response
 *
 * @param type Error type from AuthErrorType enum
 * @param detail Detailed error message
 * @param statusCode HTTP status code (defaults based on error type)
 * @param path Request path for logging (optional)
 * @param method HTTP method for logging (optional)
 * @param userId User ID for logging (optional)
 * @returns NextResponse with standardized error format
 */
export function createAuthErrorResponse(
  type: AuthErrorType | string,
  detail: string,
  statusCode?: number,
  path?: string,
  method?: string,
  userId?: string,
) {
  // Start auth error span for tracking
  let spanId = null;
  if (path && method) {
    spanId = startAuthSpan(path, method, 'auth.error', userId);
  }

  // Determine appropriate status code based on error type if not specified
  if (!statusCode) {
    switch (type) {
      case AuthErrorType.AUTHENTICATION:
        statusCode = 401;
        break;
      case AuthErrorType.AUTHORIZATION:
        statusCode = 403;
        break;
      case AuthErrorType.RATE_LIMIT:
        statusCode = 429;
        break;
      case AuthErrorType.CONFIGURATION:
      case AuthErrorType.SERVER:
        statusCode = 500;
        break;
      case AuthErrorType.RESOURCE_NOT_FOUND:
        statusCode = 404;
        break;
      case AuthErrorType.VALIDATION:
      default:
        statusCode = 400;
    }
  }

  // Log the error with appropriate level based on status code
  if (path && method) {
    const logData = {
      errorType: type,
      detail,
      statusCode,
      path,
      method,
      ...(userId && { userId }),
    };

    if (statusCode >= 500) {
      logger.error('Authentication error', logData);
      captureException(new Error(detail), { extra: logData }); // Send to Sentry
    } else if (statusCode >= 400) {
      logger.warn('Authentication warning', logData);
    } else {
      logger.info('Authentication info', logData);
    }
  }

  // Construct the error response
  const errorResponse = {
    error: {
      type,
      message: detail,
      code: (Object.values(AuthErrorType).includes(type as AuthErrorType)) 
            ? type.toLowerCase().replace('_error', '') 
            : 'general_error',
    },
  };

  // Finish auth error span if started
  if (spanId) {
    finishAuthSpan(spanId, false);
  }

  return NextResponse.json(errorResponse, { status: statusCode });
}

/**
 * Adds performance metrics headers to the response for auth operations.
 * 
 * @param response NextResponse to add performance headers to
 * @param startTime Performance timing start (performance.now())
 * @param success Authentication success flag
 * @param path Request path for logging
 * @param method HTTP method for logging
 * @param userId User ID (optional)
 * @returns NextResponse with performance headers added
 */
export function addAuthPerformanceMetrics(
  response: NextResponse,
  startTime: number,
  success: boolean,
  path: string,
  method: string,
  userId?: string,
): NextResponse {
  const duration = performance.now() - startTime;
  
  // Add Server-Timing header
  const serverTimingValue = `auth;dur=${duration.toFixed(2)};desc="Authentication ${success ? 'succeeded' : 'failed'}"`;
  response.headers.append('Server-Timing', serverTimingValue);

  // Log performance metrics using logger
  logger.info('Auth performance metrics', {
    path,
    method,
    durationMs: duration,
    success,
    userId: userId || 'N/A',
    operation: 'auth.middleware',
  });

  // Optionally, send to Datadog or other APM tool if integrated
  // Example: Datadog.timing('auth.operation.duration', duration, { path, method, success, userId });
  
  // Finish Datadog span if one was started for this auth operation
  // This assumes a span was started earlier in the request lifecycle for the auth operation
  // If not, this specific finishAuthSpan call may need to be tied to a span started
  // specifically for this auth performance measurement if detailed tracing is needed.
  // For now, we assume a broader request span might be active or this is informational.

  return response;
}

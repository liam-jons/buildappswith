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
        type: this.name,
        status: this.statusCode
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
): NextResponse {
  // Start performance tracking
  const spanId = startAuthSpan('auth.error_response');
  const startTime = performance.now();
  
  // Determine appropriate status code based on error type if not provided
  if (!statusCode) {
    switch (type) {
      case AuthErrorType.AUTHENTICATION:
        statusCode = 401; // Unauthorized
        break;
      case AuthErrorType.AUTHORIZATION:
        statusCode = 403; // Forbidden
        break;
      case AuthErrorType.VALIDATION:
        statusCode = 400; // Bad Request
        break;
      case AuthErrorType.RATE_LIMIT:
        statusCode = 429; // Too Many Requests
        break;
      case AuthErrorType.RESOURCE_NOT_FOUND:
        statusCode = 404; // Not Found
        break;
      default:
        statusCode = 500; // Server Error
    }
  }
  
  // Create standardized error response
  const errorResponse = {
    success: false,
    error: {
      type,
      detail,
      statusCode
    }
  };
  
  // Log error details for monitoring
  logger.warn('Auth error response', {
    errorType: type,
    errorDetail: detail,
    statusCode,
    ...(path && { path }),
    ...(method && { method }),
    ...(userId && { userId }),
    duration: (performance.now() - startTime).toFixed(2)
  });
  
  // Report to Sentry if this is a server error (500)
  if (statusCode >= 500) {
    captureException(new Error(`Auth Error [${type}]: ${detail}`), {
      tags: {
        errorType: type,
        statusCode: String(statusCode)
      },
      extra: {
        path,
        method,
        userId
      }
    });
  }
  
  // Create NextResponse with appropriate status and headers
  const response = NextResponse.json(errorResponse, { status: statusCode });
  
  // Add performance tracking headers
  response.headers.set('x-auth-error-type', String(type));
  
  // End performance tracking
  finishAuthSpan(spanId);
  
  return response;
}

/**
 * Performance tracking for authentication operations
 * 
 * @param response NextResponse to add performance headers to
 * @param startTime Performance timing start
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
  
  // Add performance headers
  response.headers.set('x-auth-duration', `${duration.toFixed(2)}ms`);
  response.headers.set('x-auth-success', String(success));
  
  // Log performance metrics
  logger.debug('Auth performance', {
    path,
    method,
    duration: duration.toFixed(2),
    success,
    ...(userId && { userId })
  });
  
  return response;
}

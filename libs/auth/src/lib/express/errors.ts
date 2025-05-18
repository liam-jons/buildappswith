/**
 * Authentication Error Types
 * Version: 2.0.0
 *
 * This file defines typed error classes and utilities for authentication-related errors,
 * enabling consistent error handling and standardized responses.
 */

import { NextResponse } from 'next/server';

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
 * @returns NextResponse with standardized error format
 */
export function createAuthErrorResponse(
  type: AuthErrorType | string,
  detail: string,
  statusCode?: number,
): NextResponse {
  // Default status codes based on error type
  const defaultStatusCodes: Record<string, number> = {
    [AuthErrorType.AUTHENTICATION]: 401,
    [AuthErrorType.AUTHORIZATION]: 403,
    [AuthErrorType.CONFIGURATION]: 500,
    [AuthErrorType.RATE_LIMIT]: 429,
    [AuthErrorType.SESSION]: 401,
    [AuthErrorType.TOKEN]: 401,
    [AuthErrorType.SERVER]: 500,
    [AuthErrorType.VALIDATION]: 400,
    [AuthErrorType.RESOURCE_NOT_FOUND]: 404,
  };

  // Use provided status code or default
  const status = statusCode || defaultStatusCodes[type] || 500;
  
  // Create standardized error response
  const errorResponse = {
    success: false,
    error: {
      type,
      message: detail,
      status
    }
  };

  // Return as NextResponse
  return NextResponse.json(errorResponse, { status });
}

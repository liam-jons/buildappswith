/**
 * Enhanced Express SDK Middleware
 * Version: 1.0.0
 * 
 * This file provides enhanced middleware functionality for the Clerk Express SDK,
 * with improved error handling, performance metrics, and standardized headers.
 */

import { NextRequest, NextResponse } from 'next/server';
import { clerkExpressMiddleware } from './middleware';
import { logger } from '@/lib/logger';
import { AuthConfigurationError, AuthRateLimitError } from './errors';

/**
 * Enhanced middleware with detailed metrics and robust error handling
 * 
 * @param req Next.js request object
 * @returns Next.js response with authentication data
 */
export async function withExpressAuth(req: NextRequest) {
  const startTime = performance.now();
  const path = req.nextUrl.pathname;
  const method = req.method;

  try {
    // Apply Clerk Express middleware
    const response = await clerkExpressMiddleware(req);

    // Add timing metrics for performance monitoring
    const duration = performance.now() - startTime;
    if (response.headers) {
      response.headers.set('x-auth-duration', `${duration.toFixed(2)}ms`);
      response.headers.set('x-auth-provider', 'clerk-express');
    }

    // Log successful authentication for monitoring
    if (response.headers.get('x-clerk-auth-user-id')) {
      logger.debug('Authentication successful', {
        userId: response.headers.get('x-clerk-auth-user-id'),
        path,
        method,
        duration: duration.toFixed(2),
      });
    } else {
      logger.debug('Unauthenticated request processed', {
        path,
        method,
        duration: duration.toFixed(2),
      });
    }

    return response;
  } catch (error) {
    // Enhanced error handling with error classification
    const duration = performance.now() - startTime;
    let errorType = 'UNKNOWN_ERROR';
    let statusCode = 500;
    
    // Classify errors for better monitoring and debugging
    if (error instanceof AuthConfigurationError) {
      errorType = 'CONFIG_ERROR';
      statusCode = error.statusCode;
    } else if (error instanceof AuthRateLimitError) {
      errorType = 'RATE_LIMIT';
      statusCode = 429;
    } else if (error instanceof Error) {
      if (error.message.includes('rate') || error.message.includes('limit')) {
        errorType = 'RATE_LIMIT';
        statusCode = 429;
      } else if (error.message.includes('token') || error.message.includes('jwt')) {
        errorType = 'TOKEN_ERROR';
        statusCode = 401;
      } else if (error.message.includes('config') || error.message.includes('key')) {
        errorType = 'CONFIG_ERROR';
        statusCode = 500;
      } else if (error.message.includes('permission') || error.message.includes('forbidden')) {
        errorType = 'PERMISSION_ERROR';
        statusCode = 403;
      }
    }

    // Log error with detailed information for troubleshooting
    logger.error('Authentication middleware error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      path,
      method,
      duration: duration.toFixed(2),
      errorType,
    });

    // Continue without blocking the request
    const response = NextResponse.next();
    
    // Add error information to headers for monitoring
    response.headers.set('x-auth-error', 'true');
    response.headers.set('x-auth-error-type', errorType);
    response.headers.set('x-auth-duration', `${duration.toFixed(2)}ms`);
    
    return response;
  }
}

/**
 * Check if authentication failed based on response headers
 * 
 * @param response Next.js response to check
 * @returns True if authentication failed
 */
export function hasAuthError(response: NextResponse): boolean {
  return response.headers.get('x-auth-error') === 'true';
}

/**
 * Get authentication duration from response headers
 * 
 * @param response Next.js response
 * @returns Authentication duration in milliseconds or undefined
 */
export function getAuthDuration(response: NextResponse): number | undefined {
  const durationHeader = response.headers.get('x-auth-duration');
  if (durationHeader) {
    return parseFloat(durationHeader);
  }
  return undefined;
}

/**
 * Get authenticated user ID from response headers
 * 
 * @param response Next.js response
 * @returns User ID or null if not authenticated
 */
export function getAuthUserId(response: NextResponse): string | null {
  return response.headers.get('x-clerk-auth-user-id');
}
/**
 * API Authentication Middleware
 * 
 * This file provides middleware for securing API routes with Clerk authentication
 * and role-based access control.
 * 
 * Version: 1.0.0
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { UserRole, AuthErrorType } from '../types';
import { logger } from '@/lib/logger';

/**
 * Auth user type returned by getAuth
 */
export interface AuthUser {
  id: string;
  roles: UserRole[];
  [key: string]: any;
}

/**
 * Base middleware for authenticated API routes
 * 
 * @param handler - The route handler function
 * @returns A route handler with authentication
 */
export function withAuth<T>(
  handler: (req: NextRequest, user: AuthUser) => Promise<T | NextResponse>,
): (req: NextRequest) => Promise<T | NextResponse> {
  return async (req: NextRequest) => {
    try {
      // Get auth session from Clerk
      const { userId, sessionClaims } = getAuth(req);
      
      // Check if user is authenticated
      if (!userId) {
        return NextResponse.json(
          {
            success: false,
            message: 'Authentication required',
            error: {
              type: AuthErrorType.AUTHENTICATION_ERROR,
              detail: 'User is not authenticated',
            },
          },
          { status: 401 }
        );
      }
      
      // Extract roles from session claims
      const roles = (sessionClaims?.['public_metadata']?.['roles'] as UserRole[]) || [];
      
      // Create user object with roles
      const user: AuthUser = {
        id: userId,
        roles,
        ...sessionClaims,
      };
      
      // Call the handler with the authenticated user
      return handler(req, user);
    } catch (error) {
      // Log the error
      logger.error('Authentication error', {
        path: req.nextUrl.pathname,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      
      // Return error response
      return NextResponse.json(
        {
          success: false,
          message: 'Authentication error',
          error: {
            type: AuthErrorType.SERVER_ERROR,
            detail: 'An error occurred during authentication',
          },
        },
        { status: 500 }
      );
    }
  };
}

/**
 * Middleware for role-based API route protection
 * 
 * @param handler - The route handler function
 * @param requiredRole - The role required to access this route
 * @returns A route handler with role-based access control
 */
export function withRole<T>(
  handler: (req: NextRequest, user: AuthUser) => Promise<T | NextResponse>,
  requiredRole: UserRole,
): (req: NextRequest) => Promise<T | NextResponse> {
  return withAuth(async (req, user) => {
    // Check if user has the required role
    if (!user.roles.includes(requiredRole)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Insufficient permissions',
          error: {
            type: AuthErrorType.AUTHORIZATION_ERROR,
            detail: `This operation requires ${requiredRole} role`,
          },
        },
        { status: 403 }
      );
    }
    
    // Call the handler with the authenticated and authorized user
    return handler(req, user);
  });
}

/**
 * Middleware requiring admin role
 */
export function withAdmin<T>(
  handler: (req: NextRequest, user: AuthUser) => Promise<T | NextResponse>,
): (req: NextRequest) => Promise<T | NextResponse> {
  return withRole(handler, UserRole.ADMIN);
}

/**
 * Middleware requiring builder role
 */
export function withBuilder<T>(
  handler: (req: NextRequest, user: AuthUser) => Promise<T | NextResponse>,
): (req: NextRequest) => Promise<T | NextResponse> {
  return withRole(handler, UserRole.BUILDER);
}

/**
 * Middleware requiring client role
 */
export function withClient<T>(
  handler: (req: NextRequest, user: AuthUser) => Promise<T | NextResponse>,
): (req: NextRequest) => Promise<T | NextResponse> {
  return withRole(handler, UserRole.CLIENT);
}

/**
 * Middleware requiring any of the specified roles
 * 
 * @param handler - The route handler function
 * @param roles - Array of roles, any of which grants access
 * @returns A route handler with role-based access control
 */
export function withAnyRole<T>(
  handler: (req: NextRequest, user: AuthUser) => Promise<T | NextResponse>,
  roles: UserRole[],
): (req: NextRequest) => Promise<T | NextResponse> {
  return withAuth(async (req, user) => {
    // Check if user has any of the required roles
    const hasRequiredRole = roles.some(role => user.roles.includes(role));
    
    if (!hasRequiredRole) {
      return NextResponse.json(
        {
          success: false,
          message: 'Insufficient permissions',
          error: {
            type: AuthErrorType.AUTHORIZATION_ERROR,
            detail: `This operation requires one of these roles: ${roles.join(', ')}`,
          },
        },
        { status: 403 }
      );
    }
    
    // Call the handler with the authenticated and authorized user
    return handler(req, user);
  });
}

/**
 * Middleware requiring all of the specified roles
 * 
 * @param handler - The route handler function
 * @param roles - Array of roles, all of which are required
 * @returns A route handler with role-based access control
 */
export function withAllRoles<T>(
  handler: (req: NextRequest, user: AuthUser) => Promise<T | NextResponse>,
  roles: UserRole[],
): (req: NextRequest) => Promise<T | NextResponse> {
  return withAuth(async (req, user) => {
    // Check if user has all of the required roles
    const hasAllRequiredRoles = roles.every(role => user.roles.includes(role));
    
    if (!hasAllRequiredRoles) {
      return NextResponse.json(
        {
          success: false,
          message: 'Insufficient permissions',
          error: {
            type: AuthErrorType.AUTHORIZATION_ERROR,
            detail: `This operation requires all of these roles: ${roles.join(', ')}`,
          },
        },
        { status: 403 }
      );
    }
    
    // Call the handler with the authenticated and authorized user
    return handler(req, user);
  });
}

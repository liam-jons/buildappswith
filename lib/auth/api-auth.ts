/**
 * API Authentication Middleware
 * Version: 1.1.0
 *
 * This file provides middleware functions for protecting API routes
 * with authentication and role-based access control.
 *
 * It also includes utility functions for getting the current authenticated user.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { UserRole, AuthErrorType } from './types';

/**
 * Interface for authenticated user data
 */
export interface AuthUser {
  id: string;
  roles: UserRole[];
}

/**
 * Type for route handler function
 */
export type RouteHandler = (
  request: NextRequest,
  user: AuthUser
) => Promise<NextResponse> | NextResponse;

/**
 * Middleware for protecting API routes with authentication
 * @param handler The route handler function
 * @returns A function that checks authentication before calling the handler
 */
export function withAuth(handler: RouteHandler) {
  return async (request: NextRequest) => {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        message: 'Authentication required',
        error: {
          type: AuthErrorType.AUTHENTICATION_ERROR,
          detail: 'You must be signed in to access this resource',
        },
      }, { status: 401 });
    }
    
    // Get the user's roles from the auth claims
    const { sessionClaims } = auth();
    const roles = (sessionClaims?.['public_metadata']?.['roles'] as UserRole[]) || [];
    
    // Create user object to pass to handler
    const user: AuthUser = {
      id: userId,
      roles,
    };
    
    return handler(request, user);
  };
}

/**
 * Middleware for protecting API routes with role-based access control
 * @param handler The route handler function
 * @param requiredRole The role required to access the route
 * @returns A function that checks the user has the required role before calling the handler
 */
export function withRole(handler: RouteHandler, requiredRole: UserRole) {
  return withAuth(async (request: NextRequest, user: AuthUser) => {
    if (!user.roles.includes(requiredRole)) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized',
        error: {
          type: AuthErrorType.AUTHORIZATION_ERROR,
          detail: `You do not have the required role: ${requiredRole}`,
        },
      }, { status: 403 });
    }
    
    return handler(request, user);
  });
}

/**
 * Middleware for protecting admin-only API routes
 * @param handler The route handler function
 * @returns A function that checks the user is an admin before calling the handler
 */
export function withAdmin(handler: RouteHandler) {
  return withRole(handler, UserRole.ADMIN);
}

/**
 * Middleware for protecting builder-only API routes
 * @param handler The route handler function
 * @returns A function that checks the user is a builder before calling the handler
 */
export function withBuilder(handler: RouteHandler) {
  return withRole(handler, UserRole.BUILDER);
}

/**
 * Middleware for protecting client-only API routes
 * @param handler The route handler function
 * @returns A function that checks the user is a client before calling the handler
 */
export function withClient(handler: RouteHandler) {
  return withRole(handler, UserRole.CLIENT);
}

/**
 * Get the current authenticated user, including roles
 * This can be used in API routes that don't use the withAuth middleware
 * but still need to access the authenticated user.
 *
 * @returns The authenticated user or null if not authenticated
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const { userId, sessionClaims } = auth();

  if (!userId) {
    return null;
  }

  // Extract roles from session claims
  const roles = (sessionClaims?.['public_metadata']?.['roles'] as UserRole[]) || [];

  // Create and return the user object
  return {
    id: userId,
    roles,
  };
}

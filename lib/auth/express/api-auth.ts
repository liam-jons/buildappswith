/**
 * API Route Protection Utilities
 * Version: 1.0.0
 * 
 * This file provides middleware for protecting API routes with authentication
 * and role-based access control using the Clerk Express SDK.
 */

import { requireAuth, getAuth } from "@clerk/express";
import { NextRequest, NextResponse } from "next/server";
import { adaptNextRequestToExpress, createMockExpressResponse } from "./adapter";
import { UserRole } from "../types";
import { logger } from "@/lib/logger";
import { AuthenticationError, AuthorizationError } from "./errors";

/**
 * Extended NextRequest with auth information
 */
declare module "next/server" {
  interface NextRequest {
    auth?: ReturnType<typeof getAuth>;
  }
}

/**
 * Type for authenticated route handler function
 */
export type AuthHandler = (
  req: NextRequest,
  userId: string
) => Promise<NextResponse> | NextResponse;

/**
 * Type for role-based route handler function
 */
export type RoleHandler = (
  req: NextRequest,
  userId: string,
  roles: UserRole[]
) => Promise<NextResponse> | NextResponse;

/**
 * Middleware for protecting API routes with authentication
 * @param handler The route handler function
 * @returns A function that checks authentication before calling the handler
 */
export function withAuth(handler: AuthHandler) {
  return async function authProtectedHandler(req: NextRequest) {
    try {
      // Create Express-compatible request object
      const expressReq = adaptNextRequestToExpress(req);

      // Apply requireAuth middleware
      const authMiddleware = requireAuth({
        signInUrl: '/login',
      });

      // Mock Express response and next function
      const expressRes = createMockExpressResponse();
      let isAuthorized = false;
      const next = () => { isAuthorized = true; };

      // Run auth middleware
      await authMiddleware(expressReq, expressRes, next);

      // Get auth information
      const auth = getAuth(expressReq);

      // If authorized, proceed with handler
      if (isAuthorized && auth?.userId) {
        // Attach auth to original request for convenience
        req.auth = auth;
        
        // Log successful authentication
        logger.debug('API auth successful', {
          userId: auth.userId,
          path: req.nextUrl.pathname,
          method: req.method,
        });
        
        return handler(req, auth.userId);
      }

      // If not authorized, return 401
      logger.info('API auth failed', {
        path: req.nextUrl.pathname,
        method: req.method,
      });
      
      // Return standardized error response
      const error = new AuthenticationError('Authentication required');
      return NextResponse.json(
        { 
          success: false,
          message: 'Authentication required',
          error: {
            type: 'AUTHENTICATION_ERROR',
            detail: 'You must be signed in to access this resource',
          }
        },
        { status: 401 }
      );
    } catch (error) {
      // Log error and return 500
      logger.error('API auth middleware error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        path: req.nextUrl.pathname,
        method: req.method,
      });
      
      return NextResponse.json(
        { 
          success: false,
          message: 'Authentication error',
          error: {
            type: 'SERVER_ERROR',
            detail: 'An error occurred while authenticating your request',
          }
        },
        { status: 500 }
      );
    }
  };
}

/**
 * Middleware for protecting API routes with role-based access control
 * @param role The role required to access the route
 * @param handler The route handler function
 * @returns A function that checks the user has the required role before calling the handler
 */
export function withRole(role: UserRole, handler: RoleHandler) {
  return withAuth(async (req: NextRequest, userId: string) => {
    try {
      // Check if user has required role
      const auth = req.auth;
      
      // Extract roles from session claims
      const userRoles = (auth?.sessionClaims?.roles as UserRole[] || 
                       auth?.sessionClaims?.['public_metadata']?.['roles'] as UserRole[] || 
                       []) as UserRole[];

      if (Array.isArray(userRoles) && userRoles.includes(role)) {
        return handler(req, userId, userRoles);
      }

      // Log authorization failure
      logger.info('API role check failed', {
        userId,
        requiredRole: role,
        userRoles,
        path: req.nextUrl.pathname,
        method: req.method,
      });
      
      // Return standardized error response
      return NextResponse.json(
        {
          success: false,
          message: 'Insufficient permissions',
          error: {
            type: 'AUTHORIZATION_ERROR',
            detail: `You do not have the required role: ${role}`,
          },
        },
        { status: 403 }
      );
    } catch (error) {
      // Log error and return 500
      logger.error('API role check error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        requiredRole: role,
        path: req.nextUrl.pathname,
        method: req.method,
      });
      
      return NextResponse.json(
        {
          success: false,
          message: 'Authorization error',
          error: {
            type: 'SERVER_ERROR',
            detail: 'An error occurred while checking your permissions',
          },
        },
        { status: 500 }
      );
    }
  });
}

/**
 * Middleware for protecting API routes with multiple roles (OR logic)
 * @param roles Array of roles, any of which grants access
 * @param handler The route handler function
 * @returns A function that checks if the user has any of the required roles
 */
export function withAnyRole(roles: UserRole[], handler: RoleHandler) {
  return withAuth(async (req: NextRequest, userId: string) => {
    try {
      // Check if user has any of the required roles
      const auth = req.auth;
      
      // Extract roles from session claims
      const userRoles = (auth?.sessionClaims?.roles as UserRole[] || 
                       auth?.sessionClaims?.['public_metadata']?.['roles'] as UserRole[] || 
                       []) as UserRole[];

      // Check if user has any of the required roles
      const hasRequiredRole = Array.isArray(userRoles) && 
                             roles.some(role => userRoles.includes(role));

      if (hasRequiredRole) {
        return handler(req, userId, userRoles);
      }

      // Log authorization failure
      logger.info('API role check failed', {
        userId,
        requiredRoles: roles,
        userRoles,
        path: req.nextUrl.pathname,
        method: req.method,
      });
      
      // Return standardized error response
      return NextResponse.json(
        {
          success: false,
          message: 'Insufficient permissions',
          error: {
            type: 'AUTHORIZATION_ERROR',
            detail: `You do not have any of the required roles: ${roles.join(', ')}`,
          },
        },
        { status: 403 }
      );
    } catch (error) {
      // Log error and return 500
      logger.error('API role check error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        requiredRoles: roles,
        path: req.nextUrl.pathname,
        method: req.method,
      });
      
      return NextResponse.json(
        {
          success: false,
          message: 'Authorization error',
          error: {
            type: 'SERVER_ERROR',
            detail: 'An error occurred while checking your permissions',
          },
        },
        { status: 500 }
      );
    }
  });
}

/**
 * Middleware for protecting API routes with all required roles (AND logic)
 * @param roles Array of roles, all of which are required
 * @param handler The route handler function
 * @returns A function that checks if the user has all of the required roles
 */
export function withAllRoles(roles: UserRole[], handler: RoleHandler) {
  return withAuth(async (req: NextRequest, userId: string) => {
    try {
      // Check if user has all required roles
      const auth = req.auth;
      
      // Extract roles from session claims
      const userRoles = (auth?.sessionClaims?.roles as UserRole[] || 
                       auth?.sessionClaims?.['public_metadata']?.['roles'] as UserRole[] || 
                       []) as UserRole[];

      // Check if user has all required roles
      const hasAllRequiredRoles = Array.isArray(userRoles) && 
                                 roles.every(role => userRoles.includes(role));

      if (hasAllRequiredRoles) {
        return handler(req, userId, userRoles);
      }

      // Log authorization failure
      logger.info('API role check failed', {
        userId,
        requiredRoles: roles,
        userRoles,
        path: req.nextUrl.pathname,
        method: req.method,
      });
      
      // Return standardized error response
      return NextResponse.json(
        {
          success: false,
          message: 'Insufficient permissions',
          error: {
            type: 'AUTHORIZATION_ERROR',
            detail: `You do not have all required roles: ${roles.join(', ')}`,
          },
        },
        { status: 403 }
      );
    } catch (error) {
      // Log error and return 500
      logger.error('API role check error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        requiredRoles: roles,
        path: req.nextUrl.pathname,
        method: req.method,
      });
      
      return NextResponse.json(
        {
          success: false,
          message: 'Authorization error',
          error: {
            type: 'SERVER_ERROR',
            detail: 'An error occurred while checking your permissions',
          },
        },
        { status: 500 }
      );
    }
  });
}

/**
 * Middleware for protecting admin-only API routes
 * @param handler The route handler function
 * @returns A function that checks the user is an admin before calling the handler
 */
export function withAdmin(handler: RoleHandler) {
  return withRole(UserRole.ADMIN, handler);
}

/**
 * Middleware for protecting builder-only API routes
 * @param handler The route handler function
 * @returns A function that checks the user is a builder before calling the handler
 */
export function withBuilder(handler: RoleHandler) {
  return withRole(UserRole.BUILDER, handler);
}

/**
 * Middleware for protecting client-only API routes
 * @param handler The route handler function
 * @returns A function that checks the user is a client before calling the handler
 */
export function withClient(handler: RoleHandler) {
  return withRole(UserRole.CLIENT, handler);
}

/**
 * Middleware for protecting API routes with permission-based access control
 * @param permission The permission required to access the route
 * @param handler The route handler function
 * @returns A function that checks if the user has the required permission
 */
export function withPermission(permission: string, handler: AuthHandler) {
  return withAuth(async (req: NextRequest, userId: string) => {
    try {
      // Check if user has required permission
      const auth = req.auth;
      
      // Use Clerk's built-in permission check if available
      if (auth?.has && typeof auth.has === 'function' && auth.has({ permission })) {
        return handler(req, userId);
      }
      
      // Fallback to role-based permission mapping if Clerk's permission check is not available
      // This would need to be customized based on your permission model
      const userRoles = (auth?.sessionClaims?.roles as string[] || []);
      
      // Simple role-based permission mapping
      // Replace with your actual permission mapping logic
      const rolePermissions: Record<string, string[]> = {
        [UserRole.ADMIN]: ['*'], // Admin has all permissions
        [UserRole.BUILDER]: ['profile:edit', 'builder:manage'],
        [UserRole.CLIENT]: ['profile:view', 'booking:create'],
      };
      
      // Check if any of the user's roles grant the required permission
      const hasPermission = userRoles.some(role => {
        const permissions = rolePermissions[role] || [];
        return permissions.includes('*') || permissions.includes(permission);
      });
      
      if (hasPermission) {
        return handler(req, userId);
      }

      // Log authorization failure
      logger.info('API permission check failed', {
        userId,
        requiredPermission: permission,
        userRoles,
        path: req.nextUrl.pathname,
        method: req.method,
      });
      
      // Return standardized error response
      return NextResponse.json(
        {
          success: false,
          message: 'Insufficient permissions',
          error: {
            type: 'AUTHORIZATION_ERROR',
            detail: `You do not have the required permission: ${permission}`,
          },
        },
        { status: 403 }
      );
    } catch (error) {
      // Log error and return 500
      logger.error('API permission check error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        requiredPermission: permission,
        path: req.nextUrl.pathname,
        method: req.method,
      });
      
      return NextResponse.json(
        {
          success: false,
          message: 'Authorization error',
          error: {
            type: 'SERVER_ERROR',
            detail: 'An error occurred while checking your permissions',
          },
        },
        { status: 500 }
      );
    }
  });
}
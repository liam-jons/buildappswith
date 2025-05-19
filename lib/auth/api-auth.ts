/**
 * API Route Protection Utilities
 * Version: 2.0.0
 * 
 * This file provides middleware for protecting API routes with authentication
 * and role-based access control using the Clerk Express SDK.
 */

import { requireAuth, getAuth } from "@clerk/express";
import type { Request as ExpressRequest, Response as ExpressResponse, NextFunction } from "express";
import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { adaptNextRequestToExpress, createMockExpressResponse } from "./adapters/clerk-express/adapter";
import { UserRole, AuthUser, ClerkSessionClaims, ClerkUserPublicMetadata } from "./types";
import { logger } from "@/lib/logger";
import { AuthenticationError, AuthorizationError } from "./adapters/clerk-express/errors";

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
export type AuthHandler<P = any> = (
  req: NextRequest,
  auth: { userId: string },
  params: P
) => Promise<NextResponse> | NextResponse;

/**
 * Type for role-based route handler function
 */
export type RoleHandler<P = any> = (
  req: NextRequest,
  auth: { userId: string; roles: UserRole[] },
  params: P
) => Promise<NextResponse> | NextResponse;

/**
 * Middleware for protecting API routes with authentication
 * @param handler The route handler function
 * @returns A function that checks authentication before calling the handler
 */
export function withAuth<P = any>(handler: AuthHandler<P>) {
  return async function authProtectedHandler(req: NextRequest, context?: { params: P }) {
    try {
      // Create Express-compatible request object
      const expressReq = adaptNextRequestToExpress(req);
      const mockRes = createMockExpressResponse() as unknown as ExpressResponse;
      
      // Apply Clerk Express auth middleware
      try {
        // Use the requireAuth middleware from Clerk Express
        await requireAuth()(expressReq as unknown as ExpressRequest, mockRes, (() => {}) as NextFunction);
      } catch (error) {
        // Handle authentication errors from Clerk
        logger.warn('Authentication failed', {
          path: req.nextUrl.pathname,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        
        return NextResponse.json({
          success: false,
          message: 'Authentication required',
          error: 'You must be signed in to access this resource'
        }, { status: 401 });
      }
      
      // At this point, authentication succeeded
      const auth = getAuth(expressReq);
      const userId = auth?.userId;
      
      if (!userId) {
        // This shouldn't happen if requireAuth passed, but handle it anyway
        return NextResponse.json({
          success: false,
          message: 'User ID missing',
          error: 'Authentication succeeded but user ID is missing'
        }, { status: 401 });
      }
      
      // Store auth info on the request object for potential later use
      req.auth = auth;
      
      // Pass control to the actual route handler
      const params = context?.params ?? {} as P;
      return handler(req, { userId }, params);
    } catch (error) {
      // Handle unexpected errors
      logger.error('API authentication error', {
        path: req.nextUrl.pathname,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      // Determine if this is one of our known error types
      if (error instanceof AuthenticationError) {
        return NextResponse.json({
          success: false,
          message: 'Authentication failed',
          error: error.message
        }, { status: 401 });
      }
      
      if (error instanceof AuthorizationError) {
        return NextResponse.json({
          success: false,
          message: 'Permission denied',
          error: error.message
        }, { status: 403 });
      }
      
      // Generic error response for other types of errors
      return NextResponse.json({
        success: false,
        message: 'API error',
        error: 'An unexpected error occurred'
      }, { status: 500 });
    }
  };
}

/**
 * Middleware for protecting API routes with role-based access control
 * @param role The role required to access the route
 * @param handler The route handler function
 * @returns A function that checks the user has the required role before calling the handler
 */
export function withRole<P = any>(role: UserRole, handler: RoleHandler<P>) {
  return async function roleProtectedHandler(req: NextRequest, context?: { params: P }) {
    try {
      // Create Express-compatible request object
      const expressReq = adaptNextRequestToExpress(req);
      const mockRes = createMockExpressResponse() as unknown as ExpressResponse;
      
      // Apply Clerk Express auth middleware
      try {
        // Use the requireAuth middleware from Clerk Express
        await requireAuth()(expressReq as unknown as ExpressRequest, mockRes, (() => {}) as NextFunction);
      } catch (error) {
        // Handle authentication errors from Clerk
        logger.warn('Authentication failed for role check', {
          path: req.nextUrl.pathname,
          role,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        
        return NextResponse.json({
          success: false,
          message: 'Authentication required',
          error: 'You must be signed in to access this resource'
        }, { status: 401 });
      }
      
      // At this point, authentication succeeded
      const auth = getAuth(expressReq);
      const userId = auth?.userId;
      
      if (!userId) {
        // This shouldn't happen if requireAuth passed, but handle it anyway
        return NextResponse.json({
          success: false,
          message: 'User ID missing',
          error: 'Authentication succeeded but user ID is missing'
        }, { status: 401 });
      }
      
      // Extract roles from auth claims safely
      const claims = auth?.sessionClaims as ClerkSessionClaims | undefined;
      const metadata = claims?.user_metadata;
      const roles = metadata?.roles || [];
      
      // Check if the user has the required role
      if (!roles.includes(role)) {
        logger.warn('Role authorization failed', {
          path: req.nextUrl.pathname,
          userId,
          requiredRole: role,
          userRoles: roles
        });
        
        return NextResponse.json({
          success: false,
          message: 'Permission denied',
          error: `You must have ${role} role to access this resource`
        }, { status: 403 });
      }
      
      // Store auth info on the request object for potential later use
      req.auth = auth;
      
      // Pass control to the actual route handler with roles included
      const params = context?.params ?? {} as P;
      return handler(req, { userId, roles }, params);
    } catch (error) {
      // Handle unexpected errors
      logger.error('API role authorization error', {
        path: req.nextUrl.pathname,
        role,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      // Determine if this is one of our known error types
      if (error instanceof AuthenticationError) {
        return NextResponse.json({
          success: false,
          message: 'Authentication failed',
          error: error.message
        }, { status: 401 });
      }
      
      if (error instanceof AuthorizationError) {
        return NextResponse.json({
          success: false,
          message: 'Permission denied',
          error: error.message
        }, { status: 403 });
      }
      
      // Generic error response for other types of errors
      return NextResponse.json({
        success: false,
        message: 'API error',
        error: 'An unexpected error occurred'
      }, { status: 500 });
    }
  };
}

/**
 * Middleware for protecting admin-only API routes
 * @param handler The route handler function
 * @returns A function that checks the user is an admin before calling the handler
 */
export function withAdmin<P = any>(handler: RoleHandler<P>) {
  return withRole(UserRole.ADMIN, handler);
}

/**
 * Middleware for protecting builder-only API routes
 * @param handler The route handler function
 * @returns A function that checks the user is a builder before calling the handler
 */
export function withBuilder<P = any>(handler: RoleHandler<P>) {
  return withRole(UserRole.BUILDER, handler);
}

/**
 * Middleware for protecting client-only API routes
 * @param handler The route handler function
 * @returns A function that checks the user is a client before calling the handler
 */
export function withClient<P = any>(handler: RoleHandler<P>) {
  return withRole(UserRole.CLIENT, handler);
}

/**
 * Middleware for protecting API routes with multiple roles (OR logic)
 * @param roles Array of roles, any of which grants access
 * @param handler The route handler function
 * @returns A function that checks if the user has any of the required roles
 */
export function withAnyRole<P = any>(roles: UserRole[], handler: RoleHandler<P>) {
  return async function anyRoleProtectedHandler(req: NextRequest, context?: { params: P }) {
    try {
      // Create Express-compatible request object
      const expressReq = adaptNextRequestToExpress(req);
      const mockRes = createMockExpressResponse() as unknown as ExpressResponse;
      
      // Apply Clerk Express auth middleware
      try {
        await requireAuth()(expressReq as unknown as ExpressRequest, mockRes, (() => {}) as NextFunction);
      } catch (error) {
        logger.warn('Authentication failed for role check', {
          path: req.nextUrl.pathname,
          roles,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        
        return NextResponse.json({
          success: false,
          message: 'Authentication required',
          error: 'You must be signed in to access this resource'
        }, { status: 401 });
      }
      
      // At this point, authentication succeeded
      const auth = getAuth(expressReq);
      const userId = auth?.userId;
      
      if (!userId) {
        return NextResponse.json({
          success: false,
          message: 'User ID missing',
          error: 'Authentication succeeded but user ID is missing'
        }, { status: 401 });
      }
      
      // Extract roles from auth claims
      const claims = auth?.sessionClaims as ClerkSessionClaims | undefined;
      const metadata = claims?.user_metadata;
      const userRoles = metadata?.roles || [];
      
      // Check if the user has any of the required roles
      const hasAnyRole = roles.some(role => userRoles.includes(role));
      
      if (!hasAnyRole) {
        logger.warn('Role authorization failed', {
          path: req.nextUrl.pathname,
          userId,
          requiredRoles: roles,
          userRoles
        });
        
        return NextResponse.json({
          success: false,
          message: 'Permission denied',
          error: `You must have one of these roles: ${roles.join(', ')}`
        }, { status: 403 });
      }
      
      // Store auth info on the request object for potential later use
      req.auth = auth;
      
      // Pass control to the actual route handler with roles included
      const params = context?.params ?? {} as P;
      return handler(req, { userId, roles: userRoles }, params);
    } catch (error) {
      // Handle unexpected errors (similar to withRole)
      logger.error('API role authorization error', {
        path: req.nextUrl.pathname,
        roles,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      if (error instanceof AuthenticationError) {
        return NextResponse.json({
          success: false,
          message: 'Authentication failed',
          error: error.message
        }, { status: 401 });
      }
      
      if (error instanceof AuthorizationError) {
        return NextResponse.json({
          success: false,
          message: 'Permission denied',
          error: error.message
        }, { status: 403 });
      }
      
      // Generic error response for other types of errors
      return NextResponse.json({
        success: false,
        message: 'API error',
        error: 'An unexpected error occurred'
      }, { status: 500 });
    }
  };
}

/**
 * Middleware for protecting API routes with all required roles (AND logic)
 * @param roles Array of roles, all of which are required
 * @param handler The route handler function
 * @returns A function that checks if the user has all of the required roles
 */
export function withAllRoles<P = any>(roles: UserRole[], handler: RoleHandler<P>) {
  return async function allRolesProtectedHandler(req: NextRequest, context?: { params: P }) {
    try {
      // Create Express-compatible request object
      const expressReq = adaptNextRequestToExpress(req);
      const mockRes = createMockExpressResponse() as unknown as ExpressResponse;
      
      // Apply Clerk Express auth middleware
      try {
        await requireAuth()(expressReq as unknown as ExpressRequest, mockRes, (() => {}) as NextFunction);
      } catch (error) {
        logger.warn('Authentication failed for role check', {
          path: req.nextUrl.pathname,
          roles,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        
        return NextResponse.json({
          success: false,
          message: 'Authentication required',
          error: 'You must be signed in to access this resource'
        }, { status: 401 });
      }
      
      // At this point, authentication succeeded
      const auth = getAuth(expressReq);
      const userId = auth?.userId;
      
      if (!userId) {
        return NextResponse.json({
          success: false,
          message: 'User ID missing',
          error: 'Authentication succeeded but user ID is missing'
        }, { status: 401 });
      }
      
      // Extract roles from auth claims
      const claims = auth?.sessionClaims as ClerkSessionClaims | undefined;
      const metadata = claims?.user_metadata;
      const userRoles = metadata?.roles || [];
      
      // Check if the user has all required roles
      const hasAllRoles = roles.every(role => userRoles.includes(role));
      
      if (!hasAllRoles) {
        logger.warn('Role authorization failed', {
          path: req.nextUrl.pathname,
          userId,
          requiredRoles: roles,
          userRoles
        });
        
        return NextResponse.json({
          success: false,
          message: 'Permission denied',
          error: `You must have all of these roles: ${roles.join(', ')}`
        }, { status: 403 });
      }
      
      // Store auth info on the request object for potential later use
      req.auth = auth;
      
      // Pass control to the actual route handler with roles included
      const params = context?.params ?? {} as P;
      return handler(req, { userId, roles: userRoles }, params);
    } catch (error) {
      // Handle unexpected errors (similar to withRole)
      logger.error('API role authorization error', {
        path: req.nextUrl.pathname,
        roles,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      if (error instanceof AuthenticationError) {
        return NextResponse.json({
          success: false,
          message: 'Authentication failed',
          error: error.message
        }, { status: 401 });
      }
      
      if (error instanceof AuthorizationError) {
        return NextResponse.json({
          success: false,
          message: 'Permission denied',
          error: error.message
        }, { status: 403 });
      }
      
      // Generic error response for other types of errors
      return NextResponse.json({
        success: false,
        message: 'API error',
        error: 'An unexpected error occurred'
      }, { status: 500 });
    }
  };
}

/**
 * Middleware for protecting API routes with permission-based access control
 * @param permission The permission required to access the route
 * @param handler The route handler function
 * @returns A function that checks if the user has the required permission
 */
export function withPermission<P = any>(permission: string, handler: AuthHandler<P>) {
  return async function permissionProtectedHandler(req: NextRequest, context?: { params: P }) {
    try {
      // Create Express-compatible request object
      const expressReq = adaptNextRequestToExpress(req);
      const mockRes = createMockExpressResponse() as unknown as ExpressResponse;
      
      // Apply Clerk Express auth middleware
      try {
        await requireAuth()(expressReq as unknown as ExpressRequest, mockRes, (() => {}) as NextFunction);
      } catch (error) {
        logger.warn('Authentication failed for permission check', {
          path: req.nextUrl.pathname,
          permission,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        
        return NextResponse.json({
          success: false,
          message: 'Authentication required',
          error: 'You must be signed in to access this resource'
        }, { status: 401 });
      }
      
      // At this point, authentication succeeded
      const auth = getAuth(expressReq);
      const userId = auth?.userId;
      
      if (!userId) {
        return NextResponse.json({
          success: false,
          message: 'User ID missing',
          error: 'Authentication succeeded but user ID is missing'
        }, { status: 401 });
      }
      
      // Extract roles from auth claims
      const claims = auth?.sessionClaims as ClerkSessionClaims | undefined;
      const metadata = claims?.user_metadata;
      const userRoles = metadata?.roles || [];
      
      // Simple permission checking logic - in a real app, this would be more sophisticated
      let hasPermission = false;
      
      // Admin has all permissions
      if (userRoles.includes(UserRole.ADMIN)) {
        hasPermission = true;
      }
      // Role-based permission mapping
      else if (permission.startsWith('builder:') && userRoles.includes(UserRole.BUILDER)) {
        hasPermission = true;
      }
      else if (permission.startsWith('client:') && userRoles.includes(UserRole.CLIENT)) {
        hasPermission = true;
      }
      
      if (!hasPermission) {
        logger.warn('Permission authorization failed', {
          path: req.nextUrl.pathname,
          userId,
          requiredPermission: permission,
          userRoles
        });
        
        return NextResponse.json({
          success: false,
          message: 'Permission denied',
          error: `You do not have the required permission: ${permission}`
        }, { status: 403 });
      }
      
      // Store auth info on the request object for potential later use
      req.auth = auth;
      
      // Pass control to the actual route handler
      const params = context?.params ?? {} as P;
      return handler(req, { userId }, params);
    } catch (error) {
      // Handle unexpected errors (similar to withRole)
      logger.error('API permission authorization error', {
        path: req.nextUrl.pathname,
        permission,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      if (error instanceof AuthenticationError) {
        return NextResponse.json({
          success: false,
          message: 'Authentication failed',
          error: error.message
        }, { status: 401 });
      }
      
      if (error instanceof AuthorizationError) {
        return NextResponse.json({
          success: false,
          message: 'Permission denied',
          error: error.message
        }, { status: 403 });
      }
      
      // Generic error response for other types of errors
      return NextResponse.json({
        success: false,
        message: 'API error',
        error: 'An unexpected error occurred'
      }, { status: 500 });
    }
  };
}

/**
 * Get the current authenticated user, including roles
 * This can be used in API routes that don't use the withAuth middleware
 * but still need to access the authenticated user.
 *
 * @returns The authenticated user or null if not authenticated
 */
export async function getCurrentUser(): Promise<Pick<AuthUser, 'id' | 'roles'> | null> {
  try {
    // Get the Clerk user
    const user = await currentUser();
    
    if (!user) {
      return null;
    }
    
    // Extract roles from public metadata
    const metadata = user.publicMetadata as Record<string, unknown> || {};
    const userRoles = metadata.roles;
    const roles = Array.isArray(userRoles) ? userRoles as UserRole[] : [];
    
    // Return standardized user object with minimal required fields
    return {
      id: user.id,
      roles
    };
  } catch (error) {
    logger.error('Error getting current user', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return null;
  }
}

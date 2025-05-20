/**
 * API Route Protection Utilities / Middleware
 * Version: 1.1.0 (Refactored to use @clerk/nextjs/server)
 * 
 * This file provides middleware for protecting API routes with authentication
 * and role-based access control using @clerk/nextjs/server.
 */

import { getAuth } from "@clerk/nextjs/server"; 
import { NextRequest, NextResponse } from "next/server";
import { UserRole, AuthObject } from "./types"; 
import { logger } from "@/lib/logger";
import { AuthenticationError, AuthorizationError } from "./adapters/clerk-express/errors"; 

/**
 * Extended NextRequest with auth information (from @clerk/nextjs/server's getAuth)
 */
declare module "next/server" {
  interface NextRequest {
    auth?: ReturnType<typeof getAuth>; 
  }
}

/**
 * Type for authenticated route handler function
 */
export type AuthHandler<TContext extends { params?: any } = { params?: any }> = (
  req: NextRequest,
  context: TContext,
  auth: AuthObject
) => Promise<NextResponse> | NextResponse;

/**
 * Type for role-based route handler function
 */
export type RoleHandler<TContext extends { params?: any } = { params?: any }> = (
  req: NextRequest,
  context: TContext,
  auth: AuthObject
) => Promise<NextResponse> | NextResponse;

/**
 * Type for optionally authenticated route handler function
 */
export type OptionalAuthHandler<TContext extends { params?: any } = { params?: any }> = (
  req: NextRequest,
  context: TContext,
  auth?: AuthObject
) => Promise<NextResponse> | NextResponse;

function extractUserRoles(authResult: ReturnType<typeof getAuth>): UserRole[] {
  if (!authResult || !authResult.sessionClaims) return [];
  return (authResult.sessionClaims.publicMetadata?.roles as UserRole[]) || [];
}

/**
 * Middleware for protecting API routes with authentication
 * @param handler The route handler function
 * @returns A function that checks authentication before calling the handler
 */
export function withAuth<TContext extends { params?: any } = { params?: any }>( 
  handler: AuthHandler<TContext>
) {
  return async function authProtectedHandler(req: NextRequest, context: TContext) {
    try {
      const authResult = getAuth(req);

      if (!authResult?.userId) {
        logger.info('API auth failed: No userId', {
          path: req.nextUrl.pathname,
          method: req.method,
        });
        const error = new AuthenticationError('Authentication required');
        return NextResponse.json(
          { 
            success: false,
            message: error.message,
            error: {
              type: error.name,
              detail: 'You must be signed in to access this resource.',
            }
          },
          { status: error.status }
        );
      }
      
      (req as any).auth = authResult; 
        
      const userRoles = extractUserRoles(authResult);
      const authObjectToPass: AuthObject = { userId: authResult.userId, roles: userRoles, claims: authResult.sessionClaims };

      logger.debug('API auth successful', {
        userId: authObjectToPass.userId,
        roles: authObjectToPass.roles,
        path: req.nextUrl.pathname,
        method: req.method,
      });
        
      return handler(req, context, authObjectToPass);

    } catch (error) {
      logger.error('API auth middleware error (withAuth)', {
        error: error instanceof Error ? error.message : String(error),
        path: req.nextUrl.pathname,
        method: req.method,
      });
      
      return NextResponse.json(
        { 
          success: false,
          message: 'Authentication processing error',
          error: {
            type: 'SERVER_ERROR',
            detail: 'An error occurred while authenticating your request.',
          }
        },
        { status: 500 }
      );
    }
  };
}

/**
 * Middleware for API routes that can be accessed by authenticated or unauthenticated users.
 * If a user is authenticated, their auth object is passed to the handler.
 * If not, auth object will be undefined.
 * @param handler The route handler function
 * @returns A function that retrieves auth state (if any) before calling the handler
 */
export function withOptionalAuth<TContext extends { params?: any } = { params?: any }>( 
  handler: OptionalAuthHandler<TContext>
) {
  return async function optionalAuthProtectedHandler(req: NextRequest, context: TContext) {
    try {
      const authResult = getAuth(req);

      if (authResult?.userId) {
        (req as any).auth = authResult; 
        const userRoles = extractUserRoles(authResult);
        const authObjectToPass: AuthObject = { userId: authResult.userId, roles: userRoles, claims: authResult.sessionClaims };
        
        logger.debug('Optional API auth: User authenticated', {
          userId: authObjectToPass.userId,
          roles: authObjectToPass.roles,
          path: req.nextUrl.pathname,
          method: req.method,
        });
        return handler(req, context, authObjectToPass);
      } else {
        logger.debug('Optional API auth: No authenticated user', {
          path: req.nextUrl.pathname,
          method: req.method,
        });
        return handler(req, context, undefined); 
      }

    } catch (error) {
      logger.error('API optional auth middleware error', {
        error: error instanceof Error ? error.message : String(error),
        path: req.nextUrl.pathname,
        method: req.method,
      });
      return NextResponse.json(
        { 
          success: false,
          message: 'Optional authentication processing error',
          error: {
            type: 'SERVER_ERROR',
            detail: 'An error occurred while processing optional authentication.',
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
export function withRole<TContext extends { params?: any } = { params?: any }>( 
  role: UserRole, 
  handler: RoleHandler<TContext>
) {
  return withAuth<TContext>(async (req, ctx, auth) => {
    if (!auth.roles.includes(role)) {
      logger.warn('API role check failed', {
        userId: auth.userId,
        requiredRole: role,
        userRoles: auth.roles,
        path: req.nextUrl.pathname,
        method: req.method,
      });
      const error = new AuthorizationError(`Forbidden: Role '${role}' required.`);
      return NextResponse.json(
        { 
          success: false,
          message: error.message,
          error: {
            type: error.name,
            detail: error.message,
          }
        },
        { status: error.status }
      );
    }
    return handler(req, ctx, auth);
  });
}

/**
 * Middleware for protecting API routes with multiple roles (OR logic)
 * @param roles Array of roles, any of which grants access
 * @param handler The route handler function
 * @returns A function that checks if the user has any of the required roles
 */
export function withAnyRole<TContext extends { params?: any } = { params?: any }>( 
  roles: UserRole[], 
  handler: RoleHandler<TContext>
) {
  return withAuth<TContext>(async (req, ctx, auth) => {
    const hasRequiredRole = roles.some(role => auth.roles.includes(role));
    if (!hasRequiredRole) {
      logger.warn('API anyRole check failed', {
        userId: auth.userId,
        requiredRoles: roles,
        userRoles: auth.roles,
        path: req.nextUrl.pathname,
        method: req.method,
      });
      const error = new AuthorizationError(`Forbidden: Requires one of roles: ${roles.join(', ')}.`);
      return NextResponse.json(
        { 
          success: false,
          message: error.message,
          error: {
            type: error.name,
            detail: error.message,
          }
        },
        { status: error.status }
      );
    }
    return handler(req, ctx, auth);
  });
}

/**
 * Middleware for protecting API routes with all required roles (AND logic)
 * @param roles Array of roles, all of which are required
 * @param handler The route handler function
 * @returns A function that checks if the user has all of the required roles
 */
export function withAllRoles<TContext extends { params?: any } = { params?: any }>( 
  roles: UserRole[], 
  handler: RoleHandler<TContext>
) {
  return withAuth<TContext>(async (req, ctx, auth) => {
    const hasAllRequiredRoles = roles.every(role => auth.roles.includes(role));
    if (!hasAllRequiredRoles) {
      logger.warn('API allRoles check failed', {
        userId: auth.userId,
        requiredRoles: roles,
        userRoles: auth.roles,
        path: req.nextUrl.pathname,
        method: req.method,
      });
      const error = new AuthorizationError(`Forbidden: Requires all roles: ${roles.join(', ')}.`);
      return NextResponse.json(
        { 
          success: false,
          message: error.message,
          error: {
            type: error.name,
            detail: error.message,
          }
        },
        { status: error.status }
      );
    }
    return handler(req, ctx, auth);
  });
}

/**
 * Middleware for protecting admin-only API routes
 * @param handler The route handler function
 * @returns A function that checks the user is an admin before calling the handler
 */
export function withAdmin<TContext extends { params?: any } = { params?: any }>( 
  handler: RoleHandler<TContext>
) {
  return withRole(UserRole.ADMIN, handler);
}

/**
 * Middleware for protecting builder-only API routes
 * @param handler The route handler function
 * @returns A function that checks the user is a builder before calling the handler
 */
export function withBuilder<TContext extends { params?: any } = { params?: any }>( 
  handler: RoleHandler<TContext>
) {
  return withRole(UserRole.BUILDER, handler);
}

/**
 * Middleware for protecting client-only API routes
 * @param handler The route handler function
 * @returns A function that checks the user is a client before calling the handler
 */
export function withClient<TContext extends { params?: any } = { params?: any }>( 
  handler: RoleHandler<TContext>
) {
  return withRole(UserRole.CLIENT, handler);
}

/**
 * Middleware for protecting API routes with permission-based access control.
 * Assumes permissions are stored in sessionClaims.publicMetadata.permissions as string[].
 * @param permission The permission required to access the route
 * @param handler The route handler function
 * @returns A function that checks if the user has the required permission
 */
export function withPermission<TContext extends { params?: any } = { params?: any }>( 
  permission: string, 
  handler: AuthHandler<TContext> 
) {
  return withAuth<TContext>(async (req, ctx, auth) => {
    const userPermissions = (auth.claims?.publicMetadata?.permissions as string[]) || [];
    
    if (!userPermissions.includes(permission)) {
      logger.warn('API permission check failed', {
        userId: auth.userId,
        requiredPermission: permission,
        userPermissions,
        path: req.nextUrl.pathname,
        method: req.method,
      });
      const error = new AuthorizationError(`Forbidden: Permission '${permission}' required.`);
      return NextResponse.json(
        { 
          success: false,
          message: error.message,
          error: {
            type: error.name,
            detail: error.message,
          }
        },
        { status: error.status }
      );
    }
    return handler(req, ctx, auth);
  });
}

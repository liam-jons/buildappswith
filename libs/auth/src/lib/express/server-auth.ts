/**
 * Server-Side Authentication Utilities
 * Version: 1.0.0
 * 
 * This file provides server-side authentication utilities for use with
 * Clerk Express SDK in Next.js server components and API routes.
 */

import { getAuth, ClerkRequest } from "@clerk/express";
import { headers, cookies } from "next/headers";
import { UserRole } from "../types";

// Import errors from a new errors file we'll create
import { AuthenticationError, AuthorizationError } from "./errors";

// Placeholder logger until we set up proper imports
const logger = {
  info: (message: string, context?: any) => console.log(`[INFO] ${message}`, context),
  error: (message: string, error?: any) => console.error(`[ERROR] ${message}`, error),
  warn: (message: string, context?: any) => console.warn(`[WARN] ${message}`, context),
  debug: (message: string, context?: any) => console.debug(`[DEBUG] ${message}`, context),
};

/**
 * Authentication information from server context
 */
export interface ServerAuth {
  userId: string | null;
  sessionId: string | null;
  isAuthenticated: boolean;
  roles: UserRole[];
  hasRole: (role: UserRole) => boolean;
}

/**
 * Get basic auth state in server components and route handlers
 * @returns Authentication information from response headers
 */
export function getServerAuth(): ServerAuth {
  try {
    const headersList = headers();
    const userId = headersList.get('x-clerk-auth-user-id');
    const sessionId = headersList.get('x-clerk-auth-session-id');
    
    // Parse roles from header if available
    let roles: UserRole[] = [];
    const rolesHeader = headersList.get('x-clerk-auth-user-roles');
    
    if (rolesHeader) {
      try {
        // Attempt to parse JSON roles array
        roles = JSON.parse(rolesHeader);
      } catch {
        // Fallback to comma-separated string
        roles = rolesHeader.split(',') as UserRole[];
      }
    }
    
    return {
      userId,
      sessionId, 
      isAuthenticated: !!userId,
      roles,
      hasRole: (role) => roles.includes(role)
    };
  } catch (error) {
    logger.error('Error getting server auth', error);
    
    // Return unauthenticated state
    return {
      userId: null,
      sessionId: null,
      isAuthenticated: false,
      roles: [],
      hasRole: () => false
    };
  }
}

/**
 * Create Express SDK-compatible request object from headers and cookies
 * @returns Express-compatible request object for authentication
 */
function createServerAuthRequest(): ClerkRequest {
  try {
    // Get headers and cookies
    const headersList = headers();
    const cookiesList = cookies();
    
    // Convert headers to object
    const headersObj: Record<string, string> = {};
    headersList.forEach((value, key) => {
      headersObj[key.toLowerCase()] = value;
    });
    
    // Convert cookies to object
    const cookiesObj: Record<string, string> = {};
    cookiesList.getAll().forEach(cookie => {
      cookiesObj[cookie.name] = cookie.value;
    });
    
    // Create request-like object
    return {
      headers: headersObj,
      cookies: cookiesObj,
      get: (name: string) => headersObj[name.toLowerCase()],
      header: (name: string) => headersObj[name.toLowerCase()],
      // Add minimal Express request properties as needed
      method: 'GET', // Default method
      url: '/', // Default URL
      path: '/' // Default path
    } as ClerkRequest;
  } catch (error) {
    logger.error('Error creating server auth request', error);
    throw new AuthenticationError('Failed to create authentication request');
  }
}

/**
 * Get full auth object from Express SDK in server context
 * @returns Complete Clerk auth object or null if error
 */
export function getFullServerAuth() {
  try {
    const req = createServerAuthRequest();
    return getAuth(req);
  } catch (error) {
    logger.error('Error getting full server auth', error);
    return null;
  }
}

/**
 * Check if the current user has a specific role
 * @param role Role to check for
 * @returns True if the user has the specified role
 */
export function hasServerRole(role: UserRole): boolean {
  try {
    const auth = getServerAuth();
    
    if (!auth.isAuthenticated) {
      return false;
    }
    
    // Check role
    return auth.roles.includes(role);
  } catch (error) {
    logger.error(`Error checking server role ${role}`, error);
    return false;
  }
}

/**
 * Check if the current user has a specific permission
 * @param permission Permission to check for
 * @returns True if the user has the specified permission
 */
export function hasServerPermission(permission: string): boolean {
  try {
    const auth = getServerAuth();
    
    if (!auth.isAuthenticated) {
      return false;
    }
    
    // Map permissions to roles
    // This is a simplified example - in a real implementation, 
    // you would have a more sophisticated permission mapping system
    const permissionsMap: Record<string, UserRole[]> = {
      'view:admin': [UserRole.ADMIN],
      'edit:admin': [UserRole.ADMIN],
      'view:builders': [UserRole.ADMIN, UserRole.BUILDER],
      'edit:builders': [UserRole.ADMIN],
      'view:clients': [UserRole.ADMIN, UserRole.BUILDER, UserRole.CLIENT],
      'edit:clients': [UserRole.ADMIN],
      'view:profile': [UserRole.ADMIN, UserRole.BUILDER, UserRole.CLIENT],
      'edit:profile': [UserRole.ADMIN, UserRole.BUILDER, UserRole.CLIENT],
    };
    
    // Get roles that have this permission
    const requiredRoles = permissionsMap[permission] || [];
    
    // Check if user has any of the roles
    return auth.roles.some(role => requiredRoles.includes(role));
  } catch (error) {
    logger.error(`Error checking server permission ${permission}`, error);
    return false;
  }
}

/**
 * Require authentication for server component or route handler
 * @throws AuthenticationError if user is not authenticated
 */
export function requireServerAuth(): ServerAuth {
  const auth = getServerAuth();
  
  if (!auth.isAuthenticated) {
    throw new AuthenticationError('Authentication required');
  }
  
  return auth;
}

/**
 * Require specific role for server component or route handler
 * @param role Role to require
 * @throws AuthenticationError if user is not authenticated
 * @throws AuthorizationError if user doesn't have the required role
 */
export function requireServerRole(role: UserRole): ServerAuth {
  const auth = requireServerAuth();
  
  if (!auth.roles.includes(role)) {
    throw new AuthorizationError(`Role ${role} required`);
  }
  
  return auth;
}

/**
 * Get DB-compatible user ID from Clerk user ID
 * This is useful if your database uses different IDs than Clerk
 * @param clerkUserId Clerk user ID
 * @returns Database user ID or null
 */
export async function getDbUserIdFromClerkId(clerkUserId: string): Promise<string | null> {
  try {
    if (!clerkUserId) {
      return null;
    }
    
    // In a real implementation, you would fetch the user ID from your database
    // based on the Clerk user ID. This is just a placeholder.
    // Example implementation:
    
    /*
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      select: { id: true }
    });
    return user?.id || null;
    */
    
    // For now, just return the Clerk ID as the DB ID
    // This should be replaced with actual DB integration
    return clerkUserId;
  } catch (error) {
    logger.error(`Error getting DB user ID for Clerk ID ${clerkUserId}`, error);
    return null;
  }
}

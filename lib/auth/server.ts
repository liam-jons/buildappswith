/**
 * Server-Side Authentication Utilities
 * Version: 2.0.0
 * 
 * This file provides server-side authentication utilities for use with
 * Clerk Express SDK in Next.js server components and API routes.
 */

import { getAuth } from "@clerk/express";
import type { Request as ExpressRequest } from "express";
import { headers, cookies } from "next/headers";
import { UserRole } from "./types";
import { logger } from "@/lib/logger";
import { AuthenticationError, AuthorizationError } from "./adapters/clerk-express/errors";

// Define ClerkRequest type since it's not exported from @clerk/express
type ClerkRequest = ExpressRequest;

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
    // Get headers in a sync-safe way
    const headersList = headers();
    const userId = headersList.get?.('x-clerk-auth-user-id') || null;
    const sessionId = headersList.get?.('x-clerk-auth-session-id') || null;
    
    // Parse roles from header if available
    let roles: UserRole[] = [];
    const rolesHeader = headersList.get?.('x-clerk-auth-user-roles') || null;
    
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
      hasRole: (role: UserRole) => roles.includes(role),
    };
  } catch (error) {
    logger.error('Error getting server auth from headers', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    // Return default unauthenticated state on error
    return {
      userId: null,
      sessionId: null,
      isAuthenticated: false,
      roles: [],
      hasRole: () => false,
    };
  }
}

/**
 * Create Express SDK-compatible request object from headers and cookies
 * @returns Express-compatible request object for authentication
 */
export function createServerAuthRequest(): ClerkRequest {
  // Get headers and cookies from Next.js
  const headersList = headers();
  const cookieStore = cookies();
  
  // Convert headers to standard format
  const headersObj: Record<string, string> = {};
  // Handle headersMap safely (may be a ReadonlyMap or similar)
  Array.from(headersList.entries()).forEach(([key, value]) => {
    headersObj[key] = value;
  });
  
  // Get all cookies safely
  const allCookies = cookieStore.getAll?.() || [];
  
  // Convert cookies to header format for Clerk
  const cookieHeader = allCookies
    .map(cookie => `${cookie.name}=${cookie.value}`)
    .join('; ');
  
  if (cookieHeader) {
    headersObj['cookie'] = cookieHeader;
  }
  
  // Create minimal Express-compatible request object with type assertion
  const cookiesObj: Record<string, string> = {};
  
  // Parse cookies into object format required by some Clerk functions
  allCookies.forEach(cookie => {
    cookiesObj[cookie.name] = cookie.value;
  });
  
  // Create a minimal compatible request object
  const req = {
    headers: headersObj,
    cookies: cookiesObj,
    // Add other required properties
    method: 'GET',
    url: '/',
  } as unknown as ClerkRequest;
  
  return req;
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
    logger.error('Error getting full server auth', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return null;
  }
}

/**
 * Check if the current user has a specific role
 * @param role Role to check for
 * @returns True if the user has the specified role
 */
export function hasServerRole(role: UserRole): boolean {
  const { userId, roles } = getServerAuth();
  
  // Not authenticated
  if (!userId) {
    return false;
  }
  
  // Check if user has the specified role
  return roles.includes(role);
}

/**
 * Check if the current user has a specific permission
 * @param permission Permission to check for
 * @returns True if the user has the specified permission
 */
export function hasServerPermission(permission: string): boolean {
  const { userId, roles } = getServerAuth();
  
  // Not authenticated
  if (!userId) {
    return false;
  }
  
  // Admin has all permissions
  if (roles.includes(UserRole.ADMIN)) {
    return true;
  }
  
  // Map permissions to roles (simplified implementation)
  // In a real app, this would be more sophisticated with a permission registry
  
  // Builder permissions
  if (roles.includes(UserRole.BUILDER)) {
    if (permission.startsWith('builder:')) {
      return true;
    }
  }
  
  // Client permissions
  if (roles.includes(UserRole.CLIENT)) {
    if (permission.startsWith('client:')) {
      return true;
    }
  }
  
  // No matching permission
  return false;
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
  
  if (!auth.hasRole(role)) {
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
    // This is a placeholder for your actual DB lookup implementation
    // Replace with your actual database service call
    // For example: return await db.user.findUnique({ where: { clerkId } })?.id || null;
    
    // Mock implementation - in a real app, you would query your database
    logger.debug('Getting DB user ID from Clerk ID', { clerkUserId });
    
    // Simulate database lookup delay
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Simple transformation for demo purposes
    // In a real implementation, you would look up the ID in your database
    return clerkUserId.replace('user_', 'db_');
  } catch (error) {
    logger.error('Error getting DB user ID from Clerk ID', {
      error: error instanceof Error ? error.message : 'Unknown error',
      clerkUserId
    });
    
    return null;
  }
}

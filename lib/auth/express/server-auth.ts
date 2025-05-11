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
import { logger } from "@/lib/logger";
import { AuthenticationError, AuthorizationError } from "./errors";

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
      hasRole: (role: UserRole) => roles.includes(role),
    };
  } catch (error) {
    logger.error('Error getting server auth', { 
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    
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
  try {
    const headersList = headers();
    const cookieStore = cookies();
    
    // Convert headers to object for Clerk Express SDK
    const headersObj: Record<string, string> = {};
    headersList.forEach((value, key) => {
      headersObj[key] = value;
    });
    
    // Convert cookies to object
    const cookiesObj: Record<string, string> = {};
    cookieStore.getAll().forEach(cookie => {
      cookiesObj[cookie.name] = cookie.value;
    });
    
    // Create minimal request object with necessary properties
    return {
      headers: headersObj,
      cookies: cookiesObj,
      // Add other required properties for Express compatibility
      method: 'GET',
      url: headersList.get('x-url') || '/',
      get: (name: string) => headersObj[name.toLowerCase()] || null,
    } as ClerkRequest;
  } catch (error) {
    logger.error('Error creating server auth request', { 
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    
    // Return empty request in case of error
    return {
      headers: {},
      cookies: {},
      method: 'GET',
      url: '/',
      get: () => null,
    } as ClerkRequest;
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
    logger.error('Error getting full server auth', { 
      error: error instanceof Error ? error.message : 'Unknown error',
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
  try {
    const auth = getFullServerAuth();
    if (!auth?.userId) return false;

    // Check session claims for roles
    const userRoles = auth.sessionClaims?.roles || 
                     auth.sessionClaims?.['public_metadata']?.['roles'] || 
                     [];
                     
    return Array.isArray(userRoles) && userRoles.includes(role);
  } catch (error) {
    logger.error('Error checking server role', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      role,
    });
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
    const auth = getFullServerAuth();
    if (!auth?.userId) return false;
    
    // Use Clerk's built-in permission check if available
    if (typeof auth.has === 'function') {
      return auth.has({ permission });
    }
    
    // Fallback to manual permission check based on roles
    // This would need to be customized based on your permission model
    const userRoles = auth.sessionClaims?.roles || [] as string[];
    
    // Simple role-based permission mapping
    // Replace with your actual permission mapping logic
    const rolePermissions: Record<string, string[]> = {
      [UserRole.ADMIN]: ['*'], // Admin has all permissions
      [UserRole.BUILDER]: ['profile:edit', 'builder:manage'],
      [UserRole.CLIENT]: ['profile:view', 'booking:create'],
    };
    
    // Check if any of the user's roles grant the required permission
    return userRoles.some(role => {
      const permissions = rolePermissions[role] || [];
      return permissions.includes('*') || permissions.includes(permission);
    });
  } catch (error) {
    logger.error('Error checking server permission', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      permission,
    });
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
  
  if (!auth.hasRole(role)) {
    throw new AuthorizationError(`Role ${role} required`, role);
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
  if (!clerkUserId) return null;
  
  try {
    // Here you would implement your logic to fetch the database user ID
    // based on the Clerk user ID, typically from your database
    
    // For example:
    // const user = await prisma.user.findUnique({
    //   where: { clerkId: clerkUserId },
    //   select: { id: true }
    // });
    // return user?.id || null;
    
    // For now, we'll return the Clerk ID directly
    // Replace this with your actual implementation
    return clerkUserId;
  } catch (error) {
    logger.error('Error getting DB user ID from Clerk ID', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      clerkUserId,
    });
    return null;
  }
}
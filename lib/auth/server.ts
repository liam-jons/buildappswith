/**
 * Server-Side Authentication Utilities
 * Version: 1.0.0
 * 
 * This file provides server-side authentication utilities for use with
 * Clerk Express SDK in Next.js server components and API routes.
 */

import { getAuth } from "@clerk/express";
import type { Request as ExpressRequest } from "express"; 
import { headers, cookies } from "next/headers";
import { currentUser } from "@clerk/nextjs/server";
import { UserRole, ClerkUserPublicMetadata, AuthUser } from "./types"; 
import { logger } from "@/lib/logger";
import { AuthenticationError, AuthorizationError } from "./adapters/clerk-express/errors"; 
import { getCurrentUser } from "./actions"; 
import { hasRole } from "./utils"; 

interface ClerkRequest extends ExpressRequest {}

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
export async function getServerAuth(): Promise<ServerAuth> {
  try {
    const headersList = await headers();
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
export async function createServerAuthRequest(): Promise<ClerkRequest> {
  try {
    const headersList = await headers();
    const cookieStore = await cookies();
    
    // Convert headers to object for Clerk Express SDK
    const headersObj: Record<string, string> = {};
    headersList.forEach((value: string, key: string) => { 
      headersObj[key] = value;
    });
    
    // Convert cookies to object
    const cookiesObj: Record<string, string> = {};
    cookieStore.getAll().forEach((cookie: { name: string; value: string }) => { 
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
    } as unknown as ClerkRequest;
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
    } as unknown as ClerkRequest;
  }
}

/**
 * Get full auth object from Express SDK in server context
 * @returns Complete Clerk auth object or null if error
 */
export async function getFullServerAuth() {
  try {
    const req = await createServerAuthRequest();
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
export async function hasServerRole(role: UserRole): Promise<boolean> {
  try {
    const auth = await getFullServerAuth();
    if (!auth?.userId) return false;

    // Check session claims for roles
    const userRoles: UserRole[] = (auth.sessionClaims as any)?.roles || 
                     (auth.sessionClaims as any)?.['public_metadata']?.['roles'] || 
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
export async function hasServerPermission(permission: string): Promise<boolean> {
  try {
    const auth = await getFullServerAuth();
    if (!auth?.userId) return false;
    
    // Use Clerk's built-in permission check if available
    if (typeof auth.has === 'function') {
      return auth.has({ permission });
    }
    
    // Fallback to manual permission check based on roles
    // This would need to be customized based on your permission model
    const userRoles: UserRole[] = (auth.sessionClaims as any)?.roles || [] as UserRole[]; 
    
    // Simple role-based permission mapping
    // Replace with your actual permission mapping logic
    const rolePermissions: Record<string, string[]> = {
      [UserRole.ADMIN]: ['*'], // Admin has all permissions
      [UserRole.BUILDER]: ['profile:edit', 'builder:manage'],
      [UserRole.CLIENT]: ['profile:view', 'booking:create'],
    };
    
    // Check if any of the user's roles grant the required permission
    return userRoles.some((r: UserRole) => { 
      const permissions = rolePermissions[r] || [];
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
 */
export async function requireServerAuth(): Promise<ServerAuth> {
  const auth = await getServerAuth();
  if (!auth.isAuthenticated) {
    throw new AuthenticationError('Authentication required.');
  }
  return auth;
}

/**
 * Require specific role for server component or route handler
 * @param role Role to require
 * @throws AuthenticationError if user is not authenticated
 * @throws AuthorizationError if user doesn't have the required role
 */
export async function requireServerRole(role: UserRole): Promise<ServerAuth> {
  const auth = await requireServerAuth();
  if (!auth.hasRole(role)) {
    throw new AuthorizationError(`Required role: ${role}`);
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
  // This is a placeholder. Replace with your actual logic to map
  // Clerk user IDs to your internal database user IDs if they differ.
  // For example, you might query a UserMapping table or use a consistent prefix.
  logger.info('Mapping Clerk User ID to DB User ID', { clerkUserId });

  // If Clerk ID is directly used as DB ID:
  if (process.env.CLERK_ID_IS_DB_ID === 'true') {
    return clerkUserId;
  }

  // Example: query a user table by clerk_id
  // try {
  //   const user = await prisma.user.findUnique({
  //     where: { clerkId: clerkUserId },
  //     select: { id: true },
  //   });
  //   return user?.id || null;
  // } catch (error) {
  //   logger.error('Error fetching DB user ID from Clerk ID', { clerkUserId, error });
  //   return null;
  // }

  // Fallback: return clerkUserId if no mapping needed or if above logic is commented out
  // Consider if this is the desired default behavior for your application
  return clerkUserId; 
}

/**
 * Gets basic Clerk user information (Clerk ID and roles from public metadata)
 * using @clerk/nextjs/server. Does not perform database synchronization.
 * Useful for quick server-side checks or when only Clerk session data is needed.
 * @returns Object with clerkId and roles, or null if not authenticated.
 */
export async function getClerkJsCurrentUser(): Promise<{ clerkId: string; roles: UserRole[] } | null> {
  try {
    const user = await currentUser();
    if (!user) {
      return null;
    }
    const metadata = user.publicMetadata as ClerkUserPublicMetadata | undefined;
    const roles = metadata?.roles || [];
    return {
      clerkId: user.id,
      roles,
    };
  } catch (error) {
    logger.error('Error in getClerkJsCurrentUser', { 
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return null;
  }
}

/**
 * Requires a fully authenticated and DB-synced user.
 * Retrieves the user profile combined from Clerk and the local database.
 * Throws an AuthenticationError if the user is not authenticated or cannot be resolved.
 * @returns {Promise<AuthUser>} The authenticated and DB-synced user.
 * @throws {AuthenticationError} If no user is found or cannot be resolved.
 */
export async function requireDbSyncedUser(): Promise<AuthUser> {
  // getCurrentUser from helpers.ts (which calls findOrCreateUser from actions.ts)
  // This is the function that returns the AuthUser profile.
  const user = await getCurrentUser(); 
  if (!user) {
    logger.warn('requireDbSyncedUser: User not found or could not be resolved.');
    throw new AuthenticationError('Unauthorized: User not found or could not be resolved.');
  }
  return user;
}

/**
 * Requires a fully authenticated and DB-synced user with a specific role.
 * Throws an AuthenticationError if not authenticated, or AuthorizationError if the role is not present.
 * @param {UserRole} role The role to require.
 * @returns {Promise<AuthUser>} The authenticated user with the required role.
 * @throws {AuthenticationError} If no user is found.
 * @throws {AuthorizationError} If the user does not have the required role.
 */
export async function requireDbSyncedUserRole(role: UserRole): Promise<AuthUser> {
  const user = await requireDbSyncedUser(); // Uses the above function
  if (!hasRole(user, role)) {
    logger.warn('requireDbSyncedUserRole: User does not have required role.', { userId: user.clerkId, requiredRole: role });
    throw new AuthorizationError(`Forbidden: Requires ${role} role`);
  }
  return user;
}

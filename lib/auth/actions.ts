/**
 * Auth server actions
 * Version: 1.1.0
 * 
 * Server-side actions for authentication functionality
 */

import { clerkClient, currentUser } from '@clerk/nextjs/server';
import * as Sentry from '@sentry/nextjs';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';
import { UserRole, AuthResponse, AuthErrorType, AuthUser } from '@/lib/auth/types';
import { createAuditLog, ensureProfilesForUser } from '@/lib/profile/data-service';

/**
 * Get the current user ID from Clerk
 * Returns null if not authenticated
 */
export async function getCurrentUserId(): Promise<string | null> {
  try {
    const user = await currentUser();
    return user?.id || null;
  } catch (error) {
    logger.error('Error getting current user ID', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    return null;
  }
}

/**
 * Get the current user from Clerk and database, ensuring they exist in the DB.
 * Returns a fully resolved AuthUser profile or null if not authenticated or error.
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return null;
    }

    const primaryEmailObject = clerkUser.emailAddresses.find(e => e.id === clerkUser.primaryEmailAddressId);
    if (!primaryEmailObject?.emailAddress) {
        logger.warn('Primary email not found for Clerk user', { clerkId: clerkUser.id });
        // Depending on requirements, might Sentry log this or throw, for now, return null
        return null; 
    }
    const primaryEmail = primaryEmailObject.emailAddress;

    // Ensure user exists in DB and get their DB record from findOrCreateUser
    // This step guarantees the user is in our DB.
    await findOrCreateUser(
      clerkUser.id,
      `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || primaryEmail.split('@')[0], 
      primaryEmail,
      clerkUser.imageUrl
    );

    // Now fetch the user from DB with all necessary includes (profiles)
    const dbUserWithProfiles = await db.user.findUnique({
        where: { clerkId: clerkUser.id },
        include: {
            builderProfile: true,
            clientProfile: true,
        },
    });

    if (!dbUserWithProfiles) {
        // This case should be rare if findOrCreateUser succeeded and didn't throw.
        logger.error('DB user not found after findOrCreateUser call in getCurrentUser', { clerkId: clerkUser.id });
        Sentry.captureMessage(`DB user not found after findOrCreateUser for clerkId: ${clerkUser.id} in getCurrentUser`);
        return null;
    }

    // Combine Clerk and database data into AuthUser structure
    return {
      id: dbUserWithProfiles.id,
      clerkId: clerkUser.id,
      name: dbUserWithProfiles.name, 
      email: dbUserWithProfiles.email, 
      imageUrl: dbUserWithProfiles.imageUrl ?? clerkUser.imageUrl, 
      roles: dbUserWithProfiles.roles as UserRole[], 
      verified: primaryEmailObject.verification?.status === 'verified' || dbUserWithProfiles.verified,
      stripeCustomerId: dbUserWithProfiles.stripeCustomerId,
      // Ensure all other AuthUser fields are populated if necessary
      // For now, assuming AuthUser matches this structure based on previous definitions
      // isFounder, isDemo etc., are part of dbUserWithProfiles if in schema
      isFounder: dbUserWithProfiles.isFounder,
      isDemo: dbUserWithProfiles.isDemo,
      // builderProfile & clientProfile are part of dbUserWithProfiles and implicitly part of AuthUser if extended
      // The AuthUser interface itself doesn't list builderProfile/clientProfile explicitly
      // Let's assume they are not part of the core AuthUser for now, to match its definition in types.ts
    };

  } catch (error) {
    logger.error('Error in getCurrentUser (actions.ts)', { 
      source: 'getCurrentUser-actions',
      error: error instanceof Error ? error.message : 'Unknown error', 
      stack: error instanceof Error ? error.stack : undefined
    });
    Sentry.captureException(error, { extra: { source: 'getCurrentUser-actions' } });
    return null;
  }
}

/**
 * Add a role to a user
 */
export async function addRoleToUser(userId: string, role: UserRole): Promise<AuthResponse> {
  try {
    // Get the user from the database
    const user = await db.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) throw new Error('User not found');

    // Ensure roles are consistently UserRole[] before Set operations
    const existingDbRoles = user.roles.map(r => r as UserRole); // Map Prisma roles to custom UserRole
    if (existingDbRoles.includes(role)) {
      // Role already exists, no action needed
      logger.debug('Role already exists for user', { userId, role });
      return {
        success: true,
        message: 'Role already exists'
      };
    }

    // Add the role
    const newRoles = Array.from(new Set([...existingDbRoles, role]));

    // Update the user in the database
    await db.user.update({
      where: { id: userId },
      data: { roles: newRoles }
    });
    
    // Also update the roles in Clerk's metadata
    if (user.clerkId) {
      await clerkClient.users.updateUser(user.clerkId, {
        publicMetadata: { roles: newRoles }
      });
    }
    
    // Create relevant profiles based on role
    await ensureProfilesForUser(userId, newRoles);
    
    // Log the role change
    await createAuditLog({
      userId,
      action: 'ROLE_ADDED',
      targetId: userId,
      targetType: 'User',
      details: {
        role,
        newRoles
      }
    });
    
    return { 
      success: true, 
      message: `Role ${role} added to user`,
      data: { roles: newRoles }
    };
  } catch (error) {
    logger.error('Error adding role to user', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      userId,
      role 
    });
    
    return { 
      success: false, 
      message: 'Error adding role to user',
      error: {
        type: AuthErrorType.SERVER_ERROR, // Use enum member
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    };
  }
}

/**
 * Remove a role from a user
 */
export async function removeRoleFromUser(userId: string, role: UserRole): Promise<AuthResponse> {
  try {
    // Get the user from the database
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        builderProfile: Boolean(role === UserRole.BUILDER),
        clientProfile: Boolean(role === UserRole.CLIENT)
      }
    });
    
    if (!user) {
      return { 
        success: false, 
        message: 'User not found' 
      };
    }
    
    // Check if user has the role
    if (!user.roles.includes(role)) {
      return { 
        success: true, 
        message: 'User does not have this role' 
      };
    }
    
    // Prevent removing the last role
    if (user.roles.length === 1) {
      return { 
        success: false, 
        message: 'Cannot remove the last role from a user' 
      };
    }
    
    // Remove the role
    const newRoles = user.roles.filter(r => r !== role);
    
    // Update the user in the database
    await db.user.update({
      where: { id: userId },
      data: { roles: newRoles }
    });
    
    // Also update the roles in Clerk's metadata
    if (user.clerkId) {
      await clerkClient.users.updateUser(user.clerkId, {
        publicMetadata: { roles: newRoles }
      });
    }
    
    // Log the role change
    await createAuditLog({
      userId,
      action: 'ROLE_REMOVED',
      targetId: userId,
      targetType: 'User',
      details: {
        role,
        newRoles
      }
    });
    
    return { 
      success: true, 
      message: `Role ${role} removed from user`,
      data: { roles: newRoles }
    };
  } catch (error) {
    logger.error('Error removing role from user', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      userId,
      role 
    });
    
    return { 
      success: false, 
      message: 'Error removing role from user',
      error: {
        type: AuthErrorType.SERVER_ERROR, // Use enum member
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    };
  }
}

/**
 * Get user roles for the current user with enhanced logging
 * Returns user roles and determined primary role
 */
export async function getUserRoles() {
  try {
    // Get current user with detailed data
    const user = await getCurrentUser();

    if (!user || !user.roles) {
      logger.warn('User not found or roles undefined in getUserRoles', { userId: user?.id });
      return {
        roles: [UserRole.CLIENT], // Default role
        primaryRole: UserRole.CLIENT,
        isStaff: false
      };
    }

    // Determine primary role (prioritize ADMIN > BUILDER > CLIENT)
    let primaryRole: UserRole = UserRole.CLIENT; // Default to CLIENT

    // user.roles should be UserRole[] from getCurrentUser()
    if (user.roles.some(role => role === UserRole.ADMIN)) {
      primaryRole = UserRole.ADMIN;
    } else if (user.roles.some(role => role === UserRole.BUILDER)) {
      primaryRole = UserRole.BUILDER;
    }
    // No explicit check for CLIENT, as it's the default if not ADMIN or BUILDER

    logger.debug('User roles determined successfully', {
      userId: user.id,
      dbRoles: user.roles,
      primaryRole
    });

    // Combine with Clerk roles if necessary (Clerk considered source of truth for current session roles)
    const clerkUser = await clerkClient.users.getUser(user.id);
    const clerkRoleData = clerkUser?.publicMetadata?.roles as UserRole[] || [];
    
    const allRoles = Array.from(new Set([...(user.roles as UserRole[]), ...clerkRoleData]));

    return {
      roles: allRoles,
      primaryRole,
      isStaff: primaryRole === UserRole.ADMIN || primaryRole === UserRole.BUILDER
    };
  } catch (error) {
    logger.error('Error getting user roles', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    return {
      roles: [],
      primaryRole: null,
      isStaff: false,
      status: 'error',
      debug: {
        message: 'Error retrieving user roles',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    };
  }
}

/**
 * Synchronize user roles between Clerk and database
 */
export async function syncUserRoles(userId: string): Promise<AuthResponse> {
  try {
    // Get the user from the database
    const user = await db.user.findUnique({
      where: { id: userId }
    });
    
    if (!user || !user.clerkId) {
      return { 
        success: false, 
        message: 'User not found or not linked to Clerk' 
      };
    }
    
    // Get the user from Clerk
    const clerkUser = await clerkClient.users.getUser(user.clerkId);
    
    // Extract roles from Clerk's public metadata
    const clerkRoles = clerkUser.publicMetadata?.roles as UserRole[] || [];
    
    // Combine DB roles (mapped) and Clerk roles
    const mappedDbRoles = user.roles.map(r => r as UserRole); // Map Prisma roles to custom UserRole
    const finalRoles = Array.from(new Set([...mappedDbRoles, ...clerkRoles]));

    // Update in the database
    await db.user.update({
      where: { id: userId },
      data: { roles: finalRoles }
    });
    
    // Update in Clerk
    await clerkClient.users.updateUser(user.clerkId, {
      publicMetadata: { roles: finalRoles }
    });
    
    // Ensure profiles match the roles
    await ensureProfilesForUser(userId, finalRoles);
    
    // Log the synchronization
    await createAuditLog({
      userId,
      action: 'ROLES_SYNCED',
      targetId: userId,
      targetType: 'User',
      details: {
        dbRoles: user.roles,
        clerkRoles,
        finalRoles
      }
    });
    
    return { 
      success: true, 
      message: 'Roles synchronized between Clerk and database',
      data: { roles: finalRoles }
    };
  } catch (error) {
    logger.error('Error synchronizing user roles', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      userId 
    });
    
    return { 
      success: false, 
      message: 'Error syncing user roles',
      error: {
        type: AuthErrorType.SERVER_ERROR, // Use enum member
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    };
  }
}

/**
 * Finds an existing user by clerkId or email, or creates a new one if not found.
 * Ensures a user record exists in the local database for a given Clerk user.
 * @param clerkId The Clerk user ID.
 * @param name The user's full name.
 * @param email The user's primary email address.
 * @param imageUrl The user's profile image URL.
 * @returns The found or created user record from the database.
 * @throws Throws an error if the operation fails.
 */
export async function findOrCreateUser(
  clerkId: string,
  name: string,
  email: string,
  imageUrl: string | null
) {
  try {
    logger.debug('Attempting to find or create user', { clerkId, email });

    // First, try to find the user by clerkId
    let user = await db.user.findUnique({
      where: { clerkId },
    });
    logger.debug(user ? 'User found by clerkId' : 'User not found by clerkId', { clerkId });

    // If not found by clerkId, try email
    if (!user) {
      logger.debug('Attempting to find user by email', { email });
      user = await db.user.findUnique({
        where: { email },
      });

      // If user exists by email but doesn't have a clerkId, update it
      if (user && !user.clerkId) {
        logger.debug('User found by email, updating clerkId', { userId: user.id, clerkId });
        user = await db.user.update({
          where: { id: user.id },
          data: { clerkId },
        });
      } else if (user && user.clerkId && user.clerkId !== clerkId) {
        // Edge case: Email exists with a DIFFERENT clerkId. This might indicate a problem.
        logger.warn('User found by email, but with a different clerkId. Potential account conflict.', {
          email, 
          existingClerkId: user.clerkId, 
          newClerkId: clerkId 
        });
        // Depending on policy, you might throw an error or handle this differently.
        // For now, we'll proceed assuming the clerkId passed in is the source of truth if user was not found by new clerkId first.
      }
    }

    // If user still not found, create a new one
    if (!user) {
      logger.debug('User not found by clerkId or email, creating new user', { clerkId, email });
      user = await db.user.create({
        data: {
          clerkId,
          name,
          email,
          imageUrl: imageUrl, // Changed 'image' to 'imageUrl'
          roles: [UserRole.CLIENT] as any, // Default role, cast to any
          verified: true, // Assuming Clerk has verified the email
        },
      });
      logger.info('New user created in DB', { userId: user.id, clerkId });
    }

    return user;
  } catch (error) {
    logger.error('Error in findOrCreateUser', { 
      clerkId, 
      email, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    Sentry.captureException(error);
    throw error; // Re-throw the error to be handled by the caller
  }
}

/**
 * Auth server actions
 * Version: 1.1.0
 * 
 * Server-side actions for authentication functionality
 */

import { clerkClient, currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';
import { UserRole, AuthResponse } from '@/lib/auth/types';
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
 * Get the current user from Clerk and database
 */
export async function getCurrentUser() {
  try {
    // Get the Clerk user
    const user = await currentUser();
    
    if (!user) {
      return null;
    }
    
    // Get the database user
    const dbUser = await db.user.findUnique({
      where: { clerkId: user.id },
      include: {
        builderProfile: true,
        clientProfile: true
      }
    });
    
    if (!dbUser) {
      logger.warn('User found in Clerk but not in database', { clerkId: user.id });
      return null;
    }
    
    // Combine Clerk and database data
    return {
      id: dbUser.id,
      clerkId: user.id,
      name: dbUser.name || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      email: dbUser.email,
      imageUrl: dbUser.imageUrl || user.imageUrl,
      roles: dbUser.roles,
      isAdmin: dbUser.roles.includes(UserRole.ADMIN),
      isBuilder: dbUser.roles.includes(UserRole.BUILDER),
      isClient: dbUser.roles.includes(UserRole.CLIENT),
      builderProfile: dbUser.builderProfile,
      clientProfile: dbUser.clientProfile
    };
  } catch (error) {
    logger.error('Error getting current user', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
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
    
    if (!user) {
      return { 
        success: false, 
        message: 'User not found' 
      };
    }
    
    // Check if user already has the role
    if (user.roles.includes(role)) {
      return { 
        success: true, 
        message: 'User already has this role' 
      };
    }
    
    // Add the role
    const newRoles = [...user.roles, role];
    
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
        type: 'SERVER_ERROR',
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
        type: 'SERVER_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    };
  }
}

/**
 * Get user roles for the current user
 */
export async function getUserRoles() {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return {
        roles: [],
        primaryRole: null
      };
    }
    
    // Determine primary role (prioritize ADMIN > BUILDER > CLIENT)
    let primaryRole = null;
    if (user.roles.includes(UserRole.ADMIN)) {
      primaryRole = 'ADMIN';
    } else if (user.roles.includes(UserRole.BUILDER)) {
      primaryRole = 'BUILDER';
    } else if (user.roles.includes(UserRole.CLIENT)) {
      primaryRole = 'CLIENT';
    }
    
    return {
      roles: user.roles,
      primaryRole
    };
  } catch (error) {
    logger.error('Error getting user roles', { 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    return {
      roles: [],
      primaryRole: null
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
    
    // Check if roles are different
    const dbRolesSet = new Set(user.roles);
    const clerkRolesSet = new Set(clerkRoles);
    
    const rolesEqual = 
      user.roles.length === clerkRoles.length && 
      user.roles.every(role => clerkRolesSet.has(role));
    
    if (rolesEqual) {
      return { 
        success: true, 
        message: 'Roles are already in sync',
        data: { roles: user.roles }
      };
    }
    
    // Determine which roles to use (prefer database roles if they exist)
    const rolesToUse = user.roles.length > 0 ? user.roles : clerkRoles;
    
    // Ensure there's at least one role
    const finalRoles = rolesToUse.length > 0 ? rolesToUse : [UserRole.CLIENT];
    
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
      message: 'Error synchronizing user roles',
      error: {
        type: 'SERVER_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    };
  }
}

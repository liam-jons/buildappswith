/**
 * Profile Data Synchronization Service
 * 
 * This service handles synchronization between Clerk authentication
 * and the database profiles, ensuring data consistency.
 */

import { db } from '@/lib/db';
import { logger } from '@/lib/logger';
import { UserRole } from '@/lib/auth/types';
import { clerkClient } from '@clerk/nextjs/server';

/**
 * Find or create a user based on Clerk ID and user data
 */
export async function findOrCreateUser(clerkId: string, userData: any) {
  try {
    // First try to find user by clerkId
    let user = await db.user.findUnique({
      where: { clerkId },
      include: {
        builderProfile: true,
        clientProfile: true
      }
    });
    
    // If found, return the user
    if (user) {
      return user;
    }
    
    // Extract email from Clerk data
    const email = userData.email_addresses?.[0]?.email_address;
    if (!email) {
      throw new Error('No email address found in user data');
    }
    
    // Try to find user by email (for reconciliation)
    user = await db.user.findUnique({
      where: { email },
      include: {
        builderProfile: true,
        clientProfile: true
      }
    });
    
    // If user exists with email but no clerkId, update with clerkId
    if (user && !user.clerkId) {
      user = await db.user.update({
        where: { id: user.id },
        data: { 
          clerkId,
          // Update image fields if available
          ...(userData.image_url && {
            image: userData.image_url,
            imageUrl: userData.image_url
          })
        },
        include: {
          builderProfile: true,
          clientProfile: true
        }
      });
      
      logger.info('Updated existing user with Clerk ID', { userId: user.id, clerkId });
      
      // Log special case for buildappswith email domains
      if (email.includes('buildappswith')) {
        logger.info('Linked buildappswith user email with Clerk ID', { 
          email, 
          userId: user.id,
          clerkId
        });
        
        // Create audit log entry
        await createAuditLog({
          userId: user.id,
          action: 'USER_CLERK_LINKED',
          targetId: user.id,
          targetType: 'User',
          details: {
            email,
            clerkId,
            reason: 'Email reconciliation for buildappswith domain'
          }
        });
      }
      
      return user;
    }
    
    // If no user found, create a new one
    const name = userData.username || 
                 (userData.first_name && userData.last_name) ? 
                 `${userData.first_name} ${userData.last_name}`.trim() : 
                 'Unknown User';
    
    // Extract roles from metadata or use default
    const roles = (userData.public_metadata?.roles as UserRole[]) || [UserRole.CLIENT];
    
    // Create new user
    user = await db.user.create({
      data: {
        clerkId,
        email,
        name,
        image: userData.image_url,
        imageUrl: userData.image_url,
        roles,
        emailVerified: userData.email_addresses?.[0]?.verification?.status === 'verified' ? 
                     new Date() : null
      },
      include: {
        builderProfile: true,
        clientProfile: true
      }
    });
    
    logger.info('Created new user from Clerk data', { userId: user.id, clerkId });
    
    // Create profiles based on roles if needed
    await ensureProfilesForUser(user.id, roles);
    
    // Create audit log entry
    await createAuditLog({
      userId: user.id,
      action: 'USER_CREATED',
      targetId: user.id,
      targetType: 'User',
      details: {
        source: 'clerk',
        clerkId,
        email,
        roles
      }
    });
    
    return user;
  } catch (error) {
    logger.error('Error in findOrCreateUser', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      clerkId 
    });
    throw error;
  }
}

/**
 * Ensure user has profiles matching their roles
 */
export async function ensureProfilesForUser(userId: string, roles: UserRole[]) {
  try {
    // Check if user has a builder profile
    if (roles.includes(UserRole.BUILDER)) {
      const builderProfile = await db.builderProfile.findUnique({
        where: { userId }
      });
      
      // Create builder profile if it doesn't exist
      if (!builderProfile) {
        await db.builderProfile.create({
          data: {
            userId,
            domains: [],
            badges: [],
            availableForHire: true,
            validationTier: 1
          }
        });
        
        logger.info('Created builder profile for user', { userId });
        
        // Create audit log entry
        await createAuditLog({
          userId,
          action: 'PROFILE_CREATED',
          targetId: userId,
          targetType: 'BuilderProfile',
          details: {
            profileType: 'builder',
            reason: 'Role assignment'
          }
        });
      }
    }
    
    // Check if user has a client profile
    if (roles.includes(UserRole.CLIENT)) {
      const clientProfile = await db.clientProfile.findUnique({
        where: { userId }
      });
      
      // Create client profile if it doesn't exist
      if (!clientProfile) {
        await db.clientProfile.create({
          data: { userId }
        });
        
        logger.info('Created client profile for user', { userId });
        
        // Create audit log entry
        await createAuditLog({
          userId,
          action: 'PROFILE_CREATED',
          targetId: userId,
          targetType: 'ClientProfile',
          details: {
            profileType: 'client',
            reason: 'Role assignment'
          }
        });
      }
    }
  } catch (error) {
    logger.error('Error in ensureProfilesForUser', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      userId 
    });
    throw error;
  }
}

/**
 * Synchronize role changes between Clerk and the database
 */
export async function syncUserRoles(userId: string, clerkId: string, newRoles: UserRole[]) {
  try {
    // Update roles in the database
    await db.user.update({
      where: { id: userId },
      data: { roles: newRoles }
    });
    
    // Update public metadata in Clerk with the new roles
    await clerkClient.users.updateUser(clerkId, {
      publicMetadata: { roles: newRoles }
    });
    
    // Ensure profiles match the new roles
    await ensureProfilesForUser(userId, newRoles);
    
    logger.info('Synchronized user roles', {
      userId,
      clerkId,
      roles: newRoles
    });
    
    // Create audit log entry
    await createAuditLog({
      userId,
      action: 'ROLES_UPDATED',
      targetId: userId,
      targetType: 'User',
      details: {
        roles: newRoles
      }
    });
    
    return { success: true, roles: newRoles };
  } catch (error) {
    logger.error('Error in syncUserRoles', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      userId,
      clerkId
    });
    
    throw error;
  }
}

/**
 * Synchronize Clerk user data with database user record
 */
export async function syncUserData(clerkId: string, userData: any) {
  try {
    // Find the user in the database
    const user = await db.user.findUnique({
      where: { clerkId }
    });
    
    if (!user) {
      logger.error('User not found for sync', { clerkId });
      return null;
    }
    
    // Extract primary email from Clerk
    const primaryEmail = userData.email_addresses?.[0]?.email_address;
    
    // Extract name components
    const name = userData.username || 
                 (userData.first_name && userData.last_name) ? 
                 `${userData.first_name} ${userData.last_name}`.trim() : 
                 user.name; // Fall back to existing name
    
    // Extract verified status
    const isVerified = userData.email_addresses?.[0]?.verification?.status === 'verified';
    
    // Extract roles from metadata or keep existing
    const clerkRoles = userData.public_metadata?.roles as UserRole[] || user.roles;
    
    // Check for email change
    const isEmailChanging = primaryEmail && primaryEmail !== user.email;
    
    if (isEmailChanging) {
      // Check if another user already has this email
      const existingUserWithEmail = await db.user.findUnique({
        where: { email: primaryEmail }
      });
      
      if (existingUserWithEmail && existingUserWithEmail.id !== user.id) {
        // Special handling for buildappswith email domain changes
        if (
          (primaryEmail.includes('buildappswith') || user.email.includes('buildappswith')) &&
          (!existingUserWithEmail.clerkId || existingUserWithEmail.clerkId === clerkId)
        ) {
          logger.info('Special email reconciliation for buildappswith domain', {
            userId: user.id,
            oldEmail: user.email,
            newEmail: primaryEmail
          });
          
          // Create audit log entry
          await createAuditLog({
            userId: user.id,
            action: 'EMAIL_DOMAIN_CHANGE',
            targetId: user.id,
            targetType: 'User',
            details: {
              oldEmail: user.email,
              newEmail: primaryEmail,
              reason: 'buildappswith domain change'
            }
          });
        } else {
          logger.error('Email conflict during sync', {
            clerkId,
            conflictingUserId: existingUserWithEmail.id,
            email: primaryEmail
          });
          
          // Don't update the email if there's a conflict
          return null;
        }
      }
    }
    
    // Update the user record
    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: {
        email: primaryEmail || user.email,
        name,
        image: userData.image_url || user.image,
        imageUrl: userData.image_url || user.imageUrl,
        emailVerified: isVerified ? (user.emailVerified || new Date()) : null,
        roles: clerkRoles
      }
    });
    
    // Create audit log entry
    await createAuditLog({
      userId: user.id,
      action: 'USER_UPDATED',
      targetId: user.id,
      targetType: 'User',
      details: {
        source: 'clerk',
        fields: [
          ...(primaryEmail !== user.email ? ['email'] : []),
          ...(name !== user.name ? ['name'] : []),
          ...(userData.image_url !== user.image ? ['image'] : []),
          ...(JSON.stringify(clerkRoles) !== JSON.stringify(user.roles) ? ['roles'] : [])
        ]
      }
    });
    
    // Ensure profiles match roles
    await ensureProfilesForUser(user.id, clerkRoles);
    
    return updatedUser;
  } catch (error) {
    logger.error('Error in syncUserData', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      clerkId 
    });
    throw error;
  }
}

/**
 * Create an audit log entry
 */
export async function createAuditLog({
  userId,
  action,
  targetId,
  targetType,
  details,
  ipAddress,
  userAgent
}: {
  userId: string;
  action: string;
  targetId?: string;
  targetType?: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}) {
  try {
    return await db.auditLog.create({
      data: {
        userId,
        action,
        targetId,
        targetType,
        details,
        ipAddress,
        userAgent,
      }
    });
  } catch (error) {
    logger.error('Error creating audit log', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      userId,
      action
    });
    // Don't throw the error to prevent disrupting the main flow
    return null;
  }
}

/**
 * Reconcile email discrepancy between Clerk and database
 * (Special handling for the Liam case)
 */
export async function reconcileEmailDiscrepancy(userId: string, clerkId: string) {
  try {
    // Get the user from the database
    const user = await db.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      logger.error('User not found for email reconciliation', { userId });
      return { success: false, error: 'User not found' };
    }
    
    // Get the user from Clerk
    const clerkUser = await clerkClient.users.getUser(clerkId);
    
    // Get primary email from Clerk
    const clerkEmail = clerkUser.emailAddresses[0]?.emailAddress;
    
    if (!clerkEmail) {
      logger.error('No email found in Clerk for user', { userId, clerkId });
      return { success: false, error: 'No email in Clerk' };
    }
    
    // If emails match, no reconciliation needed
    if (user.email === clerkEmail) {
      return { success: true, message: 'Emails already match' };
    }
    
    // Special handling for buildappswith.ai vs buildappswith.com
    const isLiamCase = (
      (user.email.includes('buildappswith') && clerkEmail.includes('buildappswith')) ||
      user.email === 'liam@buildappswith.com' || 
      clerkEmail === 'liam@buildappswith.ai'
    );
    
    if (isLiamCase) {
      logger.info('Reconciling buildappswith email domains', {
        userId,
        dbEmail: user.email,
        clerkEmail
      });
      
      // Create audit log entry
      await createAuditLog({
        userId,
        action: 'EMAIL_RECONCILED',
        targetId: userId,
        targetType: 'User',
        details: {
          oldEmail: user.email,
          newEmail: clerkEmail,
          reason: 'buildappswith domain reconciliation'
        }
      });
      
      // Update the email in the database to match Clerk
      await db.user.update({
        where: { id: userId },
        data: { email: clerkEmail }
      });
      
      return { 
        success: true, 
        message: 'Email reconciled for buildappswith domain',
        oldEmail: user.email,
        newEmail: clerkEmail
      };
    }
    
    // For other cases, log but don't automatically change
    logger.warn('Email discrepancy detected', {
      userId,
      dbEmail: user.email,
      clerkEmail,
      needsManualReview: true
    });
    
    return {
      success: false,
      needsManualReview: true,
      dbEmail: user.email,
      clerkEmail
    };
  } catch (error) {
    logger.error('Error reconciling email discrepancy', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      userId,
      clerkId
    });
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}
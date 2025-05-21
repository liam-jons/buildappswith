/**
 * Profile Auth Middleware
 * 
 * This middleware enforces authentication and authorization for profile-related routes.
 * It provides role-based access control and ownership verification.
 * 
 * Version: 2.0.0 (Updated for standardized enums and types)
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';
import { logProfileAccess } from '@/lib/auth/security-logging';
import { 
  UserRole,
  ProfileType,
  AccessType
} from '@/lib/types/enums';
import {
  Permission,
  ProfileRouteContext,
  ProfileRouteHandler,
  getDefaultPermissionsForRole
} from '@/lib/auth/types';

/**
 * Middleware to ensure user has access to profile
 */
export function withProfileAccess(
  handler: ProfileRouteHandler,
  options: {
    requireAuth?: boolean;
    allowedRoles?: UserRole[];
    requiredPermissions?: Permission[];
    allowOwner?: boolean;
    allowAdmin?: boolean;
  } = {
    requireAuth: true,
    allowedRoles: undefined,
    requiredPermissions: undefined,
    allowOwner: true,
    allowAdmin: true
  }
) {
  return async (req: NextRequest, params: { params?: { id?: string } }) => {
    const { 
      requireAuth = true, 
      allowedRoles, 
      requiredPermissions,
      allowOwner = true, 
      allowAdmin = true 
    } = options;
    
    // Default options if not specified
    const profileId = params.params?.id;
    
    // Get auth info from Clerk
    const { userId: clerkId } = auth();
    
    // Check if authentication is required
    if (requireAuth && !clerkId) {
      logger.warn('Unauthenticated profile access attempt', {
        profileId,
        method: req.method,
        path: req.nextUrl.pathname
      });
      
      return NextResponse.json(
        { error: 'Authentication required' }, 
        { status: 401 }
      );
    }
    
    // If no auth required and no user, allow access
    if (!requireAuth && !clerkId) {
      return handler(req, {
        userId: '',
        clerkId: '',
        user: null,
        profileId,
        profileType: undefined,
        isOwner: false,
        isAdmin: false
      });
    }
    
    try {
      // Get user from database
      const user = await db.user.findUnique({
        where: { clerkId },
        select: { 
          id: true, 
          roles: true,
          builderProfile: profileId ? {
            select: { id: true }
          } : undefined,
          clientProfile: profileId ? {
            select: { id: true }
          } : undefined
        }
      });
      
      if (!user) {
        logger.error('User not found in database', { clerkId });
        
        return NextResponse.json(
          { error: 'User not found' }, 
          { status: 404 }
        );
      }
      
      // Check role-based access
      if (allowedRoles && allowedRoles.length > 0) {
        const hasRole = allowedRoles.some(role => user.roles.includes(role));
        
        if (!hasRole) {
          logger.warn('User has insufficient roles', { 
            userId: user.id, 
            userRoles: user.roles,
            requiredRoles: allowedRoles 
          });
          
          const profileTypeValue = req.nextUrl.pathname.includes('builder') 
            ? ProfileType.BUILDER 
            : ProfileType.CLIENT;
            
          const accessTypeValue = req.method === 'GET' 
            ? AccessType.VIEW 
            : req.method === 'DELETE' 
              ? AccessType.DELETE 
              : AccessType.EDIT;
          
          await logProfileAccess({
            userId: user.id,
            profileId: profileId || 'unknown',
            profileType: profileTypeValue.toLowerCase(),
            accessType: accessTypeValue.toLowerCase(),
            allowed: false
          });
          
          return NextResponse.json(
            { error: 'Insufficient permissions' }, 
            { status: 403 }
          );
        }
      }
      
      // Check permission-based access if specified
      if (requiredPermissions && requiredPermissions.length > 0) {
        // Get all permissions for user's roles
        const userPermissions = user.roles.flatMap(
          role => getDefaultPermissionsForRole(role)
        );
        
        // Check if user has all required permissions
        const hasPermissions = requiredPermissions.every(
          permission => userPermissions.includes(permission)
        );
        
        if (!hasPermissions) {
          logger.warn('User has insufficient permissions', { 
            userId: user.id, 
            userRoles: user.roles,
            userPermissions,
            requiredPermissions 
          });
          
          return NextResponse.json(
            { error: 'Insufficient permissions' }, 
            { status: 403 }
          );
        }
      }
      
      // Handle profile-specific access if we have a profile ID
      let isOwner = false;
      let isAdmin = user.roles.includes(UserRole.ADMIN);
      let profileType: ProfileType | undefined;
      
      if (profileId) {
        // Determine profile type from URL
        profileType = req.nextUrl.pathname.includes('builder') 
          ? ProfileType.BUILDER 
          : ProfileType.CLIENT;
        
        // For builder profile access
        if (profileType === ProfileType.BUILDER) {
          // Check if this profile matches the user's builder profile
          const builderProfile = user.builderProfile;
          isOwner = builderProfile?.id === profileId;
          
          if (!isOwner && !isAdmin && (!allowAdmin || !allowOwner)) {
            logger.warn('Unauthorized builder profile access attempt', {
              userId: user.id,
              profileId,
              path: req.nextUrl.pathname
            });
            
            const accessTypeValue = req.method === 'GET' 
              ? AccessType.VIEW 
              : req.method === 'DELETE' 
                ? AccessType.DELETE 
                : AccessType.EDIT;
            
            await logProfileAccess({
              userId: user.id,
              profileId,
              profileType: ProfileType.BUILDER.toLowerCase(),
              accessType: accessTypeValue.toLowerCase(),
              allowed: false
            });
            
            return NextResponse.json(
              { error: 'Access denied' }, 
              { status: 403 }
            );
          }
        } 
        // For client profile access
        else if (profileType === ProfileType.CLIENT) {
          // Check if this profile matches the user's client profile
          const clientProfile = user.clientProfile;
          isOwner = clientProfile?.id === profileId;
          
          if (!isOwner && !isAdmin && (!allowAdmin || !allowOwner)) {
            logger.warn('Unauthorized client profile access attempt', {
              userId: user.id,
              profileId,
              path: req.nextUrl.pathname
            });
            
            const accessTypeValue = req.method === 'GET' 
              ? AccessType.VIEW 
              : req.method === 'DELETE' 
                ? AccessType.DELETE 
                : AccessType.EDIT;
            
            await logProfileAccess({
              userId: user.id,
              profileId,
              profileType: ProfileType.CLIENT.toLowerCase(),
              accessType: accessTypeValue.toLowerCase(),
              allowed: false
            });
            
            return NextResponse.json(
              { error: 'Access denied' }, 
              { status: 403 }
            );
          }
        }
      }
      
      // Log successful profile access
      if (profileId) {
        const accessTypeValue = req.method === 'GET' 
          ? AccessType.VIEW 
          : req.method === 'DELETE' 
            ? AccessType.DELETE 
            : AccessType.EDIT;
            
        await logProfileAccess({
          userId: user.id,
          profileId,
          profileType: profileType?.toLowerCase() || 'unknown',
          accessType: accessTypeValue.toLowerCase(),
          allowed: true
        });
      }
      
      // Call handler with context
      return handler(req, { 
        userId: user.id, 
        clerkId, 
        user, 
        profileId,
        profileType,
        isOwner,
        isAdmin
      });
    } catch (error) {
      logger.error('Error in profile access middleware', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        clerkId,
        profileId
      });
      
      return NextResponse.json(
        { error: 'Internal server error' }, 
        { status: 500 }
      );
    }
  };
}

/**
 * Middleware to ensure user is an admin
 */
export function withAdminAccess(handler: ProfileRouteHandler) {
  return withProfileAccess(handler, {
    requireAuth: true,
    allowedRoles: [UserRole.ADMIN],
    requiredPermissions: ['admin:access'],
    allowOwner: false,
    allowAdmin: true
  });
}

/**
 * Middleware for builder profile routes
 */
export function withBuilderProfileAccess(handler: ProfileRouteHandler) {
  return withProfileAccess(handler, {
    requireAuth: true,
    allowedRoles: [UserRole.BUILDER, UserRole.ADMIN],
    requiredPermissions: ['view:builder'],
    allowOwner: true,
    allowAdmin: true
  });
}

/**
 * Middleware for client profile routes
 */
export function withClientProfileAccess(handler: ProfileRouteHandler) {
  return withProfileAccess(handler, {
    requireAuth: true,
    allowedRoles: [UserRole.CLIENT, UserRole.ADMIN],
    requiredPermissions: ['view:profile'],
    allowOwner: true,
    allowAdmin: true
  });
}

/**
 * Middleware for authenticated routes with any role
 */
export function withAuthenticatedAccess(handler: ProfileRouteHandler) {
  return withProfileAccess(handler, {
    requireAuth: true,
    allowedRoles: [UserRole.CLIENT, UserRole.BUILDER, UserRole.ADMIN],
    allowOwner: true,
    allowAdmin: true
  });
}

/**
 * Middleware with optional authentication
 */
export function withOptionalAuth(handler: ProfileRouteHandler) {
  return withProfileAccess(handler, {
    requireAuth: false
  });
}
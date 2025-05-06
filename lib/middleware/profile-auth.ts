/**
 * Profile Auth Middleware
 * 
 * This middleware enforces authentication and authorization for profile-related routes.
 * It provides role-based access control and ownership verification.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';
import { UserRole } from '@/lib/auth/types';
import { logProfileAccess } from '@/lib/auth/security-logging';

// Define context for route handlers
export interface ProfileRouteContext {
  userId: string;
  clerkId: string;
  user: any;
  profileId?: string;
  profileType?: 'builder' | 'client';
  isOwner: boolean;
  isAdmin: boolean;
}

// Define route handler with profile context
export type ProfileRouteHandler = (
  req: NextRequest,
  context: ProfileRouteContext
) => Promise<NextResponse> | NextResponse;

/**
 * Middleware to ensure user has access to profile
 */
export function withProfileAccess(
  handler: ProfileRouteHandler,
  options: {
    requireAuth?: boolean;
    allowedRoles?: UserRole[];
    allowOwner?: boolean;
    allowAdmin?: boolean;
  } = {
    requireAuth: true,
    allowedRoles: undefined,
    allowOwner: true,
    allowAdmin: true
  }
) {
  return async (req: NextRequest, params: { params?: { id?: string } }) => {
    const { 
      requireAuth = true, 
      allowedRoles, 
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
          
          await logProfileAccess({
            userId: user.id,
            profileId: profileId || 'unknown',
            profileType: req.nextUrl.pathname.includes('builder') ? 'builder' : 'client',
            accessType: req.method === 'GET' ? 'view' : 
                        req.method === 'DELETE' ? 'delete' : 'edit',
            allowed: false
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
      let profileType: 'builder' | 'client' | undefined;
      
      if (profileId) {
        // Determine profile type from URL
        profileType = req.nextUrl.pathname.includes('builder') ? 'builder' : 'client';
        
        // For builder profile access
        if (profileType === 'builder') {
          // Check if this profile matches the user's builder profile
          const builderProfile = user.builderProfile;
          isOwner = builderProfile?.id === profileId;
          
          if (!isOwner && !isAdmin && (!allowAdmin || !allowOwner)) {
            logger.warn('Unauthorized builder profile access attempt', {
              userId: user.id,
              profileId,
              path: req.nextUrl.pathname
            });
            
            await logProfileAccess({
              userId: user.id,
              profileId,
              profileType: 'builder',
              accessType: req.method === 'GET' ? 'view' : 
                          req.method === 'DELETE' ? 'delete' : 'edit',
              allowed: false
            });
            
            return NextResponse.json(
              { error: 'Access denied' }, 
              { status: 403 }
            );
          }
        } 
        // For client profile access
        else if (profileType === 'client') {
          // Check if this profile matches the user's client profile
          const clientProfile = user.clientProfile;
          isOwner = clientProfile?.id === profileId;
          
          if (!isOwner && !isAdmin && (!allowAdmin || !allowOwner)) {
            logger.warn('Unauthorized client profile access attempt', {
              userId: user.id,
              profileId,
              path: req.nextUrl.pathname
            });
            
            await logProfileAccess({
              userId: user.id,
              profileId,
              profileType: 'client',
              accessType: req.method === 'GET' ? 'view' : 
                          req.method === 'DELETE' ? 'delete' : 'edit',
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
        await logProfileAccess({
          userId: user.id,
          profileId,
          profileType: profileType || 'unknown',
          accessType: req.method === 'GET' ? 'view' : 
                      req.method === 'DELETE' ? 'delete' : 'edit',
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
    allowOwner: true,
    allowAdmin: true
  });
}
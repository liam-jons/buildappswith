/**
 * Authentication Test API
 * 
 * This API provides endpoints for testing authentication and role-based access control.
 * It demonstrates the use of the authentication middleware and role-based protection.
 * 
 * Version: 1.0.0
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, withRole, withAdmin, withBuilder, withClient } from '@/lib/auth';
import { UserRole, AuthObject } from '@/lib/auth/types';

/**
 * GET handler for testing authentication
 * 
 * Requires authentication but no specific role
 */
export const GET = withAuth(async (req: NextRequest, context: { params?: any }, auth: AuthObject) => {
  return NextResponse.json({
    success: true,
    message: 'Authentication successful',
    data: {
      userId: auth.userId,
      roles: auth.roles,
      isAuthenticated: true,
    },
  });
});

/**
 * POST handler for testing admin role access
 * 
 * Requires ADMIN role
 */
export const POST = withAdmin(async (req: NextRequest, context: { params?: any }, auth: AuthObject) => {
  return NextResponse.json({
    success: true,
    message: 'Admin access granted',
    data: {
      userId: auth.userId,
      roles: auth.roles,
      isAdmin: true,
    },
  });
});

/**
 * PUT handler for testing builder role access
 * 
 * Requires BUILDER role
 */
export const PUT = withBuilder(async (req: NextRequest, context: { params?: any }, auth: AuthObject) => {
  return NextResponse.json({
    success: true,
    message: 'Builder access granted',
    data: {
      userId: auth.userId,
      roles: auth.roles,
      isBuilder: true,
    },
  });
});

/**
 * PATCH handler for testing client role access
 * 
 * Requires CLIENT role
 */
export const PATCH = withClient(async (req: NextRequest, context: { params?: any }, auth: AuthObject) => {
  return NextResponse.json({
    success: true,
    message: 'Client access granted',
    data: {
      userId: auth.userId,
      roles: auth.roles,
      isClient: true,
    },
  });
});

/**
 * DELETE handler for testing custom role access
 * 
 * Requires either ADMIN or BUILDER role
 */
export const DELETE = withRole(
  UserRole.ADMIN, 
  async (req: NextRequest, context: { params?: any }, auth: AuthObject) => { 
    return NextResponse.json({
      success: true,
      message: 'Custom role access granted for ADMIN',
      data: {
        userId: auth.userId,
        roles: auth.roles,
        hasRequiredRole: true,
      },
    });
  }
);

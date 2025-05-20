/**
 * Auth Test API Routes
 * Version: 1.0.0
 * 
 * Test endpoints for verifying Clerk Express SDK authentication flow
 * This file implements:
 * - Public endpoint (GET) - accessible to all users
 * - Auth-protected endpoint (POST) - requires authentication
 * - Role-protected endpoints (PUT, DELETE) - requires specific roles
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  withAuth, 
  withRole, 
  withAdmin,
  withBuilder 
} from '@/lib/auth';
import { UserRole, AuthObject } from '@/lib/auth/types';
import { logger } from '@/lib/logger';

/**
 * Public endpoint - No authentication required
 */
export async function GET(req: NextRequest) {
  logger.info('Public auth test endpoint accessed', {
    path: req.nextUrl.pathname,
    method: req.method,
  });

  return NextResponse.json({
    success: true,
    message: 'Public endpoint accessible to all users',
    auth: {
      required: false,
      type: 'public'
    }
  });
}

/**
 * Protected endpoint - Requires authentication
 */
export const POST = withAuth(async (req: NextRequest, context: { params?: any }, auth: AuthObject) => {
  logger.info('Auth-protected endpoint accessed', {
    userId: auth.userId,
    path: req.nextUrl.pathname,
    method: req.method,
  });

  return NextResponse.json({
    success: true,
    message: 'Authentication verified successfully',
    auth: {
      required: true,
      type: 'user',
      userId: auth.userId
    }
  });
});

/**
 * Admin-only endpoint - Requires ADMIN role
 */
export const PUT = withAdmin(async (req: NextRequest, context: { params?: any }, auth: AuthObject) => {
  logger.info('Admin-protected endpoint accessed', {
    userId: auth.userId,
    roles: auth.roles,
    path: req.nextUrl.pathname,
    method: req.method,
  });

  return NextResponse.json({
    success: true,
    message: 'Admin authentication verified successfully',
    auth: {
      required: true,
      type: 'admin',
      userId: auth.userId,
      roles: auth.roles
    }
  });
});

/**
 * Builder-only endpoint - Requires BUILDER role
 */
export const DELETE = withBuilder(async (req: NextRequest, context: { params?: any }, auth: AuthObject) => {
  logger.info('Builder-protected endpoint accessed', {
    userId: auth.userId,
    roles: auth.roles,
    path: req.nextUrl.pathname,
    method: req.method,
  });

  return NextResponse.json({
    success: true,
    message: 'Builder authentication verified successfully',
    auth: {
      required: true,
      type: 'builder',
      userId: auth.userId,
      roles: auth.roles
    }
  });
});

/**
 * PATCH endpoint - Requires specific roles (ADMIN or BUILDER)
 */
export const PATCH = withRole(UserRole.CLIENT, async (req: NextRequest, context: { params?: any }, auth: AuthObject) => {
  logger.info('Client-protected endpoint accessed', {
    userId: auth.userId,
    roles: auth.roles,
    path: req.nextUrl.pathname,
    method: req.method,
  });

  return NextResponse.json({
    success: true,
    message: 'Client authentication verified successfully',
    auth: {
      required: true,
      type: 'client',
      userId: auth.userId,
      roles: auth.roles
    }
  });
});
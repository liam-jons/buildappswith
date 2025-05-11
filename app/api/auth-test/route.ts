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
} from '@/lib/auth/express/api-auth';
import { UserRole } from '@/lib/auth/types';
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
export const POST = withAuth(async (req: NextRequest, userId: string) => {
  logger.info('Auth-protected endpoint accessed', {
    userId,
    path: req.nextUrl.pathname,
    method: req.method,
  });

  return NextResponse.json({
    success: true,
    message: 'Authentication verified successfully',
    auth: {
      required: true,
      type: 'user',
      userId
    }
  });
});

/**
 * Admin-only endpoint - Requires ADMIN role
 */
export const PUT = withAdmin(async (req: NextRequest, userId: string, roles: UserRole[]) => {
  logger.info('Admin-protected endpoint accessed', {
    userId,
    roles,
    path: req.nextUrl.pathname,
    method: req.method,
  });

  return NextResponse.json({
    success: true,
    message: 'Admin authentication verified successfully',
    auth: {
      required: true,
      type: 'admin',
      userId,
      roles
    }
  });
});

/**
 * Builder-only endpoint - Requires BUILDER role
 */
export const DELETE = withBuilder(async (req: NextRequest, userId: string, roles: UserRole[]) => {
  logger.info('Builder-protected endpoint accessed', {
    userId,
    roles,
    path: req.nextUrl.pathname,
    method: req.method,
  });

  return NextResponse.json({
    success: true,
    message: 'Builder authentication verified successfully',
    auth: {
      required: true,
      type: 'builder',
      userId,
      roles
    }
  });
});

/**
 * PATCH endpoint - Requires specific roles (ADMIN or BUILDER)
 */
export const PATCH = withRole(UserRole.CLIENT, async (req: NextRequest, userId: string, roles: UserRole[]) => {
  logger.info('Client-protected endpoint accessed', {
    userId,
    roles,
    path: req.nextUrl.pathname,
    method: req.method,
  });

  return NextResponse.json({
    success: true,
    message: 'Client authentication verified successfully',
    auth: {
      required: true,
      type: 'client',
      userId,
      roles
    }
  });
});
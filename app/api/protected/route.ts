/**
 * Protected API Routes
 * Version: 1.0.0
 * 
 * These routes demonstrate role-based API protection using the Clerk Express SDK.
 * Each HTTP method has a different authorization requirement.
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  withAuth, 
  withRole, 
  withAdmin, 
  withBuilder,
  withAnyRole,
  withAllRoles
} from '@/lib/auth';
import { UserRole, AuthObject } from '@/lib/auth/types';
import { logger } from '@/lib/logger';

/**
 * GET - Requires basic authentication (any authenticated user)
 */
export const GET = withAuth(async (req: NextRequest, context: { params?: any }, auth: AuthObject) => {
  logger.info('Protected GET endpoint accessed', { userId: auth.userId, path: req.nextUrl.pathname });
  
  return NextResponse.json({
    success: true,
    message: 'Successfully accessed basic protected endpoint',
    auth: {
      userId: auth.userId,
      requirements: 'Basic authentication',
      timestamp: new Date().toISOString()
    }
  });
});

/**
 * POST - Requires admin role
 */
export const POST = withAdmin(async (req: NextRequest, context: { params?: any }, auth: AuthObject) => {
  logger.info('Admin-only POST endpoint accessed', { userId: auth.userId, roles: auth.roles, path: req.nextUrl.pathname });
  
  return NextResponse.json({
    success: true,
    message: 'Successfully accessed admin-only endpoint',
    auth: {
      userId: auth.userId,
      roles: auth.roles,
      requirements: 'Admin role required',
      timestamp: new Date().toISOString()
    }
  });
});

/**
 * PUT - Requires builder role
 */
export const PUT = withBuilder(async (req: NextRequest, context: { params?: any }, auth: AuthObject) => {
  logger.info('Builder-only PUT endpoint accessed', { userId: auth.userId, roles: auth.roles, path: req.nextUrl.pathname });
  
  return NextResponse.json({
    success: true,
    message: 'Successfully accessed builder-only endpoint',
    auth: {
      userId: auth.userId,
      roles: auth.roles,
      requirements: 'Builder role required',
      timestamp: new Date().toISOString()
    }
  });
});

/**
 * PATCH - Requires either admin OR builder role
 */
export const PATCH = withAnyRole([UserRole.ADMIN, UserRole.BUILDER], async (req: NextRequest, context: { params?: any }, auth: AuthObject) => {
  logger.info('Admin OR Builder endpoint accessed', { userId: auth.userId, roles: auth.roles, path: req.nextUrl.pathname });
  
  return NextResponse.json({
    success: true,
    message: 'Successfully accessed endpoint requiring admin OR builder role',
    auth: {
      userId: auth.userId,
      roles: auth.roles,
      requirements: 'Admin OR Builder role required',
      timestamp: new Date().toISOString()
    }
  });
});

/**
 * DELETE - Requires BOTH admin AND client roles
 */
export const DELETE = withAllRoles([UserRole.ADMIN, UserRole.CLIENT], async (req: NextRequest, context: { params?: any }, auth: AuthObject) => {
  logger.info('Admin AND Client endpoint accessed', { userId: auth.userId, roles: auth.roles, path: req.nextUrl.pathname });
  
  return NextResponse.json({
    success: true,
    message: 'Successfully accessed endpoint requiring admin AND client roles',
    auth: {
      userId: auth.userId,
      roles: auth.roles,
      requirements: 'Admin AND Client roles required',
      timestamp: new Date().toISOString()
    }
  });
});
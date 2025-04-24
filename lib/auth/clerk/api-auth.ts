import { NextRequest, NextResponse } from 'next/server';
import { UserRole } from '@/lib/auth/types';
import { AuthUser, requireAuth, requireRole } from './helpers';

/**
 * Type for API handler functions that require authentication
 */
export type AuthenticatedHandler = (
  req: NextRequest,
  user: AuthUser
) => Promise<NextResponse> | NextResponse;

/**
 * Type for API handler functions that require a specific role
 */
export type RoleProtectedHandler = (
  req: NextRequest,
  user: AuthUser
) => Promise<NextResponse> | NextResponse;

/**
 * Wrap an API handler to require authentication
 * @param handler The handler function that requires an authenticated user
 * @returns A standard Next.js API handler
 */
export function withAuth(handler: AuthenticatedHandler) {
  return async (req: NextRequest) => {
    try {
      const user = await requireAuth();
      return await handler(req, user);
    } catch (error) {
      if (error instanceof Error && error.message === 'Unauthorized') {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
      
      console.error('API auth error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

/**
 * Wrap an API handler to require a specific role
 * @param role Role required to access the handler
 * @param handler The handler function that requires a specific role
 * @returns A standard Next.js API handler
 */
export function withRole(role: UserRole, handler: RoleProtectedHandler) {
  return async (req: NextRequest) => {
    try {
      const user = await requireRole(role);
      return await handler(req, user);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Unauthorized') {
          return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
          );
        }
        
        if (error.message.startsWith('Forbidden')) {
          return NextResponse.json(
            { error: error.message },
            { status: 403 }
          );
        }
      }
      
      console.error('API auth error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

/**
 * Helper for admin-only API routes
 * @param handler Handler requiring admin access
 */
export function withAdmin(handler: RoleProtectedHandler) {
  return withRole(UserRole.ADMIN, handler);
}

/**
 * Helper for builder-only API routes
 * @param handler Handler requiring builder access
 */
export function withBuilder(handler: RoleProtectedHandler) {
  return withRole(UserRole.BUILDER, handler);
}

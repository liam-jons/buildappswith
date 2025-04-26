/**
 * Role-Based Access Control Middleware
 * Version: 1.0.78
 * 
 * Provides enhanced RBAC functionality for middleware
 * with flexible permission models and policy enforcement.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createMiddlewareError } from './error-handling';
import { middlewareLogger } from './logging';

export type UserRole = 'CLIENT' | 'BUILDER' | 'ADMIN';

export type ResourceAction = 'view' | 'create' | 'update' | 'delete' | 'manage';

export type Permission = {
  resource: string;
  action: ResourceAction;
};

export type AccessPolicy = {
  roles: UserRole[];
  permissions: Permission[];
};

/**
 * Default access policies for different resources
 */
export const defaultAccessPolicies: Record<string, AccessPolicy> = {
  dashboard: {
    roles: ['CLIENT', 'BUILDER', 'ADMIN'],
    permissions: [{ resource: 'dashboard', action: 'view' }],
  },
  builderProfile: {
    roles: ['BUILDER', 'ADMIN'],
    permissions: [
      { resource: 'builderProfile', action: 'view' },
      { resource: 'builderProfile', action: 'update' },
    ],
  },
  adminPanel: {
    roles: ['ADMIN'],
    permissions: [{ resource: 'adminPanel', action: 'manage' }],
  },
  clientProfile: {
    roles: ['CLIENT', 'ADMIN'],
    permissions: [
      { resource: 'clientProfile', action: 'view' },
      { resource: 'clientProfile', action: 'update' },
    ],
  },
  sessions: {
    roles: ['CLIENT', 'BUILDER', 'ADMIN'],
    permissions: [{ resource: 'sessions', action: 'view' }],
  },
};

/**
 * Route to access policy mapping for path-based authorization
 */
export const routeAccessPolicies: Record<string, string> = {
  '/dashboard': 'dashboard',
  '/dashboard/(.*)': 'dashboard',
  '/builder/profile': 'builderProfile',
  '/builder/(.*)': 'builderProfile',
  '/admin': 'adminPanel',
  '/admin/(.*)': 'adminPanel',
  '/client/profile': 'clientProfile',
  '/client/(.*)': 'clientProfile',
  '/sessions': 'sessions',
  '/sessions/(.*)': 'sessions',
};

/**
 * Get user roles from auth object
 * @param auth Auth object from Clerk
 * @returns Array of user roles
 */
export function getUserRoles(userAuth: ReturnType<typeof auth>): UserRole[] {
  // If no user, return empty array
  if (!userAuth.userId) {
    return [];
  }
  
  // Get roles from user metadata
  // This assumes Clerk has user metadata with roles
  const userRoles = userAuth.sessionClaims?.roles as UserRole[] || [];
  
  // Fallback if no roles defined - assign CLIENT role by default
  if (!userRoles || userRoles.length === 0) {
    return ['CLIENT'];
  }
  
  return userRoles;
}

/**
 * Check if the user has permission to access a resource
 * @param userRoles User roles
 * @param policyName Policy name
 * @returns Boolean indicating if user has access
 */
export function hasAccess(userRoles: UserRole[], policyName: string): boolean {
  // Get the access policy
  const policy = defaultAccessPolicies[policyName];
  
  // If policy doesn't exist, deny access
  if (!policy) {
    return false;
  }
  
  // Check if user has any of the required roles
  return userRoles.some(role => policy.roles.includes(role));
}

/**
 * Get matching policy name for a path
 * @param path URL path
 * @returns Policy name or undefined
 */
export function getPolicyForPath(path: string): string | undefined {
  // Check each route pattern
  for (const [pattern, policy] of Object.entries(routeAccessPolicies)) {
    // Convert string patterns to regex if they contain wildcards
    const regex = pattern.includes('(.*)') 
      ? new RegExp(`^${pattern.replace('(.*)', '.*')}$`)
      : undefined;
      
    // Check if path matches pattern
    if (regex ? regex.test(path) : path === pattern) {
      return policy;
    }
  }
  
  return undefined;
}

/**
 * Middleware function for role-based access control
 * @param request Next.js request
 * @returns Response or null to continue
 */
export async function rbacMiddleware(request: NextRequest): Promise<NextResponse | null> {
  const { pathname } = request.nextUrl;
  
  // Get policy for path
  const policyName = getPolicyForPath(pathname);
  
  // If no policy required, continue
  if (!policyName) {
    return null;
  }
  
  // Get auth from Clerk
  const userAuth = auth();
  
  // If no auth and policy required, unauthorized
  if (!userAuth || !userAuth.userId) {
    middlewareLogger.warn(
      'rbac', 
      `Unauthorized access attempt to ${pathname}`,
      { policyRequired: policyName },
      request
    );
    
    // Return unauthorized for API routes, redirect for pages
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Redirect to login with return URL
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect_url', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // Get user roles
  const userRoles = getUserRoles(userAuth);
  
  // Check access
  if (!hasAccess(userRoles, policyName)) {
    middlewareLogger.warn(
      'rbac', 
      `Forbidden access attempt to ${pathname}`,
      { 
        policyRequired: policyName,
        userRoles,
        userId: userAuth.userId 
      },
      request
    );
    
    // Return forbidden for API routes, redirect for pages
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'You do not have permission to access this resource' },
        { status: 403 }
      );
    }
    
    // Redirect to access denied page
    const accessDeniedUrl = new URL('/access-denied', request.url);
    accessDeniedUrl.searchParams.set('resource', pathname);
    return NextResponse.redirect(accessDeniedUrl);
  }
  
  // Log successful access
  middlewareLogger.debug(
    'rbac',
    `Access granted to ${pathname}`,
    { 
      policyName,
      userRoles,
      userId: userAuth.userId 
    },
    request
  );
  
  // Continue with the request
  return null;
}

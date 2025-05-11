/**
 * Authentication Hooks
 *
 * This file provides standardized hooks for accessing authentication state
 * and role-based functionality throughout the application.
 *
 * Version: 2.0.0 - Updated to use Clerk Express SDK
 */

'use client';

import { useRouter } from 'next/navigation';
import { UserRole, AuthUser, AuthOptions } from '@/lib/auth/types';
import React from 'react';
import {
  useAuth as useExpressAuth,
  useUser as useExpressUser,
  useIsAdmin as useExpressIsAdmin,
  useIsBuilder as useExpressIsBuilder,
  useHasRole as useExpressHasRole,
  useSignOut as useExpressSignOut,
  useAuthStatus as useExpressAuthStatus
} from '@/lib/auth/express/client-auth';

/**
 * Enhanced auth hook with role-based functionality using Express SDK
 *
 * @returns Enhanced auth object with role-based properties
 */
export function useAuth() {
  // Forward to Express SDK implementation
  return useExpressAuth();
}

/**
 * Transform user data into application-specific format using Express SDK
 *
 * @returns Transformed user data and loading state
 */
export function useUser() {
  // Forward to Express SDK implementation
  return useExpressUser();
}

/**
 * Simple hook for checking authentication status using Express SDK
 *
 * @returns Authentication status and loading state
 */
export function useAuthStatus() {
  // Forward to Express SDK implementation
  return useExpressAuthStatus();
}

/**
 * Wrap sign-out functionality with Express SDK
 *
 * @returns Sign-out function
 */
export function useSignOut() {
  // Forward to Express SDK implementation
  return useExpressSignOut();
}

/**
 * Check if the authenticated user has a specific role using Express SDK
 *
 * @param role - The role to check for
 * @returns Boolean indicating if the user has the role
 */
export function useHasRole(role: UserRole) {
  // Forward to Express SDK implementation
  return useExpressHasRole(role);
}

/**
 * Convenience hook for checking admin role using Express SDK
 *
 * @returns Boolean indicating if the user is an admin
 */
export function useIsAdmin() {
  // Forward to Express SDK implementation
  return useExpressIsAdmin();
}

/**
 * Convenience hook for checking builder role using Express SDK
 *
 * @returns Boolean indicating if the user is a builder
 */
export function useIsBuilder() {
  // Forward to Express SDK implementation
  return useExpressIsBuilder();
}

/**
 * Convenience hook for checking client role using Express SDK
 *
 * @returns Boolean indicating if the user is a client
 */
export function useIsClient() {
  // Forward to Express SDK implementation
  return useExpressHasRole(UserRole.CLIENT);
}

/**
 * Check if the authenticated user has all of the specified roles using Express SDK
 *
 * @param roles - Array of roles to check for
 * @returns Boolean indicating if the user has all roles
 */
export function useHasAllRoles(roles: UserRole[]) {
  const { hasRole, isLoaded } = useExpressAuth();
  return isLoaded && roles.every(role => hasRole(role));
}

/**
 * Check if the authenticated user has any of the specified roles using Express SDK
 *
 * @param roles - Array of roles to check for
 * @returns Boolean indicating if the user has any of the roles
 */
export function useHasAnyRole(roles: UserRole[]) {
  const { hasRole, isLoaded } = useExpressAuth();
  return isLoaded && roles.some(role => hasRole(role));
}

/**
 * Protect client-side components based on authentication status
 * Updated to use Express SDK
 *
 * @param WrappedComponent - Component to protect
 * @param options - Options for protection
 * @returns Protected component
 */
export function withClientAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: {
    redirectTo?: string;
    loadingComponent?: React.ReactNode;
    requiredRoles?: UserRole[];
    requireAllRoles?: boolean;
  } = {}
) {
  const WithAuth = (props: P) => {
    const router = useRouter();
    const { isSignedIn, isLoaded, hasRole } = useExpressAuth();

    const redirectTo = options.redirectTo || '/login';
    const defaultLoading = React.createElement('div', {}, 'Loading...');
    const loadingComponent = options.loadingComponent || defaultLoading;
    const requiredRoles = options.requiredRoles || [];
    const requireAllRoles = options.requireAllRoles || false;

    // Handle loading state
    if (!isLoaded) {
      return React.createElement(React.Fragment, {}, loadingComponent);
    }

    // Check if user is authenticated
    if (!isSignedIn) {
      // Use callback URL only on client-side
      if (typeof window !== 'undefined') {
        const callbackUrl = encodeURIComponent(window.location.href);
        router.replace(`${redirectTo}?callbackUrl=${callbackUrl}`);
      } else {
        router.replace(redirectTo);
      }
      return null;
    }

    // Check role requirements if specified using the hasRole function from Express SDK
    if (requiredRoles.length > 0) {
      const hasRequiredRoles = requireAllRoles
        ? requiredRoles.every(role => hasRole(role))
        : requiredRoles.some(role => hasRole(role));

      if (!hasRequiredRoles) {
        router.replace('/unauthorized');
        return null;
      }
    }

    // Render the protected component
    return React.createElement(WrappedComponent, props);
  };

  // Set display name for debugging
  WithAuth.displayName = `WithAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return WithAuth;
}
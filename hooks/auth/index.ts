/**
 * Authentication Hooks
 * 
 * This file provides standardized hooks for accessing Clerk authentication state
 * and role-based functionality throughout the application.
 * 
 * Version: 1.0.0
 */

'use client';

import { useAuth as useClerkAuth, useUser as useClerkUser, SignOutResource } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { UserRole, AuthUser, AuthOptions } from '@/lib/auth/types';
import React from 'react';

/**
 * Enhanced version of Clerk's useAuth hook with role-based functionality
 * 
 * @returns Enhanced auth object with role-based properties
 */
export function useAuth() {
  const { userId, sessionId, isLoaded, isSignedIn, signOut } = useClerkAuth();
  const { user } = useClerkUser();
  
  // Extract roles from user metadata
  const roles = (user?.publicMetadata?.roles as UserRole[]) || [];
  
  // Role checking functions
  const hasRole = (role: UserRole) => roles.includes(role);
  const isAdmin = hasRole(UserRole.ADMIN);
  const isBuilder = hasRole(UserRole.BUILDER);
  const isClient = hasRole(UserRole.CLIENT);
  
  return {
    userId,
    sessionId,
    isLoaded,
    isSignedIn,
    user,
    roles,
    hasRole,
    isAdmin,
    isBuilder,
    isClient,
    signOut,
  };
}

/**
 * Transform Clerk's user data into application-specific format
 * 
 * @returns Transformed user data and loading state
 */
export function useUser() {
  const { user, isLoaded } = useClerkUser();
  
  // Transform user data when available
  const transformedUser: AuthUser | null = user ? {
    id: user.id,
    name: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
    email: user.primaryEmailAddress?.emailAddress || '',
    imageUrl: user.imageUrl,
    roles: (user.publicMetadata?.roles as UserRole[]) || [],
    verified: (user.publicMetadata?.verified as boolean) || false,
    completedOnboarding: (user.publicMetadata?.completedOnboarding as boolean) || false,
    stripeCustomerId: (user.publicMetadata?.stripeCustomerId as string) || undefined,
    builderProfile: (user.publicMetadata?.builderProfile as any) || undefined,
    clientProfile: (user.publicMetadata?.clientProfile as any) || undefined,
  } : null;
  
  return { user: transformedUser, isLoaded };
}

/**
 * Simple hook for checking authentication status
 * 
 * @returns Authentication status and loading state
 */
export function useAuthStatus() {
  const { isSignedIn, isLoaded } = useClerkAuth();
  return { isAuthenticated: !!isSignedIn, isLoading: !isLoaded };
}

/**
 * Wrap Clerk's sign-out functionality with additional options
 * 
 * @returns Sign-out function
 */
export function useSignOut() {
  const { signOut } = useClerkAuth();
  const router = useRouter();
  
  return async (options?: AuthOptions) => {
    await signOut();
    
    if (options?.callbackUrl) {
      router.push(options.callbackUrl);
    }
  };
}

/**
 * Check if the authenticated user has a specific role
 * 
 * @param role - The role to check for
 * @returns Boolean indicating if the user has the role
 */
export function useHasRole(role: UserRole) {
  const { roles, isLoaded } = useAuth();
  return isLoaded && roles.includes(role);
}

/**
 * Convenience hook for checking admin role
 * 
 * @returns Boolean indicating if the user is an admin
 */
export function useIsAdmin() {
  return useHasRole(UserRole.ADMIN);
}

/**
 * Convenience hook for checking builder role
 * 
 * @returns Boolean indicating if the user is a builder
 */
export function useIsBuilder() {
  return useHasRole(UserRole.BUILDER);
}

/**
 * Convenience hook for checking client role
 * 
 * @returns Boolean indicating if the user is a client
 */
export function useIsClient() {
  return useHasRole(UserRole.CLIENT);
}

/**
 * Check if the authenticated user has all of the specified roles
 * 
 * @param roles - Array of roles to check for
 * @returns Boolean indicating if the user has all roles
 */
export function useHasAllRoles(roles: UserRole[]) {
  const { roles: userRoles, isLoaded } = useAuth();
  return isLoaded && roles.every(role => userRoles.includes(role));
}

/**
 * Check if the authenticated user has any of the specified roles
 * 
 * @param roles - Array of roles to check for
 * @returns Boolean indicating if the user has any of the roles
 */
export function useHasAnyRole(roles: UserRole[]) {
  const { roles: userRoles, isLoaded } = useAuth();
  return isLoaded && roles.some(role => userRoles.includes(role));
}

/**
 * Protect client-side components based on authentication status
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
    const { isSignedIn, isLoaded, roles } = useAuth();
    
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
    
    // Check role requirements if specified
    if (requiredRoles.length > 0) {
      const hasRequiredRoles = requireAllRoles
        ? requiredRoles.every(role => roles.includes(role))
        : requiredRoles.some(role => roles.includes(role));
        
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
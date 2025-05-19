/**
 * Authentication Hooks
 *
 * This file provides standardized hooks for accessing authentication state
 * and role-based functionality throughout the application.
 *
 * Version: 4.0.0 - DEPRECATED FORWARDING MODULE
 * 
 * ⚠️ DEPRECATED: This module is provided for backward compatibility only.
 * Please import auth hooks directly from @/lib/auth in new code.
 * This forwarding module will be removed in a future release.
 */

'use client';

import { useRouter } from 'next/navigation';
import React from 'react';
import {
  useAuth as useAuthHook,
  useUser as useUserHook,
  useIsAdmin as useIsAdminHook,
  useIsBuilder as useIsBuilderHook,
  useIsClient as useIsClientHook,
  useHasRole as useHasRoleHook,
  useHasAllRoles as useHasAllRolesHook,
  useHasAnyRole as useHasAnyRolesHook,
  useSignOut as useSignOutHook,
  useAuthStatus as useAuthStatusHook,
  UserRole,
  withAuth
} from '@/lib/auth';

/**
 * Export UserRole from the auth domain
 */
export { UserRole, withAuth };

/**
 * @deprecated Import from @/lib/auth instead
 */
export function useAuth() {
  console.warn('DEPRECATED: useAuth() from @/hooks/auth is deprecated. Import from @/lib/auth instead.');
  return useAuthHook();
}

/**
 * Transform user data into application-specific format
 *
 * @deprecated Import from @/lib/auth instead
 * @returns Transformed user data and loading state
 */
export function useUser() {
  console.warn('DEPRECATED: useUser() from @/hooks/auth is deprecated. Import from @/lib/auth instead.');
  return useUserHook();
}

/**
 * Simple hook for checking authentication status
 *
 * @deprecated Import from @/lib/auth instead
 * @returns Authentication status and loading state
 */
export function useAuthStatus() {
  console.warn('DEPRECATED: useAuthStatus() from @/hooks/auth is deprecated. Import from @/lib/auth instead.');
  return useAuthStatusHook();
}

/**
 * Wrap sign-out functionality
 *
 * @deprecated Import from @/lib/auth instead
 * @returns Sign-out function
 */
export function useSignOut() {
  console.warn('DEPRECATED: useSignOut() from @/hooks/auth is deprecated. Import from @/lib/auth instead.');
  return useSignOutHook();
}

/**
 * Check if the authenticated user has a specific role
 *
 * @deprecated Import from @/lib/auth instead
 * @param role - The role to check for
 * @returns Boolean indicating if the user has the role
 */
export function useHasRole(role: UserRole) {
  console.warn('DEPRECATED: useHasRole() from @/hooks/auth is deprecated. Import from @/lib/auth instead.');
  return useHasRoleHook(role);
}

/**
 * Convenience hook for checking admin role
 *
 * @deprecated Import from @/lib/auth instead
 * @returns Boolean indicating if the user is an admin
 */
export function useIsAdmin() {
  console.warn('DEPRECATED: useIsAdmin() from @/hooks/auth is deprecated. Import from @/lib/auth instead.');
  return useIsAdminHook();
}

/**
 * Convenience hook for checking builder role
 *
 * @deprecated Import from @/lib/auth instead
 * @returns Boolean indicating if the user is a builder
 */
export function useIsBuilder() {
  console.warn('DEPRECATED: useIsBuilder() from @/hooks/auth is deprecated. Import from @/lib/auth instead.');
  return useIsBuilderHook();
}

/**
 * Convenience hook for checking client role
 *
 * @deprecated Import from @/lib/auth instead
 * @returns Boolean indicating if the user is a client
 */
export function useIsClient() {
  console.warn('DEPRECATED: useIsClient() from @/hooks/auth is deprecated. Import from @/lib/auth instead.');
  return useIsClientHook();
}

/**
 * Check if the authenticated user has all of the specified roles
 *
 * @deprecated Import from @/lib/auth instead
 * @param roles - Array of roles to check for
 * @returns Boolean indicating if the user has all roles
 */
export function useHasAllRoles(roles: UserRole[]) {
  console.warn('DEPRECATED: useHasAllRoles() from @/hooks/auth is deprecated. Import from @/lib/auth instead.');
  return useHasAllRolesHook(roles);
}

/**
 * Check if the authenticated user has any of the specified roles
 *
 * @deprecated Import from @/lib/auth instead
 * @param roles - Array of roles to check for
 * @returns Boolean indicating if the user has any of the roles
 */
export function useHasAnyRole(roles: UserRole[]) {
  console.warn('DEPRECATED: useHasAnyRole() from @/hooks/auth is deprecated. Import from @/lib/auth instead.');
  return useHasAnyRolesHook(roles);
}

/**
 * Hook for accessing and refreshing auth tokens
 *
 * @deprecated Import from @/lib/auth instead
 * @returns Token management functions and state
 */
export function useAuthToken() {
  console.warn('DEPRECATED: useAuthToken() from @/hooks/auth is deprecated. Import from @/lib/auth instead.');
  // Return a stub implementation that won't block usage but will motivate migration
  return { token: null, getToken: async () => null, isLoaded: true, isExpired: false };
}

/**
 * @deprecated Import withAuth from @/lib/auth instead
 * This is now an alias for the withAuth HOC from the auth domain
 */
export const withClientAuth = withAuth;
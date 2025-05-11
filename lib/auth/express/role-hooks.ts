/**
 * Role-Based Authentication Hooks
 * Version: 2.0.0
 * 
 * This file provides specialized role-based authentication hooks
 * for use with the Express SDK implementation.
 */

"use client";

import { useAuth } from './client-auth';
import { UserRole } from '../types';
import { useMemo } from 'react';

/**
 * Check if the authenticated user has a specific role
 * @param role - The role to check for
 * @returns Boolean indicating if the user has the role
 */
export function useHasRole(role: UserRole): boolean {
  const { roles, isLoaded } = useAuth();
  
  // Using useMemo to optimize performance
  return useMemo(() => {
    if (!isLoaded) return false;
    return roles.includes(role);
  }, [roles, isLoaded, role]);
}

/**
 * Check if the authenticated user has all of the specified roles
 * @param requiredRoles - Array of roles to check for
 * @returns Boolean indicating if the user has all roles
 */
export function useHasAllRoles(requiredRoles: UserRole[]): boolean {
  const { roles, isLoaded } = useAuth();
  
  return useMemo(() => {
    if (!isLoaded || !requiredRoles.length) return false;
    return requiredRoles.every(role => roles.includes(role));
  }, [roles, isLoaded, requiredRoles]);
}

/**
 * Check if the authenticated user has any of the specified roles
 * @param requiredRoles - Array of roles to check for
 * @returns Boolean indicating if the user has any of the roles
 */
export function useHasAnyRole(requiredRoles: UserRole[]): boolean {
  const { roles, isLoaded } = useAuth();
  
  return useMemo(() => {
    if (!isLoaded || !requiredRoles.length) return false;
    return requiredRoles.some(role => roles.includes(role));
  }, [roles, isLoaded, requiredRoles]);
}

/**
 * Convenience hook for checking admin role
 * @returns Boolean indicating if the user is an admin
 */
export function useIsAdmin(): boolean {
  return useHasRole(UserRole.ADMIN);
}

/**
 * Convenience hook for checking builder role
 * @returns Boolean indicating if the user is a builder
 */
export function useIsBuilder(): boolean {
  return useHasRole(UserRole.BUILDER);
}

/**
 * Convenience hook for checking client role
 * @returns Boolean indicating if the user is a client
 */
export function useIsClient(): boolean {
  return useHasRole(UserRole.CLIENT);
}
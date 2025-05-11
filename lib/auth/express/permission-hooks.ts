/**
 * Permission-Based Authentication Hooks
 * Version: 2.0.0
 * 
 * This file provides specialized permission-based authentication hooks
 * for use with the Express SDK implementation.
 */

"use client";

import { useAuth } from './client-auth';
import { UserRole } from '../types';
import { useMemo } from 'react';

// Role-permission mapping
const rolePermissions: Record<UserRole, string[]> = {
  [UserRole.ADMIN]: ['*'], // Admin has all permissions
  [UserRole.BUILDER]: [
    'profile:edit',
    'profile:view',
    'builder:manage',
    'session:manage',
    'booking:view',
    'marketplace:manage'
  ],
  [UserRole.CLIENT]: [
    'profile:view',
    'profile:edit:self',
    'booking:create',
    'booking:manage:self',
    'review:create'
  ]
};

/**
 * Calculate permissions from roles
 * @param roles User roles
 * @returns Set of permissions
 */
export function calculatePermissions(roles: UserRole[]): Set<string> {
  const permissions = new Set<string>();
  
  for (const role of roles) {
    if (rolePermissions[role]) {
      for (const permission of rolePermissions[role]) {
        permissions.add(permission);
        
        // If wildcard permission, no need to continue
        if (permission === '*') break;
      }
    }
  }
  
  return permissions;
}

/**
 * Check if the authenticated user has a specific permission
 * @param permission - The permission to check for
 * @returns Boolean indicating if the user has the permission
 */
export function usePermission(permission: string): boolean {
  const { roles, isLoaded } = useAuth();
  
  return useMemo(() => {
    if (!isLoaded) return false;
    
    const permissions = calculatePermissions(roles);
    return permissions.has(permission) || permissions.has('*');
  }, [roles, isLoaded, permission]);
}

/**
 * Check if the authenticated user has any of the specified permissions
 * @param requiredPermissions - Array of permissions to check for
 * @returns Boolean indicating if the user has any of the permissions
 */
export function useAnyPermission(requiredPermissions: string[]): boolean {
  const { roles, isLoaded } = useAuth();
  
  return useMemo(() => {
    if (!isLoaded || !requiredPermissions.length) return false;
    
    const permissions = calculatePermissions(roles);
    return requiredPermissions.some(p => permissions.has(p) || permissions.has('*'));
  }, [roles, isLoaded, requiredPermissions]);
}

/**
 * Check if the authenticated user has all of the specified permissions
 * @param requiredPermissions - Array of permissions to check for
 * @returns Boolean indicating if the user has all the permissions
 */
export function useAllPermissions(requiredPermissions: string[]): boolean {
  const { roles, isLoaded } = useAuth();
  
  return useMemo(() => {
    if (!isLoaded || !requiredPermissions.length) return false;
    
    const permissions = calculatePermissions(roles);
    return requiredPermissions.every(p => permissions.has(p) || permissions.has('*'));
  }, [roles, isLoaded, requiredPermissions]);
}
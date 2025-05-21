'use client';

import { useAuth, useHasAnyRole, useHasAllRoles } from '@/lib/auth';
import { UserRole } from '@/lib/types/enums';
import { Permission } from '@/lib/auth/types';
import { ReactNode, useMemo } from 'react';

interface RoleProtectedProps {
  children: ReactNode;
  requiredRoles: UserRole[];
  requireAll?: boolean;
  fallback?: ReactNode;
  loadingFallback?: ReactNode;
}

/**
 * Component that conditionally renders based on user roles
 * This is a lighter version of ProtectedRoute that doesn't handle redirects
 * and is intended for conditional rendering within the UI
 * 
 * Version: 1.0.0
 */
export function RoleProtected({
  children,
  requiredRoles,
  requireAll = false,
  fallback = null,
  loadingFallback
}: RoleProtectedProps) {
  const { isLoaded } = useAuth();
  
  // Use optimized role checking hooks
  const hasRequiredRoles = requireAll 
    ? useHasAllRoles(requiredRoles) 
    : useHasAnyRole(requiredRoles);

  // Loading state handling
  if (!isLoaded) {
    return loadingFallback || (
      <div className="animate-pulse p-2">
        <div className="h-4 bg-slate-200 rounded w-full max-w-[120px]"></div>
      </div>
    );
  }
  
  // Role check
  if (!hasRequiredRoles) {
    return fallback;
  }
  
  return <>{children}</>;
}

interface PermissionProtectedProps {
  children: ReactNode;
  permissions: Permission[];
  requireAll?: boolean;
  fallback?: ReactNode;
  loadingFallback?: ReactNode;
}

/**
 * Component that conditionally renders based on user permissions
 * This is a wrapper component that maps roles to permissions
 * 
 * Version: 1.0.0
 */
export function PermissionProtected({
  children,
  permissions,
  requireAll = false,
  fallback = null,
  loadingFallback
}: PermissionProtectedProps) {
  // Map permissions to roles for the current implementation
  // In a future version, this could use direct permission checking
  const { isLoaded, hasPermission } = useAuth();

  // Memoized permission check
  const hasRequiredPermissions = useMemo(() => {
    if (!isLoaded) return false;
    
    return requireAll
      ? permissions.every(permission => hasPermission(permission as Permission))
      : permissions.some(permission => hasPermission(permission as Permission));
  }, [isLoaded, hasPermission, permissions, requireAll]);

  // Loading state handling
  if (!isLoaded) {
    return loadingFallback || (
      <div className="animate-pulse p-2">
        <div className="h-4 bg-slate-200 rounded w-full max-w-[120px]"></div>
      </div>
    );
  }
  
  // Permission check
  if (!hasRequiredPermissions) {
    return fallback;
  }
  
  return <>{children}</>;
}
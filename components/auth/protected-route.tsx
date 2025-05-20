'use client';

import { useAuth, useHasAnyRole, useHasAllRoles } from '@/lib/auth';
import { UserRole } from '@/lib/auth/types';
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect, useMemo } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: UserRole[];
  requireAll?: boolean;
  redirectUrl?: string;
  fallback?: ReactNode;
}

/**
 * A component that protects routes by checking authentication status
 * and roles before rendering children
 *
 * Enhanced with Express SDK hooks and optimized performance
 * Version: 2.0.0
 */
export default function ProtectedRoute({
  children,
  requiredRoles = [],
  requireAll = false,
  redirectUrl = '/login',
  fallback
}: ProtectedRouteProps) {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  
  // Use optimized role checking hooks for better performance
  const hasRequiredRoles = requireAll 
    ? useHasAllRoles(requiredRoles) 
    : useHasAnyRole(requiredRoles);

  // Memoize authorization check
  const isAuthorized = useMemo(() => {
    if (!isLoaded) return false;
    if (!isSignedIn) return false;
    return requiredRoles.length === 0 || hasRequiredRoles;
  }, [isLoaded, isSignedIn, requiredRoles.length, hasRequiredRoles]);

  useEffect(() => {
    // Only check after auth is loaded
    if (!isLoaded) return;

    // If not signed in, redirect to login with return URL
    if (!isSignedIn) {
      // Add return URL to login redirect for better UX
      const returnUrl = encodeURIComponent(window.location.pathname);
      router.push(`${redirectUrl}?returnUrl=${returnUrl}`);
      return;
    }

    // If roles are required but user doesn't have them, redirect to unauthorized page
    if (requiredRoles.length > 0 && !hasRequiredRoles) {
      router.push('/unauthorized');
    }
  }, [isSignedIn, isLoaded, requiredRoles, hasRequiredRoles, router, redirectUrl]);

  // Show loading state while auth is loading
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-center">
          <div className="h-4 w-32 bg-slate-200 rounded mb-2"></div>
          <div className="h-8 w-64 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  // If not authorized, show fallback or nothing
  if (!isAuthorized) {
    return fallback || null;
  }

  // If authenticated and has required roles, render children
  return <>{children}</>;
}
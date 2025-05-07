'use client';

import { useAuth } from '@/hooks/auth';
import { UserRole } from '@/lib/auth/types';
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: UserRole[];
  redirectUrl?: string;
}

/**
 * A component that protects routes by checking authentication status
 * and roles before rendering children
 */
export default function ProtectedRoute({
  children,
  requiredRoles = [],
  redirectUrl = '/login'
}: ProtectedRouteProps) {
  const { isSignedIn, isLoaded, roles } = useAuth();
  const router = useRouter();

  const hasAnyRole = (rolesToCheck: UserRole[]) => {
    return rolesToCheck.some(role => roles.includes(role));
  };

  useEffect(() => {
    // Only check after auth is loaded
    if (!isLoaded) return;

    // If not signed in, redirect to login
    if (!isSignedIn) {
      router.push(redirectUrl);
      return;
    }

    // If roles are required, check if user has any of them
    if (requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
      router.push('/');
    }
  }, [isSignedIn, isLoaded, requiredRoles, roles, router, redirectUrl, hasAnyRole]);

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

  // If not authenticated or missing required roles, show nothing
  // (redirect will happen in useEffect)
  if (!isSignedIn || (requiredRoles.length > 0 && !hasAnyRole(requiredRoles))) {
    return null;
  }

  // If authenticated and has required roles, render children
  return <>{children}</>;
}
/**
 * Authentication Status Component
 *
 * This component demonstrates the use of the Clerk Express SDK authentication hooks
 * to display the current authentication status and user information.
 *
 * Version: 2.0.0 (Updated for Clerk Express SDK)
 */

'use client';

import {
  useAuth,
  useUser,
  useIsAdmin,
  useIsBuilder,
  useIsClient,
  useHasRole,
  useSignOut,
  useAuthStatus
} from '@/lib/auth';
import { Button } from '@/components/ui/core/button';
import { UserRole } from '@/lib/auth';
import { useMemo } from 'react';
import { useRouter } from 'next/navigation';

interface AuthStatusProps {
  className?: string;
  compact?: boolean;
}

/**
 * Component that displays the current authentication status and user information
 * using the Clerk Express SDK hooks
 */
export function AuthStatus({ className, compact = false }: AuthStatusProps) {
  // Use Express SDK hooks for improved performance via hooks/auth
  const { isSignedIn, isLoaded, roles, hasRole } = useAuth();
  const { user } = useUser();
  const isAdmin = useIsAdmin();
  const isBuilder = useIsBuilder();
  const isClient = useIsClient();
  const signOut = useSignOut();

  // Handle loading state
  if (!isLoaded) {
    return (
      <div className={`p-4 rounded-md bg-slate-100 ${className}`}>
        <p className="text-slate-600">Loading authentication status...</p>
      </div>
    );
  }

  // Handle unauthenticated state
  if (!isSignedIn) {
    return (
      <div className={`p-4 rounded-md bg-slate-100 ${className}`}>
        {!compact && <h3 className="text-lg font-medium mb-2">Not Authenticated</h3>}
        {!compact && <p className="text-slate-600 mb-4">You are not currently signed in.</p>}
        <div className="flex space-x-4">
          <Button variant="default" size={compact ? "sm" : "default"} asChild>
            <a href="/sign-in">Sign In</a>
          </Button>
          {!compact && (
            <Button variant="outline" asChild>
              <a href="/sign-up">Create Account</a>
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Compact authenticated view for headers/navbars
  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span className="text-sm font-medium">
          {user?.name || 'Authenticated User'}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => signOut({ callbackUrl: '/' })}
        >
          Sign out
        </Button>
      </div>
    );
  }

  // Full authenticated state view
  return (
    <div className={`p-4 rounded-md bg-slate-100 ${className}`}>
      <h3 className="text-lg font-medium mb-2">Authentication Status</h3>

      <div className="mb-4">
        <p className="text-green-600 font-medium">✓ Authenticated</p>
        <p className="text-slate-600">User ID: {user?.id}</p>
        <p className="text-slate-600">Name: {user?.name}</p>
        <p className="text-slate-600">Email: {user?.email}</p>
      </div>

      <div className="mb-4">
        <h4 className="font-medium mb-1">Roles:</h4>
        <div className="flex flex-wrap gap-2">
          {roles.length > 0 ? (
            roles.map((role) => (
              <span
                key={role}
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  role === UserRole.ADMIN
                    ? 'bg-purple-100 text-purple-800'
                    : role === UserRole.BUILDER
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-green-100 text-green-800'
                }`}
              >
                {role}
              </span>
            ))
          ) : (
            <span className="text-slate-600">No roles assigned</span>
          )}
        </div>
      </div>

      <div className="mb-4">
        <h4 className="font-medium mb-1">Role Status:</h4>
        <ul className="space-y-1">
          <li className="flex items-center">
            <span className={`w-5 ${isAdmin ? 'text-green-600' : 'text-red-600'}`}>
              {isAdmin ? '✓' : '✗'}
            </span>
            <span>Admin Access</span>
          </li>
          <li className="flex items-center">
            <span className={`w-5 ${isBuilder ? 'text-green-600' : 'text-red-600'}`}>
              {isBuilder ? '✓' : '✗'}
            </span>
            <span>Builder Access</span>
          </li>
          <li className="flex items-center">
            <span className={`w-5 ${isClient ? 'text-green-600' : 'text-red-600'}`}>
              {isClient ? '✓' : '✗'}
            </span>
            <span>Client Access</span>
          </li>
          <li className="flex items-center">
            <span className={`w-5 ${hasRole(UserRole.ADMIN) ? 'text-green-600' : 'text-red-600'}`}>
              {hasRole(UserRole.ADMIN) ? '✓' : '✗'}
            </span>
            <span>Has Admin Role (using hasRole)</span>
          </li>
        </ul>
      </div>

      {user?.verified !== undefined && (
        <div className="mb-4">
          <h4 className="font-medium mb-1">Profile Status:</h4>
          {user.verified !== undefined && (
            <p className="text-slate-600">
              Verification: {user.verified ? 'Verified' : 'Unverified'}
            </p>
          )}
          {user.stripeCustomerId && (
            <p className="text-slate-600">
              Stripe Customer ID: {user.stripeCustomerId}
            </p>
          )}
        </div>
      )}

      <div className="mt-4">
        <Button
          variant="outline"
          onClick={() => signOut({ callbackUrl: '/' })}
        >
          Sign Out
        </Button>
      </div>
    </div>
  );
}

/**
 * Protected version of AuthStatus that requires authentication
 */
export function ProtectedAuthStatus(props: AuthStatusProps) {
  const { isSignedIn, isLoaded } = useAuthStatus();

  if (isLoaded === false) { // Check for false explicitly, as isLoaded is true when done loading
    return <div>Loading...</div>;
  }

  if (!isSignedIn) {
    return (
      <div className={`p-4 rounded-md bg-slate-100 ${props.className}`}>
        <p className="text-slate-600">
          You must be signed in to view this content.
        </p>
        <Button
          className="mt-2"
          asChild
        >
          <a href="/sign-in">Sign In</a>
        </Button>
      </div>
    );
  }

  return <AuthStatus {...props} />;
}

/**
 * Simple auth status component for site header/navigation
 * Enhanced with improved performance through memoization
 */
export function HeaderAuthStatus({ className }: AuthStatusProps) {
  const { user } = useUser();
  const { isSignedIn, isLoaded } = useAuthStatus();
  const signOut = useSignOut();
  const router = useRouter();

  const initials = useMemo(() => {
    if (isLoaded === false) { // Check for false explicitly, as isLoaded is true when done loading
      return <div className="text-slate-500">Loading...</div>;
    }

    if (!isSignedIn) {
      return (
        <Button
          variant="ghost"
          size="sm"
          asChild
        >
          <a href="/sign-in">Sign in</a>
        </Button>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">
          {user?.name || 'Authenticated User'}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => signOut({ callbackUrl: '/' })}
        >
          Sign out
        </Button>
      </div>
    );
  }, [isLoaded, isSignedIn, user, signOut]);

  return initials;
}
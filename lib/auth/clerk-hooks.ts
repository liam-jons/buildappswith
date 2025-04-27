"use client";

import { useAuth as useClerkAuth, useUser, useClerk } from "@clerk/nextjs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserRole } from "./types";
import { User, AuthState } from "./types";

/**
 * Enhanced authentication hook that provides a consistent interface
 * @returns Object containing auth state and user information
 * @version 1.0.108
 */
export const useAuth = (): AuthState => {
  const { isLoaded, isSignedIn, userId, sessionId } = useClerkAuth();
  const { user, isLoaded: isUserLoaded } = useUser();
  const { signOut: clerkSignOut } = useClerk();
  const router = useRouter();
  
  // Extract roles from publicMetadata
  const roles = user?.publicMetadata?.roles as UserRole[] || [];
  
  // Create a standardized user object
  const enhancedUser: User | null = isSignedIn && user ? {
    id: user.id,
    name: user.fullName || user.username || '',
    email: user.primaryEmailAddress?.emailAddress || '',
    image: user.imageUrl || '',
    roles,
    verified: user.primaryEmailAddress?.verification?.status === 'verified',
    stripeCustomerId: user.publicMetadata?.stripeCustomerId as string || null,
  } : null;
  
  // Clean interface for sign in
  const signIn = (options?: { callbackUrl?: string, redirect?: boolean }) => {
    if (options?.redirect !== false) {
      router.push(options?.callbackUrl || '/login');
    }
    return Promise.resolve({ ok: true, error: null });
  };
  
  // Clean interface for sign out
  const signOut = (options?: { callbackUrl?: string }) => {
    return clerkSignOut().then(() => {
      if (options?.callbackUrl) {
        router.push(options.callbackUrl);
      }
      return { ok: true };
    });
  };
  
  return {
    user: enhancedUser,
    isLoading: !isLoaded || !isUserLoaded,
    isAuthenticated: !!isSignedIn && !!userId,
    isClient: roles.includes(UserRole.CLIENT),
    isBuilder: roles.includes(UserRole.BUILDER),
    isAdmin: roles.includes(UserRole.ADMIN),
    status: isLoaded ? (isSignedIn ? "authenticated" : "unauthenticated") : "loading",
    signIn,
    signOut,
    updateSession: () => Promise.resolve(null),
  };
};

/**
 * Hook to check if the current user has a specific role
 * @param allowedRoles - Array of allowed roles
 * @returns Boolean indicating if the user has one of the specified roles
 * @version 1.0.108
 */
export const useHasRole = (allowedRoles: UserRole[]) => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated || !user || !user.roles) {
    return false;
  }
  
  return user.roles.some(role => allowedRoles.includes(role));
};

/**
 * Hook to redirect if user doesn't have required roles
 * @param allowedRoles - Array of allowed roles
 * @param redirectTo - Path to redirect to if unauthorized
 * @version 1.0.108
 */
export const useRequireRole = (allowedRoles: UserRole[], redirectTo: string = '/login') => {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const hasRequiredRole = useHasRole(allowedRoles);
  
  // Effect to handle the redirect
  useEffect(() => {
    if (!isLoading && !hasRequiredRole) {
      router.push(redirectTo);
    }
  }, [isLoading, hasRequiredRole, router, redirectTo]);
  
  return { 
    isAuthorized: hasRequiredRole,
    isLoading
  };
};

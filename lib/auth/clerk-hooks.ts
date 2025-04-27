"use client";

import { useAuth as useClerkAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { UserRole } from "./types";

/**
 * Hook to access the current authenticated user with a compatible API to the old NextAuth hook
 * @returns Object containing auth state and user information
 */
export const useAuth = () => {
  const { isLoaded, isSignedIn, userId, sessionId } = useClerkAuth();
  const { user, isLoaded: isUserLoaded } = useUser();
  const router = useRouter();
  
  // Extract roles from publicMetadata
  const roles = user?.publicMetadata?.roles as UserRole[] || [];
  
  // Create a user object that matches the shape of the old NextAuth user
  const compatUser = isSignedIn ? {
    id: user?.id || '',
    name: user?.fullName || user?.username || '',
    email: user?.primaryEmailAddress?.emailAddress || '',
    image: user?.imageUrl || '',
    roles,
    verified: user?.primaryEmailAddress?.verification?.status === 'verified',
    stripeCustomerId: user?.publicMetadata?.stripeCustomerId as string || null,
  } : null;
  
  // Create a compatible signIn function
  const signIn = (options?: { callbackUrl?: string, redirect?: boolean }) => {
    // Redirect to Clerk's sign-in page
    if (options?.redirect !== false) {
      router.push(options?.callbackUrl || '/login');
    }
    return Promise.resolve({ ok: true, error: null });
  };
  
  // Create a compatible signOut function
  const signOut = (options?: { callbackUrl?: string }) => {
    // Use Clerk's sign-out functionality, which will be properly implemented
    // when we integrate the button click handler
    user?.signOut().then(() => {
      if (options?.callbackUrl) {
        router.push(options.callbackUrl);
      }
    });
    return Promise.resolve({ ok: true });
  };
  
  return {
    user: compatUser,
    isLoading: !isLoaded || !isUserLoaded,
    isAuthenticated: !!isSignedIn && !!userId,
    isClient: roles.includes(UserRole.CLIENT) || false,
    isBuilder: roles.includes(UserRole.BUILDER) || false,
    isAdmin: roles.includes(UserRole.ADMIN) || false,
    status: isLoaded ? (isSignedIn ? "authenticated" : "unauthenticated") : "loading",
    signIn,
    signOut,
    updateSession: () => Promise.resolve(null), // No-op for compatibility
  };
};

/**
 * Hook to check if the current user has a specific role
 * @param allowedRoles - Array of allowed roles
 * @returns Boolean indicating if the user has one of the specified roles
 */
export const useHasRole = (allowedRoles: UserRole[]) => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated || !user || !user.roles) {
    return false;
  }
  
  return user.roles.some(role => allowedRoles.includes(role));
};

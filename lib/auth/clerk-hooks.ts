"use client";

import { useAuth as useClerkAuth, useUser as useClerkUser } from "@clerk/nextjs";
import { UserRole } from "./types";
import { useState, useEffect } from "react";

/**
 * Extended user object with our custom fields
 */
export interface ExtendedUser {
  id: string;
  clerkId: string;
  name: string | null;
  email: string;
  image: string | null;
  roles: UserRole[];
  verified: boolean;
  stripeCustomerId?: string | null;
}

/**
 * Custom hook for checking if a user has a specific role
 * @param role Role to check for
 * @returns boolean indicating if the user has the role
 */
export function useHasRole(role: UserRole): boolean {
  const { user } = useUser();
  
  if (!user) {
    return false;
  }
  
  return user.roles.includes(role);
}

/**
 * Custom hook for checking if a user has admin role
 * @returns boolean indicating if the user is an admin
 */
export function useIsAdmin(): boolean {
  return useHasRole(UserRole.ADMIN);
}

/**
 * Custom hook for checking if a user has builder role
 * @returns boolean indicating if the user is a builder
 */
export function useIsBuilder(): boolean {
  return useHasRole(UserRole.BUILDER);
}

/**
 * Custom hook for checking if a user has client role
 * @returns boolean indicating if the user is a client
 */
export function useIsClient(): boolean {
  return useHasRole(UserRole.CLIENT);
}

/**
 * Enhanced auth hook that combines Clerk's useAuth with our extended user information
 * @returns Enhanced auth object with isAdmin, isBuilder, isClient helpers
 */
export function useAuth() {
  const clerk = useClerkAuth();
  const { user } = useUser();
  
  return {
    ...clerk,
    isAdmin: user ? user.roles.includes(UserRole.ADMIN) : false,
    isBuilder: user ? user.roles.includes(UserRole.BUILDER) : false,
    isClient: user ? user.roles.includes(UserRole.CLIENT) : false,
    user
  };
}

/**
 * Enhanced user hook that transforms Clerk user data into our application format
 * @returns ExtendedUser object or null if not authenticated
 */
export function useUser(): { user: ExtendedUser | null, isLoaded: boolean } {
  const { isLoaded: isClerkLoaded, isSignedIn, userId } = useClerkAuth();
  const { user: clerkUser, isLoaded: isUserLoaded } = useClerkUser();
  const [user, setUser] = useState<ExtendedUser | null>(null);
  
  useEffect(() => {
    // Only attempt to transform the user when Clerk has loaded the user data
    if (isClerkLoaded && isUserLoaded && isSignedIn && clerkUser) {
      // Extract roles from publicMetadata
      const roles = (clerkUser.publicMetadata?.roles as UserRole[]) || [UserRole.CLIENT];
      
      // Create compatible user object
      setUser({
        id: clerkUser.id || userId || '',
        clerkId: clerkUser.id || '',
        name: clerkUser.fullName || clerkUser.username || '',
        email: clerkUser.primaryEmailAddress?.emailAddress || '',
        image: clerkUser.imageUrl || '',
        roles,
        verified: clerkUser.primaryEmailAddress?.verification?.status === 'verified',
        stripeCustomerId: (clerkUser.publicMetadata?.stripeCustomerId as string) || null,
      });
    } else if (isClerkLoaded && !isSignedIn) {
      setUser(null);
    }
  }, [isClerkLoaded, isUserLoaded, isSignedIn, clerkUser, userId]);
  
  return { 
    user,
    isLoaded: isClerkLoaded && isUserLoaded
  };
}

/**
 * Hook for accessing sign-out function with next router integration
 * @returns SignOut function that accepts options including callbackUrl
 */
export function useSignOut() {
  const { signOut: clerkSignOut } = useClerkAuth();
  
  return async (options?: { callbackUrl?: string }) => {
    await clerkSignOut();
    if (options?.callbackUrl) {
      window.location.href = options.callbackUrl;
    }
    return { ok: true };
  };
}

/**
 * Hook for determining authentication status with loading state
 * @returns Authentication state object with isAuthenticated and isLoading
 */
export function useAuthStatus() {
  const { isLoaded, isSignedIn } = useClerkAuth();
  
  return {
    isAuthenticated: !!isSignedIn,
    isLoading: !isLoaded
  };
}

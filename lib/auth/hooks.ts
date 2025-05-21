/**
 * Client-Side Authentication Hooks
 * Version: 3.0.0
 *
 * Provides client-side authentication hooks compatible with
 * the Clerk Express SDK for use in React components.
 */

"use client";

import { useAuth as useClerkAuth, useUser as useClerkUser } from "@clerk/nextjs";
import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import React from 'react';
import { UserRole, AuthContextType, AuthUser, AuthStatus, Permission } from './types';

// Create auth context
const AuthContext = createContext<AuthContextType | null>(null);

/**
 * Enhanced user hook that transforms Clerk user data into our application format
 * @returns AuthUser object or null if not authenticated
 */
function useUserInternal(): { user: AuthUser | null, isLoaded: boolean } {
  const { user: clerkUser, isLoaded: clerkIsLoaded } = useClerkUser();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    if (!clerkIsLoaded) return;
    
    if (!clerkUser) {
      setUser(null);
      setIsLoaded(true);
      return;
    }
    
    // Extract roles from public metadata
    const publicMetadata = clerkUser.publicMetadata || {};
    const roleMetadata = publicMetadata?.roles || [];
    const roles = Array.isArray(roleMetadata) ? roleMetadata as UserRole[] : [];
    
    // Transform Clerk user to our application format
    const transformedUser: AuthUser = {
      id: clerkUser.id, // Assuming AuthUser expects clerkId as id from client perspective
      clerkId: clerkUser.id,
      name: clerkUser.fullName || clerkUser.username || null,
      email: clerkUser.primaryEmailAddress?.emailAddress || '',
      imageUrl: clerkUser.imageUrl || null, // Changed from image to imageUrl
      roles,
      verified: clerkUser.emailAddresses.some(email => email.verification?.status === 'verified') || false,
      stripeCustomerId: publicMetadata?.stripeCustomerId as string || null,
      isFounder: typeof publicMetadata?.isFounder === 'boolean' ? publicMetadata.isFounder : false, // Added isFounder
      isDemo: typeof publicMetadata?.isDemo === 'boolean' ? publicMetadata.isDemo : false, // Added isDemo
    };
    
    setUser(transformedUser);
    setIsLoaded(true);
  }, [clerkUser, clerkIsLoaded]);
  
  return { user, isLoaded };
}

/**
 * Enhanced auth hook compatible with Express SDK backend
 * @returns Enhanced auth object with role helpers
 */
function useAuthInternal(): AuthContextType {
  const { user, isLoaded } = useUserInternal();
  const { signOut: clerkSignOut, getToken: clerkGetToken } = useClerkAuth();
  
  // Role-based helper functions
  const hasRole = (role: UserRole): boolean => {
    if (!user || !isLoaded) return false;
    return user.roles.includes(role);
  };
  
  // Permission-based helper function
  const hasPermission = (permission: string): boolean => {
    if (!user || !isLoaded) return false;
    
    // Admin has all permissions
    if (hasRole(UserRole.ADMIN)) return true;
    
    // Map roles to permissions (simplified implementation)
    // In a real app, this would be more sophisticated
    if (permission.startsWith('builder:') && hasRole(UserRole.BUILDER)) return true;
    if (permission.startsWith('client:') && hasRole(UserRole.CLIENT)) return true;
    
    return false;
  };
  
  // Enhanced sign out with callback URL support
  const signOut = async (options?: { callbackUrl?: string }) => {
    try {
      await clerkSignOut();
      
      // Handle redirect if callbackUrl is provided
      if (options?.callbackUrl && typeof window !== 'undefined') {
        window.location.href = options.callbackUrl;
      }
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };
  
  // Convenience role properties
  const isAdmin = hasRole(UserRole.ADMIN);
  const isBuilder = hasRole(UserRole.BUILDER);
  const isClient = hasRole(UserRole.CLIENT);
  
  return {
    user,
    status: !isLoaded ? AuthStatus.LOADING : (user ? AuthStatus.AUTHENTICATED : AuthStatus.UNAUTHENTICATED),
    isLoaded,
    isSignedIn: !!user,
    roles: user?.roles || [],
    hasRole,
    hasPermission,
    isAdmin,
    isBuilder,
    isClient,
    signOut,
    getToken: clerkGetToken, // Expose getToken from Clerk
  };
}

/**
 * Auth provider component for Express SDK compatibility
 */
export function ExpressAuthProvider({ children }: { children: ReactNode }) {
  const authContext = useAuthInternal();
  
  return React.createElement(
    AuthContext.Provider,
    { value: authContext },
    children
  );
}

/**
 * Context hook for auth state access
 */
export function useAuthContext() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuthContext must be used within an ExpressAuthProvider');
  }
  
  return context;
}

/**
 * Enhanced auth hook compatible with Express SDK backend
 * @returns Enhanced auth object with role helpers
 */
export function useAuth(): AuthContextType {
  // This hook now directly uses useAuthContext.
  // It requires an ExpressAuthProvider to be an ancestor in the React tree.
  // The conditional fallback to useAuthInternal has been removed to comply with the Rules of Hooks.
  return useAuthContext();
}

/**
 * Enhanced user hook that transforms Clerk user data into our application format
 * @returns AuthUser object or null if not authenticated
 */
export function useUser() {
  const { user, isLoaded } = useAuth();
  return { user, isLoaded };
}

/**
 * Hook for checking if a user has a specific role
 * @param role Role to check for
 * @returns boolean indicating if the user has the role
 */
export function useHasRole(role: UserRole): boolean {
  const { hasRole, isLoaded } = useAuth();
  return isLoaded && hasRole(role);
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
 * Check if user has specific permission
 */
export function usePermission(permission: Permission) {
  const { hasPermission, isLoaded } = useAuth();
  return isLoaded && hasPermission(permission);
}

/**
 * Hook for accessing sign-out function with next router integration
 * @returns SignOut function that accepts options including callbackUrl
 */
export function useSignOut() {
  const { signOut } = useAuth();
  return signOut;
}

/**
 * Hook for determining authentication status with loading state
 * @returns Authentication state object with isSignedIn and isLoaded
 */
export function useAuthStatus() {
  const { isSignedIn, isLoaded } = useAuth();
  
  return {
    isSignedIn,
    isLoaded
  };
}

/**
 * Hook for checking if the authenticated user has all of the specified roles
 * @param roles - Array of roles to check for
 * @returns Boolean indicating if the user has all roles
 */
export function useHasAllRoles(roles: UserRole[]) {
  const { hasRole, isLoaded } = useAuth();
  return isLoaded && roles.every(role => hasRole(role));
}

/**
 * Hook for checking if the authenticated user has any of the specified roles
 * @param roles - Array of roles to check for
 * @returns Boolean indicating if the user has any of the roles
 */
export function useHasAnyRole(roles: UserRole[]) {
  const { hasRole, isLoaded } = useAuth();
  return isLoaded && roles.some(role => hasRole(role));
}

// Also export the base Clerk hooks for any direct usage needs
export { useClerk, useSignIn, useSignUp } from '@clerk/nextjs';

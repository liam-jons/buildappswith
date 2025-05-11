/**
 * Client-Side Authentication Hooks
 * Version: 1.0.0
 * 
 * This file provides client-side authentication hooks compatible with
 * the Clerk Express SDK for use in React components.
 */

"use client";

import { useAuth as useClerkAuth, useUser as useClerkUser } from "@clerk/nextjs";
import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { UserRole } from "../types";

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
 * Auth context type
 */
interface AuthContextType {
  user: ExtendedUser | null;
  isLoaded: boolean;
  isSignedIn: boolean;
  roles: UserRole[];
  hasRole: (role: UserRole) => boolean;
  hasPermission: (permission: string) => boolean;
  isAdmin: boolean;
  isBuilder: boolean;
  isClient: boolean;
  signOut: (options?: { callbackUrl?: string }) => Promise<{
    ok: boolean;
  }>;
}

// Create auth context
const AuthContext = createContext<AuthContextType | null>(null);

/**
 * Auth provider component for Express SDK compatibility
 */
export function ExpressAuthProvider({ children }: { children: ReactNode }) {
  const authState = useAuth();

  // Use createElement instead of JSX to avoid potential build issues
  return React.createElement(
    AuthContext.Provider,
    { value: authState },
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
  const clerk = useClerkAuth();
  const { user, isLoaded: isUserLoaded } = useUser();
  const [roles, setRoles] = useState<UserRole[]>([]);
  
  // Sync roles from Clerk session claims or user metadata
  useEffect(() => {
    async function syncRoles() {
      try {
        if (clerk.isSignedIn) {
          // Get session token for JWT parsing
          const session = await clerk.getToken();
          
          if (session) {
            try {
              // Parse JWT to get roles from session claims
              const [_header, payload, _signature] = session.split('.');
              const parsedPayload = JSON.parse(atob(payload));
              
              // Try to get roles from various locations in the JWT
              const extractedRoles = 
                parsedPayload.roles || 
                parsedPayload.public_metadata?.roles ||
                [];
                
              setRoles(Array.isArray(extractedRoles) ? extractedRoles : []);
            } catch (parseError) {
              console.error('Error parsing JWT for roles:', parseError);
              
              // Fallback to user metadata if available
              if (user) {
                setRoles(user.roles);
              } else {
                setRoles([]);
              }
            }
          } else if (user) {
            // Fallback to user metadata if token isn't available
            setRoles(user.roles);
          }
        } else {
          setRoles([]);
        }
      } catch (error) {
        console.error('Error fetching auth roles:', error);
        setRoles([]);
      }
    }

    syncRoles();
  }, [clerk.isSignedIn, user]);
  
  /**
   * Check if user has a specific role
   */
  const hasRole = (role: UserRole): boolean => {
    return roles.includes(role);
  };
  
  /**
   * Check if user has a specific permission
   * This uses a simple role-based permission model
   */
  const hasPermission = (permission: string): boolean => {
    // Simple role-based permission mapping
    // This would need to be customized based on your permission model
    const rolePermissions: Record<string, string[]> = {
      [UserRole.ADMIN]: ['*'], // Admin has all permissions
      [UserRole.BUILDER]: ['profile:edit', 'builder:manage'],
      [UserRole.CLIENT]: ['profile:view', 'booking:create'],
    };
    
    // Check if any of the user's roles grant the required permission
    return roles.some(role => {
      const permissions = rolePermissions[role] || [];
      return permissions.includes('*') || permissions.includes(permission);
    });
  };
  
  /**
   * Sign out with optional redirect
   */
  const signOut = async (options?: { callbackUrl?: string }) => {
    await clerk.signOut();
    
    if (options?.callbackUrl) {
      window.location.href = options.callbackUrl;
    }
    
    return { ok: true };
  };
  
  // Return auth context
  return {
    ...clerk,
    user,
    isLoaded: clerk.isLoaded && isUserLoaded,
    roles,
    hasRole,
    hasPermission,
    isAdmin: hasRole(UserRole.ADMIN),
    isBuilder: hasRole(UserRole.BUILDER),
    isClient: hasRole(UserRole.CLIENT),
    signOut,
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
 * Hook for checking if a user has a specific role
 * @param role Role to check for
 * @returns boolean indicating if the user has the role
 */
export function useHasRole(role: UserRole): boolean {
  const { hasRole } = useAuth();
  return hasRole(role);
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
export function usePermission(permission: string) {
  const { hasPermission } = useAuth();
  return hasPermission(permission);
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
 * @returns Authentication state object with isAuthenticated and isLoading
 */
export function useAuthStatus() {
  const { isLoaded, isSignedIn } = useAuth();

  return {
    isAuthenticated: !!isSignedIn,
    isLoading: !isLoaded
  };
}

/**
 * Hook for accessing and refreshing auth tokens
 * @returns Token-related functions and state
 */
export function useAuthToken() {
  const clerk = useClerkAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Get the current token
  const getToken = async () => {
    try {
      return await clerk.getToken();
    } catch (error) {
      console.error('Error getting auth token:', error);
      throw error;
    }
  };

  // Force token refresh
  const refreshToken = async () => {
    try {
      setIsRefreshing(true);

      // Force token refresh in Clerk
      await clerk.session?.reload();

      // Get the fresh token
      const token = await clerk.getToken({ skipCache: true });

      setIsRefreshing(false);
      return token;
    } catch (error) {
      setIsRefreshing(false);
      console.error('Error refreshing token:', error);
      throw error;
    }
  };

  return {
    getToken,
    refreshToken,
    isRefreshing
  };
}
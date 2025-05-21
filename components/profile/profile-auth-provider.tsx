"use client";

/**
 * Profile Authentication Provider
 * 
 * A context provider that manages authentication state for profile components.
 * It provides a unified interface to:
 * - Check if the current user is authenticated
 * - Check if the current user is the profile owner
 * - Check if the current user has admin privileges
 * - Determine permissions for various profile actions (view, edit, delete)
 */

import React, { createContext, useContext, ReactNode } from "react";
import { useAuth } from "@/lib/auth/hooks";
import { UserRole } from "@/lib/types/enums";
import { BuilderProfile, ProfilePermissions } from "@/lib/profile/types";

// Define the shape of our profile auth context
interface ProfileAuthContextType {
  profile: BuilderProfile;
  permissions: ProfilePermissions;
  isOwner: boolean;
  isAdmin: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Create the context with null default value
const ProfileAuthContext = createContext<ProfileAuthContextType | null>(null);

// Props for our provider component
interface ProfileAuthProviderProps {
  children: ReactNode;
  profile: BuilderProfile;
  initialPermissions?: Partial<ProfilePermissions>;
}

/**
 * Profile Authentication Provider Component
 * 
 * Provides context for profile authentication state and permissions
 */
export function ProfileAuthProvider({
  children,
  profile,
  initialPermissions = {}
}: ProfileAuthProviderProps) {
  // Get authentication state from Clerk
  const { isSignedIn, isAdmin, user, isLoaded } = useAuth();
  
  // Determine if the current user is the profile owner
  const isOwner = !!isSignedIn && !!user && user.id === profile.clerkUserId;
  
  // Calculate permissions based on auth state and initial permissions
  const permissions: ProfilePermissions = {
    canView: true, // Public profiles are viewable by all
    canEdit: isOwner || !!isAdmin || !!initialPermissions.canEdit,
    canDelete: (isOwner || !!isAdmin) && !!initialPermissions.canDelete,
    canVerify: !!isAdmin && !!initialPermissions.canVerify
  };
  
  // Context value
  const contextValue: ProfileAuthContextType = {
    profile,
    permissions,
    isOwner: !!isOwner,
    isAdmin: !!isAdmin,
    isAuthenticated: !!isSignedIn,
    isLoading: !isLoaded
  };
  
  return (
    <ProfileAuthContext.Provider value={contextValue}>
      {children}
    </ProfileAuthContext.Provider>
  );
}

/**
 * Hook to use profile authentication context
 * 
 * Provides access to profile permissions and authentication state
 */
export function useProfileAuth() {
  const context = useContext(ProfileAuthContext);
  
  if (!context) {
    throw new Error("useProfileAuth must be used within a ProfileAuthProvider");
  }
  
  return context;
}

/**
 * Higher-order component to require profile authentication
 * 
 * Wraps a component and only renders it if the user has the required permissions
 */
interface WithProfileAuthProps {
  requiredPermission?: keyof ProfilePermissions;
  fallback?: React.ReactNode;
}

export function withProfileAuth<P extends object>(
  Component: React.ComponentType<P>,
  { requiredPermission, fallback = null }: WithProfileAuthProps = {}
) {
  return function WithProfileAuth(props: P) {
    const auth = useProfileAuth();
    
    // If loading, show nothing
    if (auth.isLoading) {
      return <div>Loading authentication state...</div>;
    }
    
    // If permission is required but not granted, show fallback
    if (
      requiredPermission && 
      !auth.permissions[requiredPermission]
    ) {
      return fallback;
    }
    
    // Otherwise show the wrapped component
    return <Component {...props} />;
  };
}
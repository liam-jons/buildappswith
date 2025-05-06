# Profile Component Authentication Integration

## Overview

This document outlines the integration approach for connecting authentication with profile components in the Buildappswith platform. It provides guidelines for implementing secure, consistent, and efficient authentication flows within profile-related features.

## Authentication-Profile Integration Strategy

### Key Principles

1. **Separation of Concerns**
   - Authentication system (Clerk) manages identity and authentication
   - Database profiles store application-specific user data
   - Components fetch from both sources as needed

2. **Progressive Enhancement**
   - Profile components should render with basic information while full data loads
   - Authentication state dictates available actions and permissions
   - Graceful handling of loading and error states

3. **Consistent Access Patterns**
   - Standardized hooks for accessing auth and profile data
   - Clear API for checking permissions and roles
   - Predictable data flow through component hierarchy

## Component Integration Patterns

### 1. Auth-Aware Components

For components that need to adapt based on authentication state:

```tsx
"use client";

import { useAuth } from "@/lib/auth/hooks";
import { BuilderProfileProps } from "./types";

export function BuilderProfileActions({ profileId }: { profileId: string }) {
  const { isSignedIn, isAdmin, isBuilder, user } = useAuth();
  
  // Is the current user viewing their own profile?
  const isOwner = isSignedIn && user?.id === profileId;
  
  return (
    <div className="profile-actions">
      {/* Admin-only actions */}
      {isAdmin && (
        <Button variant="outline">Verify Builder</Button>
      )}
      
      {/* Owner-only actions */}
      {isOwner && (
        <Button variant="default">Edit Profile</Button>
      )}
      
      {/* Authenticated but not owner */}
      {isSignedIn && !isOwner && (
        <Button variant="default">Contact Builder</Button>
      )}
      
      {/* Public actions - available to all */}
      <Button variant="outline">View Portfolio</Button>
    </div>
  );
}
```

### 2. Profile Data Fetching

For components that need to fetch and display profile data:

```tsx
// In a Server Component
import { getBuilderProfileById } from "@/lib/profile/actions";
import { auth } from "@clerk/nextjs/server";
import { BuilderProfileClient } from "./builder-profile-client";

export async function BuilderProfileWrapper({ profileId }: { profileId: string }) {
  // Get auth state on the server
  const { userId } = auth();
  
  // Fetch profile data
  const profile = await getBuilderProfileById(profileId);
  
  if (!profile) {
    return <ProfileNotFound />;
  }
  
  // Pass auth status and profile data to client component
  return (
    <BuilderProfileClient 
      profile={profile} 
      isAuthenticated={!!userId}
      isOwner={userId === profile.clerkUserId}
    />
  );
}
```

### 3. Protected Profile Actions

For mutations that require authentication and permission checks:

```tsx
"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth/hooks";
import { updateProfile } from "@/lib/profile/api";

export function ProfileEditForm({ profile, onSuccess }: ProfileEditFormProps) {
  const { isSignedIn, user } = useAuth();
  const [formData, setFormData] = useState({...profile});
  
  // Permission check
  if (!isSignedIn || user?.id !== profile.userId) {
    return <AccessDenied />;
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // The API call will include auth headers automatically
      await updateProfile(profile.id, formData);
      onSuccess();
    } catch (error) {
      // Handle errors
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

## Authentication-Aware Data Fetching

### Server-Side Approach

```tsx
// In a Server Component
import { auth } from "@clerk/nextjs/server";
import { getProfileWithAuthContext } from "@/lib/profile/actions";

export async function ProfileWithAuth({ profileId }: { profileId: string }) {
  // Get auth context server-side
  const { userId } = auth();
  
  // Fetch profile with auth context for permissions
  const { profile, permissions } = await getProfileWithAuthContext(profileId, userId);
  
  // Pass data to client component
  return <ProfileDisplay profile={profile} permissions={permissions} />;
}
```

### Client-Side Approach

```tsx
"use client";

import { useAuth } from "@/lib/auth/hooks";
import { useProfile } from "@/lib/profile/hooks";

export function ProfileClientFetch({ profileId }: { profileId: string }) {
  // Get auth state
  const { isSignedIn, user } = useAuth();
  
  // Fetch profile data (useProfile will include auth headers in requests)
  const { profile, isLoading, error } = useProfile(profileId);
  
  if (isLoading) return <Loading />;
  if (error) return <Error message={error.message} />;
  
  // Determine permissions based on auth state and profile
  const canEdit = isSignedIn && (user?.id === profile.userId || user?.roles.includes("ADMIN"));
  
  return (
    <div>
      <ProfileDisplay profile={profile} />
      {canEdit && <EditButton profileId={profileId} />}
    </div>
  );
}
```

## Profile Context Provider

For complex profile-aware UIs, implement a context provider:

```tsx
"use client";

import { createContext, useContext, ReactNode } from "react";
import { useAuth } from "@/lib/auth/hooks";
import { BuilderProfile, ProfilePermissions } from "@/lib/profile/types";

interface ProfileContextType {
  profile: BuilderProfile;
  permissions: ProfilePermissions;
  isOwner: boolean;
  isAdmin: boolean;
  refetchProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | null>(null);

export function ProfileProvider({ 
  children, 
  profile, 
  permissions 
}: { 
  children: ReactNode; 
  profile: BuilderProfile;
  permissions: ProfilePermissions;
}) {
  const { isAdmin, user } = useAuth();
  const isOwner = user?.id === profile.userId;
  
  // Function to refresh profile data
  const refetchProfile = async () => {
    // Implement profile refresh logic
  };
  
  return (
    <ProfileContext.Provider value={{ 
      profile, 
      permissions, 
      isOwner, 
      isAdmin, 
      refetchProfile 
    }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfileContext() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfileContext must be used within a ProfileProvider");
  }
  return context;
}
```

## Role-Based Profile Navigation

Implement navigation components that adapt based on user roles:

```tsx
"use client";

import { useAuth } from "@/lib/auth/hooks";
import { ProfileTabs, ProfileTab } from "@/components/ui/tabs";

export function ProfileNavigation({ profileId }: { profileId: string }) {
  const { isSignedIn, isAdmin, isBuilder, user } = useAuth();
  const isOwner = isSignedIn && user?.id === profileId;
  
  return (
    <ProfileTabs defaultValue="portfolio">
      {/* Public tabs */}
      <ProfileTab value="portfolio" label="Portfolio" />
      <ProfileTab value="about" label="About" />
      
      {/* Builder-only tabs */}
      {isBuilder && (
        <ProfileTab value="builder-resources" label="Builder Resources" />
      )}
      
      {/* Owner-only tabs */}
      {isOwner && (
        <>
          <ProfileTab value="analytics" label="Analytics" />
          <ProfileTab value="settings" label="Settings" />
        </>
      )}
      
      {/* Admin-only tabs */}
      {isAdmin && (
        <ProfileTab value="admin-controls" label="Admin Controls" />
      )}
    </ProfileTabs>
  );
}
```

## Profile-Auth Hook Implementation

Create specialized hooks for profile-auth integration:

```typescript
// lib/profile/hooks.ts
"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth/hooks";
import { 
  getBuilderProfileById, 
  updateBuilderProfile, 
  createBuilderProfile 
} from "@/lib/profile/api";

// Hook for fetching a profile with permissions
export function useProfile(profileId: string) {
  const { isSignedIn, isAdmin, user } = useAuth();
  
  return useQuery({
    queryKey: ["profile", profileId],
    queryFn: () => getBuilderProfileById(profileId),
    select: (profile) => {
      // Enhance profile with permission flags
      return {
        ...profile,
        permissions: {
          canView: true, // All profiles are publicly viewable
          canEdit: isSignedIn && (user?.id === profile.userId || isAdmin),
          canDelete: isSignedIn && (user?.id === profile.userId || isAdmin),
          canVerify: isAdmin,
        }
      };
    },
  });
}

// Hook for updating a profile
export function useUpdateProfile() {
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: ({ profileId, data }: { profileId: string, data: any }) => 
      updateBuilderProfile(profileId, data),
    onMutate: (variables) => {
      // Optimistic updates, permission checks, etc.
    }
  });
}

// Hook for checking profile ownership
export function useIsProfileOwner(profileUserId: string) {
  const { isSignedIn, user } = useAuth();
  return isSignedIn && user?.id === profileUserId;
}
```

## Protected Routes for Profile Management

For profile-related pages that require authentication:

```tsx
// app/(platform)/profile/settings/page.tsx
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { ProfileSettingsForm } from "@/components/profile/profile-settings-form";
import { getProfileByClerkId } from "@/lib/profile/actions";

export default async function ProfileSettingsPage() {
  // Auth check on the server
  const { userId } = auth();
  
  if (!userId) {
    // Redirect unauthenticated users
    redirect("/login?redirect_url=/profile/settings");
  }
  
  // Fetch the profile using the authenticated user's ID
  const profile = await getProfileByClerkId(userId);
  
  if (!profile) {
    // Handle missing profile
    return <ProfileNotFound />;
  }
  
  return <ProfileSettingsForm profile={profile} />;
}
```

## Error Handling and Edge Cases

### 1. Authentication Loading States

```tsx
"use client";

import { useAuth } from "@/lib/auth/hooks";

export function ProfileActionButton({ profileId }: { profileId: string }) {
  const { isSignedIn, isLoaded } = useAuth();
  
  // Handle loading state
  if (!isLoaded) {
    return <Button disabled>Loading...</Button>;
  }
  
  return (
    <Button>
      {isSignedIn ? "Contact" : "Sign in to contact"}
    </Button>
  );
}
```

### 2. Authentication Errors

```tsx
"use client";

import { useAuth } from "@/lib/auth/hooks";
import { useProfile } from "@/lib/profile/hooks";

export function ProfileWithErrorHandling({ profileId }: { profileId: string }) {
  const { isSignedIn, isLoaded, error: authError } = useAuth();
  const { profile, isLoading, error: profileError } = useProfile(profileId);
  
  // Handle authentication errors
  if (authError) {
    return <AuthError message={authError.message} />;
  }
  
  // Handle profile loading errors
  if (profileError) {
    return <ProfileError message={profileError.message} />;
  }
  
  // Handle loading states
  if (!isLoaded || isLoading) {
    return <Loading />;
  }
  
  return <ProfileDisplay profile={profile} isSignedIn={isSignedIn} />;
}
```

### 3. Missing Profiles

```tsx
async function fetchProfileWithFallbacks(userId: string) {
  try {
    // Try to get from database first
    const profile = await db.builderProfile.findFirst({
      where: { userId }
    });
    
    if (profile) {
      return profile;
    }
    
    // If no profile found but user exists, create a basic profile
    const user = await db.user.findUnique({
      where: { id: userId }
    });
    
    if (user) {
      return await db.builderProfile.create({
        data: {
          userId: user.id,
          // Basic profile defaults
        }
      });
    }
    
    // If no user found, handle error
    return null;
  } catch (error) {
    logger.error("Error fetching profile", { userId, error });
    return null;
  }
}
```

## Implementation Details

### Authentication Status in API Requests

Ensure API requests include authentication information:

```typescript
// lib/profile/api.ts
import { getAuthToken } from "@/lib/auth/utils";

export async function updateBuilderProfile(profileId: string, data: any) {
  const token = await getAuthToken();
  
  const response = await fetch(`/api/profiles/builder/${profileId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      // Include auth token in header
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update profile");
  }
  
  return response.json();
}
```

### Profile-Specific Auth Guards

Create reusable auth guards for profile components:

```tsx
"use client";

import { useAuth } from "@/lib/auth/hooks";
import { ReactNode } from "react";

interface ProfileAuthGuardProps {
  children: ReactNode;
  profileId: string;
  requiredRole?: "OWNER" | "ADMIN" | "ANY";
  fallback?: ReactNode;
}

export function ProfileAuthGuard({ 
  children, 
  profileId, 
  requiredRole = "ANY",
  fallback = <AccessDenied />
}: ProfileAuthGuardProps) {
  const { isSignedIn, isAdmin, user, isLoaded } = useAuth();
  
  // Handle loading state
  if (!isLoaded) {
    return <Loading />;
  }
  
  // Check basic authentication
  if (!isSignedIn) {
    return fallback;
  }
  
  // Check specific roles
  if (requiredRole === "ADMIN" && !isAdmin) {
    return fallback;
  }
  
  if (requiredRole === "OWNER" && user?.id !== profileId) {
    return fallback;
  }
  
  // If all checks pass, render children
  return <>{children}</>;
}
```

### Synchronized Role Updates

When roles change, ensure profiles are updated accordingly:

```typescript
// lib/auth/role-service.ts
import { clerkClient } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { UserRole } from "@/lib/auth/types";

export async function addUserRole(userId: string, role: UserRole) {
  // Get the user from database
  const user = await db.user.findUnique({ 
    where: { id: userId },
    include: {
      builderProfile: true,
      clientProfile: true
    }
  });
  
  if (!user) {
    throw new Error("User not found");
  }
  
  // Add role if not present
  if (!user.roles.includes(role)) {
    // Update database roles
    await db.user.update({
      where: { id: userId },
      data: {
        roles: [...user.roles, role]
      }
    });
    
    // Update Clerk metadata
    await clerkClient.users.updateUser(user.clerkId, {
      publicMetadata: {
        roles: [...user.roles, role]
      }
    });
    
    // Create profile records based on role
    if (role === UserRole.BUILDER && !user.builderProfile) {
      await db.builderProfile.create({
        data: {
          userId: user.id,
          // Default builder profile data
        }
      });
    }
    
    if (role === UserRole.CLIENT && !user.clientProfile) {
      await db.clientProfile.create({
        data: {
          userId: user.id,
          // Default client profile data
        }
      });
    }
  }
  
  return true;
}
```

## Profile-Auth Integration Testing

Implement comprehensive testing for auth-profile integration:

```typescript
// __tests__/components/profile/profile-auth-integration.test.tsx
import { render, screen } from "@testing-library/react";
import { mockUser, mockProfile } from "@/tests/mocks/users";
import { AuthProvider } from "@/lib/auth/auth-provider";
import { ProfileDisplay } from "@/components/profile/profile-display";

describe("Profile Authentication Integration", () => {
  it("shows edit controls for profile owner", () => {
    // Mock authenticated user as profile owner
    const user = mockUser({ id: "user-123" });
    const profile = mockProfile({ userId: "user-123" });
    
    render(
      <AuthProvider user={user} isSignedIn={true}>
        <ProfileDisplay profile={profile} />
      </AuthProvider>
    );
    
    expect(screen.getByText("Edit Profile")).toBeInTheDocument();
  });
  
  it("hides edit controls for non-owners", () => {
    // Mock authenticated user as non-owner
    const user = mockUser({ id: "different-user" });
    const profile = mockProfile({ userId: "user-123" });
    
    render(
      <AuthProvider user={user} isSignedIn={true}>
        <ProfileDisplay profile={profile} />
      </AuthProvider>
    );
    
    expect(screen.queryByText("Edit Profile")).not.toBeInTheDocument();
  });
  
  it("shows admin controls for admin users", () => {
    // Mock authenticated admin user
    const user = mockUser({ id: "admin-user", roles: ["ADMIN"] });
    const profile = mockProfile({ userId: "user-123" });
    
    render(
      <AuthProvider user={user} isSignedIn={true}>
        <ProfileDisplay profile={profile} />
      </AuthProvider>
    );
    
    expect(screen.getByText("Verify Builder")).toBeInTheDocument();
  });
});
```

## Conclusion

This integration approach ensures that profile components correctly respect authentication state and user permissions. By following these patterns, we can create a secure and seamless user experience where authentication and profile data work together harmoniously.

The key principles to follow are:
1. Use auth hooks consistently for permission checks
2. Fetch profile data with authentication context
3. Implement proper loading and error states
4. Use server components for initial data loading where possible
5. Maintain clear separation between auth and profile data while ensuring they remain synchronized

By implementing these integration patterns, we can maintain a clean architecture while providing a rich, personalized user experience based on authentication state and user roles.
# Builder Profile Server Actions Implementation

## Overview

This document outlines the implementation of server actions for profile management in the BuildAppsWith platform. These server actions provide the backend functionality for managing builder profiles, expertise areas, and session types.

## Architecture

The Profile Server Actions follow these principles:

1. **Server-Side Only**: All actions run exclusively on the server
2. **Authentication**: Actions verify the user is authenticated via Clerk
3. **Authorization**: Actions ensure users can only modify their own profile data
4. **Type Safety**: TypeScript interfaces define all input and output types
5. **Error Handling**: Comprehensive error handling with logging
6. **Cache Management**: Automatic path revalidation when data changes

## Implemented Server Actions

The following server actions have been implemented and are available in `/lib/profile/actions.ts`:

### 1. `getCurrentBuilderProfile`

Retrieves the current user's builder profile based on their Clerk authentication.

```typescript
export async function getCurrentBuilderProfile(): Promise<BuilderProfileResponse | null>
```

### 2. `getBuilderProfileBySlug`

Retrieves a builder profile by its unique slug.

```typescript
export async function getBuilderProfileBySlug(slug: string): Promise<BuilderProfileResponse | null>
```

### 3. `updateBuilderProfile`

Updates the authenticated user's builder profile with new information.

```typescript
export async function updateBuilderProfile(data: UpdateBuilderProfileData): Promise<BuilderProfileResponse | null>
```

### 4. `updateExpertiseAreas`

Updates the expertise areas section of a builder's profile.

```typescript
export async function updateExpertiseAreas(data: ExpertiseAreasUpdate): Promise<BuilderProfileResponse | null>
```

### 5. `getSessionTypes`

Retrieves session types for a builder, either by builder ID or for the current authenticated user.

```typescript
export async function getSessionTypes(builderId?: string): Promise<SessionTypeWithId[]>
```

### 6. `updateSessionType`

Creates a new session type or updates an existing one.

```typescript
export async function updateSessionType(
  data: Omit<SessionTypeWithId, 'id'> & { id?: string }
): Promise<SessionTypeWithId | null>
```

### 7. `deleteSessionType`

Deletes a session type.

```typescript
export async function deleteSessionType(id: string): Promise<boolean>
```

## Type Definitions

All types used by these server actions are defined in `/lib/profile/types.ts`, including:

- `BuilderProfileResponse`: Structure of the response from profile server actions
- `BuilderProfileData`: Structure of the builder profile data
- `UpdateBuilderProfileData`: Data structure for profile updates
- `ExpertiseAreasUpdate`: Structure for expertise areas updates
- `SessionTypeWithId`: Structure for session type data

## Usage Examples

### Retrieving the Current Profile

```typescript
import { getCurrentBuilderProfile } from '@/lib/profile';

// In a Server Component
const profileData = await getCurrentBuilderProfile();
if (profileData) {
  // Use profile data
}
```

### Updating a Profile

```typescript
import { updateBuilderProfile } from '@/lib/profile';

// In a Server Action or form submission
const result = await updateBuilderProfile({
  bio: 'New bio content',
  headline: 'New headline',
  availableForHire: true
});
```

### Managing Session Types

```typescript
import { getSessionTypes, updateSessionType } from '@/lib/profile';

// Get all session types
const sessionTypes = await getSessionTypes();

// Create a new session type
const newSessionType = await updateSessionType({
  title: 'Quick Consultation',
  description: 'A 30-minute focused session',
  durationMinutes: 30,
  price: 75,
  currency: 'USD',
  isActive: true,
  color: '#4f46e5'
});
```

## Error Handling

All server actions implement comprehensive error handling:

1. Authentication errors when no authenticated user is found
2. Permission errors when trying to access/modify resources that don't belong to the user
3. Validation errors when provided data doesn't meet requirements
4. Database errors with proper logging

## Testing

Unit tests for these server actions are available in `/tests/profile/profile-actions.test.ts`.

## Next Steps

1. **Client Components**: Develop React components that utilize these server actions for the UI
2. **Form Validation**: Implement Zod schemas for input validation before sending data to server actions
3. **Extended Permissions**: Add more granular permissions for profile management
4. **Performance Optimization**: Add caching strategies for frequently accessed profiles
5. **Admin Functionality**: Implement admin-specific actions for managing all profiles
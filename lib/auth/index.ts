/**
 * Buildappswith Authentication Module
 * Version: 1.0.108
 * 
 * Centralizes all authentication-related exports for the application.
 * This module has been fully migrated from NextAuth.js to Clerk.
 */

// Re-export Clerk's standard auth functionality
export { 
  auth,
  currentUser,
  clerkClient,
  getAuth,
} from '@clerk/nextjs/server';

// Re-export client-side hooks
export { 
  useAuth,
  useUser,
  useSignIn,
  useSignUp,
  useClerk,
  useOrganization,
  useOrganizationList,
} from '@clerk/nextjs';

// Export our custom hooks and types
export * from './types';
export * from './clerk-hooks';

// For backward compatibility, we'll maintain a getServerSession function
// that wraps Clerk's auth() for code that hasn't been updated yet
export async function getServerSession() {
  const { auth } = await import('@clerk/nextjs/server');
  const authObject = auth();
  
  // Only return something if there's an authenticated user
  if (!authObject.userId) return null;
  
  return {
    user: {
      id: authObject.userId,
      // Note: Other user details should be fetched from clerkClient if needed
    }
  };
}

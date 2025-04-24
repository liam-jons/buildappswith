import { clerkClient, currentUser } from '@clerk/nextjs';
import { authData } from '@/lib/auth/data-access';
import { UserRole } from '@/lib/auth/types';
import * as Sentry from '@sentry/nextjs';

/**
 * Extended user type with combined Clerk and database data
 */
export interface AuthUser {
  id: string;            // Database user ID
  clerkId: string;       // Clerk user ID
  name: string | null;
  email: string;
  image: string | null;
  roles: UserRole[];
  verified: boolean;
  stripeCustomerId?: string | null; // Updated to handle null values from Clerk
}

/**
 * Get the current user with complete profile from Clerk and database
 * @returns AuthUser object or null if not authenticated
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    // Get basic user info from Clerk
    const user = await currentUser();
    
    if (!user) {
      return null;
    }
    
    // Get the primary email
    const primaryEmail = user.emailAddresses.find(
      email => email.id === user.primaryEmailAddressId
    );
    
    if (!primaryEmail) {
      throw new Error('User has no primary email address');
    }
    
    // Find or create the user in our database
    const dbUser = await findOrCreateUser(
      user.id,
      user.firstName && user.lastName 
        ? `${user.firstName} ${user.lastName}` 
        : (user.username || primaryEmail.emailAddress),
      primaryEmail.emailAddress,
      user.imageUrl
    );
    
    // Combine Clerk and database data
    return {
      id: dbUser.id,
      clerkId: user.id,
      name: dbUser.name,
      email: dbUser.email,
      image: dbUser.image ?? user.imageUrl, // Using nullish coalescing to properly handle null values
      roles: (dbUser.roles as UserRole[]) ?? [UserRole.CLIENT], // Using nullish coalescing for consistency
      verified: (primaryEmail.verification?.status === 'verified') || dbUser.verified,
      stripeCustomerId: dbUser.stripeCustomerId,
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Find or create a user in the database based on Clerk user data
 * Uses the new data access layer for better abstraction
 */
async function findOrCreateUser(
  clerkId: string,
  name: string,
  email: string,
  imageUrl: string | null
) {
  try {
    // First, try to find the user by clerkId
    let user = await authData.findUserByClerkId(clerkId);
    
    // If not found by clerkId, try email
    if (!user) {
      user = await authData.findUserByEmail(email);
      
      // If user exists by email but doesn't have a clerkId, update it
      if (user && !user.clerkId) {
        user = await authData.updateUserClerkId(user.id, clerkId);
      }
    }
    
    // If user still not found, create a new one
    if (!user) {
      user = await authData.createUser({
        clerkId,
        name,
        email,
        image: imageUrl,
        roles: [UserRole.CLIENT],
        verified: true, // Clerk has already verified the email
      });
    }
    
    return user;
  } catch (error) {
    // Log and report the error
    console.error('Error in findOrCreateUser:', error);
    Sentry.captureException(error);
    throw error;
  }
}

/**
 * Helper for API route auth that throws if not authenticated
 * @returns Authenticated user
 * @throws Error if not authenticated
 */
export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('Unauthorized');
  }
  
  return user;
}

/**
 * Helper for checking if a user has a specific role
 * @param user User to check
 * @param role Role to check for
 * @returns boolean indicating if user has the role
 */
export function hasRole(user: AuthUser | null, role: UserRole): boolean {
  if (!user) return false;
  return user.roles.includes(role);
}

/**
 * Helper for requiring a specific role in API routes
 * @param role Role to require
 * @returns Authenticated user with the required role
 * @throws Error if not authenticated or doesn't have the role
 */
export async function requireRole(role: UserRole): Promise<AuthUser> {
  const user = await requireAuth();
  
  if (!hasRole(user, role)) {
    throw new Error(`Forbidden: Requires ${role} role`);
  }
  
  return user;
}

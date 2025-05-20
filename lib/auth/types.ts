/**
 * Authentication Types
 * 
 * This file defines the common types used throughout the authentication system.
 * 
 * Version: 2.0.0
 */

import { getAuth as clerkGetAuth } from "@clerk/nextjs/server"; // Added import for getAuth type inference

/**
 * User roles in the system
 */
export enum UserRole {
  ADMIN = 'ADMIN',
  BUILDER = 'BUILDER',
  CLIENT = 'CLIENT',
}

/**
 * Clerk user metadata shape
 */
export interface ClerkUserPublicMetadata {
  roles?: UserRole[];
  permissions?: string[];
  [key: string]: unknown;
}

/**
 * Clerk session claims shape
 */
export interface ClerkSessionClaims {
  user_metadata?: ClerkUserPublicMetadata;
  [key: string]: unknown;
}

/**
 * Extended user type with combined Clerk and database data.
 * Represents a fully resolved user profile including database ID, Clerk ID,
 * roles, and other essential information.
 */
export interface AuthUser {
  id: string;            // Database user ID
  clerkId: string;       // Clerk user ID
  name: string | null;
  email: string;
  imageUrl: string | null;    // Typically from Clerk or DB user.imageUrl
  roles: UserRole[];
  verified: boolean;       // Email verification status
  stripeCustomerId?: string | null;
  isFounder: boolean;      // Added property
  isDemo: boolean;         // Added property
  // Add other relevant fields from your database's User model as needed
  // e.g., builderProfileId?: string | null;
  //       clientProfileId?: string | null;
}

/**
 * Authentication error types
 */
export enum AuthErrorType {
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Standardized authentication error
 */
export interface AuthError {
  type: AuthErrorType;
  message: string;
  status?: number;
  cause?: unknown;
}

/**
 * Standardized API response for authentication operations
 */
export interface AuthResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: AuthError;
}

/**
 * Authentication options for sign-in and sign-out
 */
export interface AuthOptions {
  callbackUrl?: string;
  redirectUrl?: string;
}

/**
 * Authentication middleware options
 */
export interface AuthMiddlewareOptions {
  requireAuth?: boolean;
  requireRoles?: UserRole[];
}

/**
 * Authentication context type for providers
 */
export interface AuthContextType {
  user: AuthUser | null;
  isLoaded: boolean;
  isSignedIn: boolean;
  roles: UserRole[];
  hasRole: (role: UserRole) => boolean;
  hasPermission: (permission: string) => boolean;
  isAdmin: boolean;
  isBuilder: boolean;
  isClient: boolean;
  signOut: (options?: { callbackUrl?: string }) => Promise<void>;
  getToken: (options?: { template?: string; skipCache?: boolean }) => Promise<string | null>;
}

/**
 * Object containing authenticated user's ID, roles, and session claims.
 * Passed by HOFs in api-protection.ts to protected API route handlers.
 */
export interface AuthObject {
  userId: string;
  roles: UserRole[];
  claims: ReturnType<typeof clerkGetAuth>['sessionClaims'];
  // Consider adding orgId if it's consistently available from getAuth and needed by handlers
  // orgId?: string | null; 
}

/**
 * Authentication Types
 * 
 * This file defines the common types used throughout the authentication system.
 * 
 * Version: 2.0.0
 */

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
 * Extended user data with application-specific fields
 */
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  imageUrl: string;
  roles: UserRole[];
  verified: boolean;
  completedOnboarding?: boolean;
  stripeCustomerId?: string;
  builderProfile?: {
    id: string;
    slug: string;
    validationTier: number;
  };
  clientProfile?: {
    id: string;
  };
  publicMetadata?: ClerkUserPublicMetadata; // To hold raw public metadata if needed
}

/**
 * Extended user object for Clerk Express integration
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
  user: ExtendedUser | null;
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

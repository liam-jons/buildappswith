/**
 * Authentication Types
 * 
 * This file defines the common types used throughout the authentication system.
 * 
 * Version: 1.0.0
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
export class AuthError extends Error {
  constructor(
    public type: AuthErrorType,
    public message: string,
    public status?: number,
    public cause?: unknown
  ) {
    super(message);
  }
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
  isAdmin: boolean;
  isBuilder: boolean;
  isClient: boolean;
  signOut: (options?: AuthOptions) => Promise<void>;
}

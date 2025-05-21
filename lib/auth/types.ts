/**
 * Authentication Types
 * 
 * This file defines the common types used throughout the authentication system.
 * 
 * Version: 3.0.0
 */

import { getAuth as clerkGetAuth } from "@clerk/nextjs/server";
import { 
  UserRole, 
  AuthStatus, 
  ProfileType,
  AccessType
} from '@/lib/types/enums';

// Re-export commonly used enums for easier importing
export { UserRole, AuthStatus, ProfileType, AccessType };

/**
 * Permission type - defines all possible permissions in the system
 */
export type Permission = 
  | 'view:profile'
  | 'edit:profile'
  | 'view:builder'
  | 'edit:builder'
  | 'manage:bookings'
  | 'manage:sessions'
  | 'admin:access'
  | 'payment:view'
  | 'payment:manage';

/**
 * Role-Permission mapping interface
 */
export interface RolePermission {
  role: UserRole;
  permissions: Permission[];
}

/**
 * Permission checker function type
 */
export type PermissionChecker = (permission: Permission) => boolean;

/**
 * Clerk user metadata shape
 */
export interface ClerkUserPublicMetadata {
  roles?: UserRole[];
  permissions?: Permission[];
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
  id: string;                 // Database user ID
  clerkId: string;            // Clerk user ID
  name: string | null;
  email: string;
  imageUrl: string | null;    // Typically from Clerk or DB user.imageUrl
  roles: UserRole[];
  verified: boolean;          // Email verification status
  stripeCustomerId?: string | null;
  isFounder: boolean;         // Added property
  isDemo: boolean;            // Added property
  builderProfileId?: string | null;
  clientProfileId?: string | null;
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
 * Authentication state representing the current auth status and user data
 */
export interface AuthState {
  status: AuthStatus;
  user: AuthUser | null;
  error?: AuthError | null;
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
  requirePermissions?: Permission[];
}

/**
 * Authentication context type for providers
 */
export interface AuthContextType {
  user: AuthUser | null;
  status: AuthStatus;
  isLoaded: boolean;
  isSignedIn: boolean;
  roles: UserRole[];
  hasRole: (role: UserRole) => boolean;
  hasPermission: (permission: Permission) => boolean;
  isAdmin: boolean;
  isBuilder: boolean;
  isClient: boolean;
  signOut: (options?: { callbackUrl?: string }) => Promise<void>;
  getToken: (options?: { template?: string; skipCache?: boolean }) => Promise<string | null>;
}

/**
 * Auth provider props
 */
export interface AuthProviderProps {
  children: React.ReactNode;
  initialState?: Partial<AuthState>;
  onError?: (error: AuthError) => void;
}

/**
 * Object containing authenticated user's ID, roles, and session claims.
 * Passed by HOFs in api-protection.ts to protected API route handlers.
 */
export interface AuthObject {
  userId: string;
  roles: UserRole[];
  claims: ReturnType<typeof clerkGetAuth>['sessionClaims'];
  permissions?: Permission[];
}

/**
 * Profile route context for middleware
 */
export interface ProfileRouteContext {
  userId: string;
  clerkId: string;
  user: {
    id: string;
    roles: UserRole[];
    [key: string]: any;
  };
  profileId?: string;
  profileType?: ProfileType;
  isOwner: boolean;
  isAdmin: boolean;
}

/**
 * Profile route handler type
 */
export type ProfileRouteHandler = (
  req: Request,
  context: ProfileRouteContext
) => Promise<Response> | Response;

/**
 * Type guard to check if a value is a valid Permission
 */
export function isValidPermission(value: string): value is Permission {
  const validPermissions: Permission[] = [
    'view:profile',
    'edit:profile',
    'view:builder',
    'edit:builder',
    'manage:bookings',
    'manage:sessions',
    'admin:access',
    'payment:view',
    'payment:manage'
  ];
  
  return validPermissions.includes(value as Permission);
}

/**
 * Helper function to get default permissions for a role
 */
export function getDefaultPermissionsForRole(role: UserRole): Permission[] {
  switch (role) {
    case UserRole.ADMIN:
      return [
        'view:profile',
        'edit:profile',
        'view:builder',
        'edit:builder',
        'manage:bookings',
        'manage:sessions',
        'admin:access',
        'payment:view',
        'payment:manage'
      ];
    case UserRole.BUILDER:
      return [
        'view:profile',
        'edit:profile',
        'manage:bookings',
        'manage:sessions'
      ];
    case UserRole.CLIENT:
      return [
        'view:profile',
        'edit:profile',
        'view:builder'
      ];
    default:
      return ['view:profile'];
  }
}
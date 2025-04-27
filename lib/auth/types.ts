/**
 * User roles for role-based access control - use the same values as in Prisma schema
 */
export enum UserRole {
  CLIENT = "CLIENT",
  BUILDER = "BUILDER",
  ADMIN = "ADMIN",
}

/**
 * Extended user type with Clerk and custom fields
 */
export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  roles: UserRole[];
  stripeCustomerId?: string;
  verified: boolean;
}

/**
 * Authentication state interface
 */
export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isClient: boolean;
  isBuilder: boolean;
  isAdmin: boolean;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  signIn: (options?: { callbackUrl?: string, redirect?: boolean }) => Promise<{ ok: boolean, error: null | string }>;
  signOut: (options?: { callbackUrl?: string }) => Promise<{ ok: boolean }>;
  updateSession: () => Promise<null>;
}

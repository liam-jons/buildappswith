import type { DefaultSession } from "next-auth";

/**
 * User roles for role-based access control - use the same values as in Prisma schema
 */
export enum UserRole {
  CLIENT = "CLIENT",
  BUILDER = "BUILDER",
  ADMIN = "ADMIN",
}

/**
 * Extended user type with role and other custom fields
 */
export type User = DefaultSession["user"] & {
  role: UserRole;
  stripeCustomerId?: string;
  verified: boolean;
};

/**
 * Extend next-auth session type to include custom user fields
 */
declare module "next-auth" {
  interface Session {
    user: User;
  }
  
  interface User {
    role: UserRole;
    stripeCustomerId?: string;
    verified: boolean;
  }

  interface JWT {
    id: string;
    role: UserRole;
    stripeCustomerId?: string;
    verified: boolean;
  }
}

/**
 * Extended JWT type for next-auth
 */
declare module "next-auth" {
  interface JWT {
    id: string;
    role: UserRole;
    stripeCustomerId?: string;
    verified: boolean;
  }
}

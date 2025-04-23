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
 * Extended user type with roles and other custom fields
 */
export type User = DefaultSession["user"] & {
  roles: UserRole[];
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
    roles: UserRole[];
    stripeCustomerId?: string;
    verified: boolean;
  }

  interface JWT {
    id: string;
    roles: UserRole[];
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
    roles: UserRole[];
    stripeCustomerId?: string;
    verified: boolean;
  }
}

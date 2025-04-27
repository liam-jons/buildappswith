/**
 * @deprecated This file is deprecated and will be removed in a future version.
 * The original NextAuth implementation has been archived in /archived/nextauth-legacy/lib/auth/auth.ts
 * 
 * Please use the Clerk authentication system directly:
 * - For client-side auth: import { useAuth, useUser } from "@clerk/nextjs";
 * - For server-side auth: import { currentUser } from "@clerk/nextjs/server";
 * - For middleware: import { authMiddleware } from "@clerk/nextjs";
 */

// Export stub to prevent import errors during migration
export const authOptions = {
  deprecated: true,
  message: 'NextAuth has been replaced with Clerk authentication.',
};

// Forward any requests to getServerSession to an error function
export async function getServerSession() {
  throw new Error('NextAuth has been replaced with Clerk. Use currentUser() from @clerk/nextjs/server instead.');
}
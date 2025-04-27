// Export everything needed from our auth implementation
import { auth, signIn, signOut, authConfig } from "./auth";
import type { NextAuthConfig } from "next-auth";

// Export getServerSession for backward compatibility
export async function getServerSession() {
  return await auth();
}

// Export the auth configuration for use with getServerSession
export const authOptions: NextAuthConfig = authConfig;

// Re-export the auth instance, signIn, signOut from auth.ts
export { auth, signIn, signOut };

// Re-export types and hooks for easy access
export * from "./types";
export * from "./hooks";

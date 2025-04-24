import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { UserRole } from "./types";

export interface AuthUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  roles?: UserRole[];
  stripeCustomerId?: string;
  verified?: boolean;
}

/**
 * Get the current session on the server side
 */
export async function getSession() {
  return await auth();
}

/**
 * Check if the user is authenticated on the server side
 * Redirects to login if not authenticated
 */
export async function checkAuthServer() {
  const session = await getSession();
  
  if (!session?.user) {
    redirect("/login");
  }
  
  return session.user as AuthUser;
}

/**
 * Check if a user has a specific role
 */
export function hasRole(user: any | null, role: UserRole): boolean {
  if (!user || !user.roles) return false;
  return user.roles.includes(role);
}

/**
 * Check if a user has any of the specified roles
 */
export function hasAnyRole(user: any | null, roles: UserRole[]): boolean {
  if (!user || !user.roles) return false;
  return user.roles.some((userRole: UserRole) => roles.includes(userRole));
}

/**
 * Check if the user is authenticated and has a specific role
 * Redirects to login if not authenticated or to a custom page if not authorized
 */
export async function checkRole(role: UserRole, redirectTo = "/unauthorized") {
  const user = await checkAuthServer();
  
  if (!hasRole(user, role)) {
    redirect(redirectTo);
  }
  
  return user;
}

/**
 * Check if the user is authenticated and has any of the specified roles
 * Redirects to login if not authenticated or to a custom page if not authorized
 */
export async function checkRoles(roles: UserRole[], redirectTo = "/unauthorized") {
  const user = await checkAuthServer();
  
  if (!hasAnyRole(user, roles)) {
    redirect(redirectTo);
  }
  
  return user;
}
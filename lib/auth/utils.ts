/**
 * Auth utilities
 * Version: 1.0.0
 * 
 * Utility functions for authentication
 */

import { AuthUser, UserRole } from "@/lib/auth/types";

// Example utility function
// export function isAuthenticated(user?: User): boolean {
//   return !!user?.id;
// }

/**
 * Checks if a user has a specific role.
 * @param user The user object (AuthUser) or null.
 * @param role The role to check for (UserRole).
 * @returns boolean True if the user has the role, false otherwise.
 */
export function hasRole(user: AuthUser | null, role: UserRole): boolean {
  if (!user || !user.roles) return false; 
  return user.roles.includes(role);
}

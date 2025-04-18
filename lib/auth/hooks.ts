import { useSession, signIn, signOut } from "next-auth/react";
import { UserRole } from "./types";

/**
 * Hook to access the current authenticated user
 * @returns Object containing auth state and user information
 */
export const useAuth = () => {
  const { data: session, status, update } = useSession();
  const user = session?.user;
  
  return {
    user,
    isLoading: status === "loading",
    isAuthenticated: !!user,
    isClient: user?.role === UserRole.CLIENT,
    isBuilder: user?.role === UserRole.BUILDER,
    isAdmin: user?.role === UserRole.ADMIN,
    status,
    signIn,
    signOut,
    updateSession: update,
  };
};

/**
 * Hook to check if the current user has a specific role
 * @param roles - Array of allowed roles
 * @returns Boolean indicating if the user has one of the specified roles
 */
export const useHasRole = (roles: UserRole[]) => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated || !user) {
    return false;
  }
  
  return roles.includes(user.role);
};

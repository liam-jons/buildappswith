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
    isClient: user?.roles?.includes(UserRole.CLIENT) || false,
    isBuilder: user?.roles?.includes(UserRole.BUILDER) || false,
    isAdmin: user?.roles?.includes(UserRole.ADMIN) || false,
    status,
    signIn,
    signOut,
    updateSession: update,
  };
};

/**
 * Hook to check if the current user has a specific role
 * @param allowedRoles - Array of allowed roles
 * @returns Boolean indicating if the user has one of the specified roles
 */
export const useHasRole = (allowedRoles: UserRole[]) => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated || !user || !user.roles) {
    return false;
  }
  
  return user.roles.some(role => allowedRoles.includes(role));
};

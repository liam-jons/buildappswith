import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';

// Helper function to check authentication status on the server
export async function checkAuthServer() {
  const session = await getSession();
  
  if (!session || !session.user) {
    redirect('/api/auth/login');
  }
  
  return session.user;
}

// Helper function to retrieve the user on the server if available
export async function getCurrentUser() {
  const session = await getSession();
  return session?.user || null;
}

// Helper function to extract user roles from Auth0 user object
export function getUserRoles(user: any) {
  return user?.[`${process.env.AUTH0_AUDIENCE}/roles`] || [];
}

// Helper function to check if a user has a specific role
export function hasRole(user: any, roleName: string) {
  const roles = getUserRoles(user);
  return Array.isArray(roles) && roles.includes(roleName);
}
import { auth } from '@/lib/auth/auth';
import { UserRole } from '@/lib/auth/types';
import { redirect } from 'next/navigation';

// Helper function to check authentication status on the server
export async function checkAuthServer() {
  const session = await auth();
  
  if (!session || !session.user) {
    redirect('/login');
  }
  
  return session.user;
}

// Helper function to retrieve the user on the server if available
export async function getCurrentUser() {
  const session = await auth();
  return session?.user || null;
}

// Helper function to check if a user has a specific role
export function hasRole(user: any, role: UserRole) {
  if (!user) return false;
  return user.role === role;
}
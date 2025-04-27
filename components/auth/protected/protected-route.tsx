"use client";

import { useAuth } from '@/lib/auth/clerk-hooks';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Protected route component using Clerk authentication
 * Redirects to login if not authenticated
 */
export function ProtectedRoute({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If not loading and not authenticated, redirect to login
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
          <p>Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Show error state if there's a problem
  if (!isAuthenticated) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <p className="text-destructive">Authentication required</p>
          <button 
            onClick={() => router.push('/login')}
            className="rounded bg-primary px-4 py-2 text-primary-foreground"
          >
            Log in
          </button>
        </div>
      </div>
    );
  }

  // If authenticated, show the protected content
  if (user) {
    return <>{children}</>;
  }

  // Default loading state (should not typically be shown due to the useEffect redirect)
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
        <p>Checking authentication...</p>
      </div>
    </div>
  );
}

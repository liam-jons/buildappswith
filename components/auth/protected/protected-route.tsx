"use client";

import { useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function ProtectedRoute({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const { data: session, status } = useSession();
  const isLoading = status === "loading";
  const user = session?.user;
  const error = !session && !isLoading;
  const router = useRouter();

  useEffect(() => {
    // If not loading and no user or error, redirect to login
    if (!isLoading && (!user || error)) {
      router.push('/login');
    }
  }, [user, isLoading, error, router]);

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
  if (error) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <p className="text-destructive">Authentication error</p>
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
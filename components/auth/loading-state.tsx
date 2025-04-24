"use client";

import { useAuth } from "@clerk/nextjs";
import React from "react";

interface AuthLoadingStateProps {
  children: React.ReactNode;
}

/**
 * Component to handle authentication loading states
 * Prevents blank pages by showing a loading state while Clerk auth is initializing
 */
export function AuthLoadingState({ children }: AuthLoadingStateProps) {
  const { isLoaded } = useAuth();

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
          <p className="text-sm text-muted-foreground">Loading authentication...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

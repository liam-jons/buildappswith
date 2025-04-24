"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect, useState } from "react";

interface AuthErrorBoundaryProps {
  children: React.ReactNode;
}

/**
 * Error boundary for catching and reporting authentication errors
 */
export function AuthErrorBoundary({ children }: AuthErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Listen for auth-related errors
    const handleError = (error: ErrorEvent) => {
      console.error("Auth error caught:", error);
      
      // Report to Sentry
      Sentry.captureException(error);
      
      // Set error state only for auth-related errors
      if (
        error.message?.includes("clerk") || 
        error.message?.includes("auth") ||
        error.message?.includes("unauthorized")
      ) {
        setHasError(true);
      }
    };

    // Add global error listener
    window.addEventListener("error", handleError);
    
    // Cleanup
    return () => {
      window.removeEventListener("error", handleError);
    };
  }, []);

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-destructive/10 text-destructive p-4 rounded-md max-w-md w-full">
          <h2 className="text-lg font-medium mb-2">Authentication Error</h2>
          <p className="mb-4">
            There was a problem with authentication. Please try refreshing the page or signing in again.
          </p>
          <button
            onClick={() => {
              setHasError(false);
              window.location.href = "/login";
            }}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

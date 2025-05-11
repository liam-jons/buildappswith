"use client";

import { ClerkProvider as BaseClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";
import { useState, useEffect, ReactNode } from "react";
import * as Sentry from "@sentry/nextjs";
import ProgressiveLoadingState from "@/components/auth/progressive-loading-state";
import { ExpressAuthProvider } from "@/components/auth/express-auth-provider";
import { AuthErrorBoundary } from "@/components/auth/auth-error-boundary";

/**
 * Authentication state
 */
type AuthState = 'initializing' | 'connecting' | 'ready' | 'error';

/**
 * Enhanced Clerk Provider component
 * Unified authentication provider with improved loading state management
 * and error handling
 */
export function EnhancedClerkProvider({ children }: { children: ReactNode }) {
  const { theme } = useTheme();
  const [authState, setAuthState] = useState<AuthState>('initializing');
  const [authError, setAuthError] = useState<Error | null>(null);
  const [initialAuthCheckComplete, setInitialAuthCheckComplete] = useState(false);

  // Configuration that works for all environments
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  // Check connection as soon as the component mounts
  useEffect(() => {
    setAuthState('connecting');

    // Simulate checking auth connection
    const checkAuth = () => {
      // If publishable key is missing, set error
      if (!publishableKey) {
        console.error('Clerk publishable key is missing');
        setAuthError(new Error('Authentication configuration error'));
        setAuthState('error');
        return;
      }

      // After a short delay to ensure Clerk has a chance to initialize
      setTimeout(() => {
        setInitialAuthCheckComplete(true);
        setAuthState('ready');
      }, 500);
    };

    checkAuth();
  }, [publishableKey]);

  // Handle auth connection error
  const handleConnectionError = (error: Error) => {
    console.error('Authentication connection error:', error);
    Sentry.captureException(error, {
      tags: { source: 'auth-initialization' },
      level: 'error'
    });
    setAuthError(error);
    setAuthState('error');
  };

  // Handle retry attempt
  const handleRetry = () => {
    setAuthState('initializing');
    window.location.reload();
  };

  // Show loading state if auth is still initializing
  if (authState === 'initializing' || authState === 'connecting') {
    return <ProgressiveLoadingState state={authState} />;
  }

  // Show error state if there's an auth initialization error
  if (authState === 'error') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4 max-w-md text-center p-6">
          <div className="bg-red-100 p-3 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium">Authentication Error</h3>
          <p className="text-sm text-muted-foreground">
            {authError?.message || 'There was an error initializing authentication.'}
          </p>
          <button
            onClick={handleRetry}
            className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Successfully initialized auth provider with ExpressAuthProvider
  return (
    <BaseClerkProvider
      appearance={{
        baseTheme: theme === "dark" ? dark : undefined,
        elements: {
          formButtonPrimary:
            "bg-primary hover:bg-primary/90 text-primary-foreground",
          card: "bg-background border border-border shadow-sm",
          formButtonReset: "text-muted-foreground hover:text-foreground",
          footerActionLink: "text-primary hover:text-primary/90",
          headerTitle: "text-foreground",
          headerSubtitle: "text-muted-foreground",
          socialButtonsBlockButton:
            "border border-border hover:bg-muted text-foreground",
          formFieldLabel: "text-foreground",
          formFieldInput:
            "bg-background border border-input text-foreground rounded-md",
          identityPreview: "bg-muted-foreground/20",
          dividerLine: "bg-border",
          dividerText: "text-muted-foreground",
        },
      }}
      publishableKey={publishableKey}
      // Using the same settings across all environments
      telemetry={false}
    >
      <ExpressAuthProvider>
        <AuthErrorBoundary>
          {children}
        </AuthErrorBoundary>
      </ExpressAuthProvider>
    </BaseClerkProvider>
  );
}
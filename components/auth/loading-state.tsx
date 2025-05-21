"use client";

import { useAuth } from "@/lib/auth";
import React from "react";
import { ProgressiveLoadingState } from "./progressive-loading-state";

interface AuthLoadingStateProps {
  children: React.ReactNode;
  maxWaitTime?: number;
}

/**
 * Component to handle authentication loading states
 * Prevents blank pages by showing a loading state while Clerk auth is initializing
 * Uses a reliable initialization check with connection monitoring and timeout safety
 */
export function AuthLoadingState({
  children,
  maxWaitTime = 8000
}: AuthLoadingStateProps) {
  const { isLoaded, isSignedIn } = useAuth();
  const [stage, setStage] = React.useState<'initializing' | 'connecting' | 'timeout'>('initializing');
  const [forceRender, setForceRender] = React.useState(false);

  // Use multiple checks to detect proper loading
  React.useEffect(() => {
    // Set initial stage
    setStage('connecting');

    // Safety timeout for worst-case scenarios
    // Will force-render content after maxWaitTime
    const safetyTimer = setTimeout(() => {
      console.warn('Auth initialization safety timeout reached, forcing render');
      setForceRender(true);
    }, maxWaitTime);

    // Show timeout message after 3 seconds
    const timeoutTimer = setTimeout(() => {
      if (!isLoaded) {
        setStage('timeout');
      }
    }, 3000);

    return () => {
      clearTimeout(safetyTimer);
      clearTimeout(timeoutTimer);
    };
  }, [maxWaitTime]);

  // When auth is loaded or we hit the safety timeout, render children
  if (isLoaded || forceRender) {
    return <>{children}</>;
  }

  // Show progressive loading UI while waiting
  return <ProgressiveLoadingState state={stage} />;
}

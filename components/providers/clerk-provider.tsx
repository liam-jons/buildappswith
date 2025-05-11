"use client";

import { EnhancedClerkProvider } from "./enhanced-clerk-provider";
import { AuthLoadingState } from "../auth/loading-state";
import { Suspense } from "react";

interface ClerkProviderProps {
  children: React.ReactNode;
}

/**
 * ClerkProvider wrapper component that supports theme switching
 * This is now a wrapper around EnhancedClerkProvider for backward compatibility
 */
export function ClerkProvider({ children }: ClerkProviderProps) {
  // Use the enhanced provider with consistent behavior across environments
  return (
    <EnhancedClerkProvider>
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
        <AuthLoadingState maxWaitTime={10000}>
          {children}
        </AuthLoadingState>
      </Suspense>
    </EnhancedClerkProvider>
  );
}

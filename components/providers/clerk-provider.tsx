"use client";

import { EnhancedClerkProvider } from "./enhanced-clerk-provider";
import { OptimizedAuthLoadingState } from "../auth/optimized-loading-state";
import { Suspense } from "react";

interface ClerkProviderProps {
  children: React.ReactNode;
}

/**
 * ClerkProvider wrapper component that supports theme switching
 * Updated to use optimized loading state for better public page performance
 */
export function ClerkProvider({ children }: ClerkProviderProps) {
  // Use the enhanced provider with consistent behavior across environments
  return (
    <EnhancedClerkProvider>
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
        <OptimizedAuthLoadingState maxWaitTime={5000}>
          {children}
        </OptimizedAuthLoadingState>
      </Suspense>
    </EnhancedClerkProvider>
  );
}

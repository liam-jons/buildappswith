"use client";

import { ThemeProvider } from "next-themes";
import { ClerkProvider } from "./clerk-provider";
import { Toaster } from "sonner";
import { AuthErrorBoundary } from "../auth/auth-error-boundary";
// import { DatadogRumProvider, retrieveTraceContext } from "./datadog-rum-provider";

interface ProvidersProps {
  children: React.ReactNode;
}

/**
 * Combined providers wrapper for the application
 */
export function Providers({ children }: ProvidersProps) {
  // Retrieve trace context from localStorage for SPA navigation if available
  // const traceContext = typeof window !== 'undefined' ? retrieveTraceContext() : null;
  
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ClerkProvider>
        {/* Datadog temporarily disabled - API version issues */}
        {/* <DatadogRumProvider traceContext={traceContext}> */}
          <AuthErrorBoundary>
            <Toaster richColors />
            {children}
          </AuthErrorBoundary>
        {/* </DatadogRumProvider> */}
      </ClerkProvider>
    </ThemeProvider>
  );
}

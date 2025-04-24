"use client";

import { ClerkProvider as BaseClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";
import { AuthLoadingState } from "../auth/loading-state";
import { Suspense } from "react";
// Import Sentry if needed for error monitoring
import * as Sentry from "@sentry/nextjs";

interface ClerkProviderProps {
  children: React.ReactNode;
}

/**
 * ClerkProvider wrapper component that supports theme switching
 */
export function ClerkProvider({ children }: ClerkProviderProps) {
  const { theme } = useTheme();
  
  // Prevent strict mode double-mounting issues by using a stable reference
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
      // Setting publishableKey in the component ensures it's properly set on client-side
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      // Adding observer to catch and report auth errors
      // New as of v5 of Clerk's SDK
      telemetry={false}
    >
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
        <AuthLoadingState>
          {children}
        </AuthLoadingState>
      </Suspense>
    </BaseClerkProvider>
  );
}

"use client";

import { ThemeProvider } from "next-themes";
import { ClerkProvider } from "./clerk-provider";
import { Toaster } from "sonner";
import { AuthErrorBoundary } from "../auth/auth-error-boundary";

interface ProvidersProps {
  children: React.ReactNode;
}

/**
 * Combined providers wrapper for the application
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ClerkProvider>
        <AuthErrorBoundary>
          <Toaster richColors />
          {children}
        </AuthErrorBoundary>
      </ClerkProvider>
    </ThemeProvider>
  );
}

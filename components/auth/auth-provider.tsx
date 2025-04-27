"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";
import { ReactNode } from 'react';

/**
 * AuthProvider component using Clerk
 * This replaces the NextAuth SessionProvider with Clerk's equivalent
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const { theme } = useTheme();
  
  return (
    <ClerkProvider
      appearance={{
        baseTheme: theme === "dark" ? dark : undefined,
        elements: {
          formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary-foreground",
          card: "bg-background border border-border shadow-sm",
          formButtonReset: "text-muted-foreground hover:text-foreground",
          footerActionLink: "text-primary hover:text-primary/90",
          headerTitle: "text-foreground",
          headerSubtitle: "text-muted-foreground",
          socialButtonsBlockButton: "border border-border hover:bg-muted text-foreground",
          formFieldLabel: "text-foreground",
          formFieldInput: "bg-background border border-input text-foreground rounded-md",
          identityPreview: "bg-muted-foreground/20",
          dividerLine: "bg-border",
          dividerText: "text-muted-foreground",
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
}

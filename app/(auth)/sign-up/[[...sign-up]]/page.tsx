'use client';

import { SignUp } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Clerk SignUp Page Using Catch-All Routes
 * 
 * This follows Clerk best practices by using the [[...sign-up]] catch-all route
 * pattern to enable all Clerk authentication flows.
 */
export default function SignUpPage() {
  const { theme } = useTheme();
  const searchParams = useSearchParams();
  const [redirectUrl, setRedirectUrl] = useState<string | undefined>();
  
  useEffect(() => {
    // Check for various redirect parameters that might be set
    const redirect = searchParams?.get('redirect_url') || 
                    searchParams?.get('redirectUrl') ||
                    searchParams?.get('returnUrl') ||
                    searchParams?.get('return_url');
    
    setRedirectUrl(redirect || undefined);
  }, [searchParams]);

  // Clerk appearance customization
  const appearance = {
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
  };

  // Pass redirectUrl if provided to ensure proper post-auth redirect
  return (
    <div className="flex justify-center items-center min-h-screen">
      <SignUp
        appearance={appearance}
        path="/sign-up"
        routing="path"
        signInUrl="/sign-in"
        afterSignUpUrl={redirectUrl || '/dashboard'}
        redirectUrl={redirectUrl}
      />
    </div>
  );
}
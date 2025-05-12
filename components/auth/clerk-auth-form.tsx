"use client";

import { SignIn, SignUp } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import { dark } from "@clerk/themes";
import { cn } from "@/lib/utils";

interface ClerkAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {
  mode?: "signin" | "signup";
  routing?: "path" | "hash" | "virtual";
  path?: string;
  signInUrl?: string;
  signUpUrl?: string;
}

/**
 * Clerk authentication form component with theme support
 */
export function ClerkAuthForm({
  className,
  mode = "signin",
  routing = "path",
  path,
  signInUrl = "/sign-in",
  signUpUrl = "/sign-up",
  ...props
}: ClerkAuthFormProps) {
  const { theme } = useTheme();

  // Common appearance settings for Clerk components
  const appearanceConfig = {
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

  // Default paths if not provided
  const signInPath = path || "/sign-in";
  const signUpPath = path || "/sign-up";

  return (
    <div className={cn("flex justify-center", className)} {...props}>
      {mode === "signin" ? (
        <SignIn
          appearance={appearanceConfig}
          routing={routing}
          path={signInPath}
          signUpUrl={signUpUrl}
        />
      ) : (
        <SignUp
          appearance={appearanceConfig}
          routing={routing}
          path={signUpPath}
          signInUrl={signInUrl}
        />
      )}
    </div>
  );
}

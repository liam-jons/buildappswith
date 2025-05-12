"use client";

import { SignIn, SignUp } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import { dark } from "@clerk/themes";
import { cn } from "@/lib/utils";

interface ClerkAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {
  mode?: "signin" | "signup";
}

/**
 * Clerk authentication form component with theme support
 */
export function ClerkAuthForm({
  className,
  mode = "signin",
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

  return (
    <div className={cn("flex justify-center", className)} {...props}>
      {mode === "signin" ? (
        <SignIn appearance={appearanceConfig} />
      ) : (
        <SignUp appearance={appearanceConfig} />
      )}
    </div>
  );
}

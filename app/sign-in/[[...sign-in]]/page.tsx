import { SignIn } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/core/button";
import { useTheme } from "next-themes";
import { dark } from "@clerk/themes";

export const metadata: Metadata = {
  title: "Sign In | Build Apps With",
  description: "Sign in to your account",
};

export default function SignInPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Link
        href="/"
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "absolute left-4 top-4 md:left-8 md:top-8"
        )}
      >
        <>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </>
      </Link>
      <div className="mx-auto flex w-full flex-col justify-center gap-6 sm:w-[350px]">
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back
          </h1>
          <p className="text-sm text-muted-foreground">Sign in to your account</p>
        </div>
        <SignIn
          appearance={{
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
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
        />
        <p className="px-8 text-center text-sm text-muted-foreground">
          <Link
            href="/sign-up"
            className="hover:text-brand underline underline-offset-4"
          >
            Don&apos;t have an account? Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
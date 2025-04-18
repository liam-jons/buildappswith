import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Verify Email | Buildappswith",
  description: "Verify your email address",
};

export default function VerifyPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Link
        href="/"
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "absolute left-4 top-4 md:left-8 md:top-8"
        )}
      >
        <span>Back to Home</span>
      </Link>
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Check your email
          </h1>
          <p className="text-sm text-muted-foreground">
            We&apos;ve sent you a verification link. Please check your email to continue.
          </p>
        </div>
        <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-lg text-sm text-slate-500 dark:text-slate-400 text-center">
          <p>
            If you don&apos;t see the email in your inbox, check your spam folder or{" "}
            <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:underline">
              try again
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

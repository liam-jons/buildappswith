"use client";

// Version: 1.0.54
// Error boundary component for handling React errors gracefully

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Error from "next/error";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ErrorBoundary({ children, fallback }: ErrorBoundaryProps) {
  const router = useRouter();

  useEffect(() => {
    // Set up event listener for unhandled errors
    const handleError = (event: ErrorEvent) => {
      console.error("Error caught by error boundary:", event.error);
      
      // You could log to an error tracking service here
      
      // Optional: Refresh the page or navigate on critical errors
      // router.refresh();
    };

    window.addEventListener("error", handleError);
    return () => window.removeEventListener("error", handleError);
  }, [router]);

  return <>{children}</>;
}

export interface CustomError {
  message?: string;
}

export function ErrorFallback({ error }: { error: CustomError }) {
  return (
    <div className="p-8 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-300 my-8">
      <h2 className="text-lg font-semibold mb-2">Something went wrong</h2>
      <p className="mb-4">We&apos;re sorry, but there was an error loading this content.</p>
      <p className="text-sm text-red-700 dark:text-red-400">
        Error details: {error.message || "Unknown error"}
      </p>
    </div>
  );
}

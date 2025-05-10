"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/core/button";
import { logger } from "@/lib/logger";
import { ErrorSeverity, ErrorCategory } from "@/lib/sentry";

interface GlobalErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Global error boundary for capturing unhandled errors at the application level
 * Provides fallback UI and error reporting to Sentry
 * 
 * @example
 * <GlobalErrorBoundary>
 *   <App />
 * </GlobalErrorBoundary>
 */
export function GlobalErrorBoundary({ 
  children, 
  fallback 
}: GlobalErrorBoundaryProps) {
  const [error, setError] = useState<Error | null>(null);
  const [eventId, setEventId] = useState<string | null>(null);

  useEffect(() => {
    // Handle unhandled errors
    const handleError = (event: ErrorEvent) => {
      // Log the error
      logger.error("Global error caught:", {
        error: event.error,
        message: event.message,
        source: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        severity: ErrorSeverity.HIGH,
        category: ErrorCategory.SYSTEM,
        component: 'GlobalErrorBoundary',
      }, event.error);

      // Capture in Sentry and get event ID for user feedback
      const eventId = Sentry.captureException(event.error);
      setEventId(eventId);
      setError(event.error);

      // Prevent default handler
      event.preventDefault();
    };

    // Add global error listener
    window.addEventListener("error", handleError);

    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      // Convert promise rejection to error
      const error = event.reason instanceof Error 
        ? event.reason 
        : new Error(String(event.reason));

      // Log the error
      logger.error("Unhandled promise rejection:", {
        reason: event.reason,
        severity: ErrorSeverity.HIGH,
        category: ErrorCategory.SYSTEM,
        component: 'GlobalErrorBoundary',
      }, error);

      // Capture in Sentry and get event ID for user feedback
      const eventId = Sentry.captureException(error);
      setEventId(eventId);
      setError(error);

      // Prevent default handler
      event.preventDefault();
    };

    // Add unhandled rejection listener
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    // Cleanup
    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, []);

  // If an error has been caught, show the fallback UI
  if (error) {
    return fallback || (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-6">
        <div className="bg-destructive/10 text-destructive p-6 rounded-lg max-w-md w-full">
          <h2 className="text-xl font-semibold mb-3">Something went wrong</h2>
          <p className="mb-4">
            We've encountered an unexpected error and our team has been notified.
          </p>
          {eventId && (
            <p className="text-sm mb-4">
              Reference ID: {eventId}
            </p>
          )}
          <div className="flex gap-3">
            <Button
              onClick={() => window.location.reload()}
              variant="default"
            >
              Reload Page
            </Button>
            <Button
              onClick={() => Sentry.showReportDialog({ eventId: eventId || "" })}
              variant="outline"
            >
              Tell Us What Happened
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default GlobalErrorBoundary;
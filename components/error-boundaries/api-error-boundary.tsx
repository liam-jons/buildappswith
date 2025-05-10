"use client";

import * as Sentry from "@sentry/nextjs";
import { useState, ReactNode } from "react";
import { Button } from "@/components/ui/core/button";
import { logger } from "@/lib/logger";
import { ErrorSeverity, ErrorCategory } from "@/lib/sentry";

interface ApiErrorBoundaryProps {
  children: (props: ApiErrorBoundaryAPI) => ReactNode;
  fallback?: (props: ApiErrorFallbackProps) => ReactNode;
  apiName: string;
}

interface ApiErrorBoundaryAPI {
  error: Error | null;
  isLoading: boolean;
  isError: boolean;
  reset: () => void;
  setError: (error: Error) => void;
  setLoading: (isLoading: boolean) => void;
}

interface ApiErrorFallbackProps {
  error: Error;
  reset: () => void;
  eventId: string | null;
}

/**
 * Error boundary specifically designed for API data fetching operations
 * Provides render props pattern for fine-grained control over error states
 * 
 * @example
 * <ApiErrorBoundary apiName="UserProfileData">
 *   {({ isLoading, isError, error, setLoading, setError }) => {
 *     // Use these props to handle API state
 *     return <UserProfile />;
 *   }}
 * </ApiErrorBoundary>
 */
export function ApiErrorBoundary({ 
  children, 
  fallback, 
  apiName 
}: ApiErrorBoundaryProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [eventId, setEventId] = useState<string | null>(null);

  const handleError = (error: Error) => {
    // Log to console and Sentry
    logger.error(`API Error in ${apiName}:`, {
      error,
      component: apiName,
      severity: ErrorSeverity.HIGH,
      category: ErrorCategory.INTEGRATION,
      affectedFeature: apiName,
    }, error);

    // Report to Sentry with API context
    const eventId = Sentry.withScope((scope) => {
      scope.setTag("api", apiName);
      scope.setTag("error_type", "api_error");
      return Sentry.captureException(error);
    });

    setEventId(eventId);
    setError(error);
    setIsLoading(false);
  };

  const reset = () => {
    setError(null);
    setEventId(null);
  };

  // API for child components
  const api: ApiErrorBoundaryAPI = {
    error,
    isLoading,
    isError: error !== null,
    reset,
    setError: handleError,
    setLoading: setIsLoading,
  };

  // If there's an error and a fallback is provided, render it
  if (error && fallback) {
    return fallback({
      error,
      reset,
      eventId,
    });
  }

  // If there's an error but no fallback, render default error UI
  if (error && !fallback) {
    return (
      <div className="p-4 bg-muted/50 rounded-md border shadow-sm">
        <div className="space-y-2">
          <h3 className="text-base font-medium">
            Problem loading data
          </h3>
          <p className="text-sm text-muted-foreground">
            We encountered an error while fetching data from {apiName}.
          </p>
          {process.env.NODE_ENV !== 'production' && (
            <div className="text-xs p-2 mt-2 bg-muted rounded overflow-auto max-h-[200px]">
              <p className="font-mono">{error.toString()}</p>
            </div>
          )}
          <div className="flex flex-col xs:flex-row gap-2 mt-4">
            <Button
              size="sm"
              onClick={reset}
              variant="default"
            >
              Retry
            </Button>
            {eventId && (
              <Button
                size="sm"
                onClick={() => Sentry.showReportDialog({ eventId })}
                variant="outline"
              >
                Report Issue
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // No error, render children with API
  return <>{children(api)}</>;
}

export default ApiErrorBoundary;
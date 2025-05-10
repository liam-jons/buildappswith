"use client";

import React from 'react';
import { FeatureErrorBoundary } from '@/components/error-boundaries/feature-error-boundary';
import { Button } from '@/components/ui/core/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/core/alert';
import * as Sentry from "@sentry/nextjs";

interface MarketplaceErrorBoundaryProps {
  children: React.ReactNode;
  componentName?: string;
  fallback?: React.ReactNode;
  onError?: (error: Error, info: React.ErrorInfo) => void;
}

/**
 * MarketplaceErrorBoundary
 *
 * Specialized error boundary for marketplace components with consistent error handling
 * and customized UI. Built on top of FeatureErrorBoundary with marketplace-specific logging.
 */
export function MarketplaceErrorBoundary({
  children,
  componentName = 'Marketplace component',
  fallback,
  onError,
}: MarketplaceErrorBoundaryProps) {
  // Custom error handler for marketplace components
  const handleError = (error: Error, info: React.ErrorInfo) => {
    // Log the error to console
    console.error(`Error in ${componentName}:`, error);

    // Send to Sentry
    Sentry.withScope((scope) => {
      scope.setTag("component", componentName);
      scope.setTag("context", "marketplace");
      scope.setExtra("componentStack", info.componentStack);
      Sentry.captureException(error);
    });

    // Call additional error handler if provided
    if (onError) {
      onError(error, info);
    }
  };

  return (
    <FeatureErrorBoundary
      name={componentName}
      onError={handleError}
      fallback={fallback || <MarketplaceErrorFallback componentName={componentName} />}
    >
      {children}
    </FeatureErrorBoundary>
  );
}

/**
 * Custom fallback component for marketplace errors
 */
export function MarketplaceErrorFallback({
  componentName,
  error,
  resetErrorBoundary,
}: {
  componentName?: string;
  error?: Error;
  resetErrorBoundary?: () => void;
}) {
  return (
    <Alert variant="destructive" className="mb-6">
      <AlertTitle>There was a problem loading this content</AlertTitle>
      <AlertDescription className="space-y-4">
        <p className="text-sm text-muted-foreground">
          We encountered an issue while trying to load {componentName?.toLowerCase() || 'marketplace content'}.
        </p>
        {resetErrorBoundary && (
          <Button onClick={resetErrorBoundary} variant="outline" size="sm">
            Try Again
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}
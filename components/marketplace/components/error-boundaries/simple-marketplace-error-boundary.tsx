"use client";

import React from 'react';
import * as Sentry from "@sentry/nextjs";

interface MarketplaceErrorBoundaryProps {
  children: React.ReactNode;
  componentName?: string;
}

/**
 * A simplified version of MarketplaceErrorBoundary that doesn't depend on any external components
 * This is used for testing compilation without introducing additional dependencies
 */
export function SimpleMarketplaceErrorBoundary({
  children,
  componentName = 'Marketplace component',
}: MarketplaceErrorBoundaryProps) {
  // Basic error handler
  const handleError = (error: Error, info: React.ErrorInfo) => {
    // Log to console only
    console.error(`Error in ${componentName}:`, error);
    
    // Send to Sentry
    Sentry.withScope((scope) => {
      scope.setTag("component", componentName);
      scope.setExtra("componentStack", info.componentStack);
      Sentry.captureException(error);
    });
  };

  return (
    <div className="marketplace-error-boundary">
      {children}
    </div>
  );
}
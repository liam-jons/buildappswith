// This file configures the initialization of monitoring tools on the server.
// Handles both Sentry and Datadog initialization for server-side monitoring.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

export async function register() {
  // Guard clause: This should only run on the server
  if (typeof window !== 'undefined') return;

  try {
    // Sentry is already initialized in sentry.server.config.ts
    
    // NOTE: Datadog APM initialization is temporarily disabled to resolve build issues
    // Once the build issues are resolved, uncomment the following code:
    /*
    // Initialize Datadog APM for server-side tracing
    const { getDatadogConfig } = await import('./lib/datadog/config');
    const { initializeServerTracer } = await import('./lib/datadog/init');

    // Get config safely
    const config = getDatadogConfig();

    // Initialize server tracer
    if (typeof initializeServerTracer === 'function') {
      initializeServerTracer();
    }
    */
    
    // Log that monitoring is partially disabled
    console.log('NOTE: Datadog server monitoring is temporarily disabled to resolve build issues');
  } catch (error) {
    console.error('Error initializing server monitoring:', error);
  }
}

// Simple wrapper for request error handling that works with any Sentry version
export const onRequestError = (error) => {
  try {
    if (typeof Sentry.captureException === 'function') {
      Sentry.captureException(error);
    }
  } catch (e) {
    // Silently handle errors in the error handler
  }
};
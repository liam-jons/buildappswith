/**
 * Client-side instrumentation
 * This file only runs in the browser environment
 */

import * as Sentry from "@sentry/nextjs";

export function register() {
  // Only run in browser
  if (typeof window === 'undefined') {
    console.debug('Client instrumentation skipped on server');
    return;
  }

  try {
    // Use existing Sentry configuration from sentry.client.config.ts

    // Initialize Datadog RUM for client-side monitoring
    // Use dynamic import to load only client-specific module
    setTimeout(() => {
      import('./lib/datadog/client')
        .then(({ initializeRum }) => {
          if (typeof initializeRum === 'function') {
            initializeRum();
          }
        })
        .catch(error => {
          console.warn('Failed to initialize RUM:', error);
        });
    }, 0);
  } catch (error) {
    console.error('Error initializing client monitoring:', error);
  }
}

// Export router transition hooks with defensive compatibility
export const onRouterTransitionStart = (context) => {
  try {
    if (typeof Sentry.captureRouterTransitionStart === 'function') {
      return Sentry.captureRouterTransitionStart(context);
    }
  } catch (e) {
    // Silently ignore errors in the transition hooks
  }
  return undefined;
};

// Default implementation for router transitions that works with any version
export const onRouterTransitionComplete = (context) => {
  try {
    if (typeof Sentry.captureException === 'function') {
      // At minimum, we can capture any exceptions that might occur
      // This avoids depending on specific Sentry APIs that might change
    }
  } catch (e) {
    // Silently ignore errors in the transition hooks
  }
  return undefined;
};
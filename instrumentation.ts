// This file configures the initialization of Sentry on the server.
// Leverages existing configuration from sentry.server.config.ts
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

export async function register() {
  // Sentry is already initialized in sentry.server.config.ts
  // This file exists for compatibility with NextJS instrumentation
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
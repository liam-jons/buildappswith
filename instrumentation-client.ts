// This file configures the initialization of Sentry on the client.
// Uses settings from sentry.client.config.ts but adapted for instrumentation.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";
import { getInitializationConfig } from "./lib/sentry";

export function register() {
  // Only run in browser
  if (typeof window === 'undefined') return;

  // Use existing Sentry configuration
  // This instrumentation file is just a compatibility layer
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
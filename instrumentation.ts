// This file configures the initialization of Sentry on the server.
// The config here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';
import {
  getInitializationConfig,
  configureSentryDataFiltering,
  configureSentryPerformance
} from "./lib/sentry";

export async function register() {
  try {
    // Determine the runtime environment
    const isServer = typeof window === 'undefined';
    const isNodeRuntime = process.env.NEXT_RUNTIME === 'nodejs';
    const isEdgeRuntime = process.env.NEXT_RUNTIME === 'edge';

    // Only initialize server-side monitoring on the server
    if (isServer) {
      // Get base config with EU region explicit settings
      const baseConfig = getInitializationConfig();

      // Apply sensitive data filtering
      const configWithPrivacyFilters = configureSentryDataFiltering(baseConfig);

      // Configure integrations based on runtime
      let serverIntegrations = [];

      // Node.js runtime integrations
      if (isNodeRuntime) {
        // Handle Sentry integration changes in newer versions
        try {
          // For newer Sentry versions where Integrations might be restructured
          serverIntegrations = [];

          // Only add integrations if they exist
          if (Sentry.Integrations?.Http) {
            serverIntegrations.push(new Sentry.Integrations.Http({ tracing: true }));
          }

          if (Sentry.Integrations?.OnUncaughtException) {
            serverIntegrations.push(new Sentry.Integrations.OnUncaughtException());
          }

          if (Sentry.Integrations?.OnUnhandledRejection) {
            serverIntegrations.push(new Sentry.Integrations.OnUnhandledRejection());
          }
        } catch (e) {
          // Silently handle integration errors - monitoring should be non-blocking
          console.warn('Sentry integrations configuration error:', e);
        }

        // In Node.js environments only, we can safely use dd-trace
        // We no longer try to import this for client bundles
      }

      // Apply performance monitoring config with EU region support
      const finalConfig = configureSentryPerformance({
        ...configWithPrivacyFilters,
        // Set EU region explicitly
        region: 'eu',
        integrations: serverIntegrations,
      });

      // Initialize Sentry
      Sentry.init(finalConfig);
    }
  } catch (error) {
    console.error('Error initializing monitoring:', error);
  }
}

// Capture server-side React component errors (Next.js 14+)
export const onRequestError = Sentry.captureRequestError;
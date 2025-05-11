// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";
import {
  getInitializationConfig,
  configureSentryDataFiltering,
  configureSentryPerformance
} from "./lib/sentry";

export function register() {
  try {
    // Only initialize on client
    if (typeof window === 'undefined') return;

    // Get base config with EU region explicit settings
    const baseConfig = getInitializationConfig();

    // Apply sensitive data filtering
    const configWithPrivacyFilters = configureSentryDataFiltering(baseConfig);

    // Apply browser-specific performance monitoring
    const finalConfig = configureSentryPerformance({
      ...configWithPrivacyFilters,
      
      // Set EU region explicitly
      region: 'eu',
      
      integrations: [
        new Sentry.BrowserTracing({
          tracePropagationTargets: [
            "localhost",
            "buildappswith.com",
            /^\//,  // All relative URLs
          ],
        }),
      ],

      // Maintain Datadog integration
      beforeSend: (event) => {
        try {
          // If there's a Datadog RUM global context with trace info, add it to Sentry
          if (
            window.__DD_RUM__ &&
            window.__DD_RUM__._getInternalContext
          ) {
            const rumContext = window.__DD_RUM__._getInternalContext();
            if (rumContext && rumContext.application && rumContext.application.id) {
              event.contexts = {
                ...event.contexts,
                datadog_rum: {
                  application_id: rumContext.application.id,
                  session_id: rumContext.session.id,
                  view_id: rumContext.view.id,
                  rum_version: rumContext.version,
                }
              };
            }
          }
          return event;
        } catch (error) {
          console.error('Error in Sentry beforeSend:', error);
          return event;
        }
      },
    });

    // Initialize Sentry with defensive coding
    Sentry.init(finalConfig);
  } catch (e) {
    console.debug('Error initializing Sentry client', e);
  }
}

// Add typings for window.__DD_RUM__
declare global {
  interface Window {
    __DD_RUM__?: {
      _getInternalContext?: () => any;
    };
  }
}

// Export necessary hooks for Next.js
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
export const onRouterTransitionComplete = Sentry.onRouterTransitionComplete;
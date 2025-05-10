// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever the client-side code is loaded.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";
import { 
  getInitializationConfig, 
  configureSentryDataFiltering, 
  configureSentryPerformance 
} from "./lib/sentry";

// Get base config from our central configuration
const baseConfig = getInitializationConfig();

// Apply sensitive data filtering
const configWithPrivacyFilters = configureSentryDataFiltering(baseConfig);

// Apply performance monitoring config for client with basic settings only
// No specialized integrations to avoid compatibility issues
const finalConfig = configureSentryPerformance({
  ...configWithPrivacyFilters,
  
  // Use minimal integrations to avoid dependency on browser-specific APIs
  // This helps with compatibility across environments
  integrations: [
    // Temporarily disable browser tracing to fix undefined constructor error
    // typeof window !== 'undefined' ? new Sentry.BrowserTracing({
    //   tracePropagationTargets: [
    //     "localhost",
    //     "buildappswith.com",
    //     /^\//,  // All relative URLs
    //   ],
    // }) : null,
  ].filter(Boolean), // Filter out null values
  
  // Basic performance settings that work across environments
  tracesSampleRate: 0.1,
  tracePropagationTargets: [
    "localhost",
    "buildappswith.com",
    /^\//,  // All relative URLs
  ],
  
  // Attempt to correlate with Datadog RUM if available
  beforeSend: (event) => {
    try {
      // If there's a Datadog RUM global context with trace info, add it to Sentry
      if (
        typeof window !== 'undefined' && 
        window.__DD_RUM__ && 
        window.__DD_RUM__._getInternalContext
      ) {
        const rumContext = window.__DD_RUM__._getInternalContext();
        if (rumContext && rumContext.application.id) {
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

// Add typings for window.__DD_RUM__
declare global {
  interface Window {
    __DD_RUM__?: {
      _getInternalContext?: () => any;
    };
  }
}

// Initialize Sentry with defensive coding
try {
  Sentry.init(finalConfig);
} catch (e) {
  console.debug('Error initializing Sentry', e);
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
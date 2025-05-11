Sentry Configuration Migration Plan

  Current State Analysis

  - Using deprecated configuration via separate sentry.client.config.ts and sentry.server.config.ts files
  - Already has a basic instrumentation.ts but not using the instrumentation API fully
  - EU region configured in DSN but not explicitly in other settings
  - Has Datadog integration with manual context propagation
  - Contains custom error filtering and performance monitoring

  Migration Strategy

  1. Create instrumentation-client.ts

  Create a new file at the root level that will contain all client-side Sentry initialization:

  // instrumentation-client.ts
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

      // Get base config from our central configuration
      const baseConfig = getInitializationConfig();

      // Apply sensitive data filtering
      const configWithPrivacyFilters = configureSentryDataFiltering({
        ...baseConfig,
        // Ensure EU region is explicitly set
        dsn: process.env.NEXT_PUBLIC_SENTRY_DSN ||
  "https://fbc43927da128c3a176f85092ef2bb5c@o4509207749328896.ingest.de.sentry.io/4509207750967376",
      });

      // Apply browser-specific performance monitoring
      const finalConfig = configureSentryPerformance({
        ...configWithPrivacyFilters,
        integrations: [
          new Sentry.BrowserTracing({
            tracePropagationTargets: [
              "localhost",
              "buildappswith.com",
              /^\//,  // All relative URLs
            ],
          }),
          // Add any other browser-specific integrations
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

      // Initialize Sentry with defensive coding
      Sentry.init(finalConfig);
    } catch (e) {
      console.debug('Error initializing Sentry client', e);
    }
  }

  // Types for Datadog RUM
  declare global {
    interface Window {
      __DD_RUM__?: {
        _getInternalContext?: () => any;
      };
    }
  }

  export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

  2. Update instrumentation.ts

  Modify the existing instrumentation.ts to incorporate better error handling and server-side initialization:

  // instrumentation.ts
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
        console.log('Initializing server-side monitoring...');

        // Get base config from our central configuration
        const baseConfig = getInitializationConfig();

        // Apply sensitive data filtering with explicit EU region
        const configWithPrivacyFilters = configureSentryDataFiltering({
          ...baseConfig,
          // Ensure EU region is explicitly set
          dsn: process.env.NEXT_PUBLIC_SENTRY_DSN ||
  "https://fbc43927da128c3a176f85092ef2bb5c@o4509207749328896.ingest.de.sentry.io/4509207750967376",
        });

        // Configure integrations based on runtime
        let serverIntegrations = [];

        // Node.js runtime integrations
        if (isNodeRuntime) {
          serverIntegrations = [
            // Add Node-specific integrations
            new Sentry.Integrations.Http({ tracing: true }),
            new Sentry.Integrations.OnUncaughtException(),
            new Sentry.Integrations.OnUnhandledRejection(),
          ];
        }

        // Apply performance monitoring config with appropriate integrations
        const finalConfig = configureSentryPerformance({
          ...configWithPrivacyFilters,
          integrations: serverIntegrations,
        });

        // Initialize Sentry
        Sentry.init(finalConfig);
      }
    } catch (error) {
      console.error('Error initializing monitoring:', error);
    }
  }

  // Capture server-side React component errors (for Next.js 15+)
  export const onRequestError = Sentry.captureRequestError;

  3. Update EU Region Configuration

  Enhance lib/sentry/config.ts to explicitly support EU region:

  // Addition to lib/sentry/config.ts
  export const sentryConfig = {
    // Existing code...

    // EU region configuration
    region: 'eu',
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN ||
  "https://fbc43927da128c3a176f85092ef2bb5c@o4509207749328896.ingest.de.sentry.io/4509207750967376",

    // Update getInitializationConfig to include region
    getInitializationConfig() {
      return {
        dsn: this.dsn,
        environment: this.environment,
        release: this.release,
        tracesSampleRate: this.getSampleRate(),
        debug: this.getEnvironmentConfig().debug || false,
        attachStacktrace: this.getEnvironmentConfig().attachStacktrace || false,
        enabled: this.isEnabled(),
        region: this.region,  // Add region support

        // Configure sampling dynamically
        tracesSampler: (samplingContext) => {
          // Get transaction name if available
          const transactionName = samplingContext.transactionContext?.name;
          if (transactionName) {
            return this.shouldSampleTransaction(transactionName);
          }

          return this.getSampleRate();
        },
      };
    }
  };

  4. Implementation Steps

  1. Create new instrumentation-client.ts file
  2. Update instrumentation.ts
  3. Enhance EU region support in sentry/config.ts
  4. Remove sentry.client.config.ts and sentry.server.config.ts after testing

  5. Testing Strategy

  - Verify error capture in development
  - Ensure Sentry receives server-side errors
  - Confirm EU region data storage in Sentry dashboard
  - Test integration with Datadog
  - Verify performance monitoring across environments

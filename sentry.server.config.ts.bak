// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";
import {
  getInitializationConfig,
  configureSentryDataFiltering,
  configureSentryPerformance
} from "./lib/sentry";

// Safe imports with checks
let DatadogSentryIntegration: any;
let createDatadogTraceContext: () => Record<string, any> | null = () => null;

// Create a dummy integration if we can't import the real one
DatadogSentryIntegration = class DummyIntegration implements Sentry.Integration {
  public static id: string = 'DummyDatadogIntegration';
  public name: string = DatadogSentryIntegration.id;
  constructor(private readonly options: any = {}) {}
  setupOnce(): void {}
};

// Get base config from our central configuration
const baseConfig = getInitializationConfig();

// Apply sensitive data filtering
const configWithPrivacyFilters = configureSentryDataFiltering(baseConfig);

// Apply performance monitoring config for server
const finalConfig = configureSentryPerformance({
  ...configWithPrivacyFilters,
  
  // Add server-specific integrations including Datadog integration
  integrations: [
    // Placeholder for Datadog integration - only used server-side
    ...(typeof window === 'undefined' ? [new DatadogSentryIntegration({ alwaysLinkTraces: true })] : []),

    // Standard HTTP integration for server - only add if available
    ...(Sentry.Integrations.Http ? [new Sentry.Integrations.Http({ tracing: true })] : []),

    // Node integration
    new Sentry.Integrations.OnUncaughtException(),
    new Sentry.Integrations.OnUnhandledRejection(),
  ],
  
  // Add context to all events
  beforeSend: (event) => {
    try {
      // We're simplifying this to avoid Datadog dependencies
      // If you need to add Datadog context, do it separately
      return event;
    } catch (error) {
      console.error('Error in Sentry beforeSend:', error);
      return event;
    }
  },
});

Sentry.init(finalConfig);
// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";
import { 
  getInitializationConfig, 
  configureSentryDataFiltering, 
  configureSentryPerformance 
} from "./lib/sentry";
// Note: Datadog APM is not compatible with Edge Runtime
// So we don't import Datadog integrations here

// Get base config from our central configuration
const baseConfig = getInitializationConfig();

// Apply sensitive data filtering
const configWithPrivacyFilters = configureSentryDataFiltering(baseConfig);

// Apply performance monitoring config for edge
const finalConfig = configureSentryPerformance({
  ...configWithPrivacyFilters,
  
  // Add edge-specific integrations
  integrations: [
    // Edge-specific integrations
    // Datadog is not used in edge runtime
  ],
  
  // Edge runtime may have different performance requirements
  tracesSampleRate: 0.2,
});

Sentry.init(finalConfig);
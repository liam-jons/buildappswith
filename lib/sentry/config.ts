/**
 * Centralized Sentry configuration module
 * @version 1.0.0
 */

export const sentryConfig = {
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || "https://fbc43927da128c3a176f85092ef2bb5c@o4509207749328896.ingest.de.sentry.io/4509207750967376",
  environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV,
  release: process.env.SENTRY_RELEASE || `buildappswith@${process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'}`,

  // Performance monitoring
  tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '0.1'),

  // Only enable debug in development
  debug: process.env.SENTRY_DEBUG === 'true' || process.env.NODE_ENV === 'development',

  // Default integrations
  defaultIntegrations: true,

  // Key environments configuration
  environments: {
    development: {
      tracesSampleRate: 1.0, // Full sampling in development
      debug: true,
      attachStacktrace: true,
    },
    test: {
      enabled: false, // Disable in test environment
    },
    staging: {
      tracesSampleRate: 0.5, // Higher sampling in staging
      attachStacktrace: true,
    },
    production: {
      tracesSampleRate: 0.1, // Lower sampling in production
      debug: false,
      attachStacktrace: true,
    },
  },

  // Critical transactions always sampled
  tracingConfigurations: {
    alwaysSample: [
      'payment.process',
      'auth.signup',
      'auth.signin',
      'booking.create'
    ],
  },

  // Configure different Sentry settings based on the current environment
  getEnvironmentConfig() {
    const env = this.environment || 'development';
    return this.environments[env] || this.environments.development;
  },

  // Utility function to determine if Sentry should be enabled
  isEnabled() {
    if (this.environment === 'test' && !process.env.SENTRY_ENABLE_IN_TESTS) {
      return false;
    }
    return Boolean(this.dsn);
  },

  // Utility function to get the appropriate sample rate for the current environment
  getSampleRate() {
    const envConfig = this.getEnvironmentConfig();
    return envConfig.tracesSampleRate !== undefined 
      ? envConfig.tracesSampleRate 
      : this.tracesSampleRate;
  },

  // Helper for transaction sampling
  shouldSampleTransaction(transactionName: string) {
    // Always sample critical transactions
    if (this.tracingConfigurations.alwaysSample.includes(transactionName)) {
      return 1.0;
    }
    
    // Otherwise use the environment-specific sample rate
    return this.getSampleRate();
  }
};

// Export a initialization helper for consistent setup across environments
export function getInitializationConfig() {
  return {
    dsn: sentryConfig.dsn,
    environment: sentryConfig.environment,
    release: sentryConfig.release,
    tracesSampleRate: sentryConfig.getSampleRate(),
    debug: sentryConfig.getEnvironmentConfig().debug || false,
    attachStacktrace: sentryConfig.getEnvironmentConfig().attachStacktrace || false,
    enabled: sentryConfig.isEnabled(),
    
    // Configure sampling dynamically
    tracesSampler: (samplingContext) => {
      // Get transaction name if available
      const transactionName = samplingContext.transactionContext?.name;
      if (transactionName) {
        return sentryConfig.shouldSampleTransaction(transactionName);
      }
      
      return sentryConfig.getSampleRate();
    },
  };
}
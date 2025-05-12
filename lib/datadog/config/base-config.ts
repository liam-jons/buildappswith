/**
 * Datadog Base Configuration
 * 
 * Shared configuration for all Datadog services including:
 * - APM (Server-side tracing)
 * - RUM (Real User Monitoring)
 * - Logs
 * - Profiling
 */

/**
 * Environment enum for Datadog
 */
export enum DatadogEnvironment {
  DEVELOPMENT = 'development',
  TESTING = 'testing',
  STAGING = 'staging',
  PRODUCTION = 'production',
}

/**
 * Environment-specific configuration
 */
export interface EnvironmentConfig {
  enabled: boolean;
  sampleRate: number;
  logSampleRate: number;
  rumSampleRate: number;
  rumSessionReplaySampleRate: number;
  profiling: boolean;
  debugging: boolean;
}

/**
 * Base configuration interface
 */
export interface DatadogConfig {
  service: string;
  version: string;
  env: DatadogEnvironment;
  site: string;
  enabled: boolean;
  sampleRate: number;
  logSampleRate: number;
  rumSampleRate: number;
  rumSessionReplaySampleRate: number;
  profiling: boolean;
  debugging: boolean;
  criticalTransactions: string[];
}

/**
 * Base configuration with EU1 region default
 */
export const datadogConfigBase = {
  service: 'buildappswith-platform',
  version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  site: process.env.DATADOG_SITE || 'datadoghq.eu', // EU1 by default
  
  // Critical transactions to always trace (100% sampling)
  criticalTransactions: [
    'auth.signup',
    'auth.login',
    'auth.verify',
    'auth.refresh',
    'auth.protected',
    'auth.role',
    'auth.permission',
    'payment.process',
    'booking.create',
    'marketplace.search',
  ],

  // Environment-specific configurations
  environments: {
    [DatadogEnvironment.DEVELOPMENT]: {
      enabled: process.env.DATADOG_ENABLE_DEV === 'true',
      sampleRate: 1.0,
      logSampleRate: 1.0,
      rumSampleRate: 1.0,
      rumSessionReplaySampleRate: 1.0,
      profiling: true,
      debugging: true,
    },
    [DatadogEnvironment.TESTING]: {
      enabled: process.env.DATADOG_ENABLE_TEST === 'true',
      sampleRate: 1.0,
      logSampleRate: 1.0,
      rumSampleRate: 1.0,
      rumSessionReplaySampleRate: 0.0, // Disable replay in test
      profiling: false,
      debugging: true,
    },
    [DatadogEnvironment.STAGING]: {
      enabled: true,
      sampleRate: 0.5,
      logSampleRate: 0.5,
      rumSampleRate: 0.5,
      rumSessionReplaySampleRate: 0.3,
      profiling: true,
      debugging: true,
    },
    [DatadogEnvironment.PRODUCTION]: {
      enabled: true,
      sampleRate: 0.1,
      logSampleRate: 0.2,
      rumSampleRate: 0.1,
      rumSessionReplaySampleRate: 0.05,
      profiling: true,
      debugging: false,
    },
  },
};

/**
 * Gets the current environment based on NODE_ENV
 */
export function getCurrentEnvironment(): DatadogEnvironment {
  // Use NEXT_PUBLIC env var for client-side compatibility
  const env = process.env.NEXT_PUBLIC_NODE_ENV || process.env.NODE_ENV;
  return (env as DatadogEnvironment) || DatadogEnvironment.DEVELOPMENT;
}

/**
 * Gets the environment-specific configuration
 */
export function getEnvironmentConfig(): EnvironmentConfig {
  const env = getCurrentEnvironment();
  return datadogConfigBase.environments[env] || datadogConfigBase.environments[DatadogEnvironment.DEVELOPMENT];
}

/**
 * Returns the complete Datadog configuration
 */
export function getDatadogConfig(): DatadogConfig {
  const envConfig = getEnvironmentConfig();
  const env = getCurrentEnvironment();
  
  return {
    service: datadogConfigBase.service,
    version: datadogConfigBase.version,
    env,
    site: datadogConfigBase.site,
    criticalTransactions: datadogConfigBase.criticalTransactions,
    ...envConfig,
  };
}

/**
 * Validates that the site is set to EU region (datadoghq.eu)
 * @param site The site value to check
 */
export function validateEURegion(site: string): boolean {
  if (site !== 'datadoghq.eu') {
    console.warn('Warning: Datadog not configured for EU region (datadoghq.eu)');
    return false;
  }
  return true;
}

/**
 * Determines if the specified transaction is critical and should always be traced
 */
export function isCriticalTransaction(transactionName: string): boolean {
  return datadogConfigBase.criticalTransactions.includes(transactionName);
}

/**
 * Gets the appropriate sample rate for a transaction
 * - Critical transactions are always sampled (1.0)
 * - Non-critical transactions use the environment's sample rate
 */
export function getTransactionSampleRate(transactionName: string): number {
  if (isCriticalTransaction(transactionName)) {
    return 1.0;
  }
  return getEnvironmentConfig().sampleRate;
}
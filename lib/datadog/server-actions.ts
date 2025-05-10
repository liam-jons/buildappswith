'use server';

/**
 * Datadog Server Actions
 * 
 * This file contains server actions that can be called from the client
 * All functions must be async when using 'use server' directive
 */

/**
 * Gets the Datadog service configuration for the current environment
 * Safe to call from client components
 */
export async function getDatadogServiceInfo() {
  const env = process.env.NODE_ENV || 'development';
  const version = process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0';
  const service = 'buildappswith-platform';
  const site = process.env.DATADOG_SITE || 'datadoghq.com';
  
  return {
    env,
    version,
    service,
    site,
    enabled: (process.env.DATADOG_ENABLE_DEV === 'true' || 
             env === 'production' || 
             env === 'staging')
  };
}
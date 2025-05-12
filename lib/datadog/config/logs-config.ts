/**
 * Datadog Logs Configuration
 * 
 * Configuration for Logs on the client side
 */

import { getDatadogConfig, validateEURegion } from './base-config';
import { LogsConfig } from '../interfaces/logs';

/**
 * Get the logs configuration for the current environment
 */
export function getLogsConfiguration(): LogsConfig {
  const config = getDatadogConfig();
  
  const site = process.env.NEXT_PUBLIC_DATADOG_SITE || 'datadoghq.eu';
  
  // Validate EU region
  validateEURegion(site);
  
  return {
    enabled: config.enabled,
    clientToken: process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN || '',
    site,
    service: config.service,
    env: config.env,
    version: config.version,
    sampleRate: config.logSampleRate,
    forwardErrorsToLogs: true,
  };
}

/**
 * Validates that all required environment variables are set for logs
 */
export function validateLogsEnvironmentVariables(): boolean {
  const missing: string[] = [];
  
  if (!process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN) {
    missing.push('NEXT_PUBLIC_DATADOG_CLIENT_TOKEN');
  }
  
  if (missing.length > 0) {
    console.warn(`Missing required environment variables for Datadog Logs: ${missing.join(', ')}`);
    return false;
  }
  
  return true;
}
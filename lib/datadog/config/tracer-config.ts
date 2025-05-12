/**
 * Datadog Tracer Configuration
 * 
 * Configuration for APM tracing on the server side
 */

import { getDatadogConfig, validateEURegion } from './base-config';
import { TracerConfig } from '../interfaces/tracer';

/**
 * Get the tracer configuration for the current environment
 */
export function getTracerConfiguration(): TracerConfig {
  const config = getDatadogConfig();
  
  const site = process.env.DATADOG_SITE || 'datadoghq.eu';
  
  // Validate EU region
  validateEURegion(site);
  
  return {
    enabled: config.enabled,
    service: config.service,
    env: config.env,
    version: config.version,
    site,
    sampleRate: config.sampleRate,
    logInjection: true,
    profiling: config.profiling,
    debug: config.debugging,
  };
}

/**
 * Validates that all required environment variables are set for the tracer
 */
export function validateTracerEnvironmentVariables(): boolean {
  const missing: string[] = [];
  
  // DD_API_KEY is required for sending data to Datadog
  if (!process.env.DD_API_KEY) {
    missing.push('DD_API_KEY');
  }
  
  if (missing.length > 0) {
    console.warn(`Missing recommended environment variables for Datadog Tracer: ${missing.join(', ')}`);
    // Don't return false since it can still work locally without API key
  }
  
  return true;
}
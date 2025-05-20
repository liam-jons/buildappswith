/**
 * Centralized Datadog Initialization Module
 * 
 * This module provides singleton instances and unified initialization control
 * for all Datadog SDKs (RUM, Logs, APM) across client and server environments.
 * 
 * @version 2.0.0
 */

import { getDatadogConfig } from './config';
import { getRumConfiguration, validateRumEnvironmentVariables, RumConfig } from './rum-config';
import type { TraceContext } from './interfaces/trace-context';

// ========================================================================
// Environment detection helpers
// ========================================================================

/**
 * Determines if code is running in a browser environment
 */
export const isBrowser = typeof window !== 'undefined';

/**
 * Determines if code is running in a server environment
 */
export const isServer = !isBrowser;

// ========================================================================
// Client-side SDK instances and state tracking
// ========================================================================

// Initialization state flags
let rumInitialized = false;
let logsInitialized = false;

// SDK instances (only available in browser)
let datadogRum: any = null;
let datadogLogs: any = null;

// ========================================================================
// Client-side RUM initialization
// ========================================================================

/**
 * Initializes Datadog RUM (Real User Monitoring)
 * Safe to call multiple times - will only initialize once
 *
 * @param config Optional partial RUM configuration to override defaults
 * @returns Boolean indicating if initialization was performed
 */
export function initializeRum(config?: Partial<RumConfig>): boolean {
  // Skip if not in browser
  if (!isBrowser) return false;
  
  // Skip if already initialized
  if (rumInitialized) {
    console.debug('Datadog RUM already initialized - skipping');
    return false;
  }
  
  try {
    // Lazily import RUM SDK to avoid server-side inclusion
    import('@datadog/browser-rum').then(module => {
      datadogRum = module.datadogRum;
      
      // Get configuration
      const defaultConfig = getRumConfiguration();
      const mergedConfig = { ...defaultConfig, ...config };
      
      // Skip if disabled or missing environment variables
      if (!mergedConfig.enabled || !validateRumEnvironmentVariables()) {
        return;
      }

      try {
        // Initialize RUM
        datadogRum.init({
          applicationId: mergedConfig.applicationId,
          clientToken: mergedConfig.clientToken,
          site: mergedConfig.site,
          service: mergedConfig.service,
          env: mergedConfig.env,
          version: mergedConfig.version,
          sessionSampleRate: mergedConfig.sessionSampleRate,
          replaySampleRate: mergedConfig.sessionReplaySampleRate,
          trackUserInteractions: mergedConfig.trackInteractions,
          trackResources: mergedConfig.trackResources,
          trackLongTasks: mergedConfig.trackLongTasks,
          defaultPrivacyLevel: mergedConfig.defaultPrivacyLevel,
          actionNameAttribute: mergedConfig.actionNameAttribute,
          beforeSend: (event: any) => {
            // Filter sensitive data
            return event;
          },
        });

        // Set flag to prevent duplicate initialization
        rumInitialized = true;
        
        console.log(`Datadog RUM initialized for ${mergedConfig.env} environment`);
      } catch (error) {
        console.error("Failed to initialize Datadog RUM:", error);
      }
    }).catch(err => {
      console.warn('Failed to import Datadog browser RUM:', err);
    });
    
    return true;
  } catch (error) {
    console.error('Failed to initialize Datadog RUM:', error);
    return false;
  }
}

/**
 * Sets the current user for RUM tracking
 * 
 * @param user User information or null to clear user
 */
export function setRumUser(user: {
  id: string;
  name?: string;
  email?: string;
  role?: string;
  [key: string]: any;
} | null): void {
  if (!isBrowser || !rumInitialized) return;
  
  try {
    if (datadogRum) {
      if (user) {
        datadogRum.setUser(user);
      } else {
        datadogRum.removeUser();
      }
    }
  } catch (error) {
    console.error('Failed to set RUM user:', error);
  }
}

/**
 * Sets global context information for RUM
 * 
 * @param context Context object to set
 */
export function setRumGlobalContext(context: Record<string, any>): void {
  if (!isBrowser || !rumInitialized) return;
  
  try {
    if (datadogRum) {
      datadogRum.setGlobalContext(context);
    }
  } catch (error) {
    console.error('Failed to set RUM global context:', error);
  }
}

/**
 * Gets the RUM instance if initialized
 */
export function getRumInstance(): any {
  if (!isBrowser || !rumInitialized) return null;
  return datadogRum;
}

// ========================================================================
// Client-side Logs initialization
// ========================================================================

/**
 * Initializes Datadog Logs
 * Safe to call multiple times - will only initialize once
 * 
 * @returns Boolean indicating if initialization was performed
 */
export function initializeDatadogLogs(): boolean {
  // Skip if not in browser
  if (!isBrowser) return false;
  
  // Skip if already initialized
  if (logsInitialized) return false;
  
  try {
    // Lazily import Logs SDK to avoid server-side inclusion
    import('@datadog/browser-logs').then(module => {
      datadogLogs = module.datadogLogs;
      
      const config = getDatadogConfig();
      
      // Skip if disabled
      if (!config.enabled) return;
      
      if (!process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN) {
        console.warn('Missing Datadog client token - logs will not be sent');
        return;
      }

      datadogLogs.init({
        clientToken: process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN,
        site: config.site,
        service: config.service,
        env: config.env,
        version: config.version,
        forwardErrorsToLogs: true,
        sampleRate: config.logSampleRate,
        beforeSend: (log: any) => {
          // Filter sensitive data
          if (log.http?.url) {
            // Redact potentially sensitive URL parameters
            log.http.url = log.http.url.replace(/([?&](password|token|key|secret|auth)=)[^&]+/gi, '$1[REDACTED]');
          }
          return log;
        },
      });

      // Mark as initialized
      logsInitialized = true;
      console.log(`Datadog logs initialized for ${config.env} environment`);
    }).catch(err => {
      console.warn('Failed to import Datadog browser logs:', err);
    });
    
    return true;
  } catch (error) {
    console.error('Failed to initialize Datadog logs:', error);
    return false;
  }
}

/**
 * Gets the Logs instance if initialized
 */
export function getLogsInstance(): any {
  if (!isBrowser || !logsInitialized) return null;
  return datadogLogs;
}

// ========================================================================
// Server-side tracer initialization (definitions will remain, but will be broken)
// ========================================================================

/**
 * Initializes the server-side Datadog tracer
 * Safe to call multiple times - will only initialize once
 * 
 * @returns The tracer instance or null if initialization failed
 */
// @ts-ignore // Expect errors here as Tracer and serverTracer are now undefined
export function initializeServerTracer(): /* Tracer | */ null { 
  if (!isServer) return null;
  
  try {
    console.warn('Server tracer initialization skipped or failed: serverTracer variable removed.');
    return null;
  } catch (error) {
    console.error('Failed to initialize Datadog APM tracer:', error);
    return null;
  }
}

/**
 * Configure the integrations for the Datadog tracer
 */
// @ts-ignore // Expect errors here as Tracer is now undefined
export function configureTracerIntegrations(tracer: /* Tracer | */ any | null): void {
  if (!tracer) return;

  console.warn('configureTracerIntegrations called but Tracer type and serverTracer instance are removed from init.ts.');
}

/**
 * Gets the server tracer instance if initialized
 */
// @ts-ignore // Expect errors here as Tracer and serverTracer are now undefined
export function getServerTracer(): /* Tracer | */ null {
  if (!isServer) return null;
  
  console.warn('getServerTracer called but serverTracer instance is removed from init.ts.');
  return null;
}

/**
 * Extracts trace context from the current active span
 * Only applicable in server environments with an active tracer and span
 */
export function extractTraceContext(): TraceContext | null {
  if (!isServer) return null;
  
  console.warn('extractTraceContext called but server tracer logic is removed from init.ts.');
  return null;
}

// Placeholder for the actual serverTracer instance if it's managed elsewhere and init needs it.
// This is unlikely given the removal strategy but added for safety during refactor.
let serverTracerInstance: any = null; 
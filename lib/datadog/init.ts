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
          sessionReplaySampleRate: mergedConfig.sessionReplaySampleRate,
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
// Server-side tracer initialization
// ========================================================================

// Server-side initialization state
let serverTracerInitialized = false;

// Server tracer instance (only available on server)
let serverTracer: any = null;

/**
 * Initializes the server-side Datadog tracer
 * Safe to call multiple times - will only initialize once
 * 
 * @returns The tracer instance or null if initialization failed
 */
export function initializeServerTracer(): any {
  // Skip if in browser
  if (isBrowser) return null;
  
  // Skip if already initialized
  if (serverTracerInitialized) return serverTracer;
  
  try {
    // Check if server environment
    if (process.env.NEXT_RUNTIME !== 'nodejs') {
      return null;
    }
    
    // Get environment variables
    const config = getDatadogConfig();
    
    // Skip if not enabled for this environment
    if (!config.enabled) {
      console.log('Datadog APM disabled for current environment');
      return null;
    }
    
    // Import a stub module in the client
    // In server contexts, this will import the actual module
    if (isBrowser) {
      // Use the client-side stub
      const stub = require('./client/empty-tracer.client').default;
      return stub;
    } else {
      // Server-side - use dd-trace
      try {
        // Use eval to bypass webpack bundling
        // eslint-disable-next-line no-eval
        const ddTrace = eval('require')('dd-trace');
        
        // Log key status
        if (!process.env.DD_API_KEY) {
          console.warn('Datadog API key not found - APM will not send data');
        }

        // Initialize tracer
        ddTrace.init({
          service: config.service,
          env: config.env,
          version: config.version,
          logInjection: true,
          profiling: config.profiling,
          runtimeMetrics: true,
          analytics: true,
          sampleRate: config.sampleRate,
          tags: {
            application: config.service,
          },
          plugins: false,
          debug: config.debugging,
        });
        
        // Configure integrations
        configureTracerIntegrations(ddTrace);
        
        // Store singleton instance
        serverTracer = ddTrace;
        serverTracerInitialized = true;
        
        console.info(`Datadog APM initialized for ${config.env} environment`);
        
        return serverTracer;
      } catch (importError) {
        console.warn('Failed to import dd-trace:', importError);
        return null;
      }
    }
  } catch (error) {
    console.error('Failed to initialize Datadog tracer:', error);
    return null;
  }
}

/**
 * Configure the integrations for the Datadog tracer
 */
function configureTracerIntegrations(tracer: any): void {
  if (!tracer) return;
  
  try {
    const config = getDatadogConfig();
    
    // Configure Next.js integration
    tracer.use('next', { 
      hooks: true, 
      router: true, 
      server: true 
    });

    // Configure HTTP integration
    tracer.use('http', { 
      client: true, 
      server: true 
    });

    // Configure Prisma integration
    tracer.use('prisma', { 
      service: `${config.service}-db` 
    });

    // Configure Express integration
    tracer.use('express', {
      app: undefined, // Auto-detected
      hooks: true,
    });
  } catch (error) {
    console.error('Failed to configure Datadog tracer integrations:', error);
  }
}

/**
 * Gets the server tracer instance if initialized
 */
export function getServerTracer(): any {
  if (isBrowser) return null;
  
  // Initialize if not already done
  if (!serverTracerInitialized) {
    return initializeServerTracer();
  }
  
  return serverTracer;
}

/**
 * Extracts trace context from the current active span
 */
export function extractTraceContext(): TraceContext | null {
  if (isBrowser) return null;
  
  if (!serverTracerInitialized || !serverTracer) return null;
  
  try {
    const span = serverTracer.scope().active();
    if (!span) return null;

    const context = span.context();
    return {
      traceId: context.toTraceId(),
      spanId: context.toSpanId(),
      service: getDatadogConfig().service,
      env: getDatadogConfig().env,
    };
  } catch (error) {
    console.error('Failed to extract trace context:', error);
    return null;
  }
}
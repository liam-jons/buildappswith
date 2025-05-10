/**
 * Datadog Tracer Configuration
 * 
 * Central configuration for Datadog APM tracing
 */

import { tracer } from 'dd-trace';
import { getDatadogConfig, getTransactionSampleRate } from './config';

/**
 * Initializes the Datadog tracer for APM
 */
export function initializeDatadogTracer(): void {
  try {
    // Get configuration based on environment
    const config = getDatadogConfig();

    // Only initialize if enabled for this environment
    if (!config.enabled) {
      console.log('Datadog APM disabled for current environment');
      return;
    }
    
    if (!process.env.DD_API_KEY) {
      console.warn('Datadog API key not found - APM will not send data');
    }

    // Initialize Datadog APM tracer
    tracer.init({
      service: config.service,
      env: config.env,
      version: config.version,
      logInjection: true,
      profiling: config.profiling,
      runtimeMetrics: true,
      analytics: true,
      sampleRate: config.sampleRate,
      // Additional configurations
      tags: {
        application: 'buildappswith-platform',
      },
      plugins: false, // We will manually configure plugins
      debug: config.debugging,
      logger: {
        debug: (message: string) => {
          if (config.debugging) {
            console.debug(`[Datadog APM Debug] ${message}`);
          }
        },
        info: (message: string) => console.info(`[Datadog APM] ${message}`),
        error: (message: string) => console.error(`[Datadog APM Error] ${message}`),
      },
    });

    // Configure integrations
    configureTracerIntegrations();
    
    console.info(`Datadog APM initialized for ${config.env} environment`);
  } catch (error) {
    console.error('Failed to initialize Datadog tracer:', error);
  }
}

/**
 * Configures the Datadog tracer integrations
 */
function configureTracerIntegrations(): void {
  try {
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
      service: `${getDatadogConfig().service}-db` 
    });

    // Configure Express integration (if used by Next.js API routes)
    tracer.use('express', {
      app: undefined, // This will be automatically detected
      hooks: true,
    });

    // Configure GraphQL integration (if used)
    // tracer.use('graphql', {
    //   depth: 2 // Control the depth of field resolution
    // });
  } catch (error) {
    console.error('Failed to configure Datadog tracer integrations:', error);
  }
}

/**
 * Creates a new span with the given name and options
 * Provides a more consistent API for creating spans
 */
export function createSpan(
  name: string, 
  options: { 
    service?: string; 
    resource?: string; 
    type?: string;
    tags?: Record<string, any>;
  } = {}
): any {
  try {
    const config = getDatadogConfig();
    if (!config.enabled) return null;

    const span = tracer.startSpan(name, {
      childOf: tracer.scope().active(),
      tags: {
        service: options.service || config.service,
        resource: options.resource || name,
        type: options.type || 'custom',
        ...options.tags,
      },
    });

    return span;
  } catch (error) {
    console.error(`Failed to create span ${name}:`, error);
    return null;
  }
}

/**
 * Wraps a function with a Datadog span
 * @param name The name of the span
 * @param fn The function to wrap
 * @param options Additional options for the span
 * @returns The wrapped function
 */
export function withSpan<T, Args extends any[]>(
  name: string,
  fn: (...args: Args) => Promise<T> | T,
  options: {
    service?: string;
    resource?: string;
    type?: string;
    tags?: Record<string, any>;
  } = {}
): (...args: Args) => Promise<T> {
  return async (...args: Args): Promise<T> => {
    const span = createSpan(name, options);
    
    try {
      if (!span) {
        return await fn(...args);
      }
      
      // Set span as active to capture nested operations
      return await tracer.scope().activate(span, async () => {
        const result = await fn(...args);
        return result;
      });
    } catch (error) {
      if (span) {
        span.setTag('error', error);
      }
      throw error;
    } finally {
      if (span) {
        span.finish();
      }
    }
  };
}

// Export the tracer for direct access
export { tracer };
/**
 * Datadog Tracer Server Implementation
 * 
 * Server-side implementation of the Tracer interface.
 * Uses dd-trace for Node.js APM functionality.
 */

import { TracerInterface, TracerConfig, Span } from '../interfaces/tracer';
import { TraceContext } from '../interfaces/trace-context';
import { validateTracerEnvironmentVariables } from '../config/tracer-config';

// Singleton state
let tracerInitialized = false;
let serverTracer: any = null;

/**
 * Server-side implementation of the Tracer interface
 */
export const tracer: TracerInterface = {
  /**
   * Initialize the server-side tracer
   */
  init(config: TracerConfig): any {
    // Skip if already initialized
    if (tracerInitialized) return serverTracer;

    try {
      // Validate EU region
      if (config.site !== 'datadoghq.eu') {
        console.warn('Warning: Datadog tracer not configured for EU region (datadoghq.eu)');
      }

      // Skip if disabled
      if (!config.enabled) {
        console.log('Datadog APM disabled for current environment');
        return null;
      }

      // Validate environment variables
      validateTracerEnvironmentVariables();

      // Only proceed in server environment
      if (typeof window !== 'undefined') {
        return null;
      }

      // Use conditional require to prevent webpack from bundling
      try {
        // Dynamic import doesn't work well with dd-trace, use conditional require
        const ddTrace: typeof import('dd-trace') = typeof window === 'undefined' ? require('dd-trace') : null;
        if (!ddTrace) return null;

        // Initialize tracer
        ddTrace.init({
          service: config.service,
          env: config.env,
          version: config.version,
          logInjection: config.logInjection,
          profiling: config.profiling,
          runtimeMetrics: true,
          analytics: true,
          sampleRate: config.sampleRate,
          tags: {
            application: config.service,
          },
          plugins: false,
          debug: config.debug,
          logger: { 
            debug: (message: string) => { 
              if(config.debug) console.debug(`[Datadog ServerTracer Debug] ${message}`);
            },
            info: (message: string) => { 
              console.info(`[Datadog ServerTracer Info] ${message}`);
            },
            error: (err: string | Error) => { 
              const message = err instanceof Error ? err.message : err;
              console.error(`[Datadog ServerTracer Error] ${message}`);
            },
            warn: (message: string) => { 
              console.warn(`[Datadog ServerTracer Warn] ${message}`);
            }
          }
        });
        
        // Configure integrations
        this.configureTracerIntegrations(ddTrace);
        
        // Store singleton instance
        serverTracer = ddTrace;
        tracerInitialized = true;
        
        console.info(`Datadog APM initialized for ${config.env} environment`);
        
        return serverTracer;
      } catch (importError) {
        console.warn('Failed to import dd-trace:', importError);
        return null;
      }
    } catch (error) {
      console.error('Failed to initialize Datadog tracer:', error);
      return null;
    }
  },

  /**
   * Get the initialized tracer instance
   */
  getInstance(): any {
    return serverTracer;
  },

  /**
   * Get the active scope
   */
  scope() {
    if (!tracerInitialized || !serverTracer) {
      return {
        active: () => null
      };
    }

    return {
      active: () => {
        try {
          return serverTracer.scope().active();
        } catch (error) {
          console.error('Failed to get active scope:', error);
          return null;
        }
      }
    };
  },

  /**
   * Start a new span
   */
  startSpan(name: string, options?: any): Span | null {
    if (!tracerInitialized || !serverTracer?.tracer) return null;

    const activeSpan = this.scope()?.active() || undefined;

    try {
      const span = serverTracer.tracer.startSpan(name, {
        childOf: activeSpan,
        tags: {
          service: options?.service || serverTracer.tracer.config.service,
        }
      });
      return span;
    } catch (error) {
      console.error('Failed to start span:', error);
      return {
        context: () => ({ toTraceId: () => '0', toSpanId: () => '0' }),
        finish: () => {},
        addTags: () => {}
      };
    }
  },

  /**
   * Inject span context into a carrier
   */
  inject(spanContext: any, format: string, carrier: any): void {
    if (!tracerInitialized || !serverTracer) return;

    try {
      serverTracer.inject(spanContext, format, carrier);
    } catch (error) {
      console.error('Failed to inject span context:', error);
    }
  },

  /**
   * Extract span context from a carrier
   */
  extract(format: string, carrier: any): any {
    if (!tracerInitialized || !serverTracer) return null;

    try {
      return serverTracer.extract(format, carrier);
    } catch (error) {
      console.error('Failed to extract span context:', error);
      return null;
    }
  },

  /**
   * Extract the current trace context
   */
  extractTraceContext(): TraceContext | null {
    if (!tracerInitialized || !serverTracer) return null;
    
    try {
      const span = this.scope().active();
      if (!span) return null;

      const context = span.context();
      return {
        traceId: context.toTraceId(),
        spanId: context.toSpanId(),
        service: process.env.DD_SERVICE || 'buildappswith-platform',
        env: process.env.NODE_ENV || 'development',
      };
    } catch (error) {
      console.error('Failed to extract trace context:', error);
      return null;
    }
  },

  /**
   * Configure the integrations for the Datadog tracer
   * Private helper method
   */
  configureTracerIntegrations(tracerInstance: typeof import('dd-trace')): void {
    if (!tracerInstance) return;
    
    try {
      // Configure Next.js integration
      tracerInstance.use('next', { 
        hooks: {}, 
        router: true, 
        server: true 
      });

      // Configure HTTP integration
      tracerInstance.use('http', { 
        client: true, 
        server: true 
      });

      // Configure Prisma integration
      tracerInstance.use('prisma' as any, { 
        service: `${tracerInstance.tracer.config.service}-db` 
      });

      // Configure Express integration
      tracerInstance.use('express', {
        app: undefined, // Auto-detected
        hooks: {}, // Corrected hooks
      });
    } catch (error) {
      console.error('Failed to configure Datadog tracer integrations:', error);
    }
  }
};
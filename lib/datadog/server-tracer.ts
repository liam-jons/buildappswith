/**
 * Server-only implementation of Datadog tracer
 * This file should only be imported on the server side
 *
 * NOTE: Do not use 'use server' directive here as this is not a React Server Action
 */

// Only import these in server environment
let ddTrace;
let tracer;
let authSpans = new Map();

if (typeof process !== 'undefined') {
  try {
    ddTrace = require('dd-trace');
    tracer = ddTrace.tracer;
  } catch (error) {
    console.error('Failed to import dd-trace in server environment:', error);
  }
}

/**
 * Initializes the Datadog tracer with the specified configuration
 * Only runs on the server
 */
export function initializeServerTracer() {
  // Skip if not in server environment
  if (typeof window !== 'undefined' || !ddTrace) {
    console.log('Skipping Datadog tracer initialization - not in server environment');
    return;
  }

  try {
    // Check if server environment
    if (process.env.NEXT_RUNTIME !== 'nodejs') {
      console.log('Skipping Datadog tracer initialization - not in Node.js runtime');
      return;
    }
    
    // Get environment variables
    const enabled = process.env.DATADOG_ENABLE_DEV === 'true' 
      || process.env.NODE_ENV === 'production'
      || process.env.NODE_ENV === 'staging';
    
    // Skip if not enabled for this environment
    if (!enabled) {
      console.log('Datadog APM disabled for current environment');
      return;
    }
    
    // Log key status
    if (!process.env.DD_API_KEY) {
      console.warn('Datadog API key not found - APM will not send data');
    }

    // Get app version
    const version = process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0';
    const env = process.env.NODE_ENV || 'development';
    
    // Initialize tracer
    ddTrace.init({
      service: 'buildappswith-platform',
      env,
      version,
      logInjection: true,
      profiling: true,
      runtimeMetrics: true,
      analytics: true,
      tags: {
        application: 'buildappswith-platform',
      },
      plugins: false,
      debug: env === 'development',
    });
    
    // Configure integrations for common modules
    configureTracerIntegrations();
    
    console.info(`Datadog APM initialized for ${env} environment`);
  } catch (error) {
    console.error('Failed to initialize Datadog tracer:', error);
  }
}

/**
 * Configure the integrations for the Datadog tracer
 */
function configureTracerIntegrations() {
  if (!ddTrace) return;
  
  try {
    // Configure Next.js integration
    ddTrace.use('next', { 
      hooks: true, 
      router: true, 
      server: true 
    });

    // Configure HTTP integration
    ddTrace.use('http', { 
      client: true, 
      server: true 
    });

    // Configure Prisma integration
    ddTrace.use('prisma', { 
      service: 'buildappswith-db' 
    });

    // Configure Express integration
    ddTrace.use('express', {
      app: undefined, // Auto-detected
      hooks: true,
    });
  } catch (error) {
    console.error('Failed to configure Datadog tracer integrations:', error);
  }
}

/**
 * Simplified function to extract trace context
 */
export function extractServerTraceContext() {
  if (!tracer || typeof window !== 'undefined') {
    return null;
  }
  
  try {
    const span = tracer.scope().active();
    if (!span) return null;

    const context = span.context();
    return {
      traceId: context.toTraceId(),
      spanId: context.toSpanId(),
      service: 'buildappswith-platform',
      env: process.env.NODE_ENV || 'development',
    };
  } catch (error) {
    console.error('Failed to extract trace context:', error);
    return null;
  }
}

/**
 * Start a new auth span for tracking authentication performance
 *
 * @param path The request path
 * @param method The HTTP method
 * @param type The auth type (e.g., 'basic', 'role', 'permission')
 * @param userId Optional user ID
 * @returns A unique ID for the span
 */
export function startAuthSpan(path: string, method: string, type: string, userId?: string) {
  if (!tracer || typeof window !== 'undefined') {
    return null;
  }

  try {
    // Generate a unique ID for this span
    const spanId = `${method}-${path}-${Date.now()}`;

    // Start a new span
    const span = tracer.startSpan('auth.verify', {
      tags: {
        'resource.name': `${method} ${path}`,
        'span.type': 'web',
        'auth.type': type,
        ...(userId && { 'user.id': userId }),
      },
    });

    // Store the span
    authSpans.set(spanId, {
      span,
      startTime: performance.now(),
      path,
      method,
      type,
      userId,
    });

    return spanId;
  } catch (error) {
    console.error('Failed to start auth span:', error);
    return null;
  }
}

/**
 * Finish an auth span and record performance metrics
 *
 * @param spanId The ID returned from startAuthSpan
 * @param success Whether authentication was successful
 * @param error Optional error message
 */
export function finishAuthSpan(spanId: string, success: boolean, error?: string) {
  if (!tracer || typeof window !== 'undefined' || !spanId) {
    return;
  }

  try {
    // Retrieve the span
    const spanData = authSpans.get(spanId);
    if (!spanData) {
      return;
    }

    const { span, startTime, path, method, type, userId } = spanData;

    // Calculate duration
    const duration = performance.now() - startTime;

    // Add completion tags
    span.addTags({
      'auth.duration': duration.toFixed(2),
      'auth.success': success,
      ...(error && { 'error.msg': error, 'error': true }),
      ...(userId && { 'user.id': userId }),
    });

    // Finish the span
    span.finish();

    // Remove the span from the map
    authSpans.delete(spanId);
  } catch (error) {
    console.error('Failed to finish auth span:', error);
  }
}

/**
 * Exports for server usage
 */
export { tracer };
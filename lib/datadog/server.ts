/**
 * Server-side Datadog integration
 * Only for use in Node.js environment
 */

// Environment detection helpers (safe for any environment)
export const isBrowser = typeof window !== 'undefined';
export const isServer = !isBrowser;

// Export server-specific modules
export * from './server/tracer.server';
export * from './server/trace-context.server';

// Export shared types and interfaces
export * from './interfaces';

// Export server-specific initialization functions
export {
  initializeServerTracer,
  getServerTracer,
  extractTraceContext
} from './init';

// Export configuration (safe to use on server)
export * from './config';

// Export server-specific monitoring utilities
export {
  startAuthSpan,
  finishAuthSpan
} from './server-tracer';

// Export context propagation utilities for server
export {
  injectTraceContextIntoHeaders,
  extractTraceContextFromHeaders
} from './context-propagation';
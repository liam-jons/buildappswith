/**
 * Datadog Server-side Implementation
 * 
 * Exports for all server-side (Node.js) implementations.
 * These implementations are specifically designed to work in Node.js environments.
 */

// Export server implementations
export * from './tracer.server';
export * from './empty-rum.server';
export * from './empty-logs.server';
export * from './trace-context.server';

/**
 * Environment detection constants
 */
export const isBrowser = typeof window !== 'undefined';
export const isServer = !isBrowser;
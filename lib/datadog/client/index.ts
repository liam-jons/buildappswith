/**
 * Datadog Client-side Implementation
 * 
 * Exports for all client-side (browser) implementations.
 * These implementations are specifically designed to work in browser environments.
 */

// Export client implementations
export * from './rum.client';
export * from './logs.client';
export * from './empty-tracer.client';
export * from './trace-context.client';

/**
 * Environment detection constants
 */
export const isBrowser = typeof window !== 'undefined';
export const isServer = !isBrowser;
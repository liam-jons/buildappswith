/**
 * Client-side Datadog integration
 * Only includes browser-safe code
 */

// Re-export client-specific modules
export * from './client/rum.client';
export * from './client/logs.client';
export * from './client/trace-context.client';

// Export shared types and interfaces
export * from './interfaces';

// Export client-specific configuration
export * from './rum-config';

// Environment detection helpers (safe for any environment)
export const isBrowser = typeof window !== 'undefined';
export const isServer = !isBrowser;

// Client-specific initialization functions from init.ts
export { 
  initializeRum,
  setRumUser,
  setRumGlobalContext,
  getRumInstance,
  initializeDatadogLogs,
  getLogsInstance
} from './init';
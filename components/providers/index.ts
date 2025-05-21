/**
 * providers components barrel export file
 * Version: 2.0.0
 * Updated to use named exports consistently
 */

// Export components with named exports to match actual implementations
export { Providers as providers } from './providers';
export { ClerkProvider } from './clerk-provider';
export { DatadogRumProvider, retrieveTraceContext, storeTraceContext } from './datadog-rum-provider';

// Re-export Providers with its actual name as well
export { Providers } from './providers';
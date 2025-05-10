/**
 * Sentry integration index file
 * Central export point for all Sentry-related utilities
 * @version 1.0.0
 */

// Re-export from config
export { sentryConfig, getInitializationConfig } from './config';

// Re-export from error classification
export {
  ErrorSeverity,
  ErrorCategory,
  type ErrorSource,
  type UserImpactLevel,
  type ErrorMetadata,
  handleError,
  reportError,
  createDomainErrorHandler,
  errorMetadataFactory,
} from './error-classification';

// Re-export from sensitive data filter
export { default as configureSentryDataFiltering } from './sensitive-data-filter';

// Re-export from performance monitoring
export {
  configureSentryPerformance,
  createTransaction,
  monitorPerformance,
  createSpan,
  measureComponentPerformance,
  useMeasureComponent,
  monitorServerOperation,
  addServerTimingHeaders,
} from './performance';

// Re-export from user context
export {
  configureSentryUserContext,
  useSentryUser,
  configureSentryUserContextFromRequest,
} from './user-context';
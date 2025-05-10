/**
 * Error classification system for Sentry integration
 * Provides structured approach to categorize and prioritize errors
 * @version 1.0.0
 */

import * as Sentry from '@sentry/nextjs';

// Define Sentry severity enum since it might not be exported directly
export enum SentrySeverity {
  Fatal = 'fatal',
  Error = 'error',
  Warning = 'warning',
  Info = 'info',
  Debug = 'debug',
}

/**
 * Error severity levels for classification
 */
export enum ErrorSeverity {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

/**
 * Error categories for classification
 */
export enum ErrorCategory {
  SYSTEM = 'system',    // System-level errors (infra, runtime, etc.)
  BUSINESS = 'business', // Business logic errors
  USER = 'user',        // User-triggered errors (invalid input, etc.)
  INTEGRATION = 'integration', // Third-party integration errors
}

/**
 * Error source identification
 */
export type ErrorSource = 'client' | 'server' | 'edge' | 'external';

/**
 * User impact assessment
 */
export type UserImpactLevel = 'blocking' | 'degraded' | 'minimal' | 'none';

/**
 * Comprehensive error metadata structure
 */
export interface ErrorMetadata {
  // Primary classification
  severity: ErrorSeverity;
  category: ErrorCategory;

  // Source identification
  source: ErrorSource;
  component: string; // e.g., "payment", "auth", "booking"

  // Impact assessment
  userImpact: UserImpactLevel;
  affectedFeature: string;

  // Operational data
  isRecoverable: boolean;
  retryable: boolean;
}

/**
 * Default metadata for errors
 */
const defaultMetadata: Partial<ErrorMetadata> = {
  severity: ErrorSeverity.MEDIUM,
  category: ErrorCategory.SYSTEM,
  source: 'server',
  component: 'unknown',
  userImpact: 'minimal',
  affectedFeature: 'unknown',
  isRecoverable: true,
  retryable: false,
};

/**
 * Maps error severity to Sentry severity levels
 */
function mapToSentrySeverity(severity: ErrorSeverity): SentrySeverity {
  switch (severity) {
    case ErrorSeverity.CRITICAL:
      return SentrySeverity.Fatal;
    case ErrorSeverity.HIGH:
      return SentrySeverity.Error;
    case ErrorSeverity.MEDIUM:
      return SentrySeverity.Warning;
    case ErrorSeverity.LOW:
      return SentrySeverity.Info;
    default:
      return SentrySeverity.Error;
  }
}

/**
 * Comprehensive error handling with Sentry integration and classification
 * 
 * @param error The error object to handle
 * @param message Optional message to describe the error
 * @param metadata Optional metadata for error classification
 * @returns The Sentry event ID for reference
 */
export function handleError(
  error: Error,
  message?: string,
  metadata: Partial<ErrorMetadata> = {}
): string {
  // Merge with default metadata
  const errorMetadata: ErrorMetadata = {
    ...defaultMetadata,
    ...metadata,
  } as ErrorMetadata;

  return Sentry.withScope((scope) => {
    // Set error metadata as tags
    scope.setTag('error.severity', errorMetadata.severity);
    scope.setTag('error.category', errorMetadata.category);
    scope.setTag('error.source', errorMetadata.source);
    scope.setTag('error.component', errorMetadata.component);
    scope.setTag('error.userImpact', errorMetadata.userImpact);
    scope.setTag('error.affectedFeature', errorMetadata.affectedFeature);
    scope.setTag('error.isRecoverable', String(errorMetadata.isRecoverable));
    scope.setTag('error.retryable', String(errorMetadata.retryable));

    // Set error metadata as context for more detailed info
    scope.setContext('errorMetadata', errorMetadata);

    // Map severity for proper Sentry categorization
    scope.setLevel(mapToSentrySeverity(errorMetadata.severity));

    // For business critical errors, prioritize in Sentry
    if (
      errorMetadata.severity === ErrorSeverity.CRITICAL ||
      errorMetadata.userImpact === 'blocking' ||
      errorMetadata.category === ErrorCategory.BUSINESS
    ) {
      scope.setTag('priority', 'high');
    }

    // Capture the error with optional message
    if (message) {
      error.message = `${message}: ${error.message}`;
    }

    return Sentry.captureException(error);
  });
}

/**
 * Capture non-exception errors with classified metadata
 * 
 * @param message Error message to capture
 * @param metadata Optional metadata for classification
 * @returns The Sentry event ID for reference
 */
export function reportError(
  message: string,
  metadata: Partial<ErrorMetadata> = {}
): string {
  // Merge with default metadata
  const errorMetadata: ErrorMetadata = {
    ...defaultMetadata,
    ...metadata,
  } as ErrorMetadata;

  return Sentry.withScope((scope) => {
    // Set error metadata as tags
    scope.setTag('error.severity', errorMetadata.severity);
    scope.setTag('error.category', errorMetadata.category);
    scope.setTag('error.source', errorMetadata.source);
    scope.setTag('error.component', errorMetadata.component);
    scope.setTag('error.userImpact', errorMetadata.userImpact);
    scope.setTag('error.affectedFeature', errorMetadata.affectedFeature);
    scope.setTag('error.isRecoverable', String(errorMetadata.isRecoverable));
    scope.setTag('error.retryable', String(errorMetadata.retryable));

    // Set error metadata as context for more detailed info
    scope.setContext('errorMetadata', errorMetadata);

    // Map severity for proper Sentry categorization
    scope.setLevel(mapToSentrySeverity(errorMetadata.severity));

    // Capture the message
    return Sentry.captureMessage(message, mapToSentrySeverity(errorMetadata.severity));
  });
}

/**
 * Utility function to create domain-specific error handlers
 * 
 * @param component The component/domain name
 * @param defaultMetadata Default metadata for this domain
 * @returns Domain-specific error handler functions
 */
export function createDomainErrorHandler(
  component: string,
  defaultMetadata: Partial<ErrorMetadata> = {}
) {
  return {
    handleError: (
      error: Error,
      message?: string,
      metadata: Partial<ErrorMetadata> = {}
    ): string => {
      return handleError(error, message, {
        component,
        ...defaultMetadata,
        ...metadata,
      });
    },

    reportError: (
      message: string,
      metadata: Partial<ErrorMetadata> = {}
    ): string => {
      return reportError(message, {
        component,
        ...defaultMetadata,
        ...metadata,
      });
    },
  };
}

/**
 * Helper for creating common error metadata for specific scenarios
 */
export const errorMetadataFactory = {
  // Authentication related errors
  auth: {
    loginFailure: (): Partial<ErrorMetadata> => ({
      category: ErrorCategory.USER,
      component: 'auth',
      affectedFeature: 'login',
      userImpact: 'blocking',
      severity: ErrorSeverity.HIGH,
      source: 'client',
      isRecoverable: true,
      retryable: true,
    }),
    
    sessionExpired: (): Partial<ErrorMetadata> => ({
      category: ErrorCategory.SYSTEM,
      component: 'auth',
      affectedFeature: 'session',
      userImpact: 'blocking',
      severity: ErrorSeverity.MEDIUM,
      isRecoverable: true,
      retryable: false,
    }),
  },

  // Payment related errors
  payment: {
    processingFailure: (): Partial<ErrorMetadata> => ({
      category: ErrorCategory.BUSINESS,
      component: 'payment',
      affectedFeature: 'checkout',
      userImpact: 'blocking',
      severity: ErrorSeverity.CRITICAL,
      isRecoverable: true,
      retryable: true,
    }),
    
    stripeError: (): Partial<ErrorMetadata> => ({
      category: ErrorCategory.INTEGRATION,
      component: 'payment',
      affectedFeature: 'stripe',
      userImpact: 'blocking',
      severity: ErrorSeverity.HIGH,
      source: 'server',
      isRecoverable: true,
      retryable: true,
    }),
  },

  // Booking related errors
  booking: {
    availabilityError: (): Partial<ErrorMetadata> => ({
      category: ErrorCategory.SYSTEM,
      component: 'booking',
      affectedFeature: 'availability',
      userImpact: 'degraded',
      severity: ErrorSeverity.MEDIUM,
      isRecoverable: true,
      retryable: true,
    }),
    
    conflictError: (): Partial<ErrorMetadata> => ({
      category: ErrorCategory.BUSINESS,
      component: 'booking',
      affectedFeature: 'scheduling',
      userImpact: 'blocking',
      severity: ErrorSeverity.HIGH,
      isRecoverable: true,
      retryable: false,
    }),
  },

  // API related errors
  api: {
    rateLimitExceeded: (): Partial<ErrorMetadata> => ({
      category: ErrorCategory.USER,
      component: 'api',
      affectedFeature: 'rate-limiting',
      userImpact: 'degraded',
      severity: ErrorSeverity.LOW,
      isRecoverable: true,
      retryable: false,
    }),
    
    validationError: (): Partial<ErrorMetadata> => ({
      category: ErrorCategory.USER,
      component: 'api',
      affectedFeature: 'validation',
      userImpact: 'minimal',
      severity: ErrorSeverity.LOW,
      isRecoverable: true,
      retryable: true,
    }),
  },

  // Database related errors
  db: {
    connectionError: (): Partial<ErrorMetadata> => ({
      category: ErrorCategory.SYSTEM,
      component: 'database',
      affectedFeature: 'connectivity',
      userImpact: 'blocking',
      severity: ErrorSeverity.CRITICAL,
      source: 'server',
      isRecoverable: false,
      retryable: true,
    }),
    
    queryError: (): Partial<ErrorMetadata> => ({
      category: ErrorCategory.SYSTEM,
      component: 'database',
      affectedFeature: 'data-access',
      userImpact: 'degraded',
      severity: ErrorSeverity.HIGH,
      source: 'server',
      isRecoverable: true,
      retryable: true,
    }),
  },
};
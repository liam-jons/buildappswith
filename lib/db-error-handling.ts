/**
 * Database Error Handling Utilities
 * @module lib/db-error-handling
 * 
 * Provides standardized error handling for database operations
 * with classification, logging, and recovery mechanisms.
 */

import { Prisma } from '@prisma/client';
import * as Sentry from '@sentry/nextjs';
import { createDomainLogger } from './logger';
import { DatabaseOperationError } from './db';

// Create a database-specific logger
const dbErrorLogger = createDomainLogger('database-errors');

/**
 * Error categories for database operations
 */
export enum DatabaseErrorCategory {
  CONNECTION = 'connection',
  VALIDATION = 'validation',
  CONSTRAINT = 'constraint',
  TIMEOUT = 'timeout',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  UNKNOWN = 'unknown',
}

/**
 * Database error severity levels
 */
export enum DatabaseErrorSeverity {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

/**
 * Type for metadata associated with database errors
 */
export interface DatabaseErrorMetadata {
  operation: string;
  model?: string;
  args?: any;
  target?: string;
  category: DatabaseErrorCategory;
  severity: DatabaseErrorSeverity;
  retryable: boolean;
  userImpact: string;
  affectedFeature?: string;
}

/**
 * Classifies a Prisma error into a specific category
 * @param error The error to classify
 * @returns Database error category
 */
export function classifyPrismaError(error: Error): DatabaseErrorCategory {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const code = error.code;
    
    // Connection issues
    if (['P1001', 'P1002', 'P1003', 'P1008', 'P1011', 'P1017'].includes(code)) {
      return DatabaseErrorCategory.CONNECTION;
    }
    
    // Validation errors
    if (['P2000', 'P2001', 'P2002', 'P2003', 'P2004', 'P2005', 'P2006', 'P2007', 'P2008', 'P2009', 'P2010', 'P2011', 'P2012', 'P2013', 'P2014', 'P2015', 'P2016', 'P2017', 'P2018', 'P2019', 'P2020', 'P2021', 'P2022', 'P2023', 'P2024', 'P2025', 'P2026', 'P2027', 'P2030', 'P2033'].includes(code)) {
      return DatabaseErrorCategory.VALIDATION;
    }
    
    // Constraint violations
    if (['P2002', 'P2003', 'P2004'].includes(code)) {
      return DatabaseErrorCategory.CONSTRAINT;
    }
    
    // Authentication errors
    if (['P1010', 'P1017'].includes(code)) {
      return DatabaseErrorCategory.AUTHENTICATION;
    }
    
    // Timeout errors
    if (['P1009'].includes(code)) {
      return DatabaseErrorCategory.TIMEOUT;
    }
  } else if (error instanceof Prisma.PrismaClientInitializationError) {
    return DatabaseErrorCategory.CONNECTION;
  } else if (error instanceof Prisma.PrismaClientRustPanicError) {
    return DatabaseErrorCategory.CRITICAL;
  } else if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    // Attempt to parse the error message for timeout indicators
    if (error.message.toLowerCase().includes('timeout')) {
      return DatabaseErrorCategory.TIMEOUT;
    }
  }
  
  return DatabaseErrorCategory.UNKNOWN;
}

/**
 * Determines if an error is retryable based on its category
 * @param category The error category
 * @returns True if the error is potentially retryable
 */
export function isRetryableError(category: DatabaseErrorCategory): boolean {
  return [
    DatabaseErrorCategory.CONNECTION,
    DatabaseErrorCategory.TIMEOUT,
  ].includes(category);
}

/**
 * Maps error category to a severity level
 * @param category The error category
 * @returns The severity level
 */
export function mapCategoryToSeverity(category: DatabaseErrorCategory): DatabaseErrorSeverity {
  switch (category) {
    case DatabaseErrorCategory.CONNECTION:
    case DatabaseErrorCategory.AUTHENTICATION:
      return DatabaseErrorSeverity.CRITICAL;
    
    case DatabaseErrorCategory.CONSTRAINT:
    case DatabaseErrorCategory.VALIDATION:
      return DatabaseErrorSeverity.MEDIUM;
    
    case DatabaseErrorCategory.TIMEOUT:
      return DatabaseErrorSeverity.HIGH;
    
    case DatabaseErrorCategory.AUTHORIZATION:
      return DatabaseErrorSeverity.HIGH;
    
    case DatabaseErrorCategory.UNKNOWN:
    default:
      return DatabaseErrorSeverity.HIGH;
  }
}

/**
 * Creates error metadata from a Prisma error
 * @param error The Prisma error
 * @param operation The database operation being performed
 * @param model Optional model name involved in the operation
 * @param args Optional operation arguments
 * @returns Error metadata object
 */
export function createErrorMetadata(
  error: Error,
  operation: string,
  model?: string,
  args?: any
): DatabaseErrorMetadata {
  const category = classifyPrismaError(error);
  const severity = mapCategoryToSeverity(category);
  const retryable = isRetryableError(category);
  
  let target: string | undefined;
  let userImpact = 'User may experience degraded functionality';
  
  // Extract more details from Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    target = error.meta?.target as string[] || undefined;
  }
  
  // Determine user impact based on severity
  switch (severity) {
    case DatabaseErrorSeverity.CRITICAL:
      userImpact = 'Service is unavailable or severely degraded';
      break;
    case DatabaseErrorSeverity.HIGH:
      userImpact = 'Important feature is unavailable';
      break;
    case DatabaseErrorSeverity.MEDIUM:
      userImpact = 'Feature is working with limitations';
      break;
    case DatabaseErrorSeverity.LOW:
      userImpact = 'Minimal or no impact on user experience';
      break;
  }
  
  return {
    operation,
    model,
    args,
    target: Array.isArray(target) ? target.join(', ') : target,
    category,
    severity,
    retryable,
    userImpact,
    affectedFeature: model ? `${model} management` : undefined,
  };
}

/**
 * Handles a database error with standardized logging and tracking
 * @param error The error to handle
 * @param operation The database operation being performed
 * @param model Optional model name involved in the operation
 * @param args Optional operation arguments
 * @returns A standardized DatabaseOperationError
 */
export function handleDatabaseError(
  error: Error,
  operation: string,
  model?: string,
  args?: any
): DatabaseOperationError {
  // Create metadata for the error
  const metadata = createErrorMetadata(error, operation, model, args);
  
  // Log error with structured metadata
  dbErrorLogger.error(`Database error in ${operation}`, {
    error: error.message,
    stack: error.stack,
    ...metadata,
    // Redact sensitive information from args
    args: args ? sanitizeArgs(args) : undefined,
  });
  
  // Track in Sentry with context
  Sentry.withScope((scope) => {
    scope.setTag('database.operation', operation);
    scope.setTag('database.model', model || 'unknown');
    scope.setTag('database.error.category', metadata.category);
    scope.setTag('database.error.severity', metadata.severity);
    scope.setTag('database.error.retryable', String(metadata.retryable));
    
    // Add extra context
    scope.setExtra('databaseErrorMetadata', metadata);
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      scope.setExtra('prismaErrorCode', error.code);
      scope.setExtra('prismaErrorMeta', error.meta);
    }
    
    Sentry.captureException(error);
  });
  
  // Return standardized error
  let errorCode = 'DB_OPERATION_ERROR';
  
  // Use Prisma error code if available
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    errorCode = `DB_${error.code}`;
  } else if (error instanceof Prisma.PrismaClientInitializationError) {
    errorCode = 'DB_INITIALIZATION_ERROR';
  } else if (error instanceof Prisma.PrismaClientRustPanicError) {
    errorCode = 'DB_INTERNAL_ERROR';
  } else if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    errorCode = 'DB_UNKNOWN_ERROR';
  }
  
  return new DatabaseOperationError(
    `Database operation '${operation}' failed: ${error.message}`,
    error,
    errorCode
  );
}

/**
 * Sanitizes operation arguments to remove sensitive information
 * @param args The arguments to sanitize
 * @returns Sanitized arguments
 */
function sanitizeArgs(args: any): any {
  if (!args || typeof args !== 'object') {
    return args;
  }
  
  const sanitized = { ...args };
  
  // List of sensitive field patterns to redact
  const sensitiveFields = [
    /password/i,
    /secret/i,
    /token/i,
    /key/i,
    /auth/i,
    /credit/i,
    /card/i,
    /cvv/i,
    /ssn/i,
    /social/i,
    /sin/i,
    /credential/i,
  ];
  
  // Recursively sanitize objects
  function sanitizeObject(obj: any): any {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }
    
    const result = Array.isArray(obj) ? [...obj] : { ...obj };
    
    for (const key in result) {
      // Check if this key should be redacted
      const shouldRedact = sensitiveFields.some(pattern => pattern.test(key));
      
      if (shouldRedact) {
        result[key] = '[REDACTED]';
      } else if (typeof result[key] === 'object' && result[key] !== null) {
        // Recurse into nested objects/arrays
        result[key] = sanitizeObject(result[key]);
      }
    }
    
    return result;
  }
  
  return sanitizeObject(sanitized);
}

/**
 * Wraps a database operation with standardized error handling
 * @param operation Function that performs a database operation
 * @param operationName Name of the operation for logging
 * @param model Optional model name involved in the operation
 * @param args Optional operation arguments for context
 * @returns Result of the operation
 * @throws DatabaseOperationError if operation fails
 */
export async function withDatabaseOperation<T>(
  operation: () => Promise<T>,
  operationName: string,
  model?: string,
  args?: any
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    throw handleDatabaseError(
      error instanceof Error ? error : new Error(String(error)),
      operationName,
      model,
      args
    );
  }
}

/**
 * Executes a database operation with automatic retry for transient errors
 * @param operation Function that performs a database operation
 * @param operationName Name of the operation for logging
 * @param options Retry options
 * @returns Result of the operation
 * @throws DatabaseOperationError if all retries fail
 */
export async function withDatabaseRetry<T>(
  operation: () => Promise<T>,
  operationName: string,
  options: {
    model?: string;
    args?: any;
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    backoffFactor?: number;
    retryableCategories?: DatabaseErrorCategory[];
  } = {}
): Promise<T> {
  const {
    model,
    args,
    maxRetries = 3,
    initialDelay = 100,
    maxDelay = 2000,
    backoffFactor = 2,
    retryableCategories = [
      DatabaseErrorCategory.CONNECTION,
      DatabaseErrorCategory.TIMEOUT,
    ],
  } = options;
  
  let lastError: Error | null = null;
  let delay = initialDelay;
  
  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      return await operation();
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      lastError = err;
      
      // Only retry if we have attempts left and the error is retryable
      if (attempt <= maxRetries) {
        const category = classifyPrismaError(err);
        
        // Check if this category is retryable
        if (retryableCategories.includes(category)) {
          // Log retry attempt
          dbErrorLogger.warn(`Retrying database operation '${operationName}'`, {
            attempt,
            maxRetries,
            error: err.message,
            category,
            delay,
          });
          
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, delay));
          
          // Exponential backoff with max limit
          delay = Math.min(delay * backoffFactor, maxDelay);
          
          // Continue to next retry attempt
          continue;
        }
      }
      
      // If we get here, we're not retrying
      throw handleDatabaseError(err, operationName, model, args);
    }
  }
  
  // This should never happen due to the throw in the catch block,
  // but TypeScript needs it for type safety
  throw handleDatabaseError(
    lastError || new Error(`Unknown error in operation: ${operationName}`),
    operationName,
    model,
    args
  );
}
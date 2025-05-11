/**
 * Authentication Performance Monitoring for Datadog
 * 
 * This file provides utilities for monitoring authentication performance metrics
 * using Datadog. It includes tracking tools for auth operations, error tracking,
 * and performance metrics collection.
 * 
 * Version: 1.0.0
 */

import { startAuthSpan, finishAuthSpan } from './server-tracer';
import { logger } from '@/lib/logger';
import { UserRole } from '@/lib/auth/types';

/**
 * Configuration for auth monitoring
 */
export const authMonitoringConfig = {
  // Critical auth operations to monitor at 100% sample rate
  criticalAuthPaths: [
    'auth.login',
    'auth.signup',
    'auth.verify',
    'auth.refresh',
    'auth.admin',
    'auth.booking.create',
    'auth.payment.process'
  ],
  
  // Performance thresholds for alerting
  performanceThresholds: {
    warning: 200, // ms
    critical: 500  // ms
  },
  
  // Sampling rates by environment
  samplingRates: {
    development: 1.0,
    testing: 1.0,
    staging: 0.5,
    production: 0.1
  },
  
  // Datadog metric names
  metrics: {
    authDuration: 'auth.operation.duration',
    authSuccess: 'auth.operation.success',
    authFailure: 'auth.operation.failure',
    roleCheck: 'auth.role.check',
    permissionCheck: 'auth.permission.check'
  }
};

/**
 * Get the current environment
 * @returns The current environment string
 */
function getCurrentEnvironment(): string {
  return process.env.NODE_ENV || 'development';
}

/**
 * Determine if an auth operation should be sampled for metrics
 * @param path The auth operation path
 * @returns true if the operation should be sampled
 */
function shouldSampleAuthOperation(path: string): boolean {
  const env = getCurrentEnvironment();
  const samplingRate = authMonitoringConfig.samplingRates[env as keyof typeof authMonitoringConfig.samplingRates] || 0.1;
  
  // Always sample critical paths
  if (authMonitoringConfig.criticalAuthPaths.some(criticalPath => path.includes(criticalPath))) {
    return true;
  }
  
  // Sample based on environment rate
  return Math.random() < samplingRate;
}

/**
 * Track an authentication operation with performance metrics
 * 
 * @param path The request path
 * @param method The HTTP method
 * @param operation The auth operation type
 * @param userId Optional user ID
 * @param callback The operation to track
 * @returns The result of the callback
 */
export async function trackAuthOperation<T>(
  path: string,
  method: string,
  operation: string,
  userId: string | undefined,
  callback: () => Promise<T>
): Promise<T> {
  // Check if we should sample this operation
  if (!shouldSampleAuthOperation(path)) {
    return callback();
  }
  
  // Start span for tracking
  const startTime = performance.now();
  const spanId = startAuthSpan(path, method, operation, userId);
  
  try {
    // Execute the operation
    const result = await callback();
    
    // Record success and finish span
    const duration = performance.now() - startTime;
    
    // Log performance if above warning threshold
    if (duration > authMonitoringConfig.performanceThresholds.warning) {
      logger.warn('Auth operation exceeded warning threshold', {
        path,
        method,
        operation,
        userId,
        duration: `${duration.toFixed(2)}ms`,
        threshold: `${authMonitoringConfig.performanceThresholds.warning}ms`
      });
    }
    
    // Finish the span
    finishAuthSpan(spanId, true);
    
    return result;
  } catch (error) {
    // Record failure and finish span
    const duration = performance.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    logger.error('Auth operation failed', {
      path,
      method,
      operation,
      userId,
      error: errorMessage,
      duration: `${duration.toFixed(2)}ms`
    });
    
    // Finish the span with error
    finishAuthSpan(spanId, false, errorMessage);
    
    // Re-throw the error
    throw error;
  }
}

/**
 * Track a role-based access check with performance metrics
 * 
 * @param path The request path
 * @param method The HTTP method
 * @param userId The user ID
 * @param requiredRoles The required roles for access
 * @param userRoles The user's roles
 * @returns true if the user has the required role(s)
 */
export function trackRoleCheck(
  path: string,
  method: string,
  userId: string,
  requiredRoles: UserRole | UserRole[],
  userRoles: UserRole[]
): boolean {
  const startTime = performance.now();
  const operation = 'auth.role.check';
  const spanId = startAuthSpan(path, method, operation, userId);
  
  try {
    // Convert single role to array
    const requiredRolesArray = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    
    // Check if user has any of the required roles
    const hasRequiredRole = requiredRolesArray.some(role => userRoles.includes(role));
    
    // Calculate duration
    const duration = performance.now() - startTime;
    
    // Log result
    if (hasRequiredRole) {
      logger.debug('Role check passed', {
        path,
        method,
        userId,
        requiredRoles: requiredRolesArray,
        userRoles,
        duration: `${duration.toFixed(2)}ms`
      });
    } else {
      logger.info('Role check failed', {
        path,
        method,
        userId,
        requiredRoles: requiredRolesArray,
        userRoles,
        duration: `${duration.toFixed(2)}ms`
      });
    }
    
    // Finish the span
    finishAuthSpan(spanId, hasRequiredRole);
    
    return hasRequiredRole;
  } catch (error) {
    // Record failure and finish span
    const duration = performance.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    logger.error('Role check error', {
      path,
      method,
      userId,
      requiredRoles: Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles],
      userRoles,
      error: errorMessage,
      duration: `${duration.toFixed(2)}ms`
    });
    
    // Finish the span with error
    finishAuthSpan(spanId, false, errorMessage);
    
    // Default to false on error
    return false;
  }
}

/**
 * Track a permission check with performance metrics
 * 
 * @param path The request path
 * @param method The HTTP method
 * @param userId The user ID
 * @param permission The required permission
 * @param checkFn The function to check if the user has the permission
 * @returns true if the user has the permission
 */
export function trackPermissionCheck(
  path: string,
  method: string,
  userId: string,
  permission: string,
  checkFn: () => boolean
): boolean {
  const startTime = performance.now();
  const operation = 'auth.permission.check';
  const spanId = startAuthSpan(path, method, operation, userId);
  
  try {
    // Check permission
    const hasPermission = checkFn();
    
    // Calculate duration
    const duration = performance.now() - startTime;
    
    // Log result
    if (hasPermission) {
      logger.debug('Permission check passed', {
        path,
        method,
        userId,
        permission,
        duration: `${duration.toFixed(2)}ms`
      });
    } else {
      logger.info('Permission check failed', {
        path,
        method,
        userId,
        permission,
        duration: `${duration.toFixed(2)}ms`
      });
    }
    
    // Finish the span
    finishAuthSpan(spanId, hasPermission);
    
    return hasPermission;
  } catch (error) {
    // Record failure and finish span
    const duration = performance.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    logger.error('Permission check error', {
      path,
      method,
      userId,
      permission,
      error: errorMessage,
      duration: `${duration.toFixed(2)}ms`
    });
    
    // Finish the span with error
    finishAuthSpan(spanId, false, errorMessage);
    
    // Default to false on error
    return false;
  }
}
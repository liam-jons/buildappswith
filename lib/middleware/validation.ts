/**
 * Middleware Configuration Validation
 * Version: 1.0.80
 * 
 * Provides validation functions for middleware configuration:
 * - Schema validation for configuration objects
 * - Type checking for critical properties
 * - Route pattern validation
 * 
 * Used to prevent runtime errors from misconfiguration
 */

import { MiddlewareConfig, RoutePattern, ApiProtectionConfig, AuthConfig } from './config';

// Error message type for validation results
export type ValidationError = {
  path: string;
  message: string;
};

/**
 * Validate middleware configuration
 * @param config Configuration to validate
 * @returns Array of validation errors or empty array if valid
 */
export function validateMiddlewareConfig(config: MiddlewareConfig): ValidationError[] {
  const errors: ValidationError[] = [];
  
  // Check for required top-level properties
  const requiredProperties = ['auth', 'api', 'matcher'];
  requiredProperties.forEach(prop => {
    if (!(prop in config)) {
      errors.push({
        path: prop,
        message: `Required property '${prop}' is missing`
      });
    }
  });
  
  // If any required properties are missing, stop validation
  if (errors.length > 0) {
    return errors;
  }
  
  // Validate auth configuration
  errors.push(...validateAuthConfig(config.auth, 'auth'));
  
  // Validate API protection configuration
  errors.push(...validateApiProtectionConfig(config.api, 'api'));
  
  // Validate matcher (must be an array of strings)
  if (!Array.isArray(config.matcher)) {
    errors.push({
      path: 'matcher',
      message: 'Matcher must be an array'
    });
  } else {
    config.matcher.forEach((pattern, index) => {
      if (typeof pattern !== 'string') {
        errors.push({
          path: `matcher[${index}]`,
          message: 'Matcher patterns must be strings'
        });
      }
    });
  }
  
  return errors;
}

/**
 * Validate auth configuration
 * @param config Auth configuration
 * @param basePath Base path for error reporting
 * @returns Array of validation errors
 */
function validateAuthConfig(config: AuthConfig, basePath: string): ValidationError[] {
  const errors: ValidationError[] = [];
  
  // Check for required properties
  const requiredProperties = ['publicRoutes', 'ignoredRoutes', 'unauthorizedStatusCode', 'unauthorizedResponse'];
  requiredProperties.forEach(prop => {
    if (!(prop in config)) {
      errors.push({
        path: `${basePath}.${prop}`,
        message: `Required property '${prop}' is missing`
      });
    }
  });
  
  // Validate publicRoutes and ignoredRoutes arrays
  if (!Array.isArray(config.publicRoutes)) {
    errors.push({
      path: `${basePath}.publicRoutes`,
      message: 'publicRoutes must be an array'
    });
  } else {
    errors.push(...validateRoutePatterns(config.publicRoutes, `${basePath}.publicRoutes`));
  }
  
  if (!Array.isArray(config.ignoredRoutes)) {
    errors.push({
      path: `${basePath}.ignoredRoutes`,
      message: 'ignoredRoutes must be an array'
    });
  } else {
    errors.push(...validateRoutePatterns(config.ignoredRoutes, `${basePath}.ignoredRoutes`));
  }
  
  // Validate unauthorizedStatusCode (must be a number between 400-599)
  if (typeof config.unauthorizedStatusCode !== 'number') {
    errors.push({
      path: `${basePath}.unauthorizedStatusCode`,
      message: 'unauthorizedStatusCode must be a number'
    });
  } else if (config.unauthorizedStatusCode < 400 || config.unauthorizedStatusCode > 599) {
    errors.push({
      path: `${basePath}.unauthorizedStatusCode`,
      message: 'unauthorizedStatusCode must be between 400 and 599'
    });
  }
  
  // Validate unauthorizedResponse (must be an object)
  if (typeof config.unauthorizedResponse !== 'object' || config.unauthorizedResponse === null) {
    errors.push({
      path: `${basePath}.unauthorizedResponse`,
      message: 'unauthorizedResponse must be an object'
    });
  }
  
  // Validate redirectOnSignOut if present (must be a string)
  if (config.redirectOnSignOut !== undefined && typeof config.redirectOnSignOut !== 'string') {
    errors.push({
      path: `${basePath}.redirectOnSignOut`,
      message: 'redirectOnSignOut must be a string'
    });
  }
  
  return errors;
}

/**
 * Validate API protection configuration
 * @param config API protection configuration
 * @param basePath Base path for error reporting
 * @returns Array of validation errors
 */
function validateApiProtectionConfig(config: ApiProtectionConfig, basePath: string): ValidationError[] {
  const errors: ValidationError[] = [];
  
  // Check for required properties
  const requiredProperties = ['csrf', 'rateLimit', 'securityHeaders'];
  requiredProperties.forEach(prop => {
    if (!(prop in config)) {
      errors.push({
        path: `${basePath}.${prop}`,
        message: `Required property '${prop}' is missing`
      });
    }
  });
  
  // Validate CSRF configuration
  if (typeof config.csrf !== 'object' || config.csrf === null) {
    errors.push({
      path: `${basePath}.csrf`,
      message: 'csrf must be an object'
    });
  } else {
    // Check if enabled is present and a boolean
    if (typeof config.csrf.enabled !== 'boolean') {
      errors.push({
        path: `${basePath}.csrf.enabled`,
        message: 'csrf.enabled must be a boolean'
      });
    }
    
    // Validate excludePatterns if present
    if (config.csrf.excludePatterns !== undefined) {
      if (!Array.isArray(config.csrf.excludePatterns)) {
        errors.push({
          path: `${basePath}.csrf.excludePatterns`,
          message: 'csrf.excludePatterns must be an array'
        });
      } else {
        errors.push(...validateRoutePatterns(config.csrf.excludePatterns, `${basePath}.csrf.excludePatterns`));
      }
    }
    
    // Validate cookieName if present
    if (config.csrf.cookieName !== undefined && typeof config.csrf.cookieName !== 'string') {
      errors.push({
        path: `${basePath}.csrf.cookieName`,
        message: 'csrf.cookieName must be a string'
      });
    }
    
    // Validate headerName if present
    if (config.csrf.headerName !== undefined && typeof config.csrf.headerName !== 'string') {
      errors.push({
        path: `${basePath}.csrf.headerName`,
        message: 'csrf.headerName must be a string'
      });
    }
    
    // Validate tokenByteSize if present
    if (config.csrf.tokenByteSize !== undefined && typeof config.csrf.tokenByteSize !== 'number') {
      errors.push({
        path: `${basePath}.csrf.tokenByteSize`,
        message: 'csrf.tokenByteSize must be a number'
      });
    }
    
    // Validate tokenExpiry if present
    if (config.csrf.tokenExpiry !== undefined && typeof config.csrf.tokenExpiry !== 'number') {
      errors.push({
        path: `${basePath}.csrf.tokenExpiry`,
        message: 'csrf.tokenExpiry must be a number'
      });
    }
  }
  
  // Validate rate limit configuration
  if (typeof config.rateLimit !== 'object' || config.rateLimit === null) {
    errors.push({
      path: `${basePath}.rateLimit`,
      message: 'rateLimit must be an object'
    });
  } else {
    // Check if enabled is present and a boolean
    if (typeof config.rateLimit.enabled !== 'boolean') {
      errors.push({
        path: `${basePath}.rateLimit.enabled`,
        message: 'rateLimit.enabled must be a boolean'
      });
    }
    
    // Validate defaultLimit
    if (typeof config.rateLimit.defaultLimit !== 'number') {
      errors.push({
        path: `${basePath}.rateLimit.defaultLimit`,
        message: 'rateLimit.defaultLimit must be a number'
      });
    }
    
    // Validate windowSize
    if (typeof config.rateLimit.windowSize !== 'number') {
      errors.push({
        path: `${basePath}.rateLimit.windowSize`,
        message: 'rateLimit.windowSize must be a number'
      });
    }
    
    // Validate typeConfig
    if (typeof config.rateLimit.typeConfig !== 'object' || config.rateLimit.typeConfig === null) {
      errors.push({
        path: `${basePath}.rateLimit.typeConfig`,
        message: 'rateLimit.typeConfig must be an object'
      });
    } else {
      // Check required rate limit types
      const requiredTypes = ['api', 'auth', 'timeline', 'profiles', 'marketplace'];
      requiredTypes.forEach(type => {
        if (!(type in config.rateLimit.typeConfig)) {
          errors.push({
            path: `${basePath}.rateLimit.typeConfig.${type}`,
            message: `Required rate limit type '${type}' is missing`
          });
        } else if (typeof config.rateLimit.typeConfig[type as keyof typeof config.rateLimit.typeConfig] !== 'number') {
          errors.push({
            path: `${basePath}.rateLimit.typeConfig.${type}`,
            message: `Rate limit for type '${type}' must be a number`
          });
        }
      });
    }
  }
  
  // Validate security headers configuration
  if (typeof config.securityHeaders !== 'object' || config.securityHeaders === null) {
    errors.push({
      path: `${basePath}.securityHeaders`,
      message: 'securityHeaders must be an object'
    });
  } else {
    // Check each header value
    Object.entries(config.securityHeaders).forEach(([key, value]) => {
      if (value !== false && typeof value !== 'string') {
        errors.push({
          path: `${basePath}.securityHeaders.${key}`,
          message: `Security header '${key}' must be a string or false`
        });
      }
    });
  }
  
  return errors;
}

/**
 * Validate route patterns
 * @param patterns Array of route patterns
 * @param basePath Base path for error reporting
 * @returns Array of validation errors
 */
function validateRoutePatterns(patterns: RoutePattern[], basePath: string): ValidationError[] {
  const errors: ValidationError[] = [];
  
  patterns.forEach((pattern, index) => {
    if (typeof pattern !== 'string' && !(pattern instanceof RegExp)) {
      errors.push({
        path: `${basePath}[${index}]`,
        message: 'Route patterns must be strings or RegExp objects'
      });
    }
  });
  
  return errors;
}

/**
 * Format validation errors as a readable string
 * @param errors Validation errors
 * @returns String representation of errors
 */
export function formatValidationErrors(errors: ValidationError[]): string {
  if (errors.length === 0) {
    return 'No validation errors';
  }
  
  return 'Middleware configuration validation errors:\n' + 
    errors.map(error => `- ${error.path}: ${error.message}`).join('\n');
}

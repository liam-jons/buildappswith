/**
 * Middleware Configuration Validation Tests
 * Version: 1.0.75
 *
 * Tests for the middleware configuration validation module
 */

import { describe, it, expect } from 'vitest';
import { 
  validateMiddlewareConfig, 
  formatValidationErrors, 
  ValidationError 
} from '../../lib/middleware/validation';
import { defaultMiddlewareConfig } from '../../lib/middleware/config';

describe('Middleware Configuration Validation', () => {
  describe('validateMiddlewareConfig', () => {
    it('should return empty array for valid configuration', () => {
      const errors = validateMiddlewareConfig(defaultMiddlewareConfig);
      expect(errors).toEqual([]);
    });
    
    it('should detect missing required top-level properties', () => {
      const invalidConfig = {
        auth: defaultMiddlewareConfig.auth,
        api: defaultMiddlewareConfig.api,
        // missing legacyRoutes and matcher
      };
      
      const errors = validateMiddlewareConfig(invalidConfig as any);
      
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(e => e.path === 'legacyRoutes')).toBe(true);
      expect(errors.some(e => e.path === 'matcher')).toBe(true);
    });
    
    it('should validate auth configuration', () => {
      const invalidConfig = {
        ...defaultMiddlewareConfig,
        auth: {
          ...defaultMiddlewareConfig.auth,
          publicRoutes: 'not-an-array', // invalid type
          unauthorizedStatusCode: 600, // invalid value
        },
      };
      
      const errors = validateMiddlewareConfig(invalidConfig as any);
      
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(e => e.path === 'auth.publicRoutes')).toBe(true);
      expect(errors.some(e => e.path === 'auth.unauthorizedStatusCode')).toBe(true);
    });
    
    it('should validate API protection configuration', () => {
      const invalidConfig = {
        ...defaultMiddlewareConfig,
        api: {
          ...defaultMiddlewareConfig.api,
          csrf: {
            ...defaultMiddlewareConfig.api.csrf,
            enabled: 'not-a-boolean', // invalid type
          },
          rateLimit: {
            ...defaultMiddlewareConfig.api.rateLimit,
            typeConfig: {
              api: '60', // invalid type
            },
          },
        },
      };
      
      const errors = validateMiddlewareConfig(invalidConfig as any);
      
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(e => e.path === 'api.csrf.enabled')).toBe(true);
      expect(errors.some(e => e.path.includes('typeConfig'))).toBe(true);
    });
    
    it('should validate legacy routes configuration', () => {
      const invalidConfig = {
        ...defaultMiddlewareConfig,
        legacyRoutes: {
          enabled: true,
          routes: [
            {
              path: '/api/auth/signin',
              action: 'invalid-action', // invalid value
            },
            {
              path: '/api/auth/callback',
              action: 'redirect',
              // missing target
            },
          ],
        },
      };
      
      const errors = validateMiddlewareConfig(invalidConfig as any);
      
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(e => e.path.includes('action'))).toBe(true);
      expect(errors.some(e => e.path.includes('target'))).toBe(true);
    });
    
    it('should validate route patterns', () => {
      const invalidConfig = {
        ...defaultMiddlewareConfig,
        auth: {
          ...defaultMiddlewareConfig.auth,
          publicRoutes: ['/valid', 123, /valid-regex/], // mixed valid and invalid
        },
      };
      
      const errors = validateMiddlewareConfig(invalidConfig as any);
      
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(e => e.path === 'auth.publicRoutes[1]')).toBe(true);
    });
    
    it('should validate matcher configuration', () => {
      const invalidConfig = {
        ...defaultMiddlewareConfig,
        matcher: 'not-an-array', // invalid type
      };
      
      const errors = validateMiddlewareConfig(invalidConfig as any);
      
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(e => e.path === 'matcher')).toBe(true);
    });
  });
  
  describe('formatValidationErrors', () => {
    it('should format validation errors as a readable string', () => {
      const errors: ValidationError[] = [
        { path: 'auth.publicRoutes', message: 'publicRoutes must be an array' },
        { path: 'api.csrf.enabled', message: 'csrf.enabled must be a boolean' },
      ];
      
      const formatted = formatValidationErrors(errors);
      
      expect(formatted).toContain('Middleware configuration validation errors:');
      expect(formatted).toContain('auth.publicRoutes: publicRoutes must be an array');
      expect(formatted).toContain('api.csrf.enabled: csrf.enabled must be a boolean');
    });
    
    it('should return a message for no errors', () => {
      const formatted = formatValidationErrors([]);
      
      expect(formatted).toBe('No validation errors');
    });
  });
});

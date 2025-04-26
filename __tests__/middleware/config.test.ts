/**
 * Middleware Configuration Tests
 * Version: 1.0.74
 *
 * Tests for the middleware configuration module
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { 
  getMiddlewareConfig, 
  defaultMiddlewareConfig,
  environmentConfigs,
  getRateLimitType,
  mergeConfigs
} from '../../lib/middleware/config';

describe('Middleware Configuration', () => {
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    // Reset NODE_ENV before each test
    vi.stubEnv('NODE_ENV', 'test');
  });

  afterEach(() => {
    // Restore original NODE_ENV after each test
    vi.stubEnv('NODE_ENV', originalNodeEnv || 'development');
  });

  describe('getMiddlewareConfig', () => {
    it('should return config with test environment overrides when NODE_ENV is test', () => {
      const config = getMiddlewareConfig();
      expect(config.api.rateLimit.enabled).toBe(false);
      expect(config.api.securityHeaders.strictTransportSecurity).toBe(false);
    });

    it('should return config with development environment overrides when NODE_ENV is development', () => {
      vi.stubEnv('NODE_ENV', 'development');
      const config = getMiddlewareConfig();
      expect(config.api.securityHeaders.strictTransportSecurity).toBe(false);
      expect(config.api.rateLimit.typeConfig.api).toBe(120);
    });

    it('should return config with production environment overrides when NODE_ENV is production', () => {
      vi.stubEnv('NODE_ENV', 'production');
      const config = getMiddlewareConfig();
      expect(config.api.rateLimit.typeConfig.api).toBe(60);
      expect(config.api.securityHeaders.strictTransportSecurity).toBe('max-age=31536000; includeSubDomains');
    });

    it('should use development as default environment when NODE_ENV is not set', () => {
      vi.stubEnv('NODE_ENV', '');
      const config = getMiddlewareConfig();
      expect(config.api.securityHeaders.strictTransportSecurity).toBe(false);
      expect(config.api.rateLimit.typeConfig.api).toBe(120);
    });
  });

  describe('getRateLimitType', () => {
    it('should return auth for auth API paths', () => {
      expect(getRateLimitType('/api/auth/login')).toBe('auth');
      expect(getRateLimitType('/api/auth/register')).toBe('auth');
    });

    it('should return timeline for timeline API paths', () => {
      expect(getRateLimitType('/api/timeline/events')).toBe('timeline');
      expect(getRateLimitType('/api/timeline/updates')).toBe('timeline');
    });

    it('should return profiles for builders API paths', () => {
      expect(getRateLimitType('/api/builders/1')).toBe('profiles');
      expect(getRateLimitType('/api/builders/featured')).toBe('profiles');
    });

    it('should return marketplace for marketplace API paths', () => {
      expect(getRateLimitType('/api/marketplace/search')).toBe('marketplace');
      expect(getRateLimitType('/api/marketplace/categories')).toBe('marketplace');
    });

    it('should return api for other API paths', () => {
      expect(getRateLimitType('/api/other')).toBe('api');
      expect(getRateLimitType('/api/unknown')).toBe('api');
    });
  });

  describe('mergeConfigs', () => {
    it('should merge two simple objects', () => {
      const base = { a: 1, b: 2 };
      const override = { b: 3, c: 4 };
      const result = mergeConfigs(base, override);
      expect(result).toEqual({ a: 1, b: 3, c: 4 });
    });

    it('should deep merge nested objects', () => {
      const base = { 
        a: 1, 
        nested: { 
          x: 10, 
          y: 20 
        } 
      };
      const override = { 
        nested: { 
          y: 30, 
          z: 40 
        } 
      };
      const result = mergeConfigs(base, override);
      expect(result).toEqual({ 
        a: 1, 
        nested: { 
          x: 10, 
          y: 30, 
          z: 40 
        } 
      });
    });

    it('should handle arrays as primitive values (replace, not merge)', () => {
      const base = { 
        a: 1, 
        list: [1, 2, 3] 
      };
      const override = { 
        list: [4, 5] 
      };
      const result = mergeConfigs(base, override);
      expect(result).toEqual({ 
        a: 1, 
        list: [4, 5] 
      });
    });

    it('should handle null values correctly', () => {
      const base = { 
        a: 1, 
        b: { x: 10 } 
      };
      const override = { 
        b: null 
      };
      const result = mergeConfigs(base, override);
      expect(result).toEqual({ 
        a: 1, 
        b: null 
      });
    });
  });

  describe('default configurations', () => {
    it('should have correct public routes', () => {
      expect(defaultMiddlewareConfig.auth.publicRoutes).toContain('/');
      expect(defaultMiddlewareConfig.auth.publicRoutes).toContain('/login');
    });

    it('should have correct CSRF configuration', () => {
      expect(defaultMiddlewareConfig.api.csrf.enabled).toBe(true);
      expect(defaultMiddlewareConfig.api.csrf.cookieName).toBe('buildappswith_csrf');
    });

    it('should have correct rate limit configuration', () => {
      expect(defaultMiddlewareConfig.api.rateLimit.enabled).toBe(true);
      expect(defaultMiddlewareConfig.api.rateLimit.typeConfig.auth).toBe(10);
    });

    it('should have correct security headers', () => {
      expect(defaultMiddlewareConfig.api.securityHeaders.xFrameOptions).toBe('DENY');
      expect(defaultMiddlewareConfig.api.securityHeaders.contentSecurityPolicy).toBeDefined();
    });

    it('should have correct legacy route handling', () => {
      expect(defaultMiddlewareConfig.legacyRoutes.enabled).toBe(true);
      const signinRoute = defaultMiddlewareConfig.legacyRoutes.routes.find(
        r => r.path === '/api/auth/signin'
      );
      expect(signinRoute).toBeDefined();
      expect(signinRoute?.action).toBe('redirect');
      expect(signinRoute?.target).toBe('/login');
    });
  });
});

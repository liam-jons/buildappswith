/**
 * API Protection Middleware Tests
 * Version: 1.0.78
 *
 * Tests for the API protection middleware components
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { 
  applyCsrfProtection,
  applyRateLimit,
  applySecurityHeaders,
  applyApiProtection
} from '../../lib/middleware/api-protection';
import {
  createMockRequest,
  mockJsonResponse
} from '../../lib/middleware/test-utils';

// Mock dependencies
vi.mock('../../lib/csrf', () => ({
  csrfProtection: vi.fn()
}));

vi.mock('../../lib/rate-limit', () => ({
  rateLimit: vi.fn()
}));

// Import mocked modules
import { csrfProtection } from '../../lib/csrf';
import { rateLimit } from '../../lib/rate-limit';

describe('API Protection Middleware', () => {
  
  // Reset mocks before each test
  beforeEach(() => {
    vi.resetAllMocks();
    
    // Setup mocks
    vi.mocked(csrfProtection).mockResolvedValue(null);
    vi.mocked(rateLimit).mockImplementation(() => {
      return async () => NextResponse.next();
    });
  });
  
  describe('applyCsrfProtection', () => {
    it('should skip for disabled CSRF protection', async () => {
      const req = createMockRequest('/api/test', 'POST');
      const config = { enabled: false };
      
      const result = await applyCsrfProtection(req, config);
      
      expect(result).toBeNull();
      expect(csrfProtection).not.toHaveBeenCalled();
    });
    
    it('should skip for non-mutation methods', async () => {
      const req = createMockRequest('/api/test', 'GET');
      const config = { enabled: true };
      
      const result = await applyCsrfProtection(req, config);
      
      expect(result).toBeNull();
      expect(csrfProtection).not.toHaveBeenCalled();
    });
    
    it('should skip for excluded paths', async () => {
      const req = createMockRequest('/api/auth/login', 'POST');
      const config = { 
        enabled: true,
        excludePatterns: [/^\/api\/auth\//]
      };
      
      const result = await applyCsrfProtection(req, config);
      
      expect(result).toBeNull();
      expect(csrfProtection).not.toHaveBeenCalled();
    });
    
    it('should apply CSRF protection for protected paths', async () => {
      const req = createMockRequest('/api/protected', 'POST');
      const config = { 
        enabled: true,
        excludePatterns: [/^\/api\/auth\//]
      };
      
      await applyCsrfProtection(req, config);
      
      expect(csrfProtection).toHaveBeenCalledWith(req);
    });
    
    it('should return error response when CSRF validation fails', async () => {
      const req = createMockRequest('/api/protected', 'POST');
      const config = { enabled: true };
      
      // Create a response with consistent properties
      const mockErrorResponse = mockJsonResponse(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      );
      
      vi.mocked(csrfProtection).mockResolvedValue(mockErrorResponse);
      
      const result = await applyCsrfProtection(req, config);
      
      expect(result).toBe(mockErrorResponse);
      expect(result.status).toBe(403);
    });
  });
  
  describe('applyRateLimit', () => {
    it('should skip for disabled rate limiting', async () => {
      const req = createMockRequest('/api/test');
      const config = { 
        enabled: false,
        defaultLimit: 60,
        windowSize: 60,
        typeConfig: { api: 60, auth: 10, timeline: 30, profiles: 40, marketplace: 20 }
      };
      
      const result = await applyRateLimit(req, config);
      
      expect(result).toBeNull();
      expect(rateLimit).not.toHaveBeenCalled();
    });
    
    it('should apply rate limiting with correct configuration', async () => {
      const req = createMockRequest('/api/test', 'GET');
      const config = { 
        enabled: true,
        defaultLimit: 60,
        windowSize: 60,
        typeConfig: { api: 60, auth: 10, timeline: 30, profiles: 40, marketplace: 20 }
      };
      
      await applyRateLimit(req, config);
      
      expect(rateLimit).toHaveBeenCalledWith({
        type: 'api',
        limit: 60,
        windowSize: 60
      });
    });
    
    it('should use type-specific limits for different API paths', async () => {
      const req = createMockRequest('/api/auth/login', 'GET');
      const config = { 
        enabled: true,
        defaultLimit: 60,
        windowSize: 60,
        typeConfig: { api: 60, auth: 10, timeline: 30, profiles: 40, marketplace: 20 }
      };
      
      await applyRateLimit(req, config);
      
      expect(rateLimit).toHaveBeenCalledWith({
        type: 'auth',
        limit: 10,
        windowSize: 60
      });
    });
    
    it('should return rate limit error when limit is exceeded', async () => {
      const req = createMockRequest('/api/test');
      const config = { 
        enabled: true,
        defaultLimit: 60,
        windowSize: 60,
        typeConfig: { api: 60, auth: 10, timeline: 30, profiles: 40, marketplace: 20 }
      };
      
      // Create a consistent response with proper properties
      const mockRateLimitResponse = mockJsonResponse(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
      
      vi.mocked(rateLimit).mockImplementation(() => {
        return async () => mockRateLimitResponse;
      });
      
      const result = await applyRateLimit(req, config);
      
      expect(result).toBe(mockRateLimitResponse);
      expect(result.status).toBe(429);
    });
  });
  
  describe('applySecurityHeaders', () => {
    it('should apply configured security headers', () => {
      const response = NextResponse.next();
      const config = {
        contentSecurityPolicy: "default-src 'self'",
        xFrameOptions: 'DENY',
        xContentTypeOptions: 'nosniff'
      };
      
      const result = applySecurityHeaders(response, config);
      
      expect(result.headers.get('content-security-policy')).toBe("default-src 'self'");
      expect(result.headers.get('x-frame-options')).toBe('DENY');
      expect(result.headers.get('x-content-type-options')).toBe('nosniff');
    });
    
    it('should skip disabled headers', () => {
      const response = NextResponse.next();
      const config = {
        contentSecurityPolicy: "default-src 'self'",
        xFrameOptions: false,
        xContentTypeOptions: 'nosniff'
      };
      
      const result = applySecurityHeaders(response, config);
      
      expect(result.headers.get('content-security-policy')).toBe("default-src 'self'");
      expect(result.headers.get('x-frame-options')).toBeNull();
      expect(result.headers.get('x-content-type-options')).toBe('nosniff');
    });
    
    it('should convert camelCase header names to kebab-case', () => {
      const response = NextResponse.next();
      const config = {
        contentSecurityPolicy: "default-src 'self'",
        strictTransportSecurity: 'max-age=31536000'
      };
      
      const result = applySecurityHeaders(response, config);
      
      expect(result.headers.get('content-security-policy')).toBe("default-src 'self'");
      expect(result.headers.get('strict-transport-security')).toBe('max-age=31536000');
    });
  });
  
  describe('applyApiProtection', () => {
    it('should return CSRF error when CSRF validation fails', async () => {
      const req = createMockRequest('/api/protected', 'POST');
      const config = {
        csrf: { enabled: true },
        rateLimit: { 
          enabled: true,
          defaultLimit: 60,
          windowSize: 60,
          typeConfig: { api: 60, auth: 10, timeline: 30, profiles: 40, marketplace: 20 }
        },
        securityHeaders: {
          contentSecurityPolicy: "default-src 'self'"
        }
      };
      
      // Create a response with consistent properties
      const mockCsrfError = mockJsonResponse(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      );
      
      vi.mocked(csrfProtection).mockResolvedValue(mockCsrfError);
      
      const result = await applyApiProtection(req, config);
      
      expect(result).toBe(mockCsrfError);
      expect(result.status).toBe(403);
      expect(rateLimit).not.toHaveBeenCalled();
    });
    
    it('should return rate limit error when limit is exceeded', async () => {
      const req = createMockRequest('/api/test', 'GET');
      const config = {
        csrf: { enabled: true },
        rateLimit: { 
          enabled: true,
          defaultLimit: 60,
          windowSize: 60,
          typeConfig: { api: 60, auth: 10, timeline: 30, profiles: 40, marketplace: 20 }
        },
        securityHeaders: {
          contentSecurityPolicy: "default-src 'self'"
        }
      };
      
      // Create a consistent response with proper properties
      const mockRateLimitResponse = mockJsonResponse(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
      
      vi.mocked(csrfProtection).mockResolvedValue(null);
      vi.mocked(rateLimit).mockImplementation(() => {
        return async () => mockRateLimitResponse;
      });
      
      const result = await applyApiProtection(req, config);
      
      expect(result).toBe(mockRateLimitResponse);
      expect(result.status).toBe(429);
    });
    
    it('should apply security headers when all checks pass', async () => {
      const req = createMockRequest('/api/test', 'GET');
      const config = {
        csrf: { enabled: true },
        rateLimit: { 
          enabled: true,
          defaultLimit: 60,
          windowSize: 60,
          typeConfig: { api: 60, auth: 10, timeline: 30, profiles: 40, marketplace: 20 }
        },
        securityHeaders: {
          contentSecurityPolicy: "default-src 'self'",
          xFrameOptions: 'DENY'
        }
      };
      
      vi.mocked(csrfProtection).mockResolvedValue(null);
      vi.mocked(rateLimit).mockImplementation(() => {
        return async () => NextResponse.next();
      });
      
      const result = await applyApiProtection(req, config);
      
      expect(result?.headers.get('content-security-policy')).toBe("default-src 'self'");
      expect(result?.headers.get('x-frame-options')).toBe('DENY');
    });
  });
});

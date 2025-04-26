/**
 * Legacy Routes Middleware Tests
 * Version: 1.0.74
 *
 * Tests for the legacy routes middleware component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { handleLegacyRoutes } from '../../lib/middleware/legacy-routes';

describe('Legacy Routes Middleware', () => {
  
  // Create mock request
  const createMockRequest = (pathname = '/api/test') => {
    return {
      nextUrl: {
        pathname
      },
      url: 'https://buildappswith.com' + pathname
    } as unknown as NextRequest;
  };
  
  // Mock console.log to prevent test output pollution
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });
  
  it('should skip when legacy route handling is disabled', () => {
    const req = createMockRequest('/api/auth/session');
    const config = {
      enabled: false,
      routes: []
    };
    
    const result = handleLegacyRoutes(req, config);
    
    expect(result).toBeNull();
  });
  
  it('should return null for non-legacy routes', () => {
    const req = createMockRequest('/api/marketplace/builders');
    const config = {
      enabled: true,
      routes: [
        {
          path: '/api/auth/signin',
          action: 'redirect',
          target: '/login'
        }
      ]
    };
    
    const result = handleLegacyRoutes(req, config);
    
    expect(result).toBeNull();
  });
  
  it('should redirect for routes with redirect action', () => {
    const req = createMockRequest('/api/auth/signin');
    const config = {
      enabled: true,
      routes: [
        {
          path: '/api/auth/signin',
          action: 'redirect',
          target: '/login'
        }
      ]
    };
    
    // Mock NextResponse.redirect
    const mockRedirectResponse = { headers: new Headers() };
    vi.spyOn(NextResponse, 'redirect').mockReturnValue(mockRedirectResponse as unknown as NextResponse);
    
    const result = handleLegacyRoutes(req, config);
    
    expect(NextResponse.redirect).toHaveBeenCalledWith(expect.any(URL));
    expect(result).toBe(mockRedirectResponse);
  });
  
  it('should return JSON for routes with json action', () => {
    const req = createMockRequest('/api/auth/session');
    const config = {
      enabled: true,
      routes: [
        {
          path: '/api/auth/session',
          action: 'json',
          statusCode: 404,
          responseBody: { error: 'This endpoint is no longer available' }
        }
      ]
    };
    
    // Mock NextResponse.json
    const mockJsonResponse = { headers: new Headers() };
    vi.spyOn(NextResponse, 'json').mockReturnValue(mockJsonResponse as unknown as NextResponse);
    
    const result = handleLegacyRoutes(req, config);
    
    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'This endpoint is no longer available' },
      { status: 404 }
    );
    expect(result).toBe(mockJsonResponse);
  });
  
  it('should use default values when not all properties are specified', () => {
    const req = createMockRequest('/api/auth/callback/github');
    const config = {
      enabled: true,
      routes: [
        {
          path: '/api/auth/callback',
          action: 'json'
          // No statusCode or responseBody
        }
      ]
    };
    
    // Mock NextResponse.json
    const mockJsonResponse = { headers: new Headers() };
    vi.spyOn(NextResponse, 'json').mockReturnValue(mockJsonResponse as unknown as NextResponse);
    
    const result = handleLegacyRoutes(req, config);
    
    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'Deprecated endpoint' },
      { status: 404 }
    );
    expect(result).toBe(mockJsonResponse);
  });
  
  it('should log access to legacy routes', () => {
    const req = createMockRequest('/api/auth/signin');
    const config = {
      enabled: true,
      routes: [
        {
          path: '/api/auth/signin',
          action: 'redirect',
          target: '/login'
        }
      ]
    };
    
    // Mock NextResponse.redirect
    vi.spyOn(NextResponse, 'redirect').mockReturnValue({} as NextResponse);
    
    handleLegacyRoutes(req, config);
    
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Legacy route accessed'));
  });
  
  it('should match legacy routes based on startsWith pattern', () => {
    const req = createMockRequest('/api/auth/callback/github');
    const config = {
      enabled: true,
      routes: [
        {
          path: '/api/auth/callback',
          action: 'redirect',
          target: '/login'
        }
      ]
    };
    
    // Mock NextResponse.redirect
    const mockRedirectResponse = { headers: new Headers() };
    vi.spyOn(NextResponse, 'redirect').mockReturnValue(mockRedirectResponse as unknown as NextResponse);
    
    const result = handleLegacyRoutes(req, config);
    
    expect(NextResponse.redirect).toHaveBeenCalled();
    expect(result).toBe(mockRedirectResponse);
  });
});

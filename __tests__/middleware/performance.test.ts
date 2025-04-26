/**
 * Middleware Performance Monitoring Tests
 * Version: 1.0.77
 *
 * Tests for the middleware performance monitoring module
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { 
  trackPerformance, 
  trackMultipleComponents,
  addPerformanceHeaders,
  getPerformanceEntries,
  getComponentStats,
  resetPerformanceStore
} from '../../lib/middleware/performance';

describe('Middleware Performance Monitoring', () => {
  // Mock for performance.now()
  let nowValue = 1000;
  const mockPerformanceNow = vi.spyOn(performance, 'now');
  
  // Create a mock request function
  const createMockRequest = (pathname = '/test') => {
    return {
      nextUrl: { pathname }
    } as unknown as NextRequest;
  };
  
  beforeEach(() => {
    resetPerformanceStore();
    vi.clearAllMocks();
    nowValue = 1000;
    
    // Mock performance.now to return incrementing values
    mockPerformanceNow.mockImplementation(() => {
      const value = nowValue;
      nowValue += 50; // Simulate 50ms of processing time
      return value;
    });
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });
  
  describe('trackPerformance', () => {
    it('should track function execution time', async () => {
      const req = createMockRequest();
      const mockFn = vi.fn().mockResolvedValue('result');
      
      const result = await trackPerformance('test-component', req, mockFn);
      
      expect(result).toBe('result');
      expect(mockFn).toHaveBeenCalled();
      
      const entries = getPerformanceEntries();
      expect(entries.length).toBe(1);
      expect(entries[0].component).toBe('test-component');
      expect(entries[0].path).toBe('/test');
      expect(entries[0].duration).toBeGreaterThan(0); // Should be positive, not checking exact value
    });
    
    it('should store metadata when provided', async () => {
      const req = createMockRequest();
      const metadata = { userId: '123', action: 'test' };
      
      await trackPerformance('test-component', req, async () => 'result', metadata);
      
      const entries = getPerformanceEntries();
      expect(entries[0].metadata).toEqual(metadata);
    });
    
    it('should track performance even if function throws', async () => {
      const req = createMockRequest();
      const mockFn = vi.fn().mockImplementation(() => {
        throw new Error('Test error');
      });
      
      await expect(trackPerformance('test-component', req, mockFn))
        .rejects.toThrow('Test error');
      
      const entries = getPerformanceEntries();
      expect(entries.length).toBe(1);
      expect(entries[0].component).toBe('test-component');
    });
  });
  
  describe('trackMultipleComponents', () => {
    it('should track multiple components in sequence', async () => {
      const req = createMockRequest();
      const components = {
        component1: vi.fn().mockResolvedValue('result1'),
        component2: vi.fn().mockResolvedValue('result2'),
      };
      
      const results = await trackMultipleComponents(components, req);
      
      expect(results.component1).toBe('result1');
      expect(results.component2).toBe('result2');
      
      const entries = getPerformanceEntries();
      expect(entries.length).toBe(2);
      expect(entries[0].component).toBe('component1');
      expect(entries[1].component).toBe('component2');
    });
  });
  
  describe('addPerformanceHeaders', () => {
    it('should add performance headers to response in development', async () => {
      const origNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      const req = createMockRequest();
      const response = NextResponse.next();
      
      await trackPerformance('component1', req, async () => 'result1');
      await trackPerformance('component2', req, async () => 'result2');
      
      const entries = getPerformanceEntries();
      const responseWithHeaders = addPerformanceHeaders(response, entries);
      
      // Get the headers for verification
      const totalTimeHeader = responseWithHeaders.headers.get('X-Middleware-Time');
      const component1Header = responseWithHeaders.headers.get('X-Middleware-Component-component1');
      const component2Header = responseWithHeaders.headers.get('X-Middleware-Component-component2');
      
      // Verify headers exist and have the correct format
      expect(totalTimeHeader).toMatch(/^\d+\.\d+ms$/);
      expect(component1Header).toMatch(/^\d+\.\d+ms$/);
      expect(component2Header).toMatch(/^\d+\.\d+ms$/);
      
      process.env.NODE_ENV = origNodeEnv;
    });
    
    it('should not add headers in production unless explicitly enabled', () => {
      const origNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      const response = NextResponse.next();
      const entries = [
        { component: 'test', path: '/test', startTime: 1000, endTime: 1050, duration: 50 }
      ];
      
      const responseWithHeaders = addPerformanceHeaders(response, entries);
      
      expect(responseWithHeaders.headers.get('X-Middleware-Time')).toBeNull();
      
      // But should add them when explicitly enabled
      process.env.ENABLE_PERFORMANCE_HEADERS = 'true';
      const responseWithForcedHeaders = addPerformanceHeaders(response, entries);
      
      expect(responseWithForcedHeaders.headers.get('X-Middleware-Time')).toBe('50.00ms');
      
      // Clean up
      process.env.NODE_ENV = origNodeEnv;
      delete process.env.ENABLE_PERFORMANCE_HEADERS;
    });
  });
  
  describe('getPerformanceEntries', () => {
    it('should return the most recent entries', async () => {
      const req = createMockRequest();
      
      // Create 10 entries
      for (let i = 0; i < 10; i++) {
        await trackPerformance(`component-${i}`, req, async () => i);
      }
      
      // Get only the last 5
      const entries = getPerformanceEntries(5);
      
      expect(entries.length).toBe(5);
      expect(entries[0].component).toBe('component-5');
      expect(entries[4].component).toBe('component-9');
    });
    
    it('should filter entries by component', async () => {
      const req = createMockRequest();
      
      await trackPerformance('component-1', req, async () => 1);
      await trackPerformance('component-2', req, async () => 2);
      await trackPerformance('component-1', req, async () => 3);
      
      const entries = getPerformanceEntries(100, 'component-1');
      
      expect(entries.length).toBe(2);
      expect(entries[0].component).toBe('component-1');
      expect(entries[1].component).toBe('component-1');
    });
  });
  
  describe('getComponentStats', () => {
    it('should calculate performance statistics for a component', async () => {
      const req = createMockRequest();
      
      // Mock different durations
      mockPerformanceNow.mockImplementation(() => {
        const value = nowValue;
        nowValue += Math.floor(Math.random() * 100) + 10; // 10-110ms range
        return value;
      });
      
      // Create several entries for the same component
      for (let i = 0; i < 20; i++) {
        await trackPerformance('test-component', req, async () => i);
      }
      
      const stats = getComponentStats('test-component');
      
      expect(stats.count).toBe(20);
      expect(stats.avgDuration).toBeGreaterThan(0);
      expect(stats.minDuration).toBeLessThanOrEqual(stats.avgDuration);
      expect(stats.maxDuration).toBeGreaterThanOrEqual(stats.avgDuration);
      expect(stats.p95Duration).toBeLessThanOrEqual(stats.maxDuration);
      expect(stats.p99Duration).toBeLessThanOrEqual(stats.maxDuration);
    });
    
    it('should return zeros for non-existent component', () => {
      const stats = getComponentStats('non-existent');
      
      expect(stats.count).toBe(0);
      expect(stats.avgDuration).toBe(0);
      expect(stats.minDuration).toBe(0);
      expect(stats.maxDuration).toBe(0);
      expect(stats.p95Duration).toBe(0);
      expect(stats.p99Duration).toBe(0);
    });
  });
  
  describe('resetPerformanceStore', () => {
    it('should clear all performance entries', async () => {
      const req = createMockRequest();
      
      await trackPerformance('test-component', req, async () => 'result');
      expect(getPerformanceEntries().length).toBe(1);
      
      resetPerformanceStore();
      expect(getPerformanceEntries().length).toBe(0);
    });
  });
});

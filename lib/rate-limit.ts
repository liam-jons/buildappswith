/**
 * Rate Limiting Utility for Buildappswith Platform
 * Version: 0.1.64
 * 
 * Implements request rate limiting for API routes based on IP address
 * or user authentication to prevent abuse and ensure fair usage.
 * Uses in-memory storage for development and small-scale deployments.
 */

import { NextRequest, NextResponse } from 'next/server';

// Define rate limit window in seconds
const WINDOW_SIZE = 60; // 1 minute

// Define default rate limits
const DEFAULT_RATE_LIMITS = {
  // General API endpoints
  api: 60, // 60 requests per minute
  // Authentication endpoints (login, register)
  auth: 10, // 10 requests per minute
  // Timeline data requests
  timeline: 30, // 30 requests per minute
  // Builder profile data
  profiles: 40, // 40 requests per minute
  // Marketplace actions
  marketplace: 20, // 20 requests per minute
};

// Types
type RateLimitType = keyof typeof DEFAULT_RATE_LIMITS;
type RateLimitOptions = {
  type: RateLimitType;
  limit?: number;
  windowSize?: number;
  identifierFn?: (req: NextRequest) => Promise<string> | string;
};

// In-memory store for rate limiting data
// Note: This will be reset when the server restarts and doesn't work across multiple instances
// For production, replace with Redis or another persistent store
class MemoryStore {
  private store: Map<string, { count: number; resetAt: number }>;

  constructor() {
    this.store = new Map();
    // Clean up expired entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  // Increment count for a key
  async incr(key: string): Promise<number> {
    const now = Date.now();
    const data = this.store.get(key);
    
    // If no data or reset time has passed, start fresh
    if (!data || data.resetAt < now) {
      this.store.set(key, { 
        count: 1, 
        resetAt: now + (WINDOW_SIZE * 1000) 
      });
      return 1;
    }
    
    // Increment count
    const newCount = data.count + 1;
    this.store.set(key, { ...data, count: newCount });
    return newCount;
  }
  
  // Get time-to-live for a key in seconds
  async ttl(key: string): Promise<number> {
    const data = this.store.get(key);
    if (!data) return -2; // Key doesn't exist
    
    const ttl = Math.floor((data.resetAt - Date.now()) / 1000);
    return ttl > 0 ? ttl : 0;
  }

  // Clean up expired entries
  private cleanup() {
    const now = Date.now();
    for (const [key, data] of this.store.entries()) {
      if (data.resetAt < now) {
        this.store.delete(key);
      }
    }
  }
}

// Create singleton instance of MemoryStore
const memoryStore = new MemoryStore();

/**
 * Get identifier for rate limiting (IP address or user ID)
 * @param req Request object
 * @returns Identifier string
 */
async function getIdentifier(req: NextRequest): Promise<string> {
  // Get real IP, considering forwarded headers
  // In Next.js 15+, req.ip might be undefined, so we need to use headers
  let ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  
  // Clean up IP address format (get first IP if multiple are present)
  ip = ip.split(',')[0].trim();
  
  // In a real implementation, you could also use authenticated user ID if available
  // const session = await getSession();
  // return session?.user?.id || ip;
  
  return ip;
}

/**
 * Rate limiting middleware
 * @param options Rate limiting options
 * @returns Middleware function
 */
export function rateLimit(options: RateLimitOptions) {
  const {
    type,
    limit = DEFAULT_RATE_LIMITS[type],
    windowSize = WINDOW_SIZE,
    identifierFn = getIdentifier,
  } = options;

  return async function rateLimitMiddleware(req: NextRequest) {
    try {
      // Get unique identifier for this request
      const identifier = await identifierFn(req);
      
      // Create a key specific to this rate limit type and identifier
      const key = `ratelimit:${type}:${identifier}`;
      
      // Increment the counter for this key
      const count = await memoryStore.incr(key);
      
      // Get remaining time to reset
      const ttl = await memoryStore.ttl(key);
      
      // Set headers with rate limit info
      const headers = new Headers();
      headers.set('X-RateLimit-Limit', limit.toString());
      headers.set('X-RateLimit-Remaining', Math.max(0, limit - count).toString());
      headers.set('X-RateLimit-Reset', ttl.toString());
      
      // If rate limit exceeded, return 429 Too Many Requests
      if (count > limit) {
        return NextResponse.json(
          { error: 'Too many requests, please try again later' },
          { status: 429, headers }
        );
      }
      
      // Otherwise, attach rate limit headers to the response
      return NextResponse.next({
        headers,
      });
    } catch (error) {
      // If rate limiting fails, log the error but allow the request to proceed
      console.error('Rate limiting error:', error);
      return NextResponse.next();
    }
  };
}

/**
 * Helper function to create rate limited API handlers
 * @param type Rate limit type
 * @param handler API route handler function
 * @returns Rate limited handler
 */
export function withRateLimit(type: RateLimitType, handler: Function) {
  const rateLimiter = rateLimit({ type });
  
  return async function rateLimitedHandler(req: NextRequest) {
    const rateLimitResult = await rateLimiter(req);
    
    // If rate limit is exceeded, return that response
    if (rateLimitResult && rateLimitResult.status === 429) {
      return rateLimitResult;
    }
    
    // Otherwise, call the original handler
    return handler(req);
  };
}

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { publicRoutes } from '@/lib/auth/express/middleware';

describe('Authentication Routes', () => {
  it('should include the standardized authentication routes in public routes', () => {
    // Check that the publicRoutes array includes our standardized routes
    expect(publicRoutes).toContain('/sign-in');
    expect(publicRoutes).toContain('/sign-up');
    
    // Also verify legacy routes are still included for backward compatibility
    expect(publicRoutes).toContain('/login');
    expect(publicRoutes).toContain('/signup');
  });
});
Comprehensive Testing Strategy for Infrastructure Modernization

  1. Testing Framework and Approach

  Our testing strategy will cover all three infrastructure components (Sentry, Logger, and Clerk Express SDK) with
  a multi-layered approach:

  - Unit Tests: Test individual functions and components in isolation
  - Integration Tests: Test interactions between components
  - End-to-End Tests: Test complete flows in a simulated environment
  - Performance Tests: Measure performance improvements
  - Manual Verification: Validate behavior in development and production

  We'll implement tests in phases aligned with the migration implementation to catch issues early.

  2. Sentry Configuration Testing

  Unit Tests

  // __tests__/unit/sentry/config.test.ts
  import { getInitializationConfig, configureSentryDataFiltering } from '@/lib/sentry/config';

  describe('Sentry Configuration', () => {
    test('should provide EU region in configuration', () => {
      const config = getInitializationConfig();
      expect(config.region).toBe('eu');
    });

    test('should properly filter sensitive data', () => {
      const config = { dsn: 'https://example.com' };
      const filtered = configureSentryDataFiltering(config);

      // Add test assertions for PII filtering
      expect(filtered).toHaveProperty('dsnSanitized');
    });
  });

  Integration Tests

  // __tests__/integration/sentry/instrumentation.test.ts
  import { register } from '@/instrumentation-client';

  describe('Sentry Instrumentation', () => {
    let originalSentry;
    let mockInit;

    beforeEach(() => {
      // Mock Sentry.init
      mockInit = jest.fn();
      originalSentry = jest.requireMock('@sentry/nextjs');
      originalSentry.init = mockInit;
    });

    test('should initialize Sentry with correct options in client environment', () => {
      // Mock window to simulate client environment
      global.window = {};

      register();

      expect(mockInit).toHaveBeenCalledTimes(1);
      const config = mockInit.mock.calls[0][0];

      // Verify EU region configuration
      expect(config.dsn).toContain('ingest.de.sentry.io');
      expect(config.region).toBe('eu');
    });

    test('should not initialize Sentry client in server environment', () => {
      // Ensure window is undefined to simulate server
      delete global.window;

      register();

      // Should not initialize in server context
      expect(mockInit).not.toHaveBeenCalled();
    });
  });

  Error Capture Verification

  // __tests__/integration/sentry/error-capture.test.ts
  import * as Sentry from '@sentry/nextjs';

  describe('Sentry Error Capture', () => {
    let originalCaptureException;
    let captureExceptionMock;

    beforeEach(() => {
      captureExceptionMock = jest.fn();
      originalCaptureException = Sentry.captureException;
      Sentry.captureException = captureExceptionMock;
    });

    afterEach(() => {
      Sentry.captureException = originalCaptureException;
    });

    test('should capture errors with proper context', () => {
      // Create a test error
      const error = new Error('Test error');

      // Call error reporting
      Sentry.captureException(error, {
        tags: { test: 'value' }
      });

      // Verify capture was called with correct parameters
      expect(captureExceptionMock).toHaveBeenCalledWith(error, expect.objectContaining({
        tags: expect.objectContaining({ test: 'value' })
      }));
    });
  });

  Manual Verification

  1. Development Testing:
    - Trigger intentional errors in development environment
    - Verify they appear in Sentry dashboard with proper context
    - Check EU region data residency in Sentry project settings
  2. Production Simulation:
    - Set NODE_ENV=production and test error handling
    - Verify sensitive data is properly filtered
    - Confirm Datadog integration operates correctly

  3. Logger Implementation Testing

  Unit Tests

  // __tests__/unit/lib/logger.test.ts
  import { logger, createDomainLogger, ErrorSeverity } from '@/lib/logger';

  describe('Unified Logger', () => {
    // Mock console methods
    const originalConsole = { ...console };
    let consoleLogMock;
    let consoleErrorMock;

    beforeEach(() => {
      consoleLogMock = jest.fn();
      consoleErrorMock = jest.fn();
      console.log = consoleLogMock;
      console.error = consoleErrorMock;
    });

    afterEach(() => {
      console.log = originalConsole.log;
      console.error = originalConsole.error;
    });

    test('should log messages with appropriate level', () => {
      logger.info('Test info message');

      expect(consoleLogMock).toHaveBeenCalledWith(
        expect.stringContaining('"level":"info"')
      );
    });

    test('should create domain logger with context', () => {
      const domainLogger = createDomainLogger('test-domain');
      domainLogger.info('Test domain message');

      expect(consoleLogMock).toHaveBeenCalledWith(
        expect.stringContaining('"domain":"test-domain"')
      );
    });

    test('should sanitize PII data in EU compliance mode', () => {
      // Mock EU compliance environment
      process.env.NEXT_PUBLIC_ENABLE_EU_COMPLIANCE = 'true';

      logger.info('User info', {
        email: 'test@example.com',
        name: 'Test User'
      });

      expect(consoleLogMock).toHaveBeenCalledWith(
        expect.stringContaining('"email":"[REDACTED]"')
      );

      // Reset environment
      process.env.NEXT_PUBLIC_ENABLE_EU_COMPLIANCE = 'false';
    });

    test('should send errors to Sentry', () => {
      // Mock Sentry.captureException
      const originalSentry = jest.requireMock('@sentry/nextjs');
      const mockCaptureException = jest.fn();
      originalSentry.captureException = mockCaptureException;

      const error = new Error('Test error');
      logger.error('Something went wrong', { context: 'test' }, error);

      expect(mockCaptureException).toHaveBeenCalledWith(
        error,
        expect.objectContaining({
          extra: expect.objectContaining({ context: 'test' })
        })
      );
    });
  });

  Integration Tests

  // __tests__/integration/lib/logger-integration.test.ts
  import { logger } from '@/lib/logger';
  import * as Sentry from '@sentry/nextjs';

  describe('Logger Integration', () => {
    let sentryMock;

    beforeEach(() => {
      sentryMock = jest.spyOn(Sentry, 'captureException').mockImplementation();
    });

    afterEach(() => {
      sentryMock.mockRestore();
    });

    test('should integrate with Sentry for error reporting', () => {
      const error = new Error('Integration test error');
      logger.error('Integration error', { test: true }, error);

      expect(sentryMock).toHaveBeenCalledWith(
        error,
        expect.objectContaining({
          level: 'error',
          extra: expect.objectContaining({
            test: true,
            message: 'Integration error'
          })
        })
      );
    });

    test('should generate error with proper error code', () => {
      const error = new Error('Test error with code');
      logger.logError('TEST_CODE', 'Error with code', { module: 'test' }, error);

      expect(sentryMock).toHaveBeenCalledWith(
        error,
        expect.objectContaining({
          extra: expect.objectContaining({
            error_code: 'TEST_CODE',
            module: 'test'
          })
        })
      );
    });
  });

  Migration Tests

  // __tests__/unit/lib/logger-migration.test.ts
  import {
    logger,
    enhancedLogger,
    createDomainLogger,
    ErrorSeverity,
    ErrorCategory
  } from '@/lib/logger';

  describe('Logger Migration Compatibility', () => {
    test('should provide enhancedLogger for backward compatibility', () => {
      expect(enhancedLogger).toBeDefined();
      expect(enhancedLogger.debug).toBeDefined();
      expect(enhancedLogger.info).toBeDefined();
      expect(enhancedLogger.warn).toBeDefined();
      expect(enhancedLogger.error).toBeDefined();
    });

    test('should maintain error classification exports', () => {
      expect(ErrorSeverity).toBeDefined();
      expect(ErrorCategory).toBeDefined();
    });

    test('should maintain createDomainLogger functionality', () => {
      const domainLogger = createDomainLogger('test-domain', { customField: 'value' });

      // Mock console.info
      const originalConsoleInfo = console.info;
      const mockConsoleInfo = jest.fn();
      console.info = mockConsoleInfo;

      domainLogger.info('Test message');

      console.info = originalConsoleInfo;

      expect(mockConsoleInfo).toHaveBeenCalledWith(
        expect.stringContaining('"domain":"test-domain"')
      );
      expect(mockConsoleInfo).toHaveBeenCalledWith(
        expect.stringContaining('"customField":"value"')
      );
    });
  });

  Manual Verification

  1. Import Testing:
    - Verify imports work correctly throughout the codebase
    - Check that domain loggers maintain their context
  2. Environment Testing:
    - Test in both client and server environments
    - Verify different log levels work correctly
    - Test EU compliance mode with sensitive data

  4. Clerk Express SDK Testing

  Unit Tests

  // __tests__/unit/auth/express-adapter.test.ts
  import { adaptNextRequestToExpress, createMockExpressResponse } from '@/lib/auth/express/adapter';

  describe('Clerk Express Adapter', () => {
    test('should adapt Next.js request to Express format', () => {
      // Create mock Next.js request
      const mockNextRequest = {
        url: 'https://example.com/test',
        method: 'GET',
        headers: {
          entries: () => [
            ['authorization', 'Bearer token123'],
            ['content-type', 'application/json']
          ]
        },
        cookies: {
          getAll: () => [
            { name: 'session', value: 'abc123' }
          ]
        }
      };

      const adaptedRequest = adaptNextRequestToExpress(mockNextRequest);

      expect(adaptedRequest.url).toBe('https://example.com/test');
      expect(adaptedRequest.method).toBe('GET');
      expect(adaptedRequest.headers.authorization).toBe('Bearer token123');
      expect(adaptedRequest.cookies.session).toBe('abc123');
    });

    test('should create mock Express response', () => {
      const mockResponse = createMockExpressResponse();

      expect(mockResponse.setHeader).toBeDefined();
      expect(mockResponse.getHeader).toBeDefined();
      expect(mockResponse.status).toBeDefined();
    });
  });

  Integration Tests

  // __tests__/integration/auth/auth-middleware.test.ts
  import { createClerkExpressMiddleware } from '@/lib/auth/express/adapter';
  import { NextRequest, NextResponse } from 'next/server';

  describe('Auth Middleware', () => {
    // Mock getAuth from Clerk Express
    let mockGetAuth;

    beforeEach(() => {
      jest.mock('@clerk/express', () => ({
        clerkMiddleware: jest.fn((options) => (req, res, next) => next()),
        getAuth: mockGetAuth
      }));

      mockGetAuth = jest.fn().mockReturnValue({
        userId: 'user_123',
        sessionId: 'session_abc',
        sessionClaims: { roles: ['user'] }
      });
    });

    test('should handle public routes correctly', async () => {
      const middleware = createClerkExpressMiddleware();

      // Mock public route request
      const publicRequest = new NextRequest('https://example.com/');
      const response = await middleware(publicRequest);

      expect(response.status).not.toBe(401);
    });

    test('should protect private routes', async () => {
      const middleware = createClerkExpressMiddleware();
      mockGetAuth.mockReturnValueOnce(null); // No auth

      // Mock private route request
      const privateRequest = new NextRequest('https://example.com/dashboard');
      const response = await middleware(privateRequest);

      // Should redirect to login
      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toContain('/login');
    });

    test('should attach auth to response headers', async () => {
      const middleware = createClerkExpressMiddleware();

      // Mock authenticated request
      const authRequest = new NextRequest('https://example.com/dashboard');
      const response = await middleware(authRequest);

      expect(response.headers.get('x-clerk-auth-user-id')).toBe('user_123');
      expect(response.headers.get('x-clerk-auth-session-id')).toBe('session_abc');
    });
  });

  API Protection Tests

  // __tests__/integration/auth/api-protection.test.ts
  import { withAuth, withRole } from '@/lib/auth/express/api-auth';
  import { NextRequest, NextResponse } from 'next/server';

  describe('API Protection', () => {
    test('should protect routes with authentication', async () => {
      // Create protected handler
      const protectedHandler = withAuth(async (req) => {
        return NextResponse.json({ success: true });
      });

      // Mock unauthenticated request
      const unauthRequest = new NextRequest('https://example.com/api/test');
      const unauthResponse = await protectedHandler(unauthRequest);

      expect(unauthResponse.status).toBe(401);

      // Mock authenticated request
      const authRequest = new NextRequest('https://example.com/api/test');
      // Mock auth in the adapter
      jest.mock('@clerk/express', () => ({
        getAuth: () => ({ userId: 'user_123' }),
        requireAuth: () => (req, res, next) => next()
      }));

      const authResponse = await protectedHandler(authRequest);

      expect(authResponse.status).toBe(200);
    });

    test('should enforce role requirements', async () => {
      // Create role-protected handler
      const adminHandler = withRole('admin', async (req) => {
        return NextResponse.json({ success: true });
      });

      // Mock user with wrong role
      const userRequest = new NextRequest('https://example.com/api/admin');
      // Mock auth in the adapter
      jest.mock('@clerk/express', () => ({
        getAuth: () => ({
          userId: 'user_123',
          sessionClaims: { roles: ['user'] }
        }),
        requireAuth: () => (req, res, next) => next()
      }));

      const userResponse = await adminHandler(userRequest);

      expect(userResponse.status).toBe(403);

      // Mock admin user
      const adminRequest = new NextRequest('https://example.com/api/admin');
      // Update mock
      jest.mock('@clerk/express', () => ({
        getAuth: () => ({
          userId: 'user_123',
          sessionClaims: { roles: ['admin'] }
        }),
        requireAuth: () => (req, res, next) => next()
      }));

      const adminResponse = await adminHandler(adminRequest);

      expect(adminResponse.status).toBe(200);
    });
  });

  Client Auth Tests

  // __tests__/unit/auth/client-auth.test.tsx
  import { renderHook } from '@testing-library/react-hooks';
  import { useAuth, usePermission } from '@/lib/auth/express/client-auth';

  describe('Client Authentication Hooks', () => {
    // Mock Clerk hooks
    jest.mock('@clerk/nextjs', () => ({
      useAuth: () => ({
        isSignedIn: true,
        userId: 'user_123',
        getToken: jest.fn().mockResolvedValue('token123')
      })
    }));

    test('useAuth should provide role information', async () => {
      const { result, waitForNextUpdate } = renderHook(() => useAuth());

      // Wait for async role fetching
      await waitForNextUpdate();

      expect(result.current.isSignedIn).toBe(true);
      expect(result.current.userId).toBe('user_123');
      expect(result.current.roles).toEqual(expect.any(Array));
      expect(result.current.hasRole).toBeInstanceOf(Function);
    });

    test('usePermission should check permissions correctly', async () => {
      // Mock roles
      jest.mock('@/lib/auth/express/client-auth', () => ({
        useAuth: () => ({
          isSignedIn: true,
          userId: 'user_123',
          roles: ['admin']
        })
      }));

      const { result } = renderHook(() => usePermission('org:admin'));

      expect(result.current).toBe(true);
    });
  });

  End-to-End Tests

  // __tests__/e2e/auth/auth-flow.test.ts
  import { test, expect } from '@playwright/test';

  test.describe('Authentication Flow', () => {
    test('should protect dashboard route', async ({ page }) => {
      // Try to access dashboard without auth
      await page.goto('/dashboard');

      // Should be redirected to login
      expect(page.url()).toContain('/login');
    });

    test('should maintain session after login', async ({ page }) => {
      // Log in
      await page.goto('/login');
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="password"]', 'password123');
      await page.click('button[type="submit"]');

      // Should redirect to dashboard
      await page.waitForURL('/dashboard');

      // Navigate away and back
      await page.goto('/');
      await page.goto('/dashboard');

      // Should still have access
      expect(page.url()).toContain('/dashboard');
    });

    test('should enforce role-based access', async ({ page }) => {
      // Log in with user role
      await page.goto('/login');
      await page.fill('input[name="email"]', 'user@example.com');
      await page.fill('input[name="password"]', 'password123');
      await page.click('button[type="submit"]');

      // Try to access admin page
      await page.goto('/admin');

      // Should be forbidden
      expect(page).toHaveText('h1', 'Access Denied');
    });
  });

  Manual Verification

  1. Authentication Flows:
    - Manually test login and registration
    - Test protected routes
    - Verify session persistence
  2. Role-Based Access:
    - Test with different user roles
    - Verify UI adapts to user permissions
    - Test API routes with role requirements

  5. Cross-Component Integration Testing

  Error Handling Integration

  // __tests__/integration/cross-component/error-handling.test.ts
  import { logger } from '@/lib/logger';
  import * as Sentry from '@sentry/nextjs';
  import { AuthenticationError } from '@/lib/auth/express/errors';

  describe('Cross-Component Error Handling', () => {
    let sentryCaptureExceptionMock;

    beforeEach(() => {
      sentryCaptureExceptionMock = jest.spyOn(Sentry, 'captureException').mockImplementation();
    });

    afterEach(() => {
      sentryCaptureExceptionMock.mockRestore();
    });

    test('should handle auth errors with logger and Sentry', () => {
      const authError = new AuthenticationError('Auth failed');

      // Log the error
      logger.error('Authentication failed', { source: 'auth-middleware' }, authError);

      // Verify Sentry got the error with correct context
      expect(sentryCaptureExceptionMock).toHaveBeenCalledWith(
        authError,
        expect.objectContaining({
          level: 'error',
          extra: expect.objectContaining({
            source: 'auth-middleware',
            message: 'Authentication failed'
          })
        })
      );
    });
  });

  Performance Testing

  // __tests__/performance/infrastructure.test.ts
  import { performance } from 'perf_hooks';

  describe('Infrastructure Performance', () => {
    test('should measure Sentry initialization time', async () => {
      const start = performance.now();

      // Import and register Sentry
      const { register } = await import('@/instrumentation-client');
      await register();

      const duration = performance.now() - start;

      // Should initialize quickly
      expect(duration).toBeLessThan(100); // milliseconds
    });

    test('should measure logger performance', () => {
      const { logger } = require('@/lib/logger');

      const start = performance.now();

      // Log 100 messages
      for (let i = 0; i < 100; i++) {
        logger.info(`Test message ${i}`, { index: i });
      }

      const duration = performance.now() - start;

      // Should be fast
      expect(duration / 100).toBeLessThan(1); // < 1ms per log
    });

    test('should measure auth middleware performance', async () => {
      const { createClerkExpressMiddleware } = await import('@/lib/auth/express/adapter');
      const middleware = createClerkExpressMiddleware();

      // Create mock request
      const mockRequest = {
        url: 'https://example.com/dashboard',
        nextUrl: { pathname: '/dashboard' },
        headers: new Map([['authorization', 'Bearer token123']]),
        cookies: { getAll: () => [] }
      };

      const start = performance.now();

      // Run middleware
      await middleware(mockRequest);

      const duration = performance.now() - start;

      // Should process quickly
      expect(duration).toBeLessThan(50); // milliseconds
    });
  });

  6. Testing Implementation Plan

  Phase 1: Unit Test Implementation

  1. Create test files for each component:
    - Sentry configuration tests
    - Logger unit tests
    - Clerk Express adapter tests
  2. Run tests during initial implementation:
  pnpm test __tests__/unit/sentry/config.test.ts
  pnpm test __tests__/unit/lib/logger.test.ts
  pnpm test __tests__/unit/auth/express-adapter.test.ts

  Phase 2: Integration Testing

  1. Implement integration tests for individual components:
    - Sentry instrumentation tests
    - Logger integration tests
    - Auth middleware tests
  2. Run integration tests:
  pnpm test __tests__/integration

  Phase 3: Cross-Component Testing

  1. Implement tests for interactions between components:
    - Error handling integration
    - Authentication with logging
  2. Run cross-component tests:
  pnpm test __tests__/integration/cross-component

  Phase 4: End-to-End Testing

  1. Implement E2E tests for key flows:
    - Authentication flows
    - Error reporting in production environment
    - Logging in different environments
  2. Run E2E tests:
  pnpm test __tests__/e2e

  Phase 5: Performance Testing

  1. Implement performance tests:
    - Initialization times
    - Operation throughput
    - Memory usage
  2. Run performance tests:
  pnpm test __tests__/performance

  Phase 6: Manual Verification

  Create a checklist for manual verification:

  1. Sentry Verification:
    - Errors appear in Sentry dashboard
    - EU region data storage is confirmed
    - Transaction tracking works correctly
    - Source maps are properly uploaded
  2. Logger Verification:
    - All log levels work in client and server
    - Domain loggers maintain context
    - EU compliance redacts sensitive data
    - Integration with Sentry works correctly
  3. Clerk Express Verification:
    - Authentication flows are smooth
    - Protected routes work correctly
    - Role-based access control functions
    - API route protection is effective

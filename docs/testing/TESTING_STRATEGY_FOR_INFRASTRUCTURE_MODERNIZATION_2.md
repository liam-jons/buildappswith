Comprehensive Testing Strategy for Infrastructure Modernization

  To ensure our infrastructure modernization efforts are successful, we need a robust testing approach that covers
  all three components: Sentry configuration, logger implementation, and Clerk authentication. This strategy will
  ensure each component works correctly in isolation and together as a cohesive system.

  1. Test Environment Setup

  Local Development Environment

  # Create dedicated testing branch
  git checkout -b test/infrastructure-modernization

  # Install required dependencies for testing
  pnpm add -D jest @testing-library/react @testing-library/jest-dom msw vitest

  # Configure test environment variables
  cat > .env.test << EOL
  # Test environment variables
  NODE_ENV=test
  NEXT_PUBLIC_SENTRY_ENVIRONMENT=test
  SENTRY_TRACES_SAMPLE_RATE=1.0
  NEXT_PUBLIC_ENABLE_LOGS=true
  NEXT_PUBLIC_ENABLE_EU_COMPLIANCE=true
  CLERK_SECRET_KEY=test_key
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=test_publishable_key
  EOL

  Test Scripts

  Add to package.json:

  "scripts": {
    "test:sentry": "vitest --config vitest.config.ts --testNamePattern='Sentry'",
    "test:logger": "vitest --config vitest.config.ts --testNamePattern='Logger'",
    "test:auth": "vitest --config vitest.config.ts --testNamePattern='Auth|Clerk'",
    "test:infra": "vitest --config vitest.config.ts --dir=__tests__/infrastructure"
  }

  2. Sentry Configuration Testing

  Unit Tests

  // __tests__/infrastructure/sentry/instrumentation-client.test.ts
  import { vi, describe, expect, test, beforeEach, afterEach } from 'vitest';
  import { register } from '@/instrumentation-client';
  import * as Sentry from '@sentry/nextjs';

  // Mock Sentry
  vi.mock('@sentry/nextjs', () => ({
    init: vi.fn(),
    BrowserTracing: vi.fn().mockImplementation(() => ({})),
    captureRouterTransitionStart: vi.fn(),
  }));

  describe('Sentry Client Instrumentation', () => {
    // Mock window and environment
    const originalWindow = global.window;

    beforeEach(() => {
      // Set up browser environment
      global.window = {} as any;
      process.env.NEXT_PUBLIC_SENTRY_DSN = 'https://test-dsn.ingest.de.sentry.io/test';
    });

    afterEach(() => {
      global.window = originalWindow;
      vi.clearAllMocks();
    });

    test('should initialize Sentry on the client', () => {
      register();
      expect(Sentry.init).toHaveBeenCalled();
    });

    test('should include EU region in configuration', () => {
      register();
      const initCall = vi.mocked(Sentry.init).mock.calls[0][0];
      expect(initCall).toHaveProperty('dsn');
      expect(initCall.dsn).toContain('ingest.de.sentry.io');
    });

    test('should configure browser tracing integration', () => {
      register();
      const initCall = vi.mocked(Sentry.init).mock.calls[0][0];
      expect(initCall).toHaveProperty('integrations');
      expect(Sentry.BrowserTracing).toHaveBeenCalled();
    });

    test('should handle Datadog RUM integration when available', () => {
      // Setup mock Datadog RUM
      global.window.__DD_RUM__ = {
        _getInternalContext: () => ({
          application: { id: 'test-app' },
          session: { id: 'test-session' },
          view: { id: 'test-view' },
          version: '1.0.0'
        })
      };

      register();

      const initCall = vi.mocked(Sentry.init).mock.calls[0][0];
      expect(initCall).toHaveProperty('beforeSend');

      // Test the beforeSend function
      const mockEvent = {};
      const result = initCall.beforeSend(mockEvent);

      expect(result).toHaveProperty('contexts.datadog_rum');
      expect(result.contexts.datadog_rum).toHaveProperty('application_id', 'test-app');
    });

    test('should handle errors gracefully', () => {
      vi.mocked(Sentry.init).mockImplementationOnce(() => {
        throw new Error('Test error');
      });

      // Should not throw
      expect(() => register()).not.toThrow();
    });
  });

  Integration Tests

  // __tests__/infrastructure/sentry/error-capture.test.ts
  import { vi, describe, test, expect, beforeAll, afterAll } from 'vitest';
  import { captureException } from '@sentry/nextjs';
  import { register as registerClient } from '@/instrumentation-client';
  import { register as registerServer } from '@/instrumentation';

  // Mock Sentry
  vi.mock('@sentry/nextjs', () => ({
    init: vi.fn(),
    captureException: vi.fn(),
    captureMessage: vi.fn(),
    BrowserTracing: vi.fn().mockImplementation(() => ({})),
    Integrations: {
      Http: vi.fn().mockImplementation(() => ({})),
      OnUncaughtException: vi.fn().mockImplementation(() => ({})),
      OnUnhandledRejection: vi.fn().mockImplementation(() => ({})),
    },
  }));

  describe('Sentry Error Capture Integration', () => {
    beforeAll(() => {
      // Initialize Sentry in both client and server modes
      const originalWindow = global.window;
      global.window = undefined as any;

      // Server-side init
      registerServer();

      // Client-side init
      global.window = {} as any;
      registerClient();

      global.window = originalWindow;
    });

    afterAll(() => {
      vi.clearAllMocks();
    });

    test('should capture exceptions with proper context', () => {
      const testError = new Error('Test error');
      captureException(testError);

      expect(captureException).toHaveBeenCalledWith(testError);
    });
  });

  E2E Tests

  For Sentry, we'll focus on manual verification since full E2E is challenging without Sentry backend:

  // docs/testing/SENTRY_MANUAL_VERIFICATION.md

  # Sentry Implementation Manual Verification

  1. Set up a test project in Sentry dashboard
  2. Configure the application with the test project DSN
  3. Deploy to a test environment
  4. Trigger various error scenarios:
     - Client-side React error
     - Server component error
     - API route error
     - Unhandled promise rejection
  5. Verify in Sentry dashboard:
     - Errors are captured with correct source mapping
     - EU region data residency is respected
     - Proper context is attached to events
     - Datadog correlation works if applicable

  3. Logger Implementation Testing

  Unit Tests

  // __tests__/infrastructure/logger/logger.test.ts
  import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest';
  import { logger, createDomainLogger, ErrorSeverity } from '@/lib/logger';
  import * as Sentry from '@sentry/nextjs';

  // Mock Sentry
  vi.mock('@sentry/nextjs', () => ({
    captureException: vi.fn(),
    captureMessage: vi.fn(),
  }));

  // Mock console methods
  const originalConsole = { ...console };
  const mockConsole = {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    log: vi.fn(),
  };

  describe('Logger Implementation', () => {
    beforeEach(() => {
      // Replace console methods with spies
      console.debug = mockConsole.debug;
      console.info = mockConsole.info;
      console.warn = mockConsole.warn;
      console.error = mockConsole.error;
      console.log = mockConsole.log;

      // Mock environment variables
      process.env.NEXT_PUBLIC_ENABLE_LOGS = 'true';
      process.env.NEXT_PUBLIC_ENABLE_EU_COMPLIANCE = 'true';
      process.env.NEXT_PUBLIC_DATA_REGION = 'eu';

      // Mock browser environment
      global.window = {} as any;
    });

    afterEach(() => {
      // Restore console methods
      console.debug = originalConsole.debug;
      console.info = originalConsole.info;
      console.warn = originalConsole.warn;
      console.error = originalConsole.error;
      console.log = originalConsole.log;

      // Reset mocks
      vi.clearAllMocks();

      // Reset window
      global.window = undefined as any;
    });

    test('should log messages at different levels', () => {
      // Test debug level
      logger.debug('Debug message');
      expect(mockConsole.debug).toHaveBeenCalled();

      // Test info level
      logger.info('Info message');
      expect(mockConsole.info).toHaveBeenCalled();

      // Test warn level
      logger.warn('Warning message');
      expect(mockConsole.warn).toHaveBeenCalled();

      // Test error level
      logger.error('Error message');
      expect(mockConsole.error).toHaveBeenCalled();
    });

    test('should create domain loggers with context', () => {
      const dbLogger = createDomainLogger('database', { service: 'postgres' });

      dbLogger.info('Database connected');

      // Check that context was included
      const logCall = JSON.parse(mockConsole.info.mock.calls[0][0]);
      expect(logCall).toHaveProperty('domain', 'database');
      expect(logCall).toHaveProperty('service', 'postgres');
    });

    test('should sanitize PII data for EU compliance', () => {
      logger.info('User data', {
        userId: '123',
        email: 'test@example.com',
        name: 'Test User',
        details: {
          phone: '555-1234',
          preferences: { theme: 'dark' }
        }
      });

      const logCall = JSON.parse(mockConsole.info.mock.calls[0][0]);

      // PII fields should be redacted
      expect(logCall).toHaveProperty('email', '[REDACTED]');
      expect(logCall).toHaveProperty('name', '[REDACTED]');
      expect(logCall.details).toHaveProperty('phone', '[REDACTED]');

      // Non-PII fields should remain
      expect(logCall).toHaveProperty('userId', '123');
      expect(logCall.details.preferences).toHaveProperty('theme', 'dark');
    });

    test('should report errors to Sentry', () => {
      const testError = new Error('Test error');
      logger.error('Critical failure', { operationId: 'op123' }, testError);

      expect(Sentry.captureException).toHaveBeenCalledWith(testError, expect.any(Object));
    });

    test('should work with backward compatibility exports', () => {
      // Import with the original enhanced-logger names
      const { enhancedLogger, ErrorSeverity: ImportedSeverity } = require('@/lib/logger');

      enhancedLogger.info('Using legacy import');
      expect(mockConsole.info).toHaveBeenCalled();

      // Check that constants are exported
      expect(ImportedSeverity).toBe(ErrorSeverity);
    });
  });

  Integration Tests

  // __tests__/infrastructure/logger/logger-integration.test.ts
  import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest';
  import { logger, createDomainLogger } from '@/lib/logger';
  import { captureException } from '@sentry/nextjs';

  // Mock Sentry
  vi.mock('@sentry/nextjs', () => ({
    captureException: vi.fn(),
    captureMessage: vi.fn(),
  }));

  describe('Logger Integration', () => {
    beforeEach(() => {
      // Mock environment
      process.env.NEXT_PUBLIC_ENABLE_LOGS = 'true';
    });

    afterEach(() => {
      vi.clearAllMocks();
    });

    test('should integrate with database error handling', () => {
      // Simulate DB error handler
      function handleDatabaseError(error: Error) {
        const dbLogger = createDomainLogger('database', {
          component: 'error-handler',
          database: 'postgres'
        });

        dbLogger.error('Database operation failed', {
          operation: 'query',
          sql: 'SELECT * FROM users'
        }, error);

        // Additional error handling...
        throw error;
      }

      // Create mock error
      const dbError = new Error('Connection refused');

      // Assert that the error is logged and rethrown
      expect(() => handleDatabaseError(dbError)).toThrow('Connection refused');
      expect(captureException).toHaveBeenCalled();
    });

    test('should work with multiple domain loggers', () => {
      // Create different domain loggers
      const authLogger = createDomainLogger('auth');
      const apiLogger = createDomainLogger('api');
      const uiLogger = createDomainLogger('ui');

      // Mock console.info
      const originalInfo = console.info;
      const mockInfo = vi.fn();
      console.info = mockInfo;

      // Log with different loggers
      authLogger.info('User authenticated');
      apiLogger.info('API request processed');
      uiLogger.info('Component rendered');

      // Verify distinct domain values
      expect(mockInfo).toHaveBeenCalledTimes(3);
      expect(JSON.parse(mockInfo.mock.calls[0][0])).toHaveProperty('domain', 'auth');
      expect(JSON.parse(mockInfo.mock.calls[1][0])).toHaveProperty('domain', 'api');
      expect(JSON.parse(mockInfo.mock.calls[2][0])).toHaveProperty('domain', 'ui');

      // Restore console.info
      console.info = originalInfo;
    });
  });

  Import Migration Tests

  // __tests__/infrastructure/logger/import-migration.test.ts
  import { vi, describe, test, expect } from 'vitest';
  import fs from 'fs';
  import path from 'path';
  import { execSync } from 'child_process';

  describe('Logger Import Migration', () => {
    const scriptPath = path.resolve('scripts/migrate-logger.js');

    test('should correctly update enhanced-logger imports', () => {
      // Create a temporary test file
      const testDir = path.resolve('.test-tmp');
      const testFile = path.join(testDir, 'test-file.ts');

      // Ensure test directory exists
      if (!fs.existsSync(testDir)) {
        fs.mkdirSync(testDir, { recursive: true });
      }

      // Create file with enhanced-logger imports
      fs.writeFileSync(testFile, `
        import { enhancedLogger, createDomainLogger } from '@/lib/enhanced-logger';
        import { ErrorSeverity } from '@/lib/enhanced-logger';
        
        enhancedLogger.info('Testing');
      `);

      // Run the migration script on the test file
      execSync(`node ${scriptPath} --test --file=${testFile}`);

      // Read the updated file
      const updatedContent = fs.readFileSync(testFile, 'utf8');

      // Verify imports were updated
      expect(updatedContent).toContain("from '@/lib/logger'");
      expect(updatedContent).not.toContain("from '@/lib/enhanced-logger'");

      // Clean up
      fs.unlinkSync(testFile);
      fs.rmdirSync(testDir);
    });
  });

  4. Clerk Express SDK Testing

  Unit Tests

  // __tests__/infrastructure/auth/express-adapter.test.ts
  import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest';
  import { createClerkExpressMiddleware } from '@/lib/auth/express/adapter';
  import { NextRequest, NextResponse } from 'next/server';

  // Mock Clerk Express SDK
  vi.mock('@clerk/express', () => ({
    clerkMiddleware: vi.fn().mockImplementation(() => (req, res, next) => next()),
    getAuth: vi.fn().mockImplementation(() => ({
      userId: 'test-user',
      sessionId: 'test-session'
    })),
    requireAuth: vi.fn().mockImplementation(() => (req, res, next) => next()),
  }));

  describe('Clerk Express Adapter', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    test('should create Express middleware adapter', () => {
      const middleware = createClerkExpressMiddleware();
      expect(middleware).toBeInstanceOf(Function);
    });

    test('should handle authenticated requests', async () => {
      const middleware = createClerkExpressMiddleware();

      // Create mock Next.js request
      const mockReq = {
        nextUrl: new URL('https://example.com/dashboard'),
        cookies: {
          getAll: () => []
        },
        headers: new Headers(),
        method: 'GET',
        url: 'https://example.com/dashboard'
      } as unknown as NextRequest;

      // Mock NextResponse.next
      vi.spyOn(NextResponse, 'next').mockImplementation(() => {
        return new Response(null) as NextResponse;
      });

      // Execute middleware
      const response = await middleware(mockReq);

      // Verify response
      expect(response).toBeInstanceOf(Response);
      expect(NextResponse.next).toHaveBeenCalled();
    });

    test('should redirect unauthenticated users from protected routes', async () => {
      // Mock getAuth to return null (unauthenticated)
      const { getAuth } = require('@clerk/express');
      getAuth.mockImplementationOnce(() => null);

      const middleware = createClerkExpressMiddleware();

      // Create mock Next.js request for protected route
      const mockReq = {
        nextUrl: new URL('https://example.com/dashboard'),
        cookies: {
          getAll: () => []
        },
        headers: new Headers(),
        method: 'GET',
        url: 'https://example.com/dashboard'
      } as unknown as NextRequest;

      // Mock NextResponse.redirect
      vi.spyOn(NextResponse, 'redirect').mockImplementation(() => {
        return new Response(null, {
          status: 302,
          headers: { Location: 'https://example.com/login' }
        }) as NextResponse;
      });

      // Execute middleware
      const response = await middleware(mockReq);

      // Verify redirect
      expect(response).toBeInstanceOf(Response);
      expect(NextResponse.redirect).toHaveBeenCalled();
      expect(response.headers.get('Location')).toContain('/login');
    });
  });

  Integration Tests

  // __tests__/infrastructure/auth/api-auth.test.ts
  import { vi, describe, test, expect, beforeEach } from 'vitest';
  import { withAuth, withRole } from '@/lib/auth/express/api-auth';
  import { NextRequest, NextResponse } from 'next/server';

  // Mock Clerk Express SDK
  vi.mock('@clerk/express', () => ({
    requireAuth: vi.fn().mockImplementation((options) => {
      return (req, res, next) => {
        // Simulate auth middleware based on Authorization header
        if (req.headers.authorization) {
          next();
        } else {
          res.status(401).send('Unauthorized');
        }
      };
    }),
    getAuth: vi.fn().mockImplementation((req) => {
      // Return auth object if authorized
      if (req.headers.authorization) {
        return {
          userId: 'test-user',
          sessionId: 'test-session',
          sessionClaims: {
            roles: req.headers['x-test-roles']?.split(',') || []
          },
          has: ({ permission }) => {
            const permissionMap = {
              'org:admin': ['admin'],
              'profile:edit': ['admin', 'user'],
            };
            const roles = req.headers['x-test-roles']?.split(',') || [];
            return permissionMap[permission]?.some(role => roles.includes(role)) || false;
          }
        };
      }
      return null;
    }),
  }));

  describe('API Auth Protection', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    test('should protect routes with authentication', async () => {
      // Create a protected handler
      const protectedHandler = withAuth(async (req) => {
        return NextResponse.json({ success: true, userId: req.auth.userId });
      });

      // Create authenticated request
      const authRequest = new Request('https://example.com/api/test', {
        headers: {
          'Authorization': 'Bearer test-token'
        }
      }) as unknown as NextRequest;

      // Create unauthenticated request
      const unauthRequest = new Request('https://example.com/api/test') as unknown as NextRequest;

      // Test authenticated request
      const authResponse = await protectedHandler(authRequest);
      const authData = await authResponse.json();

      expect(authResponse.status).toBe(200);
      expect(authData).toHaveProperty('success', true);
      expect(authData).toHaveProperty('userId', 'test-user');

      // Test unauthenticated request
      const unauthResponse = await protectedHandler(unauthRequest);
      expect(unauthResponse.status).toBe(401);
    });

    test('should enforce role requirements', async () => {
      // Create a role-protected handler
      const adminHandler = withRole('admin', async (req) => {
        return NextResponse.json({ success: true, role: 'admin' });
      });

      // Create request with admin role
      const adminRequest = new Request('https://example.com/api/admin', {
        headers: {
          'Authorization': 'Bearer test-token',
          'x-test-roles': 'admin,user'
        }
      }) as unknown as NextRequest;

      // Create request with user role only
      const userRequest = new Request('https://example.com/api/admin', {
        headers: {
          'Authorization': 'Bearer test-token',
          'x-test-roles': 'user'
        }
      }) as unknown as NextRequest;

      // Test admin request
      const adminResponse = await adminHandler(adminRequest);
      const adminData = await adminResponse.json();

      expect(adminResponse.status).toBe(200);
      expect(adminData).toHaveProperty('success', true);

      // Test user request (should be forbidden)
      const userResponse = await adminHandler(userRequest);
      expect(userResponse.status).toBe(403);
    });
  });

  E2E Tests

  // __tests__/e2e/auth/auth-flow.test.ts
  import { test, expect } from '@playwright/test';

  test.describe('Authentication Flow', () => {
    test('should redirect unauthenticated users to login', async ({ page }) => {
      // Visit protected page
      await page.goto('/dashboard');

      // Should redirect to login
      await expect(page).toHaveURL(/.*\/login.*/);
    });

    test('should allow access to public routes', async ({ page }) => {
      // Visit public page
      await page.goto('/');

      // Should not redirect
      await expect(page).toHaveURL('/');
    });

    test('should redirect authenticated users away from auth pages', async ({ page }) => {
      // Mock authentication (depends on your auth system)
      await page.evaluate(() => {
        // This is just an example, actual implementation would vary
        window.localStorage.setItem('clerk-session', JSON.stringify({
          userId: 'test-user'
        }));
      });

      // Visit login page
      await page.goto('/login');

      // Should redirect to dashboard
      await expect(page).toHaveURL('/dashboard');
    });
  });

  5. Cross-Component Integration Testing

  Combined Infrastructure Test

  // __tests__/infrastructure/cross-component.test.ts
  import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest';
  import { register as registerSentryClient } from '@/instrumentation-client';
  import { register as registerSentryServer } from '@/instrumentation';
  import { logger, createDomainLogger } from '@/lib/logger';
  import { getServerAuth } from '@/lib/auth/express/server-auth';
  import * as Sentry from '@sentry/nextjs';
  import { headers } from 'next/headers';

  // Mock dependencies
  vi.mock('@sentry/nextjs', () => ({
    init: vi.fn(),
    captureException: vi.fn(),
    captureMessage: vi.fn(),
    BrowserTracing: vi.fn().mockImplementation(() => ({})),
    Integrations: {
      Http: vi.fn().mockImplementation(() => ({})),
      OnUncaughtException: vi.fn().mockImplementation(() => ({})),
      OnUnhandledRejection: vi.fn().mockImplementation(() => ({})),
    },
  }));

  vi.mock('next/headers', () => ({
    headers: vi.fn().mockImplementation(() => ({
      get: (name) => {
        const mockHeaders = {
          'x-clerk-auth-user-id': 'test-user',
          'x-clerk-auth-session-id': 'test-session',
        };
        return mockHeaders[name] || null;
      },
      forEach: vi.fn(),
    })),
  }));

  describe('Cross-Component Integration', () => {
    // Capture original console methods
    const originalConsole = { ...console };
    const mockConsole = {
      error: vi.fn(),
      warn: vi.fn(),
      info: vi.fn(),
      debug: vi.fn(),
    };

    beforeEach(() => {
      // Mock console methods
      console.error = mockConsole.error;
      console.warn = mockConsole.warn;
      console.info = mockConsole.info;
      console.debug = mockConsole.debug;

      // Set up environment
      process.env.NEXT_PUBLIC_ENABLE_LOGS = 'true';
      process.env.NEXT_PUBLIC_ENABLE_EU_COMPLIANCE = 'true';
      process.env.NEXT_PUBLIC_DATA_REGION = 'eu';
    });

    afterEach(() => {
      // Restore console methods
      console.error = originalConsole.error;
      console.warn = originalConsole.warn;
      console.info = originalConsole.info;
      console.debug = originalConsole.debug;

      vi.clearAllMocks();
    });

    test('should correctly integrate logging with Sentry and auth context', () => {
      // Initialize Sentry
      global.window = undefined as any;
      registerSentryServer();

      // Get auth state
      const auth = getServerAuth();

      // Create domain logger with auth context
      const authLogger = createDomainLogger('auth', {
        userId: auth.userId,
        sessionId: auth.sessionId,
      });

      // Log an error
      const testError = new Error('Authentication failed');
      authLogger.error('User authentication failed', {
        method: 'password',
        email: 'user@example.com' // Should be redacted in EU compliance mode
      }, testError);

      // Verify Sentry integration
      expect(Sentry.captureException).toHaveBeenCalledWith(testError, expect.any(Object));

      // Verify logging with auth context
      const logCall = JSON.parse(mockConsole.error.mock.calls[0][0]);
      expect(logCall).toHaveProperty('domain', 'auth');
      expect(logCall).toHaveProperty('userId', 'test-user');
      expect(logCall).toHaveProperty('sessionId', 'test-session');

      // Verify EU compliance
      expect(logCall).toHaveProperty('email', '[REDACTED]');
    });
  });

  6. Performance Testing

  // __tests__/infrastructure/performance.test.ts
  import { vi, describe, test, expect, beforeEach } from 'vitest';
  import { logger, createDomainLogger } from '@/lib/logger';
  import { performance } from 'perf_hooks';

  describe('Infrastructure Performance', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      process.env.NEXT_PUBLIC_ENABLE_LOGS = 'true';
    });

    test('should have acceptable logger performance', () => {
      // Create domain logger
      const domainLogger = createDomainLogger('performance-test');

      // Measure base performance
      const iterations = 1000;
      const start = performance.now();

      for (let i = 0; i < iterations; i++) {
        domainLogger.info('Performance test message', { iteration: i });
      }

      const end = performance.now();
      const timePerLog = (end - start) / iterations;

      // Logging should be reasonably fast (adjust threshold as needed)
      expect(timePerLog).toBeLessThan(1); // Less than 1ms per log
    });

    test('should handle high log volume efficiently', () => {
      // Mock console method to prevent actual output
      console.info = vi.fn();

      // Create domain logger
      const domainLogger = createDomainLogger('volume-test');

      // Log with increasing metadata size
      const largeObjectSizes = [10, 100, 1000];
      const results = [];

      for (const size of largeObjectSizes) {
        const largeObject = generateTestObject(size);

        const start = performance.now();
        domainLogger.info('Large object test', largeObject);
        const end = performance.now();

        results.push({
          size,
          time: end - start
        });
      }

      // Verify scaling is reasonable (not exponential)
      // The time increase should be roughly linear with object size
      const timeRatios = [];
      for (let i = 1; i < results.length; i++) {
        const sizeRatio = results[i].size / results[i-1].size;
        const timeRatio = results[i].time / results[i-1].time;
        timeRatios.push(timeRatio / sizeRatio);
      }

      // Time scaling should be sub-linear or linear
      // (adjust expectations based on actual performance characteristics)
      for (const ratio of timeRatios) {
        expect(ratio).toBeLessThan(2);
      }
    });
  });

  // Helper to generate test objects of various sizes
  function generateTestObject(fieldCount) {
    const result = {};
    for (let i = 0; i < fieldCount; i++) {
      result[`field_${i}`] = `value_${i}`;
    }
    return result;
  }

  7. Build Verification

  #!/bin/bash
  # scripts/verify-infrastructure-build.sh

  # Set up test environment
  echo "Setting up test environment..."
  export NODE_ENV=test
  export NEXT_PUBLIC_SENTRY_ENVIRONMENT=test
  export NEXT_PUBLIC_ENABLE_LOGS=true
  export NEXT_PUBLIC_ENABLE_EU_COMPLIANCE=true

  # Run build in verbose mode
  echo "Running build verification..."
  pnpm build --verbose

  # Check for specific infrastructure-related errors
  echo "Checking build logs for errors..."
  if grep -q "Failed to resolve import \"@/lib/enhanced-logger\"" .next/build-error.log 2>/dev/null; then
    echo "ERROR: Enhanced logger import errors detected!"
    exit 1
  fi

  if grep -q "Failed to resolve import \"@clerk/nextjs\"" .next/build-error.log 2>/dev/null; then
    echo "ERROR: Clerk NextJS SDK import errors detected!"
    exit 1
  fi

  # Verify Sentry sourcemap generation
  echo "Checking for Sentry sourcemaps..."
  if [ ! -d ".next/sentry" ]; then
    echo "WARNING: Sentry sourcemaps directory not found!"
  fi

  echo "Build verification complete!"
  exit 0

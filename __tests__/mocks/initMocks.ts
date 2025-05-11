/**
 * Initialize mock server for tests
 *
 * This file sets up the MSW mock server for use in tests.
 */
import { mockServer, enableMockServerLogging } from './server';
import { beforeAll, afterEach, afterAll, vi } from 'vitest';
import { handlers } from './handlers';

// Server state tracked at module level
let serverStarted = false;
let activeTestRuns = 0;

/**
 * Create global mocks needed by tests
 */
export function setupGlobalMocks() {
  // Add any global mocks here
  vi.mock('next/navigation', () => ({
    useRouter: vi.fn(() => ({
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      pathname: '/',
      query: {},
    })),
    usePathname: vi.fn(() => '/'),
    useSearchParams: vi.fn(() => new URLSearchParams()),
    notFound: vi.fn(),
    redirect: vi.fn(),
  }));
}

/**
 * Set up mock server for running tests
 * @param debug Enable detailed debug logging
 * @param logOptions Additional logging options
 */
export function setupMockServer(
  debug = false,
  logOptions = { showRequestDetails: false, showHeaders: false }
) {
  // Enable debug logging if requested
  if (debug) {
    enableMockServerLogging(logOptions);
  }

  // Start the server before all tests - ensure we only do this once
  beforeAll(() => {
    // Increment active test runs
    activeTestRuns++;

    if (!serverStarted) {
      serverStarted = true;
      mockServer.listen({
        onUnhandledRequest: debug ? 'warn' : 'bypass'
      });
      console.log('[MSW] Server started');
    } else {
      // Server already running, just reset handlers to default
      mockServer.resetHandlers();
      mockServer.use(...handlers);
      console.log('[MSW] Server already running, handlers reset to default');
    }
  });

  // Reset handlers after each test
  afterEach(() => {
    mockServer.resetHandlers();
    // Re-apply default handlers after reset
    mockServer.use(...handlers);
  });

  // Clean up after all tests are done, but only if this is the last active test suite
  afterAll(() => {
    // Decrement active test runs
    activeTestRuns--;

    if (activeTestRuns <= 0) {
      mockServer.close();
      serverStarted = false;
      activeTestRuns = 0; // Safety reset
      console.log('[MSW] Server stopped');
    } else {
      console.log(`[MSW] Server kept running for ${activeTestRuns} active test suites`);
    }
  });
}

/**
 * Start the mock server for a specific test
 * Use this for tests that need MSW but aren't using the beforeAll/afterAll setup
 * @param debug Enable detailed debug logging
 * @param logOptions Additional logging options
 */
export function startMockServer(
  debug = false,
  logOptions = { showRequestDetails: false, showHeaders: false }
) {
  if (!serverStarted) {
    serverStarted = true;
    activeTestRuns++;

    if (debug) {
      enableMockServerLogging(logOptions);
    }

    mockServer.listen({
      onUnhandledRequest: debug ? 'warn' : 'bypass'
    });
    console.log('[MSW] Server started manually');
  } else {
    // Just reset handlers if server is already running
    mockServer.resetHandlers();
    mockServer.use(...handlers);
  }

  return mockServer;
}

/**
 * Stop the mock server
 * Use this to clean up after a test that uses startMockServer
 */
export function stopMockServer() {
  if (serverStarted) {
    // Decrement active test runs
    activeTestRuns--;

    if (activeTestRuns <= 0) {
      mockServer.close();
      serverStarted = false;
      activeTestRuns = 0; // Safety reset
      console.log('[MSW] Server stopped manually');
    } else {
      // Just reset handlers if other tests are still running
      mockServer.resetHandlers();
      console.log(`[MSW] Server kept running for ${activeTestRuns} active test suites, handlers reset`);
    }
  }
}

/**
 * Reset the mock server handlers
 * Use this to reset handlers between test cases and reapply defaults
 */
export function resetMockServerHandlers() {
  mockServer.resetHandlers();
  mockServer.use(...handlers);
}

/**
 * Use this function for one-off tests with MSW
 * @param callback Function to run with the server active
 * @param debug Enable detailed debug logging
 * @param logOptions Additional logging options
 */
export async function withMockServer<T>(
  callback: () => Promise<T>,
  debug = false,
  logOptions = { showRequestDetails: false, showHeaders: false }
): Promise<T> {
  const wasActive = serverStarted;

  try {
    if (!wasActive) {
      serverStarted = true;
      activeTestRuns++;

      if (debug) {
        enableMockServerLogging(logOptions);
      }

      mockServer.listen({
        onUnhandledRequest: debug ? 'warn' : 'bypass'
      });
      console.log('[MSW] Server started for withMockServer');
    }

    return await callback();
  } finally {
    if (!wasActive) {
      mockServer.close();
      serverStarted = false;
      activeTestRuns--;
      console.log('[MSW] Server stopped after withMockServer');
    } else {
      // Just reset handlers if server was already active
      mockServer.resetHandlers();
      mockServer.use(...handlers);
    }
  }
}
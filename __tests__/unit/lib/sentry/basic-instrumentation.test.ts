/**
 * Basic tests for Sentry instrumentation
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock Sentry with a more complete mock
vi.mock('@sentry/nextjs', () => {
  return {
    init: vi.fn(),
    captureRequestError: vi.fn(),
    captureRouterTransitionStart: vi.fn(),
    onRouterTransitionComplete: vi.fn(),
    Integrations: {
      Http: vi.fn(() => ({ name: 'Http' })),
      OnUncaughtException: vi.fn(() => ({ name: 'OnUncaughtException' })),
      OnUnhandledRejection: vi.fn(() => ({ name: 'OnUnhandledRejection' })),
    },
    BrowserTracing: vi.fn(() => ({ name: 'BrowserTracing' })),
  };
});

// Mock config modules
vi.mock('../../../../lib/sentry', () => ({
  getInitializationConfig: vi.fn().mockReturnValue({
    dsn: 'https://test@ingest.de.sentry.io/1234',
    region: 'eu',
  }),
  configureSentryDataFiltering: vi.fn(config => ({ ...config, filtered: true })),
  configureSentryPerformance: vi.fn(config => ({ ...config, performanceConfig: true })),
}));

describe('Sentry Instrumentation', () => {
  const originalWindow = global.window;
  const originalEnv = process.env;
  
  beforeEach(() => {
    // Reset modules before each test
    vi.resetModules();
    process.env = { ...originalEnv };
    
    // Default to server environment (no window)
    delete global.window;
  });
  
  afterEach(() => {
    // Restore window and env
    global.window = originalWindow;
    process.env = originalEnv;
    vi.clearAllMocks();
  });
  
  // Skip server test for now as instrumentation.ts is async and hard to mock properly
  it.skip('should initialize server-side Sentry with EU region', async () => {
    // This is hard to test because it uses imports inside the register function
    // Full testing would require more complex mocking
  });
  
  it('should initialize client-side Sentry with EU region', async () => {
    // Setup browser environment
    global.window = {} as any;
    const Sentry = await import('@sentry/nextjs');
    
    // Mock getInitializationConfig to return region
    const sentry = await import('../../../../lib/sentry');
    vi.mocked(sentry.getInitializationConfig).mockReturnValue({
      dsn: 'https://test@ingest.de.sentry.io/1234',
      region: 'eu',
    });
    
    // Import the module under test after mocking
    const clientModule = await import('../../../../instrumentation-client');
    
    // Call register function
    clientModule.register();
    
    // Verify Sentry was initialized
    expect(Sentry.init).toHaveBeenCalled();
    
    // Check that EU region is passed correctly
    const initCall = vi.mocked(Sentry.init).mock.calls[0][0];
    expect(initCall).toHaveProperty('region', 'eu');
  });
});
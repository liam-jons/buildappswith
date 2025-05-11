/**
 * Unit tests for Sentry instrumentation
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock Sentry
vi.mock('@sentry/nextjs', () => ({
  init: vi.fn(),
  Integrations: {
    Http: vi.fn(),
    OnUncaughtException: vi.fn(),
    OnUnhandledRejection: vi.fn(),
  },
  captureRequestError: vi.fn(),
}));

// Mock lib/sentry
vi.mock('../../../../lib/sentry', () => ({
  getInitializationConfig: vi.fn().mockReturnValue({
    dsn: 'https://mock-dsn@ingest.de.sentry.io/123456',
    region: 'eu',
  }),
  configureSentryDataFiltering: vi.fn((config) => ({ ...config, filtered: true })),
  configureSentryPerformance: vi.fn((config) => ({ ...config, performanceConfig: true })),
}));

describe('Sentry Instrumentation', () => {
  const originalEnv = { ...process.env };
  const originalWindow = global.window;
  
  beforeEach(() => {
    // Reset mocks and modules before each test
    vi.resetModules();
    process.env = { ...originalEnv };
    
    // Mock server environment (no window)
    delete global.window;
  });
  
  afterEach(() => {
    // Clean up after each test
    process.env = originalEnv;
    global.window = originalWindow;
    vi.clearAllMocks();
  });
  
  it('should initialize Sentry correctly in Node.js runtime', async () => {
    // Setup Node.js runtime environment
    process.env.NEXT_RUNTIME = 'nodejs';
    
    // Import the modules (will use the mocks)
    const { register } = await import('../../../../instrumentation');
    const Sentry = await import('@sentry/nextjs');
    
    // Call the register function
    await register();
    
    // Verify Sentry init was called with correct config
    expect(Sentry.init).toHaveBeenCalledTimes(1);
    const initCall = Sentry.init.mock.calls[0][0];
    expect(initCall.region).toBe('eu');
    expect(initCall.filtered).toBe(true);
    expect(initCall.performanceConfig).toBe(true);
  });
  
  it('should not initialize Sentry in client environment', async () => {
    // Setup browser environment
    global.window = {} as any;
    
    // Import the modules (will use the mocks)
    const { register } = await import('../../../../instrumentation');
    const Sentry = await import('@sentry/nextjs');
    
    // Call the register function
    await register();
    
    // Verify Sentry init was not called
    expect(Sentry.init).not.toHaveBeenCalled();
  });
  
  it('should include correct integrations for Node.js runtime', async () => {
    // Setup Node.js runtime environment
    process.env.NEXT_RUNTIME = 'nodejs';
    
    // Mock BrowserTracing integration
    const { Integrations } = await import('@sentry/nextjs');
    
    // Import the module
    const { register } = await import('../../../../instrumentation');
    const sentry = await import('@sentry/nextjs');
    
    // Call the register function
    await register();
    
    // Verify correct integrations were included
    const initCall = sentry.init.mock.calls[0][0];
    expect(initCall.integrations).toBeDefined();
    expect(initCall.integrations.length).toBeGreaterThan(0);
    expect(Integrations.Http).toHaveBeenCalled();
    expect(Integrations.OnUncaughtException).toHaveBeenCalled();
    expect(Integrations.OnUnhandledRejection).toHaveBeenCalled();
  });
});
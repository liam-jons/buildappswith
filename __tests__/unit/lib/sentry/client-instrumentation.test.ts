/**
 * Unit tests for Sentry client instrumentation
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock Sentry
vi.mock('@sentry/nextjs', () => ({
  init: vi.fn(),
  BrowserTracing: vi.fn(() => ({ name: 'BrowserTracing' })),
  captureRouterTransitionStart: vi.fn(),
  onRouterTransitionComplete: vi.fn(),
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

describe('Sentry Client Instrumentation', () => {
  const originalWindow = global.window;
  
  // Setup mock window with Datadog RUM
  const mockDatadogContext = {
    application: { id: 'test-app-id' },
    session: { id: 'test-session-id' },
    view: { id: 'test-view-id' },
    version: '1.0.0',
  };
  
  beforeEach(() => {
    // Reset mocks and modules
    vi.resetModules();
    
    // Mock browser environment
    global.window = {
      __DD_RUM__: {
        _getInternalContext: vi.fn().mockReturnValue(mockDatadogContext),
      },
    } as any;
  });
  
  afterEach(() => {
    // Clean up
    global.window = originalWindow;
    vi.clearAllMocks();
  });
  
  it('should initialize Sentry correctly in browser environment', async () => {
    // Import the modules (will use the mocks)
    const { register } = await import('../../../../instrumentation-client');
    const Sentry = await import('@sentry/nextjs');
    
    // Call the register function
    register();
    
    // Verify Sentry init was called with correct config
    expect(Sentry.init).toHaveBeenCalledTimes(1);
    const initCall = Sentry.init.mock.calls[0][0];
    expect(initCall.region).toBe('eu');
    expect(initCall.filtered).toBe(true);
    expect(initCall.performanceConfig).toBe(true);
  });
  
  it('should integrate with Datadog RUM when available', async () => {
    // Import the modules
    const { register } = await import('../../../../instrumentation-client');
    const Sentry = await import('@sentry/nextjs');
    
    // Call the register function
    register();
    
    // Get the beforeSend function
    const initCall = Sentry.init.mock.calls[0][0];
    const beforeSend = initCall.beforeSend;
    expect(beforeSend).toBeDefined();
    
    // Create a test event
    const testEvent = { contexts: {} };
    
    // Call beforeSend
    const modifiedEvent = beforeSend(testEvent);
    
    // Verify Datadog context was added
    expect(modifiedEvent.contexts.datadog_rum).toBeDefined();
    expect(modifiedEvent.contexts.datadog_rum.application_id).toBe('test-app-id');
    expect(modifiedEvent.contexts.datadog_rum.session_id).toBe('test-session-id');
    expect(modifiedEvent.contexts.datadog_rum.view_id).toBe('test-view-id');
  });
  
  it('should handle errors in Datadog integration gracefully', async () => {
    // Setup window with broken Datadog RUM
    global.window = {
      __DD_RUM__: {
        _getInternalContext: vi.fn(() => { throw new Error('Datadog error'); }),
      },
    } as any;
    
    // Import the modules
    const { register } = await import('../../../../instrumentation-client');
    const Sentry = await import('@sentry/nextjs');
    
    // Call the register function (should not throw)
    expect(() => register()).not.toThrow();
    
    // Get the beforeSend function
    const initCall = Sentry.init.mock.calls[0][0];
    const beforeSend = initCall.beforeSend;
    
    // Create a test event
    const testEvent = { contexts: {} };
    
    // Call beforeSend (should not throw and return original event)
    const modifiedEvent = beforeSend(testEvent);
    expect(modifiedEvent).toBe(testEvent);
  });
});
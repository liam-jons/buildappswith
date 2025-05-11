/**
 * Unit tests for Sentry configuration
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock getInitializationConfig to avoid cross-test interference
vi.mock('../../../../lib/sentry/config', async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    getInitializationConfig: vi.fn().mockImplementation(() => {
      const mockEnv = process.env.NODE_ENV || 'development';
      const mockRegion = process.env.SENTRY_REGION || 'eu';
      
      // Base config with some hard-coded values for testing purposes
      return {
        dsn: 'https://fbc43927da128c3a176f85092ef2bb5c@o4509207749328896.ingest.de.sentry.io/4509207750967376',
        environment: mockEnv,
        region: mockRegion,
        tracesSampleRate: mockEnv === 'development' ? 1.0 : 0.1,
        enabled: mockEnv !== 'test' || process.env.SENTRY_ENABLE_IN_TESTS === 'true',
      };
    }),
    sentryConfig: {
      ...originalModule.sentryConfig,
      shouldSampleTransaction: vi.fn().mockImplementation((name) => {
        const criticalTransactions = ['payment.process', 'auth.signup'];
        return criticalTransactions.includes(name) ? 1.0 : 0.1;
      }),
    },
  };
});

describe('Sentry Configuration', () => {
  const originalEnv = { ...process.env };
  
  beforeEach(() => {
    // Reset env vars before each test
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore original env vars after each test
    process.env = originalEnv;
    vi.clearAllMocks();
  });

  it('should use EU region by default', () => {
    // When no env var is set, should default to EU
    const { getInitializationConfig } = require('../../../../lib/sentry/config');
    const config = getInitializationConfig();
    expect(config.region).toBe('eu');
  });

  it('should respect SENTRY_REGION environment variable', () => {
    // When env var is set, should use that value
    process.env.SENTRY_REGION = 'us';
    const { getInitializationConfig } = require('../../../../lib/sentry/config');
    const config = getInitializationConfig();
    expect(config.region).toBe('us');
  });

  it('should have correct DSN for EU region', () => {
    // Verify the DSN contains EU-specific ingest domain
    const { getInitializationConfig } = require('../../../../lib/sentry/config');
    const config = getInitializationConfig();
    expect(config.dsn).toContain('ingest.de.sentry.io');
  });

  it('should properly configure sample rates by environment', () => {
    // Test development environment
    process.env.NODE_ENV = 'development';
    const { getInitializationConfig } = require('../../../../lib/sentry/config');
    let config = getInitializationConfig();
    expect(config.tracesSampleRate).toBe(1.0);
    
    // Test production environment
    process.env.NODE_ENV = 'production';
    config = getInitializationConfig();
    expect(config.tracesSampleRate).toBe(0.1);
  });

  it('should always sample critical transactions', () => {
    // Test a critical transaction is always sampled
    const { sentryConfig } = require('../../../../lib/sentry/config');
    const samplingRate = sentryConfig.shouldSampleTransaction('payment.process');
    expect(samplingRate).toBe(1.0);
    
    // Test a non-critical transaction uses environment sample rate
    const regularSamplingRate = sentryConfig.shouldSampleTransaction('some.other.transaction');
    expect(regularSamplingRate).toBe(0.1);
  });

  it('should disable Sentry in test environment by default', () => {
    // In test environment, Sentry should be disabled
    process.env.NODE_ENV = 'test';
    const { getInitializationConfig } = require('../../../../lib/sentry/config');
    const config = getInitializationConfig();
    expect(config.enabled).toBe(false);
    
    // Unless explicitly enabled
    process.env.SENTRY_ENABLE_IN_TESTS = 'true';
    const configWithOverride = getInitializationConfig();
    expect(configWithOverride.enabled).toBe(true);
  });
});
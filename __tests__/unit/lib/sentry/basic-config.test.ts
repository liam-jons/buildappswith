/**
 * Basic tests for Sentry configuration
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { sentryConfig, getInitializationConfig } from '../../../../lib/sentry/config';

describe('Sentry Basic Config', () => {
  const originalEnv = { ...process.env };
  
  beforeEach(() => {
    // Reset modules before each test
    vi.resetModules();
    process.env = { ...originalEnv };
  });
  
  afterEach(() => {
    // Restore original env vars
    process.env = originalEnv;
  });
  
  it('should have EU region configuration', () => {
    // Check EU region is defined in sentryConfig
    expect(sentryConfig.region).toBe('eu');
    
    // Check EU region is included in initialization config
    const config = getInitializationConfig();
    expect(config.region).toBe('eu');
  });
  
  it('should have EU ingest domain in DSN', () => {
    // EU region DSN should use the .de domain
    expect(sentryConfig.dsn).toContain('ingest.de.sentry.io');
  });
});
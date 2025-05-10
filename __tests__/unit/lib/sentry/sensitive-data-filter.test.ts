/**
 * @test-category sensitive-data-filtering
 * @environment server
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as Sentry from '@sentry/nextjs';
import { configureSentryDataFiltering } from '@/lib/sentry';

// Mock process.env
vi.mock('process', () => ({
  env: {
    NODE_ENV: 'test',
    SENTRY_FILTER_LOCAL: 'true',
  },
}));

// Mock Sentry
vi.mock('@sentry/nextjs', () => ({
  init: vi.fn(),
  configureScope: vi.fn(),
}));

describe('Sensitive Data Filtering', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('configureSentryDataFiltering', () => {
    it('should add beforeSend and beforeBreadcrumb hooks to Sentry config', () => {
      const initialConfig = {
        dsn: 'https://examplePublicKey@o0.ingest.sentry.io/0',
        environment: 'test',
      };
      
      const enhancedConfig = configureSentryDataFiltering(initialConfig);
      
      expect(enhancedConfig).toHaveProperty('beforeSend');
      expect(enhancedConfig).toHaveProperty('beforeBreadcrumb');
      expect(typeof enhancedConfig.beforeSend).toBe('function');
      expect(typeof enhancedConfig.beforeBreadcrumb).toBe('function');
    });
    
    it('should preserve original config properties', () => {
      const initialConfig = {
        dsn: 'https://examplePublicKey@o0.ingest.sentry.io/0',
        environment: 'test',
        release: '1.0.0',
        debug: true,
      };
      
      const enhancedConfig = configureSentryDataFiltering(initialConfig);
      
      expect(enhancedConfig).toHaveProperty('dsn', initialConfig.dsn);
      expect(enhancedConfig).toHaveProperty('environment', initialConfig.environment);
      expect(enhancedConfig).toHaveProperty('release', initialConfig.release);
      expect(enhancedConfig).toHaveProperty('debug', initialConfig.debug);
    });
  });

  describe('beforeSend hook', () => {
    it('should filter sensitive data from error events', () => {
      const initialConfig = {
        dsn: 'https://examplePublicKey@o0.ingest.sentry.io/0',
      };
      
      const enhancedConfig = configureSentryDataFiltering(initialConfig);
      const beforeSend = enhancedConfig.beforeSend;
      
      // Create a mock event with sensitive data
      const mockEvent = {
        message: 'Error processing payment for john.doe@example.com',
        tags: {
          email: 'john.doe@example.com',
          'user.email': 'jane.doe@example.com',
        },
        user: {
          id: 'user-123',
          email: 'john.doe@example.com',
          ip_address: '192.168.1.1',
        },
        request: {
          url: 'https://example.com/payment',
          headers: {
            'user-agent': 'Mozilla/5.0',
            'authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          },
          data: {
            creditCard: '4111 1111 1111 1111',
            cvv: '123',
            password: 'secret123',
          },
        },
        contexts: {
          payment: {
            cardNumber: '4111 1111 1111 1111',
            expiryDate: '12/25',
          },
        },
        breadcrumbs: [
          {
            category: 'http',
            message: 'HTTP request to /api/users/john.doe@example.com',
            data: {
              url: '/api/users/john.doe@example.com',
              method: 'GET',
            },
          },
        ],
      };
      
      // Filter the event
      const filteredEvent = beforeSend(mockEvent, {});
      
      // Check that sensitive data has been filtered
      expect(filteredEvent.message).not.toContain('john.doe@example.com');
      
      // Check PII filtering in user data
      expect(filteredEvent.user.email).not.toBe('john.doe@example.com');
      expect(filteredEvent.user.email).toContain('***');
      expect(filteredEvent.user.ip_address).not.toBe('192.168.1.1');
      expect(filteredEvent.user.ip_address).toContain('*');
      
      // Check sensitive data in request
      expect(filteredEvent.request.headers.authorization).toBe('[FILTERED]');
      expect(filteredEvent.request.data.creditCard).not.toBe('4111 1111 1111 1111');
      expect(filteredEvent.request.data.cvv).toBe('[FILTERED]');
      expect(filteredEvent.request.data.password).toBe('[FILTERED]');
      
      // Check sensitive data in contexts
      expect(filteredEvent.contexts.payment.cardNumber).not.toBe('4111 1111 1111 1111');
      
      // Check breadcrumbs
      const filteredBreadcrumb = filteredEvent.breadcrumbs[0];
      expect(filteredBreadcrumb.message).not.toContain('john.doe@example.com');
      expect(filteredBreadcrumb.data.url).not.toContain('john.doe@example.com');
    });
    
    it('should return original event in development when filtering is disabled', () => {
      // Temporarily modify the env
      const originalEnv = process.env;
      process.env = { ...process.env, NODE_ENV: 'development', SENTRY_FILTER_LOCAL: 'false' };
      
      const initialConfig = { dsn: 'https://examplePublicKey@o0.ingest.sentry.io/0' };
      const enhancedConfig = configureSentryDataFiltering(initialConfig);
      const beforeSend = enhancedConfig.beforeSend;
      
      const mockEvent = {
        message: 'Test error with email john.doe@example.com',
      };
      
      const result = beforeSend(mockEvent, {});
      
      // Restore the original env
      process.env = originalEnv;
      
      // The event should be returned unchanged
      expect(result).toBe(mockEvent);
      expect(result.message).toContain('john.doe@example.com');
    });
  });

  describe('beforeBreadcrumb hook', () => {
    it('should skip filtering for UI click and navigation breadcrumbs', () => {
      const initialConfig = { dsn: 'https://examplePublicKey@o0.ingest.sentry.io/0' };
      const enhancedConfig = configureSentryDataFiltering(initialConfig);
      const beforeBreadcrumb = enhancedConfig.beforeBreadcrumb;
      
      const uiClickBreadcrumb = {
        category: 'ui.click',
        message: 'User clicked on button',
        data: {
          target: 'submit-button',
        },
      };
      
      const navigationBreadcrumb = {
        category: 'navigation',
        message: 'User navigated to /user/john.doe@example.com',
        data: {
          from: '/home',
          to: '/user/john.doe@example.com',
        },
      };
      
      const filteredUiClick = beforeBreadcrumb(uiClickBreadcrumb);
      const filteredNavigation = beforeBreadcrumb(navigationBreadcrumb);
      
      // These categories should not be filtered
      expect(filteredUiClick).toBe(uiClickBreadcrumb);
      expect(filteredNavigation).toBe(navigationBreadcrumb);
      expect(filteredNavigation.message).toContain('john.doe@example.com');
    });
    
    it('should filter sensitive data from breadcrumb messages and data', () => {
      const initialConfig = { dsn: 'https://examplePublicKey@o0.ingest.sentry.io/0' };
      const enhancedConfig = configureSentryDataFiltering(initialConfig);
      const beforeBreadcrumb = enhancedConfig.beforeBreadcrumb;
      
      const breadcrumb = {
        category: 'http',
        message: 'Failed to process payment for john.doe@example.com with card 4111-1111-1111-1111',
        data: {
          url: '/api/payments',
          method: 'POST',
          body: {
            email: 'john.doe@example.com',
            cardNumber: '4111 1111 1111 1111',
            cvv: '123',
          },
          response: {
            error: 'Invalid card for user john.doe@example.com',
          },
        },
      };
      
      const filteredBreadcrumb = beforeBreadcrumb(breadcrumb);
      
      // Check message filtering
      expect(filteredBreadcrumb.message).not.toContain('john.doe@example.com');
      expect(filteredBreadcrumb.message).not.toContain('4111-1111-1111-1111');
      
      // Check data filtering
      expect(filteredBreadcrumb.data.body.email).not.toBe('john.doe@example.com');
      expect(filteredBreadcrumb.data.body.cardNumber).not.toBe('4111 1111 1111 1111');
      expect(filteredBreadcrumb.data.body.cvv).toBe('[FILTERED]');
      expect(filteredBreadcrumb.data.response.error).not.toContain('john.doe@example.com');
    });
  });
});
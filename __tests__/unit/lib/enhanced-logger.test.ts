/**
 * @test-category logger-integration
 * @environment server
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as Sentry from '@sentry/nextjs';
import { enhancedLogger, createDomainLogger } from '@/lib/logger';
import { ErrorSeverity, ErrorCategory, handleError } from '@/lib/sentry';

// Mock console methods
vi.spyOn(console, 'debug').mockImplementation(() => {});
vi.spyOn(console, 'info').mockImplementation(() => {});
vi.spyOn(console, 'warn').mockImplementation(() => {});
vi.spyOn(console, 'error').mockImplementation(() => {});

// Mock Sentry
vi.mock('@sentry/nextjs', () => ({
  withScope: vi.fn((callback) => {
    const mockScope = {
      setContext: vi.fn(),
      setTag: vi.fn(),
      setExtra: vi.fn(),
      addBreadcrumb: vi.fn(),
    };
    callback(mockScope);
    return mockScope;
  }),
  captureException: vi.fn(),
  captureMessage: vi.fn(),
  Severity: {
    Error: 'error',
    Warning: 'warning',
    Info: 'info',
  },
}));

// Mock sentry error handling
vi.mock('@/lib/sentry', () => ({
  ErrorSeverity: {
    CRITICAL: 'critical',
    HIGH: 'high',
    MEDIUM: 'medium',
    LOW: 'low',
  },
  ErrorCategory: {
    SYSTEM: 'system',
    BUSINESS: 'business',
    USER: 'user',
    INTEGRATION: 'integration',
  },
  handleError: vi.fn(),
}));

describe('Enhanced Logger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('log levels', () => {
    it('debug() logs messages at debug level', () => {
      enhancedLogger.debug('Debug message', { context: 'test' });
      
      expect(console.debug).toHaveBeenCalled();
      const logData = JSON.parse(console.debug.mock.calls[0][0]);
      expect(logData).toHaveProperty('level', 'debug');
      expect(logData).toHaveProperty('message', 'Debug message');
      expect(logData).toHaveProperty('context', 'test');
    });
    
    it('info() logs messages at info level', () => {
      enhancedLogger.info('Info message', { context: 'test' });
      
      expect(console.info).toHaveBeenCalled();
      const logData = JSON.parse(console.info.mock.calls[0][0]);
      expect(logData).toHaveProperty('level', 'info');
      expect(logData).toHaveProperty('message', 'Info message');
      expect(logData).toHaveProperty('context', 'test');
    });
    
    it('warn() logs messages at warn level and sends to Sentry', () => {
      enhancedLogger.warn('Warning message', { context: 'test' });
      
      // Console logging
      expect(console.warn).toHaveBeenCalled();
      const logData = JSON.parse(console.warn.mock.calls[0][0]);
      expect(logData).toHaveProperty('level', 'warn');
      expect(logData).toHaveProperty('message', 'Warning message');
      
      // Sentry integration
      expect(Sentry.withScope).toHaveBeenCalled();
      expect(Sentry.captureMessage).toHaveBeenCalledWith(
        'Warning message', 
        Sentry.Severity.Warning
      );
    });
    
    it('error() logs messages at error level and sends to Sentry', () => {
      enhancedLogger.error('Error message', { context: 'test' });
      
      // Console logging
      expect(console.error).toHaveBeenCalled();
      const logData = JSON.parse(console.error.mock.calls[0][0]);
      expect(logData).toHaveProperty('level', 'error');
      expect(logData).toHaveProperty('message', 'Error message');
      
      // Sentry integration
      expect(Sentry.withScope).toHaveBeenCalled();
      expect(Sentry.captureMessage).toHaveBeenCalledWith(
        'Error message', 
        Sentry.Severity.Error
      );
    });
  });

  describe('error handling', () => {
    it('logs errors with stack traces', () => {
      const error = new Error('Test error');
      enhancedLogger.error('An error occurred', { context: 'test' }, error);
      
      // Console logging
      expect(console.error).toHaveBeenCalled();
      
      // Sentry integration with error classification
      expect(handleError).toHaveBeenCalledWith(
        error,
        'An error occurred',
        expect.objectContaining({
          severity: ErrorSeverity.HIGH,
          category: ErrorCategory.SYSTEM,
        })
      );
    });
    
    it('provides a specialized logError method with error codes', () => {
      const error = new Error('Validation error');
      enhancedLogger.logError('VALIDATION_001', 'Invalid input', { field: 'email' }, error);
      
      // Console logging
      expect(console.error).toHaveBeenCalled();
      const logData = JSON.parse(console.error.mock.calls[0][0]);
      expect(logData).toHaveProperty('error_code', 'VALIDATION_001');
      expect(logData).toHaveProperty('field', 'email');
      
      // Sentry integration
      expect(handleError).toHaveBeenCalled();
    });
    
    it('provides an exception method for direct error logging', () => {
      const error = new Error('System failure');
      error.name = 'SystemError';
      enhancedLogger.exception(error);
      
      // Console logging
      expect(console.error).toHaveBeenCalled();
      const logData = JSON.parse(console.error.mock.calls[0][0]);
      expect(logData).toHaveProperty('message', 'System failure');
      expect(logData).toHaveProperty('name', 'SystemError');
      
      // Sentry integration
      expect(handleError).toHaveBeenCalled();
    });
  });

  describe('domain loggers', () => {
    it('creates domain-specific loggers with context', () => {
      const authLogger = createDomainLogger('auth', { service: 'authentication' });
      
      authLogger.info('User login attempt', { userId: '123' });
      
      // Check context is merged
      expect(console.info).toHaveBeenCalled();
      const logData = JSON.parse(console.info.mock.calls[0][0]);
      expect(logData).toHaveProperty('domain', 'auth');
      expect(logData).toHaveProperty('service', 'authentication');
      expect(logData).toHaveProperty('userId', '123');
    });
    
    it('domain loggers send errors to Sentry with context', () => {
      const paymentLogger = createDomainLogger('payment', { 
        service: 'stripe-integration',
      });
      
      const error = new Error('Payment declined');
      paymentLogger.error('Payment processing failed', { 
        transactionId: 'tx123',
      }, error);
      
      // Check all metadata is included
      expect(console.error).toHaveBeenCalled();
      const logData = JSON.parse(console.error.mock.calls[0][0]);
      expect(logData).toHaveProperty('domain', 'payment');
      expect(logData).toHaveProperty('service', 'stripe-integration');
      expect(logData).toHaveProperty('transactionId', 'tx123');
      
      // Sentry integration with error classification
      expect(handleError).toHaveBeenCalledWith(
        error,
        'Payment processing failed',
        expect.objectContaining({
          severity: ErrorSeverity.HIGH,
          category: ErrorCategory.SYSTEM,
          component: 'logger',
        })
      );
    });
  });

  describe('logging service integration', () => {
    it('sends logs to logging service in production environment', () => {
      // Mock process.env.NODE_ENV
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      // Mock process.env.DATADOG_API_KEY
      const originalDatadogKey = process.env.DATADOG_API_KEY;
      process.env.DATADOG_API_KEY = 'test-key';
      
      // Create spy on sendToLoggingService
      const spy = vi.spyOn(enhancedLogger as any, 'sendToLoggingService');
      
      enhancedLogger.info('Production log message');
      
      // Check sendToLoggingService was called
      expect(spy).toHaveBeenCalled();
      
      // Restore env
      process.env.NODE_ENV = originalNodeEnv;
      process.env.DATADOG_API_KEY = originalDatadogKey;
    });
    
    it('does not send logs to logging service in development environment', () => {
      // Mock process.env.NODE_ENV
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      // Create spy on sendToLoggingService
      const spy = vi.spyOn(enhancedLogger as any, 'sendToLoggingService');
      
      enhancedLogger.info('Development log message');
      
      // Check sendToLoggingService was not called
      expect(spy).not.toHaveBeenCalled();
      
      // Restore env
      process.env.NODE_ENV = originalNodeEnv;
    });
  });
});
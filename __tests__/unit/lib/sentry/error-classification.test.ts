/**
 * @test-category error-classification
 * @environment server
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as Sentry from '@sentry/nextjs';
import { 
  ErrorSeverity, 
  ErrorCategory, 
  handleError,
  reportError,
  createDomainErrorHandler,
  errorMetadataFactory
} from '@/lib/sentry';

// Mock Sentry
vi.mock('@sentry/nextjs', () => {
  return {
    withScope: vi.fn((callback) => {
      const mockScope = {
        setTag: vi.fn(),
        setContext: vi.fn(),
        setLevel: vi.fn(),
      };
      callback(mockScope);
      return 'mock-event-id';
    }),
    Severity: {
      Fatal: 'fatal',
      Error: 'error',
      Warning: 'warning',
      Info: 'info',
    },
    captureException: vi.fn(() => 'mock-event-id'),
    captureMessage: vi.fn(() => 'mock-event-id'),
  };
});

describe('Error Classification System', () => {
  const mockScope = {
    setTag: vi.fn(),
    setContext: vi.fn(),
    setLevel: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('handleError', () => {
    it('should capture an exception with default metadata', () => {
      const error = new Error('Test error');
      const eventId = handleError(error);

      expect(Sentry.withScope).toHaveBeenCalled();
      expect(Sentry.captureException).toHaveBeenCalledWith(error);
      expect(eventId).toBe('mock-event-id');
    });

    it('should capture an exception with custom message', () => {
      const error = new Error('Original error');
      const message = 'Custom error message';
      
      handleError(error, message);

      expect(Sentry.captureException).toHaveBeenCalled();
      const capturedError = Sentry.captureException.mock.calls[0][0];
      expect(capturedError.message).toContain(message);
      expect(capturedError.message).toContain('Original error');
    });

    it('should capture an exception with custom metadata', () => {
      const error = new Error('Test error');
      const metadata = {
        severity: ErrorSeverity.CRITICAL,
        category: ErrorCategory.BUSINESS,
        component: 'payment',
        userImpact: 'blocking',
        affectedFeature: 'checkout',
        isRecoverable: false,
        retryable: false,
        source: 'server',
      };
      
      handleError(error, undefined, metadata);
      
      // Extract the callback function that was passed to withScope
      const scopeCallback = Sentry.withScope.mock.calls[0][0];
      
      // Create a mock scope
      const mockScope = {
        setTag: vi.fn(),
        setContext: vi.fn(),
        setLevel: vi.fn(),
      };
      
      // Call the callback with our mock scope
      scopeCallback(mockScope);
      
      // Verify the scope was configured correctly
      expect(mockScope.setTag).toHaveBeenCalledWith('error.severity', ErrorSeverity.CRITICAL);
      expect(mockScope.setTag).toHaveBeenCalledWith('error.category', ErrorCategory.BUSINESS);
      expect(mockScope.setTag).toHaveBeenCalledWith('error.component', 'payment');
      expect(mockScope.setTag).toHaveBeenCalledWith('error.userImpact', 'blocking');
      expect(mockScope.setTag).toHaveBeenCalledWith('error.affectedFeature', 'checkout');
      expect(mockScope.setTag).toHaveBeenCalledWith('error.isRecoverable', 'false');
      expect(mockScope.setTag).toHaveBeenCalledWith('error.retryable', 'false');
      expect(mockScope.setTag).toHaveBeenCalledWith('error.source', 'server');
      expect(mockScope.setTag).toHaveBeenCalledWith('priority', 'high');
    });
  });

  describe('reportError', () => {
    it('should capture a message with default metadata', () => {
      const message = 'Test error message';
      const eventId = reportError(message);

      expect(Sentry.withScope).toHaveBeenCalled();
      expect(Sentry.captureMessage).toHaveBeenCalledWith(message, expect.any(String));
      expect(eventId).toBe('mock-event-id');
    });

    it('should capture a message with custom metadata', () => {
      const message = 'Test error message';
      const metadata = {
        severity: ErrorSeverity.LOW,
        category: ErrorCategory.USER,
        component: 'form',
        userImpact: 'minimal',
      };
      
      reportError(message, metadata);
      
      // Extract the callback function
      const scopeCallback = Sentry.withScope.mock.calls[0][0];
      const mockScope = {
        setTag: vi.fn(),
        setContext: vi.fn(),
        setLevel: vi.fn(),
      };
      
      // Call the callback with our mock scope
      scopeCallback(mockScope);
      
      // Verify the scope was configured correctly
      expect(mockScope.setTag).toHaveBeenCalledWith('error.severity', ErrorSeverity.LOW);
      expect(mockScope.setTag).toHaveBeenCalledWith('error.category', ErrorCategory.USER);
      expect(mockScope.setTag).toHaveBeenCalledWith('error.component', 'form');
      expect(mockScope.setTag).toHaveBeenCalledWith('error.userImpact', 'minimal');
    });
  });

  describe('createDomainErrorHandler', () => {
    it('should create domain-specific error handlers', () => {
      const domainHandlers = createDomainErrorHandler('payment', {
        category: ErrorCategory.BUSINESS,
        severity: ErrorSeverity.HIGH,
      });
      
      expect(domainHandlers).toHaveProperty('handleError');
      expect(domainHandlers).toHaveProperty('reportError');
      expect(typeof domainHandlers.handleError).toBe('function');
      expect(typeof domainHandlers.reportError).toBe('function');
    });

    it('should pass domain metadata to handleError', () => {
      const domainHandlers = createDomainErrorHandler('payment', {
        category: ErrorCategory.BUSINESS,
        severity: ErrorSeverity.HIGH,
      });
      
      const error = new Error('Payment processing error');
      domainHandlers.handleError(error);
      
      // Extract the callback function
      const scopeCallback = Sentry.withScope.mock.calls[0][0];
      const mockScope = {
        setTag: vi.fn(),
        setContext: vi.fn(),
        setLevel: vi.fn(),
      };
      
      // Call the callback with our mock scope
      scopeCallback(mockScope);
      
      // Verify that domain metadata was passed correctly
      expect(mockScope.setTag).toHaveBeenCalledWith('error.component', 'payment');
      expect(mockScope.setTag).toHaveBeenCalledWith('error.category', ErrorCategory.BUSINESS);
      expect(mockScope.setTag).toHaveBeenCalledWith('error.severity', ErrorSeverity.HIGH);
    });

    it('should pass domain metadata to reportError', () => {
      const domainHandlers = createDomainErrorHandler('auth', {
        category: ErrorCategory.SYSTEM,
        severity: ErrorSeverity.MEDIUM,
      });
      
      domainHandlers.reportError('Authentication flow interrupted');
      
      // Extract the callback function
      const scopeCallback = Sentry.withScope.mock.calls[0][0];
      const mockScope = {
        setTag: vi.fn(),
        setContext: vi.fn(),
        setLevel: vi.fn(),
      };
      
      // Call the callback with our mock scope
      scopeCallback(mockScope);
      
      // Verify that domain metadata was passed correctly
      expect(mockScope.setTag).toHaveBeenCalledWith('error.component', 'auth');
      expect(mockScope.setTag).toHaveBeenCalledWith('error.category', ErrorCategory.SYSTEM);
      expect(mockScope.setTag).toHaveBeenCalledWith('error.severity', ErrorSeverity.MEDIUM);
    });
  });

  describe('errorMetadataFactory', () => {
    it('should provide preconfigured metadata for authentication errors', () => {
      const loginFailureMetadata = errorMetadataFactory.auth.loginFailure();
      
      expect(loginFailureMetadata).toHaveProperty('category', ErrorCategory.USER);
      expect(loginFailureMetadata).toHaveProperty('component', 'auth');
      expect(loginFailureMetadata).toHaveProperty('affectedFeature', 'login');
      expect(loginFailureMetadata).toHaveProperty('userImpact', 'blocking');
      expect(loginFailureMetadata).toHaveProperty('severity', ErrorSeverity.HIGH);
    });

    it('should provide preconfigured metadata for payment errors', () => {
      const paymentFailureMetadata = errorMetadataFactory.payment.processingFailure();
      
      expect(paymentFailureMetadata).toHaveProperty('category', ErrorCategory.BUSINESS);
      expect(paymentFailureMetadata).toHaveProperty('component', 'payment');
      expect(paymentFailureMetadata).toHaveProperty('affectedFeature', 'checkout');
      expect(paymentFailureMetadata).toHaveProperty('userImpact', 'blocking');
      expect(paymentFailureMetadata).toHaveProperty('severity', ErrorSeverity.CRITICAL);
    });
    
    it('should provide preconfigured metadata for API errors', () => {
      const rateLimitMetadata = errorMetadataFactory.api.rateLimitExceeded();
      
      expect(rateLimitMetadata).toHaveProperty('category', ErrorCategory.USER);
      expect(rateLimitMetadata).toHaveProperty('component', 'api');
      expect(rateLimitMetadata).toHaveProperty('affectedFeature', 'rate-limiting');
      expect(rateLimitMetadata).toHaveProperty('severity', ErrorSeverity.LOW);
    });
  });
});
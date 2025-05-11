import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger, createDomainLogger, Logger } from '@/lib/logger';
import * as Sentry from '@sentry/nextjs';

// Mock Sentry
vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(),
  captureMessage: vi.fn(),
  withScope: vi.fn((callback) => {
    const mockScope = {
      setExtra: vi.fn(),
      setTag: vi.fn(),
      setLevel: vi.fn(),
    };
    return callback(mockScope);
  }),
}));

describe('Unified Logger', () => {
  // Spy on console methods
  const consoleDebugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
  const consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
  const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
    
    // Make sure logging is enabled for tests
    Logger.setEnabled(true);
  });
  
  afterEach(() => {
    // Reset logging state after each test
    Logger.setEnabled(process.env.NODE_ENV !== 'production');
  });
  
  describe('Basic logging functionality', () => {
    it('should log messages at different levels', () => {
      logger.debug('Debug message');
      logger.info('Info message');
      logger.warn('Warning message');
      logger.error('Error message');
      
      expect(consoleDebugSpy).toHaveBeenCalled();
      expect(consoleInfoSpy).toHaveBeenCalled();
      expect(consoleWarnSpy).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
    
    it('should include metadata in logs', () => {
      const metadata = { user: 'test', action: 'login' };
      logger.info('User action', metadata);
      
      const lastCall = consoleInfoSpy.mock.calls[0][0];
      expect(lastCall).toContain('"user":"test"');
      expect(lastCall).toContain('"action":"login"');
    });
    
    it('should integrate with Sentry for errors', () => {
      const error = new Error('Test error');
      logger.error('Error occurred', { context: 'test' }, error);
      
      expect(Sentry.captureException).toHaveBeenCalledWith(error, expect.any(Object));
    });
  });
  
  describe('Domain logger functionality', () => {
    it('should create domain-specific loggers', () => {
      const domainLogger = createDomainLogger('test-domain');
      domainLogger.info('Domain specific message');
      
      const lastCall = consoleInfoSpy.mock.calls[0][0];
      expect(lastCall).toContain('"domain":"test-domain"');
    });
    
    it('should preserve domain context across log calls', () => {
      const domainLogger = createDomainLogger('auth');
      domainLogger.debug('Debug in auth domain');
      domainLogger.error('Error in auth domain');
      
      const debugCall = consoleDebugSpy.mock.calls[0][0];
      const errorCall = consoleErrorSpy.mock.calls[0][0];
      
      expect(debugCall).toContain('"domain":"auth"');
      expect(errorCall).toContain('"domain":"auth"');
    });
  });
  
  describe('Error handling', () => {
    it('should handle exceptions with additional context', () => {
      const error = new Error('Connection failed');
      logger.exception(error, 'Database connection error', { 
        database: 'users',
        connectionId: '12345'
      });
      
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(Sentry.captureException).toHaveBeenCalledWith(error, expect.any(Object));
      
      const lastCall = consoleErrorSpy.mock.calls[0][0];
      expect(lastCall).toContain('"database":"users"');
      expect(lastCall).toContain('"connectionId":"12345"');
    });
    
    it('should log errors with error codes', () => {
      const error = new Error('Authentication failed');
      logger.logError('AUTH_001', 'Failed to authenticate user', {
        userId: '12345'
      }, error);
      
      const lastCall = consoleErrorSpy.mock.calls[0][0];
      expect(lastCall).toContain('"error_code":"AUTH_001"');
      expect(lastCall).toContain('"userId":"12345"');
    });
  });
  
  describe('Environment awareness', () => {
    it('should include environment information in logs', () => {
      logger.info('Test message');

      const lastCall = consoleInfoSpy.mock.calls[0][0];
      expect(lastCall).toContain('"environment":"client"');
    });
  });
  
  describe('Child logger functionality', () => {
    it('should create child loggers with inherited context', () => {
      const parentLogger = createDomainLogger('parent', { context: 'test' });
      const childLogger = parentLogger.child({ child: true });
      
      childLogger.info('Child logger message');
      
      const lastCall = consoleInfoSpy.mock.calls[0][0];
      expect(lastCall).toContain('"domain":"parent"');
      expect(lastCall).toContain('"context":"test"');
      expect(lastCall).toContain('"child":true');
    });
  });
  
  describe('Enabling/disabling logging', () => {
    it('should disable and enable logging', () => {
      Logger.setEnabled(false);
      logger.info('This should not be logged');
      expect(consoleInfoSpy).not.toHaveBeenCalled();
      
      Logger.setEnabled(true);
      logger.info('This should be logged');
      expect(consoleInfoSpy).toHaveBeenCalled();
    });
    
    it('should check if logging is enabled', () => {
      Logger.setEnabled(true);
      expect(Logger.isEnabled()).toBe(true);
      
      Logger.setEnabled(false);
      expect(Logger.isEnabled()).toBe(false);
    });
  });
});
/**
 * @test-category error-boundary-sentry-integration
 * @environment client
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import * as Sentry from '@sentry/nextjs';
import { FeatureErrorBoundary, GlobalErrorBoundary, ApiErrorBoundary } from '@/components/error-boundaries';
import { logger } from '@/lib/logger';
import { ErrorSeverity, ErrorCategory } from '@/lib/sentry';

// Mock Sentry
vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(() => 'mock-event-id'),
  showReportDialog: vi.fn(),
  withScope: vi.fn((callback) => {
    const mockScope = {
      setTag: vi.fn(),
      setExtra: vi.fn(),
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
}));

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
  },
}));

// Create Error Components for Testing
const ErrorThrowingComponent = ({ message = 'Test error' }) => {
  throw new Error(message);
};

const AsyncErrorComponent = () => {
  // Create error on next event loop to test unhandled promises
  setTimeout(() => {
    throw new Error('Async error');
  }, 0);
  return <div>Will error soon</div>;
};

// Set up window.addEventListener mock
const setupErrorEventMock = (errorMessage = 'Uncaught error') => {
  const originalAddEventListener = window.addEventListener;
  window.addEventListener = vi.fn((event, handler) => {
    if (event === 'error') {
      // Trigger the error handler immediately
      handler({
        error: new Error(errorMessage),
        message: errorMessage,
        filename: 'test.js',
        lineno: 10,
        colno: 20,
        preventDefault: vi.fn(),
      });
    }
    return originalAddEventListener(event, handler);
  });
};

describe('Error Boundary Sentry Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    console.error = vi.fn(); // Suppress React error logs
  });

  describe('Global Error Boundary', () => {
    it('captures unhandled errors and sends to Sentry', () => {
      setupErrorEventMock('Global window error');
      
      render(
        <GlobalErrorBoundary>
          <div>Test content</div>
        </GlobalErrorBoundary>
      );
      
      // Verify Sentry was called with correct data
      expect(Sentry.captureException).toHaveBeenCalled();
      
      // Verify logger was called with severity and category
      expect(logger.error).toHaveBeenCalledWith(
        'Global error caught:',
        expect.objectContaining({
          error: expect.any(Error),
          message: 'Global window error',
          severity: ErrorSeverity.HIGH,
          category: ErrorCategory.SYSTEM,
          component: 'GlobalErrorBoundary',
        }),
        expect.any(Error)
      );
    });
  });

  describe('Feature Error Boundary', () => {
    it('captures component errors and sends to Sentry with feature tags', () => {
      render(
        <FeatureErrorBoundary name="PaymentForm">
          <ErrorThrowingComponent message="Payment validation failed" />
        </FeatureErrorBoundary>
      );
      
      // Get the scope callback 
      const scopeCallback = Sentry.withScope.mock.calls[0][0];
      const mockScope = {
        setTag: vi.fn(),
        setExtra: vi.fn(),
      };
      
      // Call the callback
      scopeCallback(mockScope);
      
      // Verify Sentry scope was configured correctly
      expect(mockScope.setTag).toHaveBeenCalledWith('feature', 'PaymentForm');
      expect(mockScope.setExtra).toHaveBeenCalledWith('componentStack', expect.any(String));
      
      // Verify Sentry exception was captured
      expect(Sentry.captureException).toHaveBeenCalledWith(expect.any(Error));
      
      // Verify logger was called with component context
      expect(logger.error).toHaveBeenCalledWith(
        'Error in PaymentForm component:',
        expect.objectContaining({
          component: 'PaymentForm',
        }),
        expect.any(Error)
      );
    });
  });

  describe('API Error Boundary', () => {
    it('captures API errors and sends to Sentry with API tags', () => {
      render(
        <ApiErrorBoundary apiName="UserAPI">
          {({ setError }) => (
            <button onClick={() => setError(new Error('API request failed'))}>
              Trigger Error
            </button>
          )}
        </ApiErrorBoundary>
      );
      
      // Trigger the error
      fireEvent.click(screen.getByText('Trigger Error'));
      
      // Get the scope callback
      const scopeCallback = Sentry.withScope.mock.calls[0][0];
      const mockScope = {
        setTag: vi.fn(),
      };
      
      // Call the callback
      scopeCallback(mockScope);
      
      // Verify Sentry scope was configured correctly
      expect(mockScope.setTag).toHaveBeenCalledWith('api', 'UserAPI');
      expect(mockScope.setTag).toHaveBeenCalledWith('error_type', 'api_error');
      
      // Verify Sentry exception was captured
      expect(Sentry.captureException).toHaveBeenCalledWith(expect.any(Error));
      
      // Verify logger was called with API context
      expect(logger.error).toHaveBeenCalledWith(
        'API Error in UserAPI:',
        expect.objectContaining({
          component: 'UserAPI',
        }),
        expect.any(Error)
      );
    });
  });

  describe('End-to-end Flow', () => {
    it('demonstrates complete error handling flow with nested error boundaries', () => {
      // Mock showReportDialog implementation
      Sentry.showReportDialog.mockImplementation(() => {
        console.log('Showing Sentry report dialog');
      });
      
      render(
        <GlobalErrorBoundary>
          <div data-testid="main-app">
            <h1>App Container</h1>
            <FeatureErrorBoundary name="UserProfile">
              <div data-testid="profile-container">
                <h2>User Profile</h2>
                <ApiErrorBoundary apiName="ProfileAPI">
                  {({ setError }) => (
                    <>
                      <button 
                        data-testid="error-button"
                        onClick={() => setError(new Error('Failed to load profile'))}
                      >
                        Load Profile
                      </button>
                    </>
                  )}
                </ApiErrorBoundary>
              </div>
            </FeatureErrorBoundary>
          </div>
        </GlobalErrorBoundary>
      );
      
      // Verify initial render
      expect(screen.getByTestId('main-app')).toBeInTheDocument();
      expect(screen.getByTestId('profile-container')).toBeInTheDocument();
      expect(screen.getByTestId('error-button')).toBeInTheDocument();
      
      // Trigger API error
      fireEvent.click(screen.getByTestId('error-button'));
      
      // Verify error UI is shown
      expect(screen.getByText('Problem loading data')).toBeInTheDocument();
      
      // Verify Sentry was called only for the API error
      expect(Sentry.captureException).toHaveBeenCalledTimes(1);
      expect(Sentry.captureException).toHaveBeenCalledWith(expect.any(Error));
      
      // Trigger report dialog
      fireEvent.click(screen.getByText('Report Issue'));
      expect(Sentry.showReportDialog).toHaveBeenCalledWith({
        eventId: 'mock-event-id',
      });
      
      // Retry the operation
      fireEvent.click(screen.getByText('Retry'));
      
      // Should be back to normal state
      expect(screen.getByTestId('error-button')).toBeInTheDocument();
    });
  });
});
/**
 * @test-category error-boundaries
 * @environment client
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import * as Sentry from '@sentry/nextjs';
import { ApiErrorBoundary } from '@/components/error-boundaries';
import { logger } from '@/lib/logger';
import React, { useState } from 'react';

// Mock Sentry
vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(() => 'mock-event-id'),
  showReportDialog: vi.fn(),
  withScope: vi.fn((callback) => {
    const mockScope = {
      setTag: vi.fn(),
      setExtra: vi.fn(),
    };
    callback(mockScope);
    return 'mock-event-id';
  }),
}));

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
  },
}));

describe('ApiErrorBoundary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('renders children with API context when there is no error', () => {
    render(
      <ApiErrorBoundary apiName="UserData">
        {({ isLoading, error, isError }) => (
          <div data-testid="child-component">
            {isLoading && <span>Loading...</span>}
            {isError && <span>Error!</span>}
            {!isLoading && !isError && <span>Data loaded</span>}
          </div>
        )}
      </ApiErrorBoundary>
    );
    
    expect(screen.getByTestId('child-component')).toBeInTheDocument();
    expect(screen.getByText('Data loaded')).toBeInTheDocument();
  });
  
  it('updates loading state when setLoading is called', () => {
    render(
      <ApiErrorBoundary apiName="UserData">
        {({ isLoading, setLoading }) => (
          <div>
            <button onClick={() => setLoading(true)}>Start Loading</button>
            <button onClick={() => setLoading(false)}>Stop Loading</button>
            {isLoading ? <span>Loading...</span> : <span>Not Loading</span>}
          </div>
        )}
      </ApiErrorBoundary>
    );
    
    // Check initial state
    expect(screen.getByText('Not Loading')).toBeInTheDocument();
    
    // Click start loading
    fireEvent.click(screen.getByText('Start Loading'));
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    
    // Click stop loading
    fireEvent.click(screen.getByText('Stop Loading'));
    expect(screen.getByText('Not Loading')).toBeInTheDocument();
  });
  
  it('sets error state and logs to Sentry when setError is called', () => {
    render(
      <ApiErrorBoundary apiName="UserData">
        {({ isError, error, setError }) => (
          <div>
            <button onClick={() => setError(new Error('API error'))}>Trigger Error</button>
            {isError ? (
              <div>
                Error: {error?.message}
              </div>
            ) : (
              <div>No Error</div>
            )}
          </div>
        )}
      </ApiErrorBoundary>
    );
    
    // Check initial state
    expect(screen.getByText('No Error')).toBeInTheDocument();
    
    // Trigger error
    fireEvent.click(screen.getByText('Trigger Error'));
    
    // Check the component is now showing the default error UI
    expect(screen.getByText('Problem loading data')).toBeInTheDocument();
    expect(screen.getByText(/We encountered an error while fetching data from UserData/)).toBeInTheDocument();
    expect(screen.getByText('Error: API error')).toBeInTheDocument();
    
    // Check logger and Sentry were called
    expect(logger.error).toHaveBeenCalledWith(
      'API Error in UserData:',
      expect.objectContaining({
        error: expect.any(Error),
        component: 'UserData',
      }),
      expect.any(Error)
    );
    
    expect(Sentry.withScope).toHaveBeenCalled();
    expect(Sentry.captureException).toHaveBeenCalledWith(expect.any(Error));
  });
  
  it('resets error state when reset is called', () => {
    // Simplified test that doesn't require useState
    render(
      <ApiErrorBoundary apiName="UserData">
        {({ isError, error, setError, reset }) => (
          <div>
            <button onClick={() => setError(new Error('API error'))}>
              Trigger Error
            </button>
            <button onClick={reset}>Reset Error</button>
            {isError ? (
              <div>Error: {error?.message}</div>
            ) : (
              <div>No Error</div>
            )}
          </div>
        )}
      </ApiErrorBoundary>
    );
    
    // Trigger error
    fireEvent.click(screen.getByText('Trigger Error'));
    
    // The default error UI should appear
    expect(screen.getByText('Problem loading data')).toBeInTheDocument();
    
    // Reset error
    fireEvent.click(screen.getByText('Retry'));
    
    // Should now show the component again with no error
    expect(screen.getByText('No Error')).toBeInTheDocument();
  });
  
  it('renders custom fallback when provided and an error occurs', () => {
    const CustomFallback = ({ error, reset }) => (
      <div data-testid="custom-fallback">
        <h2>Custom Error: {error.message}</h2>
        <button onClick={reset}>Custom Reset</button>
      </div>
    );
    
    render(
      <ApiErrorBoundary 
        apiName="UserData"
        fallback={CustomFallback}
      >
        {({ setError }) => (
          <div>
            <button onClick={() => setError(new Error('API error'))}>Trigger Error</button>
            <span>No Error</span>
          </div>
        )}
      </ApiErrorBoundary>
    );
    
    // Trigger error
    fireEvent.click(screen.getByText('Trigger Error'));
    
    // Check custom fallback is rendered
    expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
    expect(screen.getByText('Custom Error: API error')).toBeInTheDocument();
    
    // Reset from custom fallback
    fireEvent.click(screen.getByText('Custom Reset'));
    
    // Check we're back to normal state
    expect(screen.getByText('No Error')).toBeInTheDocument();
  });
  
  it('renders default error UI when no fallback is provided and an error occurs', () => {
    render(
      <ApiErrorBoundary apiName="UserData">
        {({ setError }) => (
          <div>
            <button onClick={() => setError(new Error('API error'))}>Trigger Error</button>
            <span>No Error</span>
          </div>
        )}
      </ApiErrorBoundary>
    );
    
    // Trigger error
    fireEvent.click(screen.getByText('Trigger Error'));
    
    // Check default error UI is rendered
    expect(screen.getByText('Problem loading data')).toBeInTheDocument();
    expect(screen.getByText(/We encountered an error while fetching data from UserData/)).toBeInTheDocument();
    
    // Check buttons are rendered
    expect(screen.getByText('Retry')).toBeInTheDocument();
    expect(screen.getByText('Report Issue')).toBeInTheDocument();
    
    // Check error details are shown in development mode
    // This assumes NODE_ENV !== 'production'
    expect(screen.getByText('Error: API error')).toBeInTheDocument();
  });
  
  it('shows Sentry report dialog when feedback button is clicked', () => {
    render(
      <ApiErrorBoundary apiName="UserData">
        {({ setError }) => (
          <div>
            <button onClick={() => setError(new Error('API error'))}>Trigger Error</button>
            <span>No Error</span>
          </div>
        )}
      </ApiErrorBoundary>
    );
    
    // Trigger error
    fireEvent.click(screen.getByText('Trigger Error'));
    
    // Click the feedback button
    fireEvent.click(screen.getByText('Report Issue'));
    
    // Check Sentry.showReportDialog was called
    expect(Sentry.showReportDialog).toHaveBeenCalledWith({
      eventId: 'mock-event-id',
    });
  });
  
  it('adds API tags to Sentry scope', () => {
    render(
      <ApiErrorBoundary apiName="UserData">
        {({ setError }) => (
          <div>
            <button onClick={() => setError(new Error('API error'))}>Trigger Error</button>
          </div>
        )}
      </ApiErrorBoundary>
    );
    
    // Trigger error
    fireEvent.click(screen.getByText('Trigger Error'));
    
    // Get the scope callback
    const scopeCallback = Sentry.withScope.mock.calls[0][0];
    const mockScope = {
      setTag: vi.fn(),
    };
    
    // Call the callback
    scopeCallback(mockScope);
    
    // Check API tags were set
    expect(mockScope.setTag).toHaveBeenCalledWith('api', 'UserData');
    expect(mockScope.setTag).toHaveBeenCalledWith('error_type', 'api_error');
  });
  
  it('works with async data fetching', async () => {
    const mockData = { name: 'John', age: 30 };
    const fetchData = vi.fn().mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(() => resolve(mockData), 100);
      });
    });
    
    render(
      <ApiErrorBoundary apiName="UserData">
        {({ isLoading, error, setLoading, setError }) => (
          <div>
            <button 
              onClick={async () => {
                setLoading(true);
                try {
                  const data = await fetchData();
                  // Render would use the data here
                } catch (err) {
                  setError(err);
                } finally {
                  setLoading(false);
                }
              }}
            >
              Fetch Data
            </button>
            {isLoading && <span>Loading...</span>}
            {!isLoading && <span>Data Ready</span>}
          </div>
        )}
      </ApiErrorBoundary>
    );
    
    // Click fetch data
    fireEvent.click(screen.getByText('Fetch Data'));
    
    // Check loading state
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    
    // Wait for loading to complete
    await waitFor(() => expect(screen.getByText('Data Ready')).toBeInTheDocument());
    
    // Check fetchData was called
    expect(fetchData).toHaveBeenCalled();
  });
});
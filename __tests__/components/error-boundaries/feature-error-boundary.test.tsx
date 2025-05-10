/**
 * @test-category error-boundaries
 * @environment client
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import * as Sentry from '@sentry/nextjs';
import { FeatureErrorBoundary } from '@/components/error-boundaries';
import { logger } from '@/lib/logger';

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

// Error throwing component for testing
const ErrorComponent = ({ shouldThrow = false }) => {
  if (shouldThrow) {
    throw new Error('Test component error');
  }
  return <div data-testid="component">Working Component</div>;
};

describe('FeatureErrorBoundary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    console.error = vi.fn(); // Suppress React error logs
  });
  
  it('renders children when there is no error', () => {
    render(
      <FeatureErrorBoundary name="TestFeature">
        <div data-testid="child-component">Test Content</div>
      </FeatureErrorBoundary>
    );
    
    expect(screen.getByTestId('child-component')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
  
  it('renders error UI when a child component throws', () => {
    render(
      <FeatureErrorBoundary name="TestFeature">
        <ErrorComponent shouldThrow={true} />
      </FeatureErrorBoundary>
    );
    
    // Check error UI is rendered
    expect(screen.getByText('Problem loading TestFeature')).toBeInTheDocument();
    expect(screen.getByText(/This feature encountered an error/)).toBeInTheDocument();
    
    // Check buttons are rendered
    expect(screen.getByText('Retry')).toBeInTheDocument();
    expect(screen.getByText('Report Feedback')).toBeInTheDocument();
    
    // Check error details are shown in development mode
    // This assumes NODE_ENV !== 'production'
    expect(screen.getByText(/Error: Test component error/)).toBeInTheDocument();
    
    // Check logger and Sentry were called
    expect(logger.error).toHaveBeenCalledWith(
      'Error in TestFeature component:',
      expect.objectContaining({
        error: expect.any(Error),
        component: 'TestFeature',
      }),
      expect.any(Error)
    );
    
    expect(Sentry.withScope).toHaveBeenCalled();
    expect(Sentry.captureException).toHaveBeenCalledWith(expect.any(Error));
  });
  
  it('renders custom fallback when provided', () => {
    const CustomFallback = () => (
      <div data-testid="custom-fallback">
        Custom Error UI
      </div>
    );
    
    render(
      <FeatureErrorBoundary name="TestFeature" fallback={<CustomFallback />}>
        <ErrorComponent shouldThrow={true} />
      </FeatureErrorBoundary>
    );
    
    // Check custom fallback is rendered
    expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
    expect(screen.getByText('Custom Error UI')).toBeInTheDocument();
  });
  
  it('resets the error state when retry button is clicked', async () => {
    let shouldThrow = true;
    
    function TestComponent() {
      if (shouldThrow) {
        throw new Error('Test error');
      }
      return <div data-testid="recovered-component">Recovered Component</div>;
    }
    
    // Mock onReset to fix the error condition
    const handleReset = vi.fn(() => {
      shouldThrow = false;
    });
    
    render(
      <FeatureErrorBoundary name="TestFeature" onReset={handleReset}>
        <TestComponent />
      </FeatureErrorBoundary>
    );
    
    // Check error UI is rendered
    expect(screen.getByText('Problem loading TestFeature')).toBeInTheDocument();
    
    // Click the retry button
    fireEvent.click(screen.getByText('Retry'));
    
    // Check onReset was called
    expect(handleReset).toHaveBeenCalled();
    
    // Check component has recovered
    expect(screen.getByTestId('recovered-component')).toBeInTheDocument();
    expect(screen.getByText('Recovered Component')).toBeInTheDocument();
  });
  
  it('hides the retry button when showReset is false', () => {
    render(
      <FeatureErrorBoundary name="TestFeature" showReset={false}>
        <ErrorComponent shouldThrow={true} />
      </FeatureErrorBoundary>
    );
    
    // Check error UI is rendered
    expect(screen.getByText('Problem loading TestFeature')).toBeInTheDocument();
    
    // Retry button should not be there
    expect(screen.queryByText('Retry')).not.toBeInTheDocument();
    
    // Report button should still be there
    expect(screen.getByText('Report Feedback')).toBeInTheDocument();
  });
  
  it('shows Sentry report dialog when feedback button is clicked', () => {
    render(
      <FeatureErrorBoundary name="TestFeature">
        <ErrorComponent shouldThrow={true} />
      </FeatureErrorBoundary>
    );
    
    // Click the feedback button
    fireEvent.click(screen.getByText('Report Feedback'));
    
    // Check Sentry.showReportDialog was called
    expect(Sentry.showReportDialog).toHaveBeenCalledWith({
      eventId: 'mock-event-id',
    });
  });
  
  it('calls onError when an error occurs', () => {
    const handleError = vi.fn();
    
    render(
      <FeatureErrorBoundary name="TestFeature" onError={handleError}>
        <ErrorComponent shouldThrow={true} />
      </FeatureErrorBoundary>
    );
    
    // Check onError was called
    expect(handleError).toHaveBeenCalledWith(
      expect.any(Error), 
      expect.objectContaining({
        componentStack: expect.any(String),
      })
    );
  });
  
  it('adds component tag to Sentry scope', () => {
    render(
      <FeatureErrorBoundary name="TestFeature">
        <ErrorComponent shouldThrow={true} />
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
    
    // Check component tag was set
    expect(mockScope.setTag).toHaveBeenCalledWith('feature', 'TestFeature');
    
    // Check component stack was added to extras
    expect(mockScope.setExtra).toHaveBeenCalledWith('componentStack', expect.any(String));
  });
});
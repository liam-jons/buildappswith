/**
 * @test-category error-boundaries
 * @environment client
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import * as Sentry from '@sentry/nextjs';
import { GlobalErrorBoundary } from '@/components/error-boundaries';
import { logger } from '@/lib/logger';

// Mock Sentry
vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(() => 'mock-event-id'),
  showReportDialog: vi.fn(),
}));

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
  },
}));

describe('GlobalErrorBoundary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset error event listeners
    const originalAddEventListener = window.addEventListener;
    const originalRemoveEventListener = window.removeEventListener;
    
    window.addEventListener = originalAddEventListener;
    window.removeEventListener = originalRemoveEventListener;
  });
  
  it('renders children when there is no error', () => {
    render(
      <GlobalErrorBoundary>
        <div data-testid="child-component">Test Content</div>
      </GlobalErrorBoundary>
    );
    
    expect(screen.getByTestId('child-component')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
  
  it('renders error UI when an error occurs', () => {
    // Mock window.addEventListener to trigger the error handler
    const originalAddEventListener = window.addEventListener;
    window.addEventListener = vi.fn((event, handler) => {
      if (event === 'error') {
        // Trigger the error handler immediately
        handler({
          error: new Error('Test error'),
          message: 'Test error message',
          filename: 'test.js',
          lineno: 10,
          colno: 20,
          preventDefault: vi.fn(),
        });
      }
      return originalAddEventListener(event, handler);
    });
    
    render(
      <GlobalErrorBoundary>
        <div>Test Content</div>
      </GlobalErrorBoundary>
    );
    
    // Check error UI is rendered
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText(/We've encountered an unexpected error/)).toBeInTheDocument();
    
    // Check event ID is displayed
    expect(screen.getByText(/Reference ID/)).toBeInTheDocument();
    expect(screen.getByText(/mock-event-id/)).toBeInTheDocument();
    
    // Check buttons
    expect(screen.getByText('Reload Page')).toBeInTheDocument();
    expect(screen.getByText('Tell Us What Happened')).toBeInTheDocument();
    
    // Check logger and Sentry were called
    expect(logger.error).toHaveBeenCalledWith(
      'Global error caught:',
      expect.objectContaining({
        error: expect.any(Error),
        message: 'Test error message',
      }),
      expect.any(Error)
    );
    
    expect(Sentry.captureException).toHaveBeenCalledWith(expect.any(Error));
  });
  
  it('renders custom fallback component when provided', () => {
    // Mock window.addEventListener to trigger the error handler
    const originalAddEventListener = window.addEventListener;
    window.addEventListener = vi.fn((event, handler) => {
      if (event === 'error') {
        // Trigger the error handler immediately
        handler({
          error: new Error('Test error'),
          message: 'Test error message',
          preventDefault: vi.fn(),
        });
      }
      return originalAddEventListener(event, handler);
    });
    
    const CustomFallback = () => (
      <div data-testid="custom-fallback">
        Custom Error UI
      </div>
    );
    
    render(
      <GlobalErrorBoundary fallback={<CustomFallback />}>
        <div>Test Content</div>
      </GlobalErrorBoundary>
    );
    
    // Check custom fallback is rendered
    expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
    expect(screen.getByText('Custom Error UI')).toBeInTheDocument();
  });
  
  it('handles unhandled promise rejections', () => {
    // Mock window.addEventListener to trigger the unhandledrejection handler
    const originalAddEventListener = window.addEventListener;
    window.addEventListener = vi.fn((event, handler) => {
      if (event === 'unhandledrejection') {
        // Trigger the unhandledrejection handler immediately
        handler({
          reason: new Error('Promise rejection error'),
          preventDefault: vi.fn(),
        });
      }
      return originalAddEventListener(event, handler);
    });
    
    render(
      <GlobalErrorBoundary>
        <div>Test Content</div>
      </GlobalErrorBoundary>
    );
    
    // Check error UI is rendered
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    
    // Check logger and Sentry were called
    expect(logger.error).toHaveBeenCalledWith(
      'Unhandled promise rejection:',
      expect.objectContaining({
        reason: expect.any(Error),
      }),
      expect.any(Error)
    );
    
    expect(Sentry.captureException).toHaveBeenCalledWith(expect.any(Error));
  });
  
  it('shows Sentry report dialog when feedback button is clicked', () => {
    // Mock window.addEventListener to trigger the error handler
    const originalAddEventListener = window.addEventListener;
    window.addEventListener = vi.fn((event, handler) => {
      if (event === 'error') {
        // Trigger the error handler immediately
        handler({
          error: new Error('Test error'),
          message: 'Test error message',
          preventDefault: vi.fn(),
        });
      }
      return originalAddEventListener(event, handler);
    });
    
    render(
      <GlobalErrorBoundary>
        <div>Test Content</div>
      </GlobalErrorBoundary>
    );
    
    // Click the feedback button
    fireEvent.click(screen.getByText('Tell Us What Happened'));
    
    // Check Sentry.showReportDialog was called
    expect(Sentry.showReportDialog).toHaveBeenCalledWith({
      eventId: 'mock-event-id',
    });
  });
  
  it('reloads the page when reload button is clicked', () => {
    // Mock window.addEventListener to trigger the error handler
    const originalAddEventListener = window.addEventListener;
    window.addEventListener = vi.fn((event, handler) => {
      if (event === 'error') {
        // Trigger the error handler immediately
        handler({
          error: new Error('Test error'),
          message: 'Test error message',
          preventDefault: vi.fn(),
        });
      }
      return originalAddEventListener(event, handler);
    });
    
    // Mock window.location.reload
    const originalLocation = window.location;
    delete window.location;
    window.location = { reload: vi.fn() } as any;
    
    render(
      <GlobalErrorBoundary>
        <div>Test Content</div>
      </GlobalErrorBoundary>
    );
    
    // Click the reload button
    fireEvent.click(screen.getByText('Reload Page'));
    
    // Check window.location.reload was called
    expect(window.location.reload).toHaveBeenCalled();
    
    // Restore window.location
    window.location = originalLocation;
  });
  
  it('removes event listeners on unmount', () => {
    // Mock window.removeEventListener
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    
    const { unmount } = render(
      <GlobalErrorBoundary>
        <div>Test Content</div>
      </GlobalErrorBoundary>
    );
    
    // Unmount the component
    unmount();
    
    // Check window.removeEventListener was called
    expect(removeEventListenerSpy).toHaveBeenCalledWith('error', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('unhandledrejection', expect.any(Function));
  });
});
'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSignOut, useAuthToken } from '@/hooks/auth';
import { Button } from '@/components/ui/core/button';
import * as Sentry from '@sentry/nextjs';

interface AuthErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error) => void;
}

/**
 * Error boundary for handling authentication-related errors
 * 
 * This component provides graceful error handling for auth-related issues:
 * - Automatically attempts token refresh on token expiration
 * - Provides error UI for persistent authentication problems
 * - Integrates with Sentry for error reporting
 * - Offers recovery options to users
 * 
 * Version: 2.0.0 (Enhanced for Express SDK)
 */
export function AuthErrorBoundary({ 
  children, 
  fallback,
  onError
}: AuthErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false);
  const [errorDetails, setErrorDetails] = useState<{message: string, retryable: boolean}>({
    message: 'An authentication error occurred',
    retryable: true
  });
  const { signOut } = useSignOut();
  const { refreshToken } = useAuthToken();
  const router = useRouter();

  // Reset error state when navigating
  useEffect(() => {
    const handleRouteChange = () => {
      if (hasError) {
        setHasError(false);
      }
    };

    // Listen for authentication errors
    const handleAuthError = async (event: Event) => {
      const customEvent = event as CustomEvent;
      const error = customEvent.detail?.error;
      
      if (!error) return;
      
      // Report to Sentry
      Sentry.captureException(error, {
        tags: { source: 'auth-error-boundary' },
        level: 'warning'
      });
      
      if (onError) {
        onError(error);
      }

      // Handle different types of auth errors
      if (error.name === 'TokenExpiredError' || error.name === 'TokenRefreshRequired') {
        try {
          // Attempt to refresh the token
          await refreshToken();
          // Token refreshed successfully, no need to show error
          return;
        } catch (refreshError) {
          // Token refresh failed, show error UI
          setErrorDetails({
            message: 'Your session has expired. Please sign in again.',
            retryable: false
          });
          setHasError(true);
        }
      } else if (error.name === 'AuthenticationError' || error.name === 'UnauthorizedError') {
        setErrorDetails({
          message: 'You are not authenticated. Please sign in.',
          retryable: false
        });
        setHasError(true);
      } else if (error.name === 'AuthorizationError' || error.name === 'ForbiddenError') {
        setErrorDetails({
          message: 'You do not have permission to access this resource.',
          retryable: false
        });
        setHasError(true);
      } else {
        // Generic auth error
        setErrorDetails({
          message: error.message || 'An authentication error occurred',
          retryable: true
        });
        setHasError(true);
      }
    };

    // Also listen for standard errors that might be auth-related
    const handleStandardError = (errorEvent: ErrorEvent) => {
      if (
        errorEvent.message?.includes("clerk") || 
        errorEvent.message?.includes("auth") ||
        errorEvent.message?.includes("unauthorized") ||
        errorEvent.message?.includes("token")
      ) {
        // Convert to auth error
        dispatchAuthError(new Error(errorEvent.message));
        
        // Prevent default handling
        errorEvent.preventDefault();
      }
    };

    // Register event listeners
    window.addEventListener('auth-error', handleAuthError);
    window.addEventListener('popstate', handleRouteChange);
    window.addEventListener('error', handleStandardError);
    
    return () => {
      window.removeEventListener('auth-error', handleAuthError);
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('error', handleStandardError);
    };
  }, [hasError, refreshToken, onError]);

  // Dispatch global auth error (for testing and manual triggering)
  const dispatchAuthError = (errorType: string | Error) => {
    const error = typeof errorType === 'string' 
      ? new Error(`Test ${errorType}`) 
      : errorType;
      
    const event = new CustomEvent('auth-error', {
      detail: {
        error,
        name: error.name
      }
    });
    window.dispatchEvent(event);
  };

  // Handle retry action
  const handleRetry = () => {
    setHasError(false);
    // Force refresh the current route
    router.refresh();
  };

  // Handle sign out action
  const handleSignOut = () => {
    signOut({ callbackUrl: '/login' });
  };

  // Custom fallback UI for auth errors
  if (hasError) {
    // Allow custom fallback if provided
    if (fallback) {
      return <>{fallback}</>;
    }

    // Default error UI
    return (
      <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md flex flex-col space-y-4 mt-8">
        <div className="flex items-center justify-center">
          <div className="bg-red-100 p-3 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">Authentication Error</h3>
          <p className="text-gray-500 mt-1">{errorDetails.message}</p>
        </div>
        <div className="flex justify-center space-x-3 pt-2">
          {errorDetails.retryable && (
            <Button variant="default" onClick={handleRetry}>
              Try Again
            </Button>
          )}
          <Button variant="outline" onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>
        
        {/* Debug controls - remove in production */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-2">Debug Controls</p>
            <div className="flex flex-wrap gap-2">
              <button 
                className="text-xs bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded" 
                onClick={() => dispatchAuthError('TokenExpiredError')}
              >
                Trigger Token Expired
              </button>
              <button 
                className="text-xs bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded" 
                onClick={() => dispatchAuthError('AuthenticationError')}
              >
                Trigger Auth Error
              </button>
              <button 
                className="text-xs bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded" 
                onClick={() => dispatchAuthError('AuthorizationError')}
              >
                Trigger Permission Error
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * Utility function to dispatch an auth error event
 * @param error The error object to dispatch
 */
export function dispatchAuthError(error: Error): void {
  const event = new CustomEvent('auth-error', {
    detail: { error }
  });
  window.dispatchEvent(event);
}

/**
 * Function to wrap an async operation with auth error handling
 * @param operation The async operation to execute
 * @returns The result of the operation
 */
export async function withAuthErrorHandling<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    // Check if it's an auth-related error
    if (error instanceof Error && 
        (error.name?.includes('Auth') || 
         error.name?.includes('Token') || 
         error.message?.toLowerCase().includes('auth') ||
         error.message?.toLowerCase().includes('unauthorized'))) {
      dispatchAuthError(error);
    }
    throw error;
  }
}
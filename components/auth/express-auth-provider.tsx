'use client';

import {
  ReactNode
} from 'react';
import { AuthErrorBoundary } from './auth-error-boundary';
import {
  ExpressAuthProvider as BaseExpressAuthProvider
} from '@/lib/auth/hooks';
import { UserRole } from '@/lib/auth/types';

/**
 * Express SDK authentication provider
 *
 * This component creates a centralized authentication context using the Express SDK
 * with performance optimizations, error handling, and consistent auth state.
 *
 * Version: 2.0.0 - Updated to fix circular dependencies and improve initialization
 */
export function ExpressAuthProvider({
  children,
  withErrorBoundary = true
}: {
  children: ReactNode;
  withErrorBoundary?: boolean;
}) {
  // If not using error boundary, just provide the context
  if (!withErrorBoundary) {
    return (
      <BaseExpressAuthProvider>
        {children}
      </BaseExpressAuthProvider>
    );
  }

  // With error boundary for handling auth errors
  return (
    <BaseExpressAuthProvider>
      <AuthErrorBoundary>
        {children}
      </AuthErrorBoundary>
    </BaseExpressAuthProvider>
  );
}

/**
 * Enhanced provider that includes authentication, error handling, and session management
 * Now uses the core Express provider directly to avoid circular dependencies
 */
export function EnhancedAuthProvider({ children }: { children: ReactNode }) {
  return (
    <ExpressAuthProvider withErrorBoundary={true}>
      {children}
    </ExpressAuthProvider>
  );
}
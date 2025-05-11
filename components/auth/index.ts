/**
 * Authentication Components
 * 
 * This barrel file exports all authentication components
 * and provides a centralized entry point for authentication-related UI.
 * 
 * Version: 2.0.0 (Updated for Clerk Express SDK)
 */

'use client';

// Authentication status components
export { 
  AuthStatus, 
  ProtectedAuthStatus, 
  HeaderAuthStatus 
} from './auth-status';

// Authentication form component
export { default as ClerkAuthForm } from './clerk-auth-form'; 

// Protection components
export { default as ProtectedRoute } from './protected-route';
export { 
  RoleProtected, 
  PermissionProtected 
} from './role-protected';

// Authentication providers
export { 
  ExpressAuthProvider, 
  EnhancedAuthProvider, 
  useExpressAuth, 
  useAuthLoaded 
} from './express-auth-provider';

// Error boundary for authentication errors
export { 
  AuthErrorBoundary, 
  dispatchAuthError, 
  withAuthErrorHandling 
} from './auth-error-boundary';

// Loading state component
export { default as LoadingState } from './loading-state';

// Re-export subdirectory components
export * from './ui';
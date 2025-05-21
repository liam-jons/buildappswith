/**
 * Authentication Components Barrel Export
 * 
 * This file exports all authentication components following the
 * domain-first organization pattern used across the codebase.
 * 
 * Version: 3.0.0 (Updated for Clerk Express SDK)
 */

'use client';

// Authentication status components
export { AuthStatus } from './auth-status';

// Authentication form component
export { default as ClerkAuthForm } from './clerk-auth-form'; 

// Protection components
export { default as ProtectedRoute } from './protected-route';
export { RoleProtected } from './role-protected';

// Authentication providers
export { ExpressAuthProvider } from './express-auth-provider';

// Error boundary for authentication errors
export { AuthErrorBoundary } from './auth-error-boundary';

// Loading state components
export { default as LoadingState } from './loading-state';
export { OptimizedLoadingState } from './optimized-loading-state';
export { ProgressiveLoadingState } from './progressive-loading-state';

// Re-export subdirectory components
export * from './ui';
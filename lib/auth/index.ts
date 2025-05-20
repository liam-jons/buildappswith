/**
 * Auth Domain Barrel Export File
 * Version: 2.0.0
 *
 * This file exports the public API for the auth domain, following the
 * standard domain architecture pattern used across the codebase.
 */

// Core domain exports - review each for client safety
export * from './actions'; // Assuming these are client-callable or safe
export * from './api';     // Assuming these are client-callable or safe
export * from './schemas';
// export * from './security-logging'; // REMOVED: Server-only, import directly via @/lib/auth/security-logging
export * from './types';
export * from './utils';

// Export client-side hooks
export {
  useAuth,
  useUser,
  useHasRole,
  useIsAdmin,
  useIsBuilder,
  useIsClient,
  useHasAllRoles,
  useHasAnyRole,
  usePermission,
  useSignOut,
  useAuthStatus,
} from './hooks';

// API protection utilities (typically server-side, but might be used in API route definitions)
// If these internally import from './server' or './security-logging', they might need to be moved
// or consumers should import them from a server-specific entry point.
// For now, keeping them but this is a potential area for further refinement.
export {
  withAuth,
  withRole,
  withAnyRole,
  withAllRoles,
  withAdmin,
  withBuilder,
  withClient,
  withPermission,
  withOptionalAuth,
  type AuthHandler,
  type RoleHandler,
  type OptionalAuthHandler,
} from './api-protection';

// Server utilities (as per Public API Design)
// These will eventually come from './server.ts'
export {
  // getServerAuth, // Placeholder
  // requireAuth,   // Placeholder
  // requireRole,   // Placeholder
} from './server'; // Assuming a future './server.ts'

// Middleware (as per Public API Design)
// This will eventually come from './middleware.ts'
export {
  // authMiddleware, // Placeholder
} from './middleware'; // Assuming a future './middleware.ts'

// Types (as per Public API Design - assuming these will be in './types.ts')
export type {
  // User, // Placeholder
  // AuthState, // Placeholder
} from './types';
export { /* UserRole */ } from './types'; // Placeholder for enums like UserRole

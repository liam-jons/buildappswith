/**
 * Auth Domain Barrel Export File
 * Version: 2.0.0
 *
 * This file exports the public API for the auth domain, following the
 * standard domain architecture pattern used across the codebase.
 */

// Core domain exports
export * from './actions';
export * from './api';
export * from './schemas';
export * from './security-logging';
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
  ExpressAuthProvider,
  useAuthContext,
} from './hooks';

// Export API protection
export {
  withAuth,
  withRole,
  withAnyRole,
  withAllRoles,
  withAdmin,
  withBuilder,
  withClient,
  withPermission,
  type AuthHandler,
  type RoleHandler,
} from './api-auth';

// Export server-side utilities
export {
  getServerAuth,
  createServerAuthRequest,
  getFullServerAuth,
  hasServerRole,
  hasServerPermission,
  requireServerAuth,
  requireServerRole,
  getDbUserIdFromClerkId,
  type ServerAuth,
} from './server';

// Export middleware
export {
  clerkExpressMiddleware,
  publicRoutes,
  ignoredRoutes,
  isPublicPath,
  isIgnoredPath,
  config as middlewareConfig,
} from './middleware';

// Export adapter utilities (for advanced use cases)
export {
  createClerkExpressMiddleware,
  adaptNextRequestToExpress,
  createMockExpressResponse,
} from './adapters/clerk-express/adapter';

// Export error types
export {
  AuthError,
  AuthenticationError,
  AuthorizationError,
  AuthConfigurationError,
  AuthRateLimitError,
  SessionError,
  TokenError,
} from './adapters/clerk-express/errors';

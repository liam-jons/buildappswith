/**
 * Clerk Express SDK Integration
 * Version: 1.0.0
 * 
 * This file exports all authentication utilities based on the Clerk Express SDK,
 * providing a central point for importing auth functionality.
 */

// Export adapter functions
export {
  createClerkExpressMiddleware,
  adaptNextRequestToExpress,
  createMockExpressResponse,
  AuthenticationError,
} from './adapter';

// Export middleware
export {
  clerkExpressMiddleware,
  publicRoutes,
  ignoredRoutes,
  isPublicPath,
  isIgnoredPath,
} from './middleware';

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
} from './server-auth';

// Export API route protection
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

// Export client-side hooks
export {
  useAuth,
  useUser,
  useHasRole,
  useIsAdmin,
  useIsBuilder,
  useIsClient,
  usePermission,
  useSignOut,
  useAuthStatus,
  ExpressAuthProvider,
  useAuthContext,
  type ExtendedUser,
} from './client-auth';

// Export error types
export {
  AuthError,
  AuthenticationError as AuthenticationErrorType,
  AuthorizationError,
  AuthConfigurationError,
  AuthRateLimitError,
  SessionError,
  TokenError,
} from './errors';
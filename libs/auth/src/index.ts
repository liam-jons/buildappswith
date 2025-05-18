// Auth Library Exports - Client Components
// Use this file to export React client components (e.g. those with 'use client' directive) or other non-server utilities

// Export core types
export { UserRole } from './lib/types';
export type { 
  AuthUser, 
  AuthOptions,
  AuthMiddlewareOptions,
  AuthContextType
} from './lib/types';

// Export express adapter components with explicit naming to avoid conflicts
export { 
  AuthError as AuthExpressError,
  AuthErrorType as AuthExpressErrorType,
  AuthenticationError,
  AuthorizationError,
  AuthConfigurationError,
  AuthRateLimitError,
  SessionError,
  TokenError,
  ValidationError,
  ResourceNotFoundError,
  createAuthErrorResponse
} from './lib/express/errors';

// Export express adapter
export { createClerkExpressMiddleware } from './lib/express/adapter';

// Export server auth utilities
export {
  getServerAuth,
  getFullServerAuth,
  hasServerRole,
  hasServerPermission,
  requireServerAuth,
  requireServerRole
} from './lib/express/server-auth';

// Export the placeholder component for now
export * from './lib/auth';

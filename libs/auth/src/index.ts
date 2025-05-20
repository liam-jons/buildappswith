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

// Export the placeholder component for now
export * from './lib/auth';

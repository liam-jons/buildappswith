// Export our custom hooks that wrap Clerk functionality
export {
  useAuth,
  useUser,
  useHasRole,
  useIsAdmin,
  useIsBuilder,
  useIsClient,
  useSignOut,
  useAuthStatus
} from './clerk-hooks';

// Also export the base Clerk hooks for any direct usage needs
export { useClerk, useSignIn, useSignUp } from '@clerk/nextjs';

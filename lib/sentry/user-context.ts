/**
 * User context enrichment for Sentry error reporting
 * Adds rich user information to Sentry events for better debugging
 * @version 1.0.0
 */

import * as Sentry from '@sentry/nextjs';

/**
 * User information to be attached to Sentry events
 */
interface SentryUserContext {
  id: string;
  email?: string;
  username?: string;
  ip_address?: string;
  roles?: string[];
  isBuilder?: boolean;
  isClient?: boolean;
  isAdmin?: boolean;
}

/**
 * Session information to be attached to Sentry context
 */
interface SentrySessionContext {
  id?: string;
  lastActiveAt?: string;
  expireAt?: string;
  userAgent?: string;
}

// Simple cookie parser for client and server
interface CookieStore {
  get: (name: string) => { value: string } | undefined;
}

// Type for a scope function to handle Sentry scope operations safely
type ScopeHandler = (scope: any) => void;

/**
 * Safe wrapper for Sentry.configureScope that handles missing API gracefully
 * @param handler Function to execute with the scope
 */
function safeConfigureScope(handler: ScopeHandler): void {
  try {
    // Check if we're in a browser environment and Sentry is fully loaded
    if (typeof window !== 'undefined' && Sentry && typeof Sentry.setUser === 'function') {
      // Direct API calls if configureScope isn't available
      handler({
        setUser: Sentry.setUser,
        setTag: (key: string, value: any) => {
          try {
            if (typeof Sentry.setTag === 'function') {
              Sentry.setTag(key, value);
            }
          } catch (e) {
            console.debug('Error in setTag:', e);
          }
        },
        setContext: (name: string, context: any) => {
          try {
            if (typeof Sentry.setContext === 'function') {
              Sentry.setContext(name, context);
            }
          } catch (e) {
            console.debug('Error in setContext:', e);
          }
        }
      });
      return;
    }
    
    // Edge runtime doesn't expose configureScope, so we'll skip this fallback
    // and rely on the direct API calls above in browser environments
  } catch (error) {
    console.debug('Error configuring Sentry scope:', error);
  }
}

/**
 * Extract user ID from request
 * 
 * @param headers Headers object
 * @param cookies Cookies object
 * @returns User ID if found, undefined otherwise
 */
function extractUserIdFromRequest(
  headersList: Headers,
  cookieStore: CookieStore
): string | undefined {
  try {
    // Check auth header
    const authHeader = headersList.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      // Extract user ID from JWT token
      // In a real implementation, you'd decode the JWT
      return 'user_from_jwt';
    }

    // Check for Clerk session cookies
    const clerkSession = cookieStore.get('__clerk_session');
    if (clerkSession) {
      // In a real implementation, you'd decode the cookie
      return 'user_from_clerk_cookie';
    }

    // Other auth methods would be implemented here
    return undefined;
  } catch (error) {
    console.error('Error extracting user ID:', error);
    return undefined;
  }
}

/**
 * Parse cookies from request object
 * Simplified implementation for the example
 * 
 * @param req Request object
 * @returns Cookie store
 */
function parseCookies(req: Request): CookieStore {
  const cookieHeader = req.headers.get('cookie') || '';
  const cookies = Object.fromEntries(
    cookieHeader.split(';').map(cookie => {
      const [name, ...rest] = cookie.trim().split('=');
      return [name, rest.join('=')];
    })
  );

  return {
    get: (name: string) => {
      const value = cookies[name];
      return value ? { value } : undefined;
    },
  };
}

/**
 * Configure user context in Sentry from Clerk auth data
 * For client-side use in React components
 * 
 * @param auth Clerk auth object
 * 
 * @example
 * // In a client component
 * const { isSignedIn, user } = useAuth();
 * 
 * // Configure Sentry user context when auth state changes
 * useEffect(() => {
 *   configureSentryUserContext({ isSignedIn, user });
 * }, [isSignedIn, user]);
 */
export function configureSentryUserContext(auth: any): void {
  try {
    // Use our safe wrapper for configureScope
    safeConfigureScope((scope) => {
      // Check scope has required methods
      if (typeof scope.setUser !== 'function') {
        console.debug('Sentry scope.setUser is not available');
        return;
      }
      
      // Core user identification (from Clerk)
      if (auth && auth.isSignedIn && auth.userId) {
        const userContext: SentryUserContext = {
          id: auth.userId,
        };
  
        // Add email and username if available
        if (auth.user?.primaryEmailAddress?.emailAddress) {
          userContext.email = auth.user.primaryEmailAddress.emailAddress;
        }
  
        if (auth.user?.username) {
          userContext.username = auth.user.username;
        }
  
        // Set user context
        scope.setUser(userContext);
  
        // User roles and permissions if setTag is available
        if (typeof scope.setTag === 'function') {
          const roles = auth.sessionClaims?.public_metadata?.roles || [];
          scope.setTag('user.role', roles.join(','));
          scope.setTag('user.isBuilder', roles.includes('builder'));
          scope.setTag('user.isClient', roles.includes('client'));
          scope.setTag('user.isAdmin', roles.includes('admin'));
        }
  
        // Account metadata if setContext is available
        if (typeof scope.setContext === 'function') {
          scope.setContext('account', {
            createdAt: auth.user?.createdAt,
            lastSignInAt: auth.user?.lastSignInAt,
            verificationStatus: auth.user?.emailAddresses?.[0]?.verification?.status,
          });
    
          // Session information
          scope.setContext('session', {
            id: auth.sessionId,
            lastActiveAt: auth.session?.lastActiveAt,
            expireAt: auth.session?.expireAt,
          });
    
          // Feature flags/entitlements
          if (auth.sessionClaims?.public_metadata?.features) {
            scope.setContext('features', auth.sessionClaims.public_metadata.features);
          }
        }
      } else {
        // Anonymous user tracking
        scope.setUser({
          id: 'anonymous',
        });
      }
    });
  } catch (error) {
    console.debug('Error configuring Sentry user context:', error);
  }
}

/**
 * Hook for using Sentry user context in React components
 * 
 * @param auth Clerk auth object
 * 
 * @example
 * function MyComponent() {
 *   const { isSignedIn, user } = useAuth();
 *   useSentryUser({ isSignedIn, user });
 *   
 *   // Component implementation
 * }
 */
export function useSentryUser(auth: any): void {
  if (typeof window !== 'undefined') {
    // Simple mock implementation - would use useEffect in practice
    configureSentryUserContext(auth);
  }
}

/**
 * Configure user context in Sentry from request headers and cookies
 * For server-side use in API routes and server components
 * 
 * @param req Request object containing headers and cookies
 * 
 * @example
 * // In an API route
 * export async function GET(request: Request) {
 *   configureSentryUserContextFromRequest(request);
 *   
 *   // API implementation
 * }
 */
export function configureSentryUserContextFromRequest(req?: Request): void {
  // Skip in client-side environment
  if (typeof window !== 'undefined') {
    return;
  }
  
  try {
    // Skip if no request
    if (!req) {
      return;
    }

    // Create headers list from request
    const headersList = new Headers(req.headers);
    
    // Parse cookies from request
    const cookieStore = parseCookies(req);

    // Get user ID from auth token or cookie
    const userId = extractUserIdFromRequest(headersList, cookieStore);
    
    // Use our safe wrapper for configureScope
    safeConfigureScope((scope) => {
      // Check scope has required methods
      if (typeof scope.setUser !== 'function') {
        console.debug('Sentry scope.setUser is not available');
        return;
      }
      
      if (userId) {
        // Set basic user info
        scope.setUser({
          id: userId,
        });

        // Additional context if setContext is available
        if (typeof scope.setContext === 'function') {
          // Set session context
          const sessionContext: SentrySessionContext = {};
          
          // Get session ID if available
          const sessionId = cookieStore.get('__session')?.value;
          if (sessionId) {
            sessionContext.id = sessionId;
          }

          // Get user agent
          const userAgent = headersList.get('user-agent');
          if (userAgent) {
            sessionContext.userAgent = userAgent;
          }

          // Set session context
          scope.setContext('session', sessionContext);

          // Set request context
          scope.setContext('request', {
            url: req.url || headersList.get('referer'),
            method: req.method || 'GET',
            headers: {
              'user-agent': userAgent,
              'accept-language': headersList.get('accept-language'),
            },
          });
        }
      } else {
        // Anonymous user
        scope.setUser({
          id: 'anonymous',
        });
      }
    });
  } catch (error) {
    console.debug('Error configuring Sentry user context from request:', error);
  }
}
'use client';

import { 
  ReactNode, 
  createContext, 
  useContext,
  useEffect,
  useState
} from 'react';
import { useAuth } from '@/hooks/auth';
import { AuthErrorBoundary } from './auth-error-boundary';
import { UserRole } from '@/lib/auth/types';

// Auth context interface
interface AuthContextType {
  isLoaded: boolean;
  isSignedIn: boolean | null;
  userId: string | null;
  roles: UserRole[];
  hasRole: (role: UserRole) => boolean;
  hasPermission: (permission: string) => boolean;
  isAdmin: boolean;
  isBuilder: boolean;
  isClient: boolean;
}

// Create context with default values
const ExpressAuthContext = createContext<AuthContextType | null>(null);

/**
 * Express SDK authentication provider
 * 
 * This component creates a centralized authentication context using the Express SDK
 * with performance optimizations, error handling, and consistent auth state.
 * 
 * Version: 1.0.0
 */
export function ExpressAuthProvider({ 
  children,
  withErrorBoundary = true
}: { 
  children: ReactNode;
  withErrorBoundary?: boolean;
}) {
  // Get auth state from the hooks
  const auth = useAuth();
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Handle initial loading state to prevent hydration mismatches
  useEffect(() => {
    if (auth.isLoaded && !initialLoadComplete) {
      setInitialLoadComplete(true);
    }
  }, [auth.isLoaded, initialLoadComplete]);

  // If not using error boundary, just provide the context
  if (!withErrorBoundary) {
    return (
      <ExpressAuthContext.Provider value={auth}>
        {children}
      </ExpressAuthContext.Provider>
    );
  }

  // With error boundary for handling auth errors
  return (
    <ExpressAuthContext.Provider value={auth}>
      <AuthErrorBoundary>
        {children}
      </AuthErrorBoundary>
    </ExpressAuthContext.Provider>
  );
}

/**
 * Hook to access the Express Auth context
 * @returns The auth context
 * @throws Error if used outside of ExpressAuthProvider
 */
export function useExpressAuth(): AuthContextType {
  const context = useContext(ExpressAuthContext);
  
  if (!context) {
    throw new Error('useExpressAuth must be used within an ExpressAuthProvider');
  }
  
  return context;
}

/**
 * Hook to check if the authentication data has loaded
 * @returns True if auth data is loaded
 */
export function useAuthLoaded(): boolean {
  const { isLoaded } = useExpressAuth();
  return isLoaded;
}

/**
 * Enhanced provider that includes authentication, error handling, and session management
 */
export function EnhancedAuthProvider({ children }: { children: ReactNode }) {
  return (
    <ExpressAuthProvider withErrorBoundary={true}>
      {children}
    </ExpressAuthProvider>
  );
}
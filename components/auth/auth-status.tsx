/**
 * Authentication Status Component
 * 
 * This component demonstrates the use of the authentication hooks to display
 * the current authentication status and user information.
 * 
 * Version: 1.0.0
 */

'use client';

import { useAuth, useUser } from '@/hooks/auth';
import { Button } from '@/components/ui/core/button';
import { UserRole } from '@/lib/auth/types';

interface AuthStatusProps {
  className?: string;
}

/**
 * Component that displays the current authentication status and user information
 */
export function AuthStatus({ className }: AuthStatusProps) {
  const { isSignedIn, isLoaded, roles, hasRole, isAdmin, isBuilder, isClient, signOut } = useAuth();
  const { user } = useUser();
  
  // Handle loading state
  if (!isLoaded) {
    return (
      <div className={`p-4 rounded-md bg-slate-100 ${className}`}>
        <p className="text-slate-600">Loading authentication status...</p>
      </div>
    );
  }
  
  // Handle unauthenticated state
  if (!isSignedIn) {
    return (
      <div className={`p-4 rounded-md bg-slate-100 ${className}`}>
        <h3 className="text-lg font-medium mb-2">Not Authenticated</h3>
        <p className="text-slate-600 mb-4">You are not currently signed in.</p>
        <div className="flex space-x-4">
          <Button variant="default" onClick={() => window.location.href = '/login'}>
            Sign In
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/sign-up'}>
            Create Account
          </Button>
        </div>
      </div>
    );
  }
  
  // Handle authenticated state
  return (
    <div className={`p-4 rounded-md bg-slate-100 ${className}`}>
      <h3 className="text-lg font-medium mb-2">Authentication Status</h3>
      
      <div className="mb-4">
        <p className="text-green-600 font-medium">✓ Authenticated</p>
        <p className="text-slate-600">User ID: {user?.id}</p>
        <p className="text-slate-600">Name: {user?.name}</p>
        <p className="text-slate-600">Email: {user?.email}</p>
      </div>
      
      <div className="mb-4">
        <h4 className="font-medium mb-1">Roles:</h4>
        <div className="flex flex-wrap gap-2">
          {roles.length > 0 ? (
            roles.map((role) => (
              <span 
                key={role} 
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  role === UserRole.ADMIN 
                    ? 'bg-purple-100 text-purple-800' 
                    : role === UserRole.BUILDER 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-green-100 text-green-800'
                }`}
              >
                {role}
              </span>
            ))
          ) : (
            <span className="text-slate-600">No roles assigned</span>
          )}
        </div>
      </div>
      
      <div className="mb-4">
        <h4 className="font-medium mb-1">Role Status:</h4>
        <ul className="space-y-1">
          <li className="flex items-center">
            <span className={`w-5 ${isAdmin ? 'text-green-600' : 'text-red-600'}`}>
              {isAdmin ? '✓' : '✗'}
            </span>
            <span>Admin Access</span>
          </li>
          <li className="flex items-center">
            <span className={`w-5 ${isBuilder ? 'text-green-600' : 'text-red-600'}`}>
              {isBuilder ? '✓' : '✗'}
            </span>
            <span>Builder Access</span>
          </li>
          <li className="flex items-center">
            <span className={`w-5 ${isClient ? 'text-green-600' : 'text-red-600'}`}>
              {isClient ? '✓' : '✗'}
            </span>
            <span>Client Access</span>
          </li>
          <li className="flex items-center">
            <span className={`w-5 ${hasRole(UserRole.ADMIN) ? 'text-green-600' : 'text-red-600'}`}>
              {hasRole(UserRole.ADMIN) ? '✓' : '✗'}
            </span>
            <span>Has Admin Role (using hasRole)</span>
          </li>
        </ul>
      </div>
      
      {user?.completedOnboarding !== undefined && (
        <div className="mb-4">
          <h4 className="font-medium mb-1">Profile Status:</h4>
          <p className="text-slate-600">
            Onboarding: {user.completedOnboarding ? 'Complete' : 'Incomplete'}
          </p>
          {user.verified !== undefined && (
            <p className="text-slate-600">
              Verification: {user.verified ? 'Verified' : 'Unverified'}
            </p>
          )}
        </div>
      )}
      
      <div className="mt-4">
        <Button 
          variant="outline" 
          onClick={() => signOut({ callbackUrl: '/' })}
        >
          Sign Out
        </Button>
      </div>
    </div>
  );
}

/**
 * Protected version of AuthStatus that requires authentication
 */
export function ProtectedAuthStatus(props: AuthStatusProps) {
  const { isSignedIn, isLoaded } = useAuth();
  
  if (!isLoaded) {
    return <div>Loading...</div>;
  }
  
  if (!isSignedIn) {
    return (
      <div className={`p-4 rounded-md bg-slate-100 ${props.className}`}>
        <p className="text-slate-600">
          You must be signed in to view this content.
        </p>
        <Button 
          className="mt-2" 
          onClick={() => window.location.href = '/login'}
        >
          Sign In
        </Button>
      </div>
    );
  }
  
  return <AuthStatus {...props} />;
}

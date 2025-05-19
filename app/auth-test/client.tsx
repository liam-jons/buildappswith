/**
 * Auth Test Client Component
 * Version: 1.0.0
 * 
 * Client component for testing Clerk Express SDK authentication flow.
 * This component:
 * - Displays client-side authentication state
 * - Provides UI for testing API endpoints with different auth requirements
 * - Demonstrates role-based rendering using Express SDK hooks
 */

"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/core/button';
import { 
  useAuth, 
  useIsAdmin, 
  useIsBuilder, 
  useHasRole,
  useSignOut 
} from '@/lib/auth/hooks';
import { UserRole } from '@/lib/auth/types';

/**
 * API response type for display
 */
interface ApiResponse {
  success: boolean;
  message: string;
  auth?: {
    required: boolean;
    type: string;
    userId?: string;
    roles?: string[];
  };
  error?: {
    type: string;
    detail: string;
  };
}

/**
 * Client component for testing authentication
 */
export default function AuthTestClient() {
  // Authentication state hooks
  const auth = useAuth();
  const isAdmin = useIsAdmin();
  const isBuilder = useIsBuilder();
  const isClient = useHasRole(UserRole.CLIENT);
  const signOut = useSignOut();
  
  // Local state for API testing
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Test a specific API endpoint
   */
  const testEndpoint = async (method: string, label: string) => {
    try {
      setLoading(label);
      setError(null);
      
      const res = await fetch('/api/auth-test', { 
        method,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await res.json();
      setApiResponse(data);
    } catch (err) {
      setError((err as Error).message);
      setApiResponse(null);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Client-side auth state */}
      <div>
        <h2 className="text-xl font-semibold mb-4 pb-2 border-b">Client Component Authentication</h2>
        
        <div className="bg-slate-100 p-4 rounded-md mb-6">
          <p className="mb-2">
            <span className="font-medium">Authentication Status:</span> 
            {auth.isSignedIn ? (
              <span className="text-green-600 ml-2">Signed In</span>
            ) : (
              <span className="text-amber-600 ml-2">Signed Out</span>
            )}
          </p>

          {auth.isSignedIn && auth.user && (
            <>
              <p className="mb-2">
                <span className="font-medium">User:</span> 
                <span className="ml-2">
                  {auth.user.name || auth.user.email || auth.user.id}
                </span>
                {auth.user.image && (
                  <img 
                    src={auth.user.image} 
                    alt="User avatar" 
                    className="w-6 h-6 rounded-full inline-block ml-2"
                  />
                )}
              </p>

              <div className="mb-2">
                <span className="font-medium">Roles:</span> 
                <div className="mt-1 flex flex-wrap gap-2">
                  {auth.roles.length > 0 ? (
                    auth.roles.map(role => (
                      <span 
                        key={role} 
                        className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium"
                      >
                        {role}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500 italic">No roles assigned</span>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <span className="font-medium">Role Checks:</span>
                <ul className="mt-1 space-y-1">
                  <li className="flex items-center">
                    <span className={isAdmin ? "text-green-600" : "text-red-600"}>
                      {isAdmin ? "✓" : "✗"}
                    </span>
                    <span className="ml-2">Is Admin</span>
                  </li>
                  <li className="flex items-center">
                    <span className={isBuilder ? "text-green-600" : "text-red-600"}>
                      {isBuilder ? "✓" : "✗"}
                    </span>
                    <span className="ml-2">Is Builder</span>
                  </li>
                  <li className="flex items-center">
                    <span className={isClient ? "text-green-600" : "text-red-600"}>
                      {isClient ? "✓" : "✗"}
                    </span>
                    <span className="ml-2">Is Client</span>
                  </li>
                </ul>
              </div>

              <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: '/' })}>
                Sign Out
              </Button>
            </>
          )}

          {!auth.isSignedIn && (
            <div className="mt-4">
              <Button onClick={() => window.location.href = '/login'}>
                Sign In
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* API endpoint testing */}
      <div>
        <h2 className="text-xl font-semibold mb-4 pb-2 border-b">API Authentication Testing</h2>
        
        <div className="bg-slate-100 p-4 rounded-md mb-6">
          <p className="mb-4">
            Test the API endpoints with different authentication requirements:
          </p>
          
          <div className="flex flex-wrap gap-3 mb-6">
            <Button 
              variant="outline" 
              onClick={() => testEndpoint('GET', 'public')}
              disabled={loading !== null}
            >
              {loading === 'public' ? 'Loading...' : 'Test Public Endpoint'}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => testEndpoint('POST', 'auth')}
              disabled={loading !== null}
            >
              {loading === 'auth' ? 'Loading...' : 'Test Auth-Required Endpoint'}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => testEndpoint('PUT', 'admin')}
              disabled={loading !== null}
            >
              {loading === 'admin' ? 'Loading...' : 'Test Admin-Only Endpoint'}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => testEndpoint('DELETE', 'builder')}
              disabled={loading !== null}
            >
              {loading === 'builder' ? 'Loading...' : 'Test Builder-Only Endpoint'}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => testEndpoint('PATCH', 'client')}
              disabled={loading !== null}
            >
              {loading === 'client' ? 'Loading...' : 'Test Client-Only Endpoint'}
            </Button>
          </div>
          
          {/* API Response Display */}
          {apiResponse && (
            <div className="mt-4">
              <h3 className="font-medium mb-2">API Response:</h3>
              <div className={`p-4 rounded ${apiResponse.success ? 'bg-green-50' : 'bg-red-50'}`}>
                <p className={`font-bold ${apiResponse.success ? 'text-green-700' : 'text-red-700'}`}>
                  {apiResponse.success ? 'SUCCESS' : 'ERROR'}
                </p>
                <p className="mt-1 mb-2">{apiResponse.message}</p>
                
                {apiResponse.auth && (
                  <div className="mt-2 text-sm">
                    <p><span className="font-medium">Auth Required:</span> {apiResponse.auth.required ? 'Yes' : 'No'}</p>
                    <p><span className="font-medium">Auth Type:</span> {apiResponse.auth.type}</p>
                    {apiResponse.auth.userId && <p><span className="font-medium">User ID:</span> {apiResponse.auth.userId}</p>}
                    {apiResponse.auth.roles && (
                      <div>
                        <span className="font-medium">Roles:</span> {apiResponse.auth.roles.join(', ')}
                      </div>
                    )}
                  </div>
                )}
                
                {apiResponse.error && (
                  <div className="mt-2 text-sm text-red-700">
                    <p><span className="font-medium">Error Type:</span> {apiResponse.error.type}</p>
                    <p><span className="font-medium">Detail:</span> {apiResponse.error.detail}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 rounded">
              <p className="text-red-700 font-bold">Error</p>
              <p className="text-red-600">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
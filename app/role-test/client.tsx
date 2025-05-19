/**
 * Role Test Client Component
 * Version: 1.0.0
 * 
 * Client component for testing role-based authorization with Clerk Express SDK.
 * This component:
 * - Displays role information for the current user
 * - Provides UI for testing protected API endpoints with different role requirements
 * - Demonstrates role-based component rendering
 */

"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/core/button';
import { 
  useAuth, 
  useIsAdmin, 
  useIsBuilder, 
  useHasRole 
} from '@/lib/auth/hooks';
import { UserRole } from '@/lib/auth/types';

/**
 * Interface for API endpoint information
 */
interface Endpoint {
  method: string;
  description: string;
  roleRequirement: string;
  buttonColor: string;
}

/**
 * API response type for display
 */
interface ApiResponse {
  success: boolean;
  message: string;
  auth?: {
    userId: string;
    roles?: string[];
    requirements: string;
    timestamp: string;
  };
  error?: {
    type: string;
    detail: string;
  };
}

/**
 * Client component for testing role-based authentication
 */
export default function RoleTestClient() {
  // Authentication state hooks
  const { isSignedIn, isLoaded, roles, user } = useAuth();
  const isAdmin = useIsAdmin();
  const isBuilder = useIsBuilder();
  const isClient = useHasRole(UserRole.CLIENT);
  
  // Local state for API testing
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // API endpoint definitions for testing
  const endpoints: Endpoint[] = [
    {
      method: 'GET',
      description: 'Basic Authentication',
      roleRequirement: 'Any authenticated user',
      buttonColor: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      method: 'POST',
      description: 'Admin Only',
      roleRequirement: 'Admin role required',
      buttonColor: 'bg-purple-600 hover:bg-purple-700',
    },
    {
      method: 'PUT',
      description: 'Builder Only',
      roleRequirement: 'Builder role required',
      buttonColor: 'bg-green-600 hover:bg-green-700',
    },
    {
      method: 'PATCH',
      description: 'Admin OR Builder',
      roleRequirement: 'Admin OR Builder role required',
      buttonColor: 'bg-yellow-600 hover:bg-yellow-700',
    },
    {
      method: 'DELETE',
      description: 'Admin AND Client',
      roleRequirement: 'Admin AND Client roles required',
      buttonColor: 'bg-red-600 hover:bg-red-700',
    }
  ];

  /**
   * Test a protected API endpoint
   */
  const testEndpoint = async (method: string) => {
    try {
      setLoading(method);
      setError(null);
      
      const res = await fetch('/api/protected', { 
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

  // If not authenticated, show sign-in prompt
  if (isLoaded && !isSignedIn) {
    return (
      <div className="bg-slate-100 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Client Component Role Testing</h2>
        <p className="mb-4">
          You need to be signed in to test role-based API endpoints.
        </p>
        <Button asChild>
          <a href="/login">Sign In</a>
        </Button>
      </div>
    );
  }

  // If still loading, show loading state
  if (!isLoaded) {
    return (
      <div className="bg-slate-100 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Client Component Role Testing</h2>
        <p>Loading authentication state...</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-100 p-6 rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Client Component Role Testing</h2>
      
      {/* User role information */}
      <div className="mb-6">
        <h3 className="font-medium text-lg mb-2">Your Role Information</h3>
        <p className="mb-2">User: {user?.name || user?.email || user?.id}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className={`p-3 rounded ${isAdmin ? 'bg-purple-100' : 'bg-gray-200'}`}>
            <p className="font-medium">Admin Role</p>
            <p>{isAdmin ? '✓ Enabled' : '✗ Disabled'}</p>
          </div>
          
          <div className={`p-3 rounded ${isBuilder ? 'bg-blue-100' : 'bg-gray-200'}`}>
            <p className="font-medium">Builder Role</p>
            <p>{isBuilder ? '✓ Enabled' : '✗ Disabled'}</p>
          </div>
          
          <div className={`p-3 rounded ${isClient ? 'bg-green-100' : 'bg-gray-200'}`}>
            <p className="font-medium">Client Role</p>
            <p>{isClient ? '✓ Enabled' : '✗ Disabled'}</p>
          </div>
        </div>
      </div>
      
      {/* API endpoint testing */}
      <div className="mb-6">
        <h3 className="font-medium text-lg mb-2">Protected API Testing</h3>
        <p className="mb-4">
          Test API endpoints with different role requirements to verify role-based
          access control functionality:
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {endpoints.map((endpoint) => (
            <button
              key={endpoint.method}
              onClick={() => testEndpoint(endpoint.method)}
              disabled={loading !== null}
              className={`p-4 rounded-md text-white ${endpoint.buttonColor} ${loading === endpoint.method ? 'opacity-50' : ''}`}
            >
              <div className="font-bold">{endpoint.method}</div>
              <div>{endpoint.description}</div>
              <div className="text-xs mt-1 opacity-90">{endpoint.roleRequirement}</div>
              {loading === endpoint.method && (
                <div className="mt-2 text-sm">Testing...</div>
              )}
            </button>
          ))}
        </div>
        
        {/* API Response Display */}
        {apiResponse && (
          <div className="mt-6">
            <h3 className="font-medium text-lg mb-2">API Response</h3>
            <div className={`p-4 rounded border ${apiResponse.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <p className={`font-semibold ${apiResponse.success ? 'text-green-700' : 'text-red-700'}`}>
                {apiResponse.success ? '✓ SUCCESS' : '✗ ERROR'}
              </p>
              <p className="my-2">{apiResponse.message}</p>
              
              {apiResponse.auth && (
                <div className="bg-white p-3 rounded mt-3 text-sm">
                  <p><span className="font-medium">User ID:</span> {apiResponse.auth.userId}</p>
                  
                  {apiResponse.auth.roles && (
                    <p className="mt-1">
                      <span className="font-medium">Roles:</span> {apiResponse.auth.roles.join(', ')}
                    </p>
                  )}
                  
                  <p className="mt-1"><span className="font-medium">Requirements:</span> {apiResponse.auth.requirements}</p>
                  <p className="mt-1"><span className="font-medium">Timestamp:</span> {new Date(apiResponse.auth.timestamp).toLocaleString()}</p>
                </div>
              )}
              
              {apiResponse.error && (
                <div className="bg-red-50 p-3 rounded mt-3 text-sm text-red-700">
                  <p><span className="font-medium">Error Type:</span> {apiResponse.error.type}</p>
                  <p><span className="font-medium">Detail:</span> {apiResponse.error.detail}</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {error && (
          <div className="p-4 mt-6 bg-red-50 border border-red-200 rounded">
            <p className="text-red-700 font-bold">Error</p>
            <p className="text-red-600">{error}</p>
          </div>
        )}
      </div>
      
      {/* Role-based content display */}
      <div>
        <h3 className="font-medium text-lg mb-2">Role-Based Content</h3>
        <p className="mb-4">
          Different content is displayed based on your assigned roles:
        </p>
        
        <div className="space-y-4">
          {/* Admin-only content */}
          {isAdmin && (
            <div className="p-4 bg-purple-100 rounded border border-purple-200">
              <h4 className="font-semibold text-purple-900">Admin-Only Content</h4>
              <p className="text-purple-800">
                This content is only visible to users with the Admin role.
              </p>
            </div>
          )}
          
          {/* Builder-only content */}
          {isBuilder && (
            <div className="p-4 bg-blue-100 rounded border border-blue-200">
              <h4 className="font-semibold text-blue-900">Builder-Only Content</h4>
              <p className="text-blue-800">
                This content is only visible to users with the Builder role.
              </p>
            </div>
          )}
          
          {/* Client-only content */}
          {isClient && (
            <div className="p-4 bg-green-100 rounded border border-green-200">
              <h4 className="font-semibold text-green-900">Client-Only Content</h4>
              <p className="text-green-800">
                This content is only visible to users with the Client role.
              </p>
            </div>
          )}
          
          {/* Admin OR Builder content */}
          {(isAdmin || isBuilder) && (
            <div className="p-4 bg-yellow-100 rounded border border-yellow-200">
              <h4 className="font-semibold text-yellow-900">Admin OR Builder Content</h4>
              <p className="text-yellow-800">
                This content is visible to users with either Admin OR Builder roles.
              </p>
            </div>
          )}
          
          {/* Admin AND Client content */}
          {(isAdmin && isClient) && (
            <div className="p-4 bg-red-100 rounded border border-red-200">
              <h4 className="font-semibold text-red-900">Admin AND Client Content</h4>
              <p className="text-red-800">
                This content is only visible to users with both Admin AND Client roles.
              </p>
            </div>
          )}
          
          {/* Fallback if no roles match */}
          {!isAdmin && !isBuilder && !isClient && (
            <div className="p-4 bg-gray-100 rounded border border-gray-200">
              <h4 className="font-semibold text-gray-900">No Role-Specific Content</h4>
              <p className="text-gray-800">
                You don't have any specific roles that display conditional content.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
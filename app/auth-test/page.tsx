/**
 * Auth Test Page
 * Version: 1.0.0
 * 
 * This page demonstrates the Clerk Express SDK authentication flow.
 * It includes:
 * - Server-side authentication state
 * - Client-side authentication testing
 * - Role-based UI rendering
 * - API endpoint testing with different protection levels
 */

import { getServerAuth } from '@/lib/auth/express/server-auth';
import { Suspense } from 'react';
import { Metadata } from 'next';
import AuthTestClient from './client';

// Metadata for the page
export const metadata: Metadata = {
  title: 'Authentication Test | BuildAppsWith',
  description: 'Test and verify authentication with Clerk Express SDK',
};

/**
 * Authentication test page with server and client components
 */
export default async function AuthTestPage() {
  // Get authentication state from server
  const auth = getServerAuth();

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Authentication Test Page</h1>
      <p className="text-gray-600 mb-8">
        This page demonstrates the Clerk Express SDK authentication flow.
        It shows both server-side and client-side authentication state
        and provides tools to test authenticated API endpoints.
      </p>

      {/* Server component authentication state */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 pb-2 border-b">Server Component Authentication</h2>
        <div className="bg-slate-100 p-4 rounded-md">
          <p className="mb-2">
            <span className="font-medium">Authentication Status:</span> 
            {auth.isAuthenticated ? (
              <span className="text-green-600 ml-2">Authenticated</span>
            ) : (
              <span className="text-amber-600 ml-2">Not Authenticated</span>
            )}
          </p>

          {auth.isAuthenticated && (
            <>
              <p className="mb-2">
                <span className="font-medium">User ID:</span> 
                <span className="ml-2 font-mono text-sm bg-slate-200 px-2 py-0.5 rounded">
                  {auth.userId}
                </span>
              </p>

              <p className="mb-2">
                <span className="font-medium">Session ID:</span> 
                <span className="ml-2 font-mono text-sm bg-slate-200 px-2 py-0.5 rounded">
                  {auth.sessionId || 'N/A'}
                </span>
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
            </>
          )}
        </div>
      </div>

      {/* Client component with API testing capabilities */}
      <Suspense fallback={<div className="p-4 bg-slate-100 rounded-md">Loading authentication client...</div>}>
        <AuthTestClient />
      </Suspense>
    </div>
  );
}
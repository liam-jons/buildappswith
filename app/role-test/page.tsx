/**
 * Role-Based Authentication Test Page
 * Version: 1.0.0
 * 
 * This page demonstrates role-based access control using the Clerk Express SDK.
 * It includes:
 * - Role-based component rendering
 * - Protected API route testing
 * - Role requirement visualization
 */

import { getServerAuth } from '@/lib/auth/express/server-auth';
import { Suspense } from 'react';
import { Metadata } from 'next';
import RoleTestClient from './client';

// Metadata for the page
export const metadata: Metadata = {
  title: 'Role-Based Auth Test | BuildAppsWith',
  description: 'Test and verify role-based access control with Clerk Express SDK',
};

/**
 * Role-based authentication test page
 */
export default async function RoleTestPage() {
  // Get authentication state from server
  const auth = getServerAuth();

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Role-Based Authentication Test</h1>
      <p className="text-gray-600 mb-8">
        This page demonstrates role-based access control using the Clerk Express SDK.
        Different components and API endpoints are protected based on user roles.
      </p>

      {/* Server component role-based rendering */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 pb-2 border-b">Server Component Role Check</h2>
        
        {auth.isAuthenticated ? (
          <div className="bg-slate-100 p-4 rounded-md">
            <p className="mb-4 text-green-600 font-medium">✓ Authenticated as {auth.userId}</p>
            
            <div className="mb-4">
              <h3 className="font-medium mb-2">Your Roles:</h3>
              {auth.roles.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {auth.roles.map(role => (
                    <span 
                      key={role}
                      className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-amber-600">No roles assigned</p>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Admin-only server component */}
              <div className={`p-4 rounded-md ${auth.hasRole('admin') ? 'bg-purple-100' : 'bg-gray-100'}`}>
                <h3 className="font-medium mb-2">Admin Access</h3>
                {auth.hasRole('admin') ? (
                  <p className="text-green-600">✓ You have admin access</p>
                ) : (
                  <p className="text-red-600">✗ Admin role required</p>
                )}
              </div>
              
              {/* Builder-only server component */}
              <div className={`p-4 rounded-md ${auth.hasRole('builder') ? 'bg-blue-100' : 'bg-gray-100'}`}>
                <h3 className="font-medium mb-2">Builder Access</h3>
                {auth.hasRole('builder') ? (
                  <p className="text-green-600">✓ You have builder access</p>
                ) : (
                  <p className="text-red-600">✗ Builder role required</p>
                )}
              </div>
              
              {/* Client-only server component */}
              <div className={`p-4 rounded-md ${auth.hasRole('client') ? 'bg-green-100' : 'bg-gray-100'}`}>
                <h3 className="font-medium mb-2">Client Access</h3>
                {auth.hasRole('client') ? (
                  <p className="text-green-600">✓ You have client access</p>
                ) : (
                  <p className="text-red-600">✗ Client role required</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-amber-50 p-4 rounded-md border border-amber-200">
            <p className="text-amber-700">You are not signed in. Sign in to test role-based access control.</p>
            <a 
              href="/login" 
              className="mt-2 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Sign In
            </a>
          </div>
        )}
      </div>

      {/* Client component with API testing capabilities */}
      <Suspense fallback={<div className="p-4 bg-slate-100 rounded-md">Loading role testing client...</div>}>
        <RoleTestClient />
      </Suspense>
    </div>
  );
}
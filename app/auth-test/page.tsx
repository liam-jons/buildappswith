"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { LoginButton } from '@/components/auth/login-button';
import { UserProfile } from '@/components/auth/user-profile';
import { Button } from '@/components/ui/button';

export default function AuthTestPage() {
  const { data: session, status } = useSession();

  return (
    <div className="container py-8 space-y-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">NextAuth.js Integration Test Page</h1>
        
        <div className="p-6 border rounded-lg bg-card">
          <h2 className="text-2xl font-semibold mb-4">Authentication Status</h2>
          
          {status === "loading" && (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full bg-muted animate-pulse"></div>
              <p>Loading authentication status...</p>
            </div>
          )}
          
          {status === "unauthenticated" && (
            <div>
              <p className="mb-4">You are not logged in.</p>
            </div>
          )}
          
          {status === "authenticated" && session?.user && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <UserProfile />
                <div>
                  <p className="font-medium">Logged in as {session.user.name}</p>
                  <p className="text-sm text-muted-foreground">{session.user.email}</p>
                  {session.user.roles && (
                    <p className="text-sm text-muted-foreground capitalize">Roles: {session.user.roles.join(', ')}</p>
                  )}
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <h3 className="font-medium mb-2">Session Object (Debug)</h3>
                <pre className="p-4 bg-muted rounded-md overflow-auto text-xs">
                  {JSON.stringify(session, null, 2)}
                </pre>
              </div>
            </div>
          )}
          
          <div className="mt-6">
            <h3 className="font-medium mb-2">Authentication Actions</h3>
            <div className="flex flex-wrap gap-4">
              {status === "unauthenticated" ? (
                <>
                  <Button onClick={() => signIn()}>Sign in with Default</Button>
                  <Button onClick={() => signIn("credentials")}>Sign in with Credentials</Button>
                  <Button onClick={() => signIn("github")}>Sign in with GitHub</Button>
                  <Button onClick={() => signIn("google")}>Sign in with Google</Button>
                  <Button variant="outline" onClick={() => window.location.href = "/login"}>
                    Go to Login Page
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="destructive" onClick={() => signOut()}>Sign Out</Button>
                </>
              )}
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t">
            <h3 className="font-medium mb-2">Demo Credentials</h3>
            <div className="space-y-2">
              <p className="text-sm">Try these credentials for testing:</p>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li><strong>Client:</strong> client@example.com / password123</li>
                <li><strong>Learner:</strong> learner@example.com / password123</li>
                <li><strong>Builder:</strong> builder@example.com / password123</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useAuth } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/auth/clerk/helpers";
import * as Sentry from "@sentry/nextjs";

export default function AuthTestPage() {
  const { isLoaded, userId, sessionId } = useAuth();
  const [dbUser, setDbUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (isLoaded && userId) {
      // Test database integration
      const fetchUser = async () => {
        try {
          const user = await getCurrentUser();
          setDbUser(user);
        } catch (err) {
          console.error("Error fetching user:", err);
          setError(err instanceof Error ? err.message : "Unknown error");
          
          // Report to Sentry
          Sentry.captureException(err);
        } finally {
          setLoading(false);
        }
      };
      
      fetchUser();
    } else if (isLoaded) {
      setLoading(false);
    }
  }, [isLoaded, userId]);
  
  if (!isLoaded) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Auth Test Page</h1>
        <div className="animate-pulse">Loading auth state...</div>
      </div>
    );
  }
  
  if (!userId) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Auth Test Page</h1>
        <p className="text-red-500">Not authenticated. Please sign in.</p>
        <a 
          href="/login" 
          className="inline-block mt-4 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
        >
          Go to Login
        </a>
      </div>
    );
  }
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Auth Test Page</h1>
        <UserButton />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-card p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Clerk Auth State</h2>
          <ul className="space-y-2">
            <li>
              <span className="font-medium">Auth Status:</span> Authenticated
            </li>
            <li>
              <span className="font-medium">User ID:</span> {userId}
            </li>
            <li>
              <span className="font-medium">Session ID:</span> {sessionId}
            </li>
          </ul>
        </div>
        
        <div className="bg-card p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Database User</h2>
          {loading ? (
            <div className="animate-pulse">Loading database user...</div>
          ) : error ? (
            <div className="text-red-500">Error: {error}</div>
          ) : dbUser ? (
            <ul className="space-y-2">
              <li>
                <span className="font-medium">DB ID:</span> {dbUser.id}
              </li>
              <li>
                <span className="font-medium">Clerk ID:</span> {dbUser.clerkId}
              </li>
              <li>
                <span className="font-medium">Name:</span> {dbUser.name}
              </li>
              <li>
                <span className="font-medium">Email:</span> {dbUser.email}
              </li>
              <li>
                <span className="font-medium">Roles:</span>{" "}
                {dbUser.roles.join(", ")}
              </li>
              <li>
                <span className="font-medium">Verified:</span>{" "}
                {dbUser.verified ? "Yes" : "No"}
              </li>
            </ul>
          ) : (
            <p>No database user found</p>
          )}
        </div>
      </div>
    </div>
  );
}

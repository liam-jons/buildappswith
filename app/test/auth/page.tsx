"use client";

import { useEffect, useState } from "react";
import { useAuth, useUser, useClerk } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { UserRole } from "@/lib/auth/types";

/**
 * Test page for Clerk authentication
 * Tests various auth states and displays user information
 * Version: 1.0.108
 */
export default function TestAuthPage() {
  const { isLoaded, userId, sessionId } = useAuth();
  const { user } = useUser();
  const { signOut } = useClerk();
  const [backendUser, setBackendUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Function to fetch authenticated user data from the backend
  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/test/auth", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      setBackendUser(data.user);
      setError(null);
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch user data");
      setBackendUser(null);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch user data when auth is loaded
  useEffect(() => {
    if (isLoaded) {
      fetchUserData();
    }
  }, [isLoaded, userId]);
  
  // Function to display role badges
  const renderRoles = (roles: string[]) => {
    return roles.map((role) => (
      <Badge key={role} variant={
        role === UserRole.ADMIN ? "destructive" :
        role === UserRole.BUILDER ? "default" :
        "secondary"
      }>
        {role}
      </Badge>
    ));
  };
  
  // Loading state
  if (!isLoaded || loading) {
    return (
      <div className="container max-w-3xl mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Test</CardTitle>
            <CardDescription>Loading authentication state...</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Get roles from user metadata
  const clerkRoles = user?.publicMetadata?.roles as string[] || [];
  
  return (
    <div className="container max-w-3xl mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Authentication Test</CardTitle>
          <CardDescription>Testing Clerk authentication integration</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Authentication Status */}
          <div>
            <h3 className="text-lg font-medium">Authentication Status</h3>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="font-medium">User ID (Clerk):</div>
              <div>{userId || "Not authenticated"}</div>
              
              <div className="font-medium">Session ID:</div>
              <div>{sessionId || "No active session"}</div>
              
              <div className="font-medium">Status:</div>
              <div>
                <Badge variant={userId ? "default" : "destructive"}>
                  {userId ? "Authenticated" : "Not Authenticated"}
                </Badge>
              </div>
              
              {user && (
                <>
                  <div className="font-medium">Email:</div>
                  <div>{user.primaryEmailAddress?.emailAddress || "N/A"}</div>
                  
                  <div className="font-medium">Name:</div>
                  <div>{user.fullName || user.username || "N/A"}</div>
                  
                  <div className="font-medium">Roles (Clerk):</div>
                  <div className="flex gap-2">{renderRoles(clerkRoles)}</div>
                </>
              )}
            </div>
          </div>
          
          <Separator />
          
          {/* User Data from Backend */}
          <div>
            <h3 className="text-lg font-medium">User Data (from backend)</h3>
            {error ? (
              <Alert variant="destructive" className="mt-2">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : backendUser ? (
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="font-medium">Database ID:</div>
                <div>{backendUser.id}</div>
                
                <div className="font-medium">Name:</div>
                <div>{backendUser.name || "N/A"}</div>
                
                <div className="font-medium">Email:</div>
                <div>{backendUser.email}</div>
                
                <div className="font-medium">Roles:</div>
                <div className="flex gap-2">{renderRoles(backendUser.roles)}</div>
                
                <div className="font-medium">Verified:</div>
                <div>
                  <Badge variant={backendUser.verified ? "default" : "outline"}>
                    {backendUser.verified ? "Verified" : "Not Verified"}
                  </Badge>
                </div>
                
                <div className="font-medium">Stripe Customer:</div>
                <div>{backendUser.stripeCustomerId || "None"}</div>
              </div>
            ) : (
              <div className="py-2">No user data available</div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={fetchUserData}
            disabled={!isLoaded || !userId}
          >
            Refresh User Data
          </Button>
          
          {userId ? (
            <Button 
              variant="destructive" 
              onClick={() => signOut()}
            >
              Sign Out
            </Button>
          ) : (
            <Button 
              variant="default" 
              onClick={() => window.location.href = "/login"}
            >
              Sign In
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

import { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";

// Import authentication utilities
import { getUserRoles, getCurrentUserId } from "@/lib/auth/actions";

// Import domain-specific components
import { DashboardSkeleton } from "@/components/ui";
import { Button } from "@/components/ui/core/button";
import { AdminDashboard } from "@/components/admin";
import { BuilderDashboard } from "@/components/marketplace";
import { ClientDashboard } from "@/components/profile";

// Metadata export for Next.js
export const metadata: Metadata = {
  title: "Dashboard | Buildappswith",
  description: "Manage your Buildappswith experience with our unified dashboard.",
};

/**
 * RoleDashboard component - renders the appropriate dashboard based on user roles
 * Supports users with multiple roles through a role switcher.
 */
async function RoleDashboard() {
  try {
    // Get user roles and user ID from server actions with enhanced logging
    const { roles, primaryRole } = await getUserRoles();
    const userId = await getCurrentUserId();

    // Add detailed debug information in development
    const debugInfo = process.env.NODE_ENV === 'development' ? (
      <div className="mt-4 p-4 border rounded-md bg-yellow-50 dark:bg-yellow-950/30 text-xs">
        <p className="font-mono">Debug info: {JSON.stringify({ roles, primaryRole }, null, 2)}</p>
      </div>
    ) : null;

    // Render appropriate dashboard based on primary role
    switch (primaryRole) {
      case "ADMIN":
        return (
          <>
            <AdminDashboard roles={roles} />
            {debugInfo}
          </>
        );
      case "BUILDER":
        return (
          <>
            <BuilderDashboard roles={roles} />
            {debugInfo}
          </>
        );
      case "CLIENT":
        return (
          <>
            <ClientDashboard userId={userId || ''} />
            {debugInfo}
          </>
        );
      default:
        // If no role or unknown role, show default dashboard with clear explanations
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Welcome to Buildappswith</h2>
            <p>Complete your profile to get started with our platform.</p>
            <div className="flex flex-col gap-3 mt-6">
              <h3 className="text-lg font-medium">Getting Started:</h3>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Complete your profile information</li>
                <li>Select your primary role (Builder or Client)</li>
                <li>Connect your calendar for scheduling (optional)</li>
              </ol>
              <Button
                variant="default"
                asChild
                className="mt-2 w-fit"
              >
                <Link href="/profile">Complete Your Profile</Link>
              </Button>
            </div>
            {debugInfo}
          </div>
        );
    }
  } catch (error) {
    console.error("Error rendering dashboard:", error);
    return (
      <div className="space-y-4 p-4 border border-red-200 rounded-md bg-red-50 dark:bg-red-950/30">
        <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">Dashboard Error</h2>
        <p>We encountered an issue loading your dashboard. Please try again later.</p>
        {process.env.NODE_ENV === 'development' && (
          <pre className="p-3 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-auto max-h-40">
            {error instanceof Error ? error.message : String(error)}
          </pre>
        )}
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          className="mt-2"
        >
          Retry
        </Button>
      </div>
    );
  }
}

/**
 * Dashboard Page
 * 
 * Unified dashboard with role-based content. Supports users with multiple roles
 * and provides appropriate functionality based on their permissions.
 */
export default function DashboardPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      <Suspense fallback={<DashboardSkeleton />}>
        <RoleDashboard />
      </Suspense>
    </div>
  );
}

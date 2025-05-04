import { Metadata } from "next";
import { Suspense } from "react";

// Import authentication utilities
import { getUserRoles } from "@/lib/auth/actions";

// Import domain-specific components
import { DashboardSkeleton } from "@/components/ui";
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
  // Get user roles from server action
  const { roles, primaryRole } = await getUserRoles();
  
  // Render appropriate dashboard based on primary role
  switch (primaryRole) {
    case "ADMIN":
      return <AdminDashboard roles={roles} />;
    case "BUILDER":
      return <BuilderDashboard roles={roles} />;
    case "CLIENT":
      return <ClientDashboard roles={roles} />;
    default:
      // If no role or unknown role, show default dashboard
      return (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Welcome to Buildappswith</h2>
          <p>Complete your profile to get started with our platform.</p>
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

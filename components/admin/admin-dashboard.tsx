/**
 * Admin Dashboard Component
 * 
 * Dashboard for platform administrators with access to platform statistics,
 * user management, content moderation, and system configuration.
 */

"use client";

import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/core";
import { AdminNav } from "./admin-nav";
import { AdminCard } from "./ui/admin-card";
import { UserRole } from "@/lib/types/enums";

interface AdminDashboardProps {
  roles: UserRole[];
}

export function AdminDashboard({ roles }: AdminDashboardProps) {
  const router = useRouter();
  
  // Placeholder statistics - would be fetched from API in real implementation
  const stats = {
    totalUsers: 1245,
    activeBuilders: 87,
    pendingVerifications: 14,
    averageRating: 4.7,
    lastWeekBookings: 34,
    revenueLastMonth: "$12,450"
  };

  // Admin actions/tasks
  const adminActions = [
    {
      title: "User Management",
      description: "Manage users, roles, and permissions",
      icon: "👥",
      actionLabel: "Manage Users",
      onAction: () => router.push("/admin/users")
    },
    {
      title: "Builder Verification",
      description: "Review and approve builder verification requests",
      icon: "✅",
      actionLabel: "Review Verifications",
      onAction: () => router.push("/admin/verification")
    },
    {
      title: "Content Moderation",
      description: "Moderate platform content and listings",
      icon: "📝",
      actionLabel: "Moderate Content",
      onAction: () => router.push("/admin/moderation")
    },
    {
      title: "System Configuration",
      description: "Configure platform settings and features",
      icon: "⚙️",
      actionLabel: "Open Settings",
      onAction: () => router.push("/admin/settings")
    },
    {
      title: "Analytics & Reporting",
      description: "View detailed platform analytics and generate reports",
      icon: "📊",
      actionLabel: "View Analytics",
      onAction: () => router.push("/admin/analytics")
    },
    {
      title: "Support Cases",
      description: "Manage user support requests and cases",
      icon: "🛟",
      actionLabel: "View Cases",
      onAction: () => router.push("/admin/support")
    }
  ];

  return (
    <div className="space-y-8">
      <AdminNav />
      
      <section>
        <h2 className="text-2xl font-semibold mb-4">Platform Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Total Users</div>
            <div className="text-3xl font-bold">{stats.totalUsers}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Active Builders</div>
            <div className="text-3xl font-bold">{stats.activeBuilders}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Pending Verifications</div>
            <div className="text-3xl font-bold">{stats.pendingVerifications}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Average Rating</div>
            <div className="text-3xl font-bold">{stats.averageRating}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Bookings (Last Week)</div>
            <div className="text-3xl font-bold">{stats.lastWeekBookings}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Revenue (Last Month)</div>
            <div className="text-3xl font-bold">{stats.revenueLastMonth}</div>
          </Card>
        </div>
      </section>
      
      <section>
        <h2 className="text-2xl font-semibold mb-4">Admin Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {adminActions.map((action, index) => (
            <AdminCard
              key={index}
              title={action.title}
              description={action.description}
              icon={action.icon}
              actionLabel={action.actionLabel}
              onAction={action.onAction}
            />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Recent Activity</h2>
        <Card className="p-6">
          <p className="text-muted-foreground">
            This section will display recent system activity, user sign-ups, and administrative events.
          </p>
          <div className="mt-4 text-center text-sm">
            Activity log functionality coming soon
          </div>
        </Card>
      </section>
    </div>
  );
}
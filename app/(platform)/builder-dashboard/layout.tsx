import { Metadata } from "next";
import ProtectedRoute from "@/components/auth/protected-route";
import { UserRole } from "@/lib/auth/types";

export const metadata: Metadata = {
  title: "Builder Dashboard",
  description: "Manage your builder profile, availability, and client bookings",
};

export default function BuilderDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requiredRoles={[UserRole.BUILDER, UserRole.ADMIN]}>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Builder Dashboard</h1>
        {children}
      </div>
    </ProtectedRoute>
  );
}

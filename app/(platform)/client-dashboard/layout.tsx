import { Metadata } from "next";
import ProtectedRoute from "@/components/auth/protected-route";
import { UserRole } from "@/lib/auth/types";

export const metadata: Metadata = {
  title: "Client Dashboard",
  description: "Manage your projects and builder bookings",
};

export default function ClientDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requiredRoles={[UserRole.CLIENT, UserRole.ADMIN]}>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Client Dashboard</h1>
        {children}
      </div>
    </ProtectedRoute>
  );
}

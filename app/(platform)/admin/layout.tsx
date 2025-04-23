import { Metadata } from "next";
import ProtectedRoute from "@/components/auth/protected-route";
import { AdminNav } from "@/components/admin/admin-nav";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Administrative controls for the Buildappswith platform",
};

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requiredRoles={['ADMIN']}>
      <div className="container mx-auto py-6">
        <div className="mb-8 flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <AdminNav />
        </div>
        {children}
      </div>
    </ProtectedRoute>
  );
}

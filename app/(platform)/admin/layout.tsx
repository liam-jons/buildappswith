import { Metadata } from "next";
import ProtectedRoute from "@/components/auth/protected-route";

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
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        {children}
      </div>
    </ProtectedRoute>
  );
}

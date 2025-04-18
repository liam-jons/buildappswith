import { Metadata } from "next";
import ProtectedRoute from "@/components/auth/protected-route";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Buildappswith platform dashboard",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="container mx-auto py-6">
        {children}
      </div>
    </ProtectedRoute>
  );
}

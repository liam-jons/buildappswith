"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/hooks";
import { UserRole } from "@/lib/auth/types";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== UserRole.ADMIN)) {
      router.push("/login?callbackUrl=/admin");
    }
  }, [isLoading, isAuthenticated, user, router]);

  // Show loading or unauthorized message
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Loading...</h2>
          <p className="text-muted-foreground">Please wait while we check your credentials</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== UserRole.ADMIN) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Unauthorized</h2>
          <p className="text-muted-foreground">You don't have permission to access this page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="container py-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your platform settings and builder profile</p>
        </div>
        {children}
      </div>
    </div>
  );
}

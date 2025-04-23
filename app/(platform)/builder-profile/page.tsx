"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// This page redirects to Liam Jons's profile page as the default
export default function BuilderProfilePage() {
  const router = useRouter();
  
  useEffect(() => {
    router.push("/builder-profile/liam-jons");
  }, [router]);
  
  return (
    <div className="container py-12 flex justify-center items-center">
      <div className="animate-pulse">Redirecting to founder profile...</div>
    </div>
  );
}

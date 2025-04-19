import { Suspense } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import BuilderProfileClient from "./client";

// Server component that receives the params as a Promise
export default async function BuilderProfilePage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  // Await the params to get the id
  const { id } = await params;
  
  return (
    <Suspense fallback={<LoadingSpinner message="Loading builder profile..." />}>
      <BuilderProfileClient builderId={id} />
    </Suspense>
  );
}
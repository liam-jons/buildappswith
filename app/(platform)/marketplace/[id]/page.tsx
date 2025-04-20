import { BuilderProfileClient } from "./BuilderProfileClient";

// This is a server component by default
export default async function BuilderProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <BuilderProfileClient builderId={resolvedParams.id} />;
}

import { Metadata } from "next";
import { notFound } from "next/navigation";

// Dynamic metadata generation
export async function generateMetadata({ 
  params 
}: { 
  params: { builderId: string } 
}): Promise<Metadata> {
  // Get builder data for metadata
  const builderData = await getBuilderData(params.builderId);
  
  if (!builderData) {
    return {
      title: "Builder Not Found | Buildappswith",
      description: "The requested builder could not be found",
    };
  }
  
  return {
    title: `${builderData.name} Verification | Buildappswith`,
    description: `Outcome verification and concrete results for ${builderData.name}`,
  };
}

// Import server-side data fetching
import { getBuilderData, getVerificationData } from "@/lib/trust/actions";

// Import components - using barrel exports
import { VerificationDetail } from "@/components/trust";

export default async function BuilderVerificationPage({ 
  params 
}: { 
  params: { builderId: string } 
}) {
  // Server-side data fetching
  const builderData = await getBuilderData(params.builderId);
  
  // Handle not found case
  if (!builderData) {
    notFound();
  }
  
  // Get verification data
  const verificationData = await getVerificationData(params.builderId);
  
  // Render the page using imported components
  return (
    <VerificationDetail 
      builder={builderData} 
      verification={verificationData} 
    />
  );
}

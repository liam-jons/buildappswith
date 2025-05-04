import { Metadata } from "next";

// Metadata export for Next.js
export const metadata: Metadata = {
  title: "Trust Architecture | Buildappswith",
  description: "Transparent Trust Architecture showing concrete outcomes and builder verification",
};

// Import server-side data fetching
import { getTrustOverview } from "@/lib/trust/actions";

// Import components - using barrel exports
import { TrustOverview } from "@/components/trust";

export default async function TrustPage() {
  // Server-side data fetching
  const trustData = await getTrustOverview();
  
  // Error handling
  if (!trustData) {
    // Handle the error case
    return <div>Error: Could not load trust architecture data</div>;
  }
  
  // Render the page using imported components
  return <TrustOverview data={trustData} />;
}

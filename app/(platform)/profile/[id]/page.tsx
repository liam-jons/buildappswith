import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

// Server-side auth import
import { auth } from "@clerk/nextjs/server";

// Import actions from domain
import { getUserProfile } from "@/lib/profile/actions";
import { UserRole } from "@/lib/auth/types";

// Import components from barrel exports
import { BuilderProfile, ClientProfile } from "@/components/profile";
import { Skeleton } from "@/components/ui";

// Generate metadata for the page
export async function generateMetadata({ 
  params 
}: { 
  params: { id: string } 
}): Promise<Metadata> {
  // Fetch user profile data for metadata
  const { user } = await getUserProfile(params.id);
  
  if (!user) {
    return {
      title: "Profile Not Found | Buildappswith",
      description: "The requested profile could not be found",
    };
  }
  
  return {
    title: `${user.name}'s Profile | Buildappswith`,
    description: user.bio || `View ${user.name}'s profile on Buildappswith`,
  };
}

/**
 * Dynamic Profile Page - Display a user's public profile
 * 
 * This page shows a public profile for any user based on their ID.
 * It handles both builder and client profiles with appropriate public content.
 */
export default async function UserProfilePage({
  params,
}: {
  params: { id: string };
}) {
  // Get the authenticated user (if any)
  const { userId: currentUserId } = auth();
  const isOwnProfile = currentUserId === params.id;
  
  // Fetch profile data
  const { user, roles } = await getUserProfile(params.id);
  
  // Handle missing user
  if (!user) {
    notFound();
  }
  
  // Determine which profile view to show based on roles
  const isBuilder = roles.includes(UserRole.BUILDER);
  const isClient = roles.includes(UserRole.CLIENT);
  
  return (
    <div className="container py-10 space-y-8">
      <div className="flex justify-between items-start">
        <h1 className="text-3xl font-bold tracking-tight">
          {isOwnProfile ? "Your Profile" : `${user.name}'s Profile`}
        </h1>
        
        {/* Show edit button for own profile */}
        {isOwnProfile && (
          <Link 
            href="/profile/edit" 
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/80 h-10 px-4 py-2"
          >
            Edit Profile
          </Link>
        )}
      </div>
      
      {/* Conditional rendering based on role */}
      <Suspense fallback={<Skeleton className="w-full h-[600px]" />}>
        {isBuilder ? (
          <BuilderProfile 
            userId={params.id} 
            isPublicView={!isOwnProfile} 
          />
        ) : isClient ? (
          <ClientProfile 
            userId={params.id} 
            isPublicView={!isOwnProfile}
          />
        ) : (
          <div className="p-6 bg-muted rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Profile Not Complete</h2>
            <p>This user has not completed their profile setup yet.</p>
          </div>
        )}
      </Suspense>
    </div>
  );
}

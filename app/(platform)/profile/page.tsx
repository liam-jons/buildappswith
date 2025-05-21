/**
 * Profile Page
 * Version: 1.0.0
 * 
 * This is the main profile page for the currently authenticated user.
 * It uses our standardized authentication hooks and supports public access.
 */

import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { UserProfile } from "@/components/profile";
import { getPublicUserProfile } from "@/lib/profile/actions";

// Metadata for SEO
export const metadata: Metadata = {
  title: "Your Profile | Buildappswith",
  description: "View and manage your profile on Buildappswith",
};

/**
 * Profile page component
 * This component shows the profile for the current user
 */
export default async function ProfilePage() {
  // Get current user from Clerk (server-side)
  const { userId } = auth();
  
  // If the user is not authenticated, show a public view with login prompt
  if (!userId) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Profile</h1>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <p className="text-lg mb-4">Please sign in to view your profile.</p>
          <a 
            href="/login?returnUrl=/profile" 
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-200"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }
  
  // Fetch user profile data
  const profile = await getPublicUserProfile(userId);
  
  // If no profile found, create one
  if (!profile) {
    // Redirect to profile creation page
    redirect("/profile/create");
  }
  
  // Render the profile page
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
      <UserProfile profile={profile} isCurrentUser={true} />
    </div>
  );
}

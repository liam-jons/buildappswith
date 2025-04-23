"use client";

// Version: 1.0.54
// Client component for interactive parts of the builder profile

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useReducedMotion } from "framer-motion";
import { SessionType } from "@/lib/scheduling/types";
import { ExtendedBuilderProfile } from "@/lib/builders/profile";
import { cn } from "@/lib/utils";

type BuilderProfileClientProps = {
  profile: ExtendedBuilderProfile | null;
  sessionTypes: SessionType[];
  enhancedProfile: any; // Using any here since we're reusing the existing profile enhancement logic
  formattedSessionTypes: any[]; // Using any to match the existing session types formatting
};

export function BuilderProfileClient({ 
  profile, 
  sessionTypes, 
  enhancedProfile, 
  formattedSessionTypes 
}: BuilderProfileClientProps) {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const [showFullBio, setShowFullBio] = useState(false);
  const [activeTab, setActiveTab] = useState("builder");
  
  // Format bio with show more/less if longer than 280 characters
  const bioIsTruncated = enhancedProfile.bio && enhancedProfile.bio.length > 280;
  const displayBio = showFullBio ? enhancedProfile.bio : bioIsTruncated ? enhancedProfile.bio.slice(0, 280) + "..." : enhancedProfile.bio;
  
  // Get appropriate availability label and styling
  const availabilityLabel = enhancedProfile.availability && typeof enhancedProfile.availability.status === 'string'
    ? {
        available: "Available Now",
        limited: "Limited Availability",
        unavailable: "Unavailable"
      }[enhancedProfile.availability.status as "available" | "limited" | "unavailable"] 
    : "Availability Unknown";
  
  const availabilityStyle = enhancedProfile.availability && typeof enhancedProfile.availability.status === 'string'
    ? {
        available: "text-green-600 dark:text-green-500 bg-green-50 dark:bg-green-950/30",
        limited: "text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-950/30",
        unavailable: "text-red-600 dark:text-red-500 bg-red-50 dark:bg-red-950/30"
      }[enhancedProfile.availability.status as "available" | "limited" | "unavailable"] 
    : "text-muted-foreground bg-muted";
  
  // Handle booking of specific session types
  const handleBookSession = (sessionId?: string) => {
    // Use the ID from the profile or fallback to a default ID
    const builderId = profile?.id || 'liam-jons';
    const url = sessionId 
      ? `/book/${builderId}?session=${sessionId}` 
      : `/book/${builderId}`;
    router.push(url);
  };
  
  const handleSendMessage = () => {
    router.push("/messages/new?recipient=liam-jons");
  };
  
  return {
    // Return all the client-side state and handlers for use in the component
    showFullBio,
    setShowFullBio,
    activeTab,
    setActiveTab,
    bioIsTruncated,
    displayBio,
    availabilityLabel,
    availabilityStyle,
    handleBookSession,
    handleSendMessage,
    shouldReduceMotion
  };
}
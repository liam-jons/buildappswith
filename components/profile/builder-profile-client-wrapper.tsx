"use client";

// Version: 1.0.54
// Client wrapper for BuilderProfile component

import { useRouter } from "next/navigation";
import { BuilderProfile } from "@/components/profile/builder-profile";

interface BuilderProfileClientWrapperProps {
  profile: any;
  sessionTypes: any[];
}

export function BuilderProfileClientWrapper({ 
  profile, 
  sessionTypes 
}: BuilderProfileClientWrapperProps) {
  const router = useRouter();
  
  // Handle session booking
  const handleScheduleSession = (sessionId?: string) => {
    const url = sessionId 
      ? `/book/${profile.id}?session=${sessionId}` 
      : `/book/${profile.id}`;
    router.push(url);
  };
  
  // Handle sending a message
  const handleSendMessage = () => {
    router.push(`/messages/new?recipient=${profile.id}`);
  };
  
  return (
    <BuilderProfile
      profile={profile}
      isOwner={false}
      onScheduleSession={handleScheduleSession}
      onSendMessage={handleSendMessage}
    />
  );
}
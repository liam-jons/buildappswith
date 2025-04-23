"use client";

// Version: 1.0.54
// Client component for interactive parts of the builder profile

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type ProfileInteractiveElementsProps = {
  builderId: string;
  bioIsTruncated: boolean;
  initialBio: string;
};

export function ProfileInteractiveElements({ 
  builderId,
  bioIsTruncated, 
  initialBio
}: ProfileInteractiveElementsProps) {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const [showFullBio, setShowFullBio] = useState(false);
  const [activeTab, setActiveTab] = useState("builder");
  
  // Format bio with show more/less if longer than 280 characters
  const displayBio = showFullBio ? initialBio : bioIsTruncated ? initialBio.slice(0, 280) + "..." : initialBio;
  
  // Handle booking of specific session types
  const handleBookSession = (sessionId?: string) => {
    const url = sessionId 
      ? `/book/${builderId}?session=${sessionId}` 
      : `/book/${builderId}`;
    router.push(url);
  };
  
  const handleSendMessage = () => {
    router.push(`/messages/new?recipient=${builderId}`);
  };
  
  return {
    TabsHandler: () => (
      <Tabs defaultValue="builder" onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full max-w-lg mx-auto mb-8">
          {/* Tab triggers will go here */}
        </TabsList>
      </Tabs>
    ),
    Bio: () => (
      <>
        {displayBio}
        {bioIsTruncated && (
          <button 
            onClick={() => setShowFullBio(!showFullBio)}
            className="ml-1 text-primary hover:underline"
          >
            {showFullBio ? "Show less" : "Show more"}
          </button>
        )}
      </>
    ),
    BookButton: ({ sessionId, children }: { sessionId?: string, children: React.ReactNode }) => (
      <Button onClick={() => handleBookSession(sessionId)}>{children}</Button>
    ),
    MessageButton: ({ children }: { children: React.ReactNode }) => (
      <Button variant="outline" onClick={handleSendMessage}>{children}</Button>
    ),
    shouldReduceMotion
  };
}

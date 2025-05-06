"use client";

// Version: 1.0.54
// Client wrapper for BuilderProfile component with Clerk integration

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { BuilderProfile, BuilderProfileData } from "@/components/profile/builder-profile";
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { CalendarIcon, ChatBubbleIcon } from "@radix-ui/react-icons";

interface BuilderProfileClientWrapperProps {
  profile: BuilderProfileData;
  sessionTypes: any[];
  clerkUserId?: string;
}

export function BuilderProfileClientWrapper({ 
  profile, 
  sessionTypes,
  clerkUserId
}: BuilderProfileClientWrapperProps) {
  const router = useRouter();
  const { isLoaded, userId, isSignedIn } = useAuth();
  const { user } = useUser();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [actionType, setActionType] = useState<'booking' | 'message' | null>(null);
  
  // Check if the current user is the profile owner
  const isOwner = isLoaded && isSignedIn && userId === clerkUserId;
  
  // Handle session booking with auth check
  const handleScheduleSession = () => {
    if (!isLoaded) return; // Still loading auth state
    
    if (isSignedIn) {
      const url = `/book/${profile.id}`;
      router.push(url);
    } else {
      setActionType('booking');
      setShowAuthDialog(true);
    }
  };
  
  // Handle sending a message with auth check
  const handleSendMessage = () => {
    if (!isLoaded) return; // Still loading auth state
    
    if (isSignedIn) {
      router.push(`/messages/new?recipient=${profile.id}`);
    } else {
      setActionType('message');
      setShowAuthDialog(true);
    }
  };
  
  // Handle profile editing (only available to the owner)
  const handleEditProfile = () => {
    if (isOwner) {
      router.push(`/profile/edit`);
    }
  };
  
  // Handle sign in from dialog
  const handleSignIn = () => {
    setShowAuthDialog(false);
    
    // Redirect to sign in page with return URL
    const returnUrl = encodeURIComponent(`/builder/${profile.id}`);
    router.push(`/login?redirect_url=${returnUrl}`);
  };
  
  return (
    <>
      <BuilderProfile
        profile={profile}
        isOwner={isOwner}
        onScheduleSession={handleScheduleSession}
        onSendMessage={handleSendMessage}
        onEditProfile={isOwner ? handleEditProfile : undefined}
      />
      
      {/* Authentication Dialog */}
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Authentication Required</DialogTitle>
            <DialogDescription>
              {actionType === 'booking' 
                ? 'You need to sign in to book a session with this builder.'
                : 'You need to sign in to send a message to this builder.'}
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="flex space-x-2 pt-4">
            <Button variant="outline" onClick={() => setShowAuthDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSignIn}>
              Sign In
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
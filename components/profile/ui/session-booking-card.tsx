"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/core/card";
import { Button } from "@/components/ui/core/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/core/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/core/dialog";
import { CalendarIcon, ClockIcon, CheckIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";

export interface SessionType {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
  price: number;
  currency: string;
  color?: string;
  maxParticipants?: number;
}

interface SessionBookingCardProps {
  builderId: string;
  builderName: string;
  sessionTypes: SessionType[];
  className?: string;
  adhdFocus?: boolean;
}

export default function SessionBookingCard({
  builderId,
  builderName,
  sessionTypes,
  className,
  adhdFocus = false
}: SessionBookingCardProps) {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  // Filter and sort session types
  const availableSessionTypes = sessionTypes.filter(session => session.price >= 0);
  
  // Get the selected session if any
  const selectedSession = selectedSessionId 
    ? availableSessionTypes.find(session => session.id === selectedSessionId)
    : null;
  
  // Format price with currency
  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };
  
  // Format duration
  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 
      ? `${hours} hr ${remainingMinutes} min` 
      : `${hours} hr`;
  };
  
  // Handle booking
  const handleBookSession = () => {
    if (!isLoaded) return;
    
    if (isSignedIn) {
      const url = selectedSessionId
        ? `/book/${builderId}?session=${selectedSessionId}`
        : `/book/${builderId}`;
      router.push(url);
    } else {
      setShowAuthDialog(true);
    }
  };
  
  // Handle sign in
  const handleSignIn = () => {
    setShowAuthDialog(false);
    const returnUrl = encodeURIComponent(`/builder/${builderId}`);
    router.push(`/login?redirect_url=${returnUrl}`);
  };

  return (
    <>
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Book a Session</span>
            {adhdFocus && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-950/50 dark:text-purple-400 rounded-full text-xs font-medium">
                ADHD-Friendly
              </span>
            )}
          </CardTitle>
          <CardDescription>
            Schedule time with {builderName} to discuss your project
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {availableSessionTypes.length > 0 ? (
            <>
              <div className="space-y-2">
                <label htmlFor="session-type" className="text-sm font-medium">
                  Session Type
                </label>
                <Select 
                  onValueChange={(value) => setSelectedSessionId(value)}
                  value={selectedSessionId || undefined}
                >
                  <SelectTrigger id="session-type">
                    <SelectValue placeholder="Select a session type" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSessionTypes.map((session) => (
                      <SelectItem key={session.id} value={session.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{session.title}</span>
                          <span className="text-muted-foreground">
                            {formatPrice(session.price, session.currency)}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedSession && (
                <div className="bg-muted rounded-md p-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <ClockIcon className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDuration(selectedSession.durationMinutes)}</span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    {selectedSession.description}
                  </p>
                  
                  {adhdFocus && (
                    <div className="text-sm flex items-start gap-2 mt-2">
                      <CheckIcon className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>Optimized for ADHD - includes pre-session structure and post-session action items</span>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <p className="text-muted-foreground text-sm">
              No session types are currently available. Please check back later.
            </p>
          )}
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full gap-2" 
            disabled={!selectedSessionId || availableSessionTypes.length === 0}
            onClick={handleBookSession}
          >
            <CalendarIcon className="h-4 w-4" />
            Book Session
            <ChevronRightIcon className="h-4 w-4 ml-auto" />
          </Button>
        </CardFooter>
      </Card>
      
      {/* Authentication Dialog */}
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Authentication Required</DialogTitle>
            <DialogDescription>
              You need to sign in to book a session with {builderName}.
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
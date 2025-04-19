"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

export default function ConfirmationPage({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const status = searchParams.get("status") || "success";
  
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // If we have a session ID, fetch the session details
    if (sessionId) {
      const fetchSession = async () => {
        try {
          const response = await fetch(`/api/stripe/sessions/${sessionId}`);
          if (response.ok) {
            const data = await response.json();
            setSession(data);
          }
        } catch (error) {
          console.error("Error fetching session:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchSession();
    } else {
      setIsLoading(false);
    }
  }, [sessionId]);

  if (isLoading) {
    return (
      <div className="container max-w-4xl py-12 text-center">
        <p>Loading your booking details...</p>
      </div>
    );
  }

  if (status === "cancel") {
    return (
      <div className="container max-w-4xl py-12">
        <Card>
          <CardHeader className="text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle>Booking Cancelled</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4">Your booking was not completed. No payment has been processed.</p>
            <p className="text-muted-foreground">You can try again or contact us if you need assistance.</p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Link href={`/book/${params.id}`}>
              <Button>Try Again</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-12">
      <Card>
        <CardHeader className="text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <CardTitle>Booking Confirmed!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {session ? (
            <div className="space-y-6">
              <div className="space-y-1">
                <p className="font-medium">Session Details</p>
                <p className="text-muted-foreground">
                  {session.booking?.sessionType || "Consultation Session"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="font-medium">Date & Time</p>
                <p className="text-muted-foreground">
                  {new Date(session.booking?.startTime).toLocaleString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  })}
                </p>
              </div>
              <div className="space-y-1">
                <p className="font-medium">Confirmation Number</p>
                <p className="text-muted-foreground">
                  {session.id.slice(0, 8).toUpperCase()}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <p className="mb-4">Your booking has been confirmed!</p>
              <p className="text-muted-foreground">You'll receive a confirmation email with all the details.</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/">
            <Button>Return to Home</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

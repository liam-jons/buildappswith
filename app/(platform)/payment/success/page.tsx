'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { TextShimmer } from '@/components/magicui/text-shimmer';
import { getCheckoutSession } from '@/lib/stripe';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [sessionData, setSessionData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    
    if (!sessionId) {
      setError('No session ID provided');
      setIsLoading(false);
      return;
    }

    // In a real implementation, we would fetch the session details
    // For now, let's simulate a successful payment
    setTimeout(() => {
      setSessionData({
        id: sessionId,
        status: 'complete',
        customerEmail: 'user@example.com',
        // This would come from your database based on the metadata stored in Stripe
        booking: {
          id: 'booking-123',
          sessionType: 'Featured Builder Consultation',
          startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
          builderName: 'Featured Builder'
        }
      });
      setIsLoading(false);
    }, 2000);

    // In a real implementation, you would fetch the session like this:
    // async function fetchSession() {
    //   try {
    //     const session = await getCheckoutSession(sessionId);
    //     setSessionData(session);
    //   } catch (error: any) {
    //     setError(error.message || 'Failed to load session');
    //   } finally {
    //     setIsLoading(false);
    //   }
    // }
    // fetchSession();
  }, [searchParams]);

  const handleViewBookings = () => {
    router.push('/profile/bookings');
  };

  const handleReturnToMarketplace = () => {
    router.push('/marketplace');
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg">Processing your payment...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-destructive">Payment Error</CardTitle>
            <CardDescription>
              We encountered a problem with your payment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
          <CardFooter>
            <Button onClick={handleReturnToMarketplace}>Return to Marketplace</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-2" />
          <TextShimmer delay={0.5} shimmerDuration={1.5}>
            <CardTitle className="text-2xl">Payment Successful!</CardTitle>
          </TextShimmer>
          <CardDescription>
            Your booking has been confirmed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <h3 className="font-medium text-lg mb-2">{sessionData?.booking?.sessionType}</h3>
            <p className="text-sm text-muted-foreground">
              Your session with {sessionData?.booking?.builderName} is scheduled for{' '}
              {new Date(sessionData?.booking?.startTime).toLocaleString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
              })}
            </p>
          </div>
          <p className="text-sm">
            A confirmation email has been sent to {sessionData?.customerEmail}
          </p>
          <p className="text-sm text-muted-foreground">
            Payment Reference: {sessionData?.id}
          </p>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-3 sm:justify-between">
          <Button variant="outline" onClick={handleReturnToMarketplace}>
            Return to Marketplace
          </Button>
          <Button onClick={handleViewBookings}>
            View My Bookings
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

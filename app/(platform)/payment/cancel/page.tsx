'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';

export default function PaymentCancelPage() {
  const router = useRouter();

  const handleReturnToBooking = () => {
    // In a real implementation, we might want to pass the builder ID to return to the specific builder's profile
    router.push('/marketplace/featured');
  };

  const handleViewBuilders = () => {
    router.push('/marketplace');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <XCircle className="h-12 w-12 text-muted-foreground" />
          </div>
          <CardTitle className="text-center">Payment Cancelled</CardTitle>
          <CardDescription className="text-center">
            Your booking hasn&apos;t been confirmed as the payment process was cancelled.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-muted-foreground mb-4">
            No charges have been made to your account.
          </p>
          <div className="bg-muted/50 rounded-lg p-4">
            <h3 className="font-medium mb-2">Would you like to:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Try again with a different payment method</li>
              <li>Schedule for a different time slot</li>
              <li>Explore other builders on the marketplace</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-3 sm:justify-between">
          <Button variant="outline" onClick={handleViewBuilders}>
            Browse All Builders
          </Button>
          <Button onClick={handleReturnToBooking}>
            Return to Booking
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

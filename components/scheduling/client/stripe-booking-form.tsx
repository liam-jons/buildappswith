'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/core/sonner';
import { Card } from '@/components/ui/core/card';
import { Button } from '@/components/ui/core/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/core/form';
import { Input } from '@/components/ui/core/input';
import { Textarea } from '@/components/ui/core/textarea';
import { Separator } from '@/components/ui/core/separator';
import { useAuth } from '@/hooks/auth';
import { formatDate } from '@/lib/utils';
import { CheckoutButton } from '@/components/payment/checkout-button';
import { StripeProvider } from '@/components/payment/stripe-provider';

// Form schema
const bookingFormSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  notes: z.string().optional(),
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

interface StripeBookingFormProps {
  sessionType: {
    id: string;
    title: string;
    description?: string;
    duration: number;
    price: number;
    currency: string;
    builderId: string;
  };
  timeSlot: {
    startTime: string;
    endTime: string;
  };
  builderId: string;
  onBack?: () => void;
}

/**
 * Enhanced booking form with Stripe payment integration
 */
export function StripeBookingForm({
  sessionType,
  timeSlot,
  builderId,
  onBack
}: StripeBookingFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const { user, isLoaded } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form initialization
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      notes: '',
    },
  });

  // Format price for display
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: sessionType.currency.toUpperCase() || 'USD',
  }).format(sessionType.price);

  // Handle form submission
  const onSubmit = async (data: BookingFormValues) => {
    try {
      setIsSubmitting(true);

      if (!isLoaded || !user) {
        toast({
          title: 'Authentication Required',
          description: 'Please sign in to book a session',
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }

      // For this implementation, we'll directly go to the payment flow
      // when the scheduling service is implemented, we would create a booking record first
      
      setIsSubmitting(false);
    } catch (error: any) {
      console.error('Error submitting booking:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit booking',
        variant: 'destructive',
      });
      setIsSubmitting(false);
    }
  };

  // Prepare booking data for checkout
  const bookingData = {
    builderId: builderId,
    sessionTypeId: sessionType.id,
    startTime: timeSlot.startTime,
    endTime: timeSlot.endTime,
    clientId: user?.id,
    clientTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  };

  return (
    <StripeProvider>
      <Card className="p-6">
        <div className="space-y-6">
          {/* Session summary */}
          <div>
            <h2 className="text-xl font-semibold">Session Summary</h2>
            <div className="mt-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Session Type:</span>
                <span className="font-medium">{sessionType.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date & Time:</span>
                <span className="font-medium">{formatDate(timeSlot.startTime)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Duration:</span>
                <span className="font-medium">{sessionType.duration} minutes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Price:</span>
                <span className="font-semibold">{formattedPrice}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Contact information form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Full Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="your@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any specific topics you'd like to discuss?"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-4 flex justify-between">
                {onBack && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onBack}
                  >
                    Back
                  </Button>
                )}

                <CheckoutButton
                  bookingData={bookingData}
                  returnUrl={`${window.location.origin}/booking/confirmation`}
                  disabled={!isLoaded || !user || isSubmitting}
                >
                  Proceed to Payment
                </CheckoutButton>
              </div>
            </form>
          </Form>
        </div>
      </Card>
    </StripeProvider>
  );
}
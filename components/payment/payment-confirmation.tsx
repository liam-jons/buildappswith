'use client';

import React from 'react';
import { Card } from '@/components/ui/core/card';
import { Button } from '@/components/ui/core/button';
import { Separator } from '@/components/ui/core/separator';
import { PaymentStatusIndicator } from './payment-status-indicator';
import { CheckCircle, Calendar, Clock, DollarSign, User, Building } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

interface PaymentConfirmationProps {
  paymentStatus: string;
  sessionData: {
    title: string;
    description?: string;
    date: string;
    duration: string;
    price: string;
    builder: string;
  };
  showAddToCalendar?: boolean;
  showContactLink?: boolean;
}

/**
 * Payment Confirmation Component
 * 
 * Displays a payment confirmation with booking details and payment status.
 */
export function PaymentConfirmation({
  paymentStatus,
  sessionData,
  showAddToCalendar = true,
  showContactLink = true,
}: PaymentConfirmationProps) {
  return (
    <Card className="overflow-hidden max-w-xl mx-auto">
      {/* Header with payment status */}
      <div className="bg-primary/5 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Booking Confirmed</h2>
          <PaymentStatusIndicator status={paymentStatus} />
        </div>
        
        <p className="mt-2 text-muted-foreground">
          Thank you for your booking. We look forward to your session!
        </p>
      </div>
      
      {/* Session details */}
      <div className="p-6 space-y-6">
        <div className="space-y-4">
          <div className="flex items-start">
            <Calendar className="h-5 w-5 text-primary/70 mr-3 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Session</h3>
              <p className="font-medium">{sessionData.title}</p>
              {sessionData.description && (
                <p className="text-sm text-muted-foreground mt-1">{sessionData.description}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-start">
            <Clock className="h-5 w-5 text-primary/70 mr-3 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Date & Time</h3>
              <p className="font-medium">{formatDate(sessionData.date)}</p>
              <p className="text-sm text-muted-foreground mt-1">Duration: {sessionData.duration}</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <Building className="h-5 w-5 text-primary/70 mr-3 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Builder</h3>
              <p className="font-medium">{sessionData.builder}</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <DollarSign className="h-5 w-5 text-primary/70 mr-3 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Price</h3>
              <p className="font-medium">{sessionData.price}</p>
            </div>
          </div>
        </div>
        
        <Separator />
        
        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          {showAddToCalendar && (
            <Button variant="outline" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Add to Calendar
            </Button>
          )}
          
          <div className="flex gap-3">
            {showContactLink && (
              <Button variant="outline" asChild>
                <Link href="/contact">Contact Support</Link>
              </Button>
            )}
            
            <Button asChild>
              <Link href="/dashboard/bookings">View All Bookings</Link>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
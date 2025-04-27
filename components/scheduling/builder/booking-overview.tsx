"use client";

import { useState, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { Booking, SessionType } from '@/lib/scheduling/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatInTimezone } from '@/lib/scheduling/utils';
import { Calendar, Clock, User, CheckCircle, AlertTriangle, XCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { updateBookingStatus } from '@/lib/api-client/scheduling';

interface BookingOverviewProps {
  bookings: Booking[];
  sessionTypes: SessionType[];
  timezone: string;
  onRefresh?: () => void;
}

export function BookingOverview({
  bookings,
  sessionTypes,
  timezone,
  onRefresh
}: BookingOverviewProps) {
  const [filter, setFilter] = useState<'upcoming' | 'past' | 'all'>('upcoming');
  const [processingBookings, setProcessingBookings] = useState<Record<string, boolean>>({});
  const { user } = useUser();
  
  const getSessionTypeById = useCallback((id: string): SessionType | undefined => {
    return sessionTypes.find(type => type.id === id);
  }, [sessionTypes]);
  
  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'cancelled':
        return 'bg-red-500';
      case 'completed':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  }, []);
  
  const getStatusIcon = useCallback((status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
        return <AlertTriangle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return null;
    }
  }, []);
  
  const isUpcoming = useCallback((booking: Booking): boolean => {
    return new Date(booking.startTime) > new Date();
  }, []);
  
  const filterBookings = useCallback(() => {
    if (filter === 'all') return bookings;
    return bookings.filter(booking => 
      filter === 'upcoming' ? isUpcoming(booking) : !isUpcoming(booking)
    );
  }, [bookings, filter, isUpcoming]);
  
  const sortedBookings = useCallback(() => {
    return filterBookings().sort((a, b) => 
      new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );
  }, [filterBookings]);

  const handleBookingAction = async (bookingId: string, action: 'reschedule' | 'cancel') => {
    setProcessingBookings(prev => ({ ...prev, [bookingId]: true }));
    
    try {
      if (action === 'cancel') {
        await updateBookingStatus(bookingId, 'cancelled');
        toast.success('Booking cancelled successfully');
      } else {
        // Reschedule functionality would go here
        toast.info('Reschedule functionality not yet implemented');
      }
      
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error(`Error ${action}ing booking:`, error);
      toast.error(`Failed to ${action} booking`);
    } finally {
      setProcessingBookings(prev => ({ ...prev, [bookingId]: false }));
    }
  };

  const displayedBookings = sortedBookings();

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle>Your Bookings</CardTitle>
          <div className="flex space-x-1">
            <Button 
              variant={filter === 'upcoming' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilter('upcoming')}
            >
              Upcoming
            </Button>
            <Button 
              variant={filter === 'past' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilter('past')}
            >
              Past
            </Button>
            <Button 
              variant={filter === 'all' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilter('all')}
            >
              All
            </Button>
            {onRefresh && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onRefresh}
                aria-label="Refresh bookings"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {displayedBookings.length === 0 ? (
          <div className="text-center p-8 border border-dashed rounded-md border-muted-foreground/20">
            <Calendar className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground">
              {filter === 'upcoming' 
                ? 'No upcoming bookings' 
                : filter === 'past'
                ? 'No past bookings'
                : 'No bookings found'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayedBookings.map((booking) => {
              const sessionType = getSessionTypeById(booking.sessionTypeId);
              const isProcessing = processingBookings[booking.id] || false;
              return (
                <div 
                  key={booking.id}
                  className="p-4 border rounded-md hover:bg-accent/50 transition-colors"
                  tabIndex={0}
                  aria-label={`Booking: ${sessionType?.title || 'Unknown session'} on ${formatInTimezone(booking.startTime, 'MMM d, yyyy', timezone)}`}
                >
                  <div className="flex justify-between mb-2">
                    <h4 className="font-medium">{sessionType?.title || 'Unknown Session Type'}</h4>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <span
                        className={`w-2 h-2 rounded-full ${getStatusColor(booking.status)}`}
                        aria-hidden="true"
                      />
                      <span className="capitalize">{booking.status}</span>
                    </Badge>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" aria-hidden="true" />
                      <span>{formatInTimezone(booking.startTime, 'MMM d, yyyy', timezone)}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" aria-hidden="true" />
                      <span>
                        {formatInTimezone(booking.startTime, 'h:mm a', timezone)} - 
                        {formatInTimezone(booking.endTime, 'h:mm a', timezone)}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1" aria-hidden="true" />
                      <span>Client #{booking.clientId}</span>
                    </div>
                  </div>
                  
                  {booking.notes && (
                    <div className="mt-2 text-sm bg-muted/50 p-2 rounded">
                      <p className="text-xs font-medium mb-1">Notes:</p>
                      <p>{booking.notes}</p>
                    </div>
                  )}
                  
                  {isUpcoming(booking) && (
                    <div className="mt-3 flex justify-end space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleBookingAction(booking.id, 'reschedule')}
                        disabled={isProcessing || booking.status === 'cancelled'}
                      >
                        {isProcessing ? (
                          <span className="inline-block animate-spin mr-2">
                            <RefreshCw className="h-4 w-4" />
                          </span>
                        ) : null}
                        Reschedule
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleBookingAction(booking.id, 'cancel')}
                        disabled={isProcessing || booking.status === 'cancelled'}
                      >
                        {isProcessing ? (
                          <span className="inline-block animate-spin mr-2">
                            <RefreshCw className="h-4 w-4" />
                          </span>
                        ) : null}
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
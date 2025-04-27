"use client";

import { useState } from 'react';
import { Booking, SessionType } from '@/lib/scheduling/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatInTimezone } from '@/lib/scheduling/utils';
import { Calendar, Clock, User, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

interface BookingOverviewProps {
  bookings: Booking[];
  sessionTypes: SessionType[];
  timezone: string;
}

export function BookingOverview({
  bookings,
  sessionTypes,
  timezone
}: BookingOverviewProps) {
  const [filter, setFilter] = useState<'upcoming' | 'past' | 'all'>('upcoming');
  
  const getSessionTypeById = (id: string): SessionType | undefined => {
    return sessionTypes.find(type => type.id === id);
  };
  
  const getStatusColor = (status: string) => {
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
  };
  
  const getStatusIcon = (status: string) => {
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
  };
  
  const isUpcoming = (booking: Booking): boolean => {
    return new Date(booking.startTime) > new Date();
  };
  
  const filterBookings = () => {
    if (filter === 'all') return bookings;
    return bookings.filter(booking => 
      filter === 'upcoming' ? isUpcoming(booking) : !isUpcoming(booking)
    );
  };
  
  const sortedBookings = filterBookings().sort((a, b) => 
    new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );

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
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {sortedBookings.length === 0 ? (
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
            {sortedBookings.map((booking) => {
              const sessionType = getSessionTypeById(booking.sessionTypeId);
              return (
                <div 
                  key={booking.id}
                  className="p-4 border rounded-md hover:bg-accent transition-colors"
                >
                  <div className="flex justify-between mb-2">
                    <h4 className="font-medium">{sessionType?.title || 'Unknown Session Type'}</h4>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <span
                        className={`w-2 h-2 rounded-full ${getStatusColor(booking.status)}`}
                      />
                      <span className="capitalize">{booking.status}</span>
                    </Badge>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatInTimezone(booking.startTime, 'MMM d, yyyy', timezone)}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {formatInTimezone(booking.startTime, 'h:mm a', timezone)} - 
                      {formatInTimezone(booking.endTime, 'h:mm a', timezone)}
                    </div>
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      Client #{booking.clientId}
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
                      >
                        Reschedule
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                      >
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
'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/core/card';
import { Badge } from '@/components/ui/core/badge';
import { Button } from '@/components/ui/core/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/core/tabs';
import { Clock, Calendar, User, BookOpen } from 'lucide-react';
import { format } from 'date-fns';
import { PATHWAYS } from '@/lib/constants/pathways';

interface Booking {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  status: string;
  paymentStatus: string;
  pathway?: string;
  customQuestionResponse?: any;
  client: {
    id: string;
    name: string;
    email: string;
  };
  sessionType: {
    id: string;
    title: string;
    eventTypeCategory?: string;
  };
}

interface BookingsByPathwayProps {
  bookings: Booking[];
  onBookingClick?: (booking: Booking) => void;
}

export function BookingsByPathway({ bookings, onBookingClick }: BookingsByPathwayProps) {
  // Group bookings by pathway
  const pathwayGroups = React.useMemo(() => {
    const groups: Record<string, Booking[]> = {
      accelerate: [],
      pivot: [],
      play: [],
      none: []
    };
    
    bookings.forEach(booking => {
      const pathway = booking.pathway?.toLowerCase() || 'none';
      if (groups[pathway]) {
        groups[pathway].push(booking);
      } else {
        groups.none.push(booking);
      }
    });
    
    return groups;
  }, [bookings]);
  
  // Get pathway info with fallback
  const getPathwayInfo = (pathway: string) => {
    const uppercasePathway = pathway.toUpperCase();
    return PATHWAYS[uppercasePathway as keyof typeof PATHWAYS] || null;
  };
  
  const renderBookingCard = (booking: Booking) => (
    <Card
      key={booking.id}
      className="mb-4 cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => onBookingClick?.(booking)}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{booking.title}</CardTitle>
            <CardDescription>{booking.client.name} - {booking.client.email}</CardDescription>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant={getStatusVariant(booking.status)}>
              {booking.status}
            </Badge>
            {booking.sessionType.eventTypeCategory && (
              <Badge variant="outline">
                {booking.sessionType.eventTypeCategory}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{format(new Date(booking.startTime), 'PPP')}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{format(new Date(booking.startTime), 'p')} - {format(new Date(booking.endTime), 'p')}</span>
          </div>
          
          {booking.customQuestionResponse && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="font-medium mb-1">Custom Response:</p>
              <p className="text-muted-foreground">
                {typeof booking.customQuestionResponse === 'object' 
                  ? booking.customQuestionResponse.answer 
                  : booking.customQuestionResponse}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
  
  return (
    <div className="space-y-6">
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All Bookings</TabsTrigger>
          <TabsTrigger value="accelerate">
            <span className="mr-2">🚀</span> Accelerate
          </TabsTrigger>
          <TabsTrigger value="pivot">
            <span className="mr-2">🔄</span> Pivot
          </TabsTrigger>
          <TabsTrigger value="play">
            <span className="mr-2">🎨</span> Play
          </TabsTrigger>
          <TabsTrigger value="none">No Pathway</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          <div className="space-y-4">
            {bookings.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No bookings found</p>
                </CardContent>
              </Card>
            ) : (
              bookings.map(renderBookingCard)
            )}
          </div>
        </TabsContent>
        
        {Object.entries(pathwayGroups).map(([pathway, pathwayBookings]) => {
          if (pathway === 'none') {
            return (
              <TabsContent key={pathway} value={pathway} className="mt-6">
                <div className="space-y-4">
                  {pathwayBookings.length === 0 ? (
                    <Card>
                      <CardContent className="text-center py-8">
                        <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No bookings without a pathway</p>
                      </CardContent>
                    </Card>
                  ) : (
                    pathwayBookings.map(renderBookingCard)
                  )}
                </div>
              </TabsContent>
            );
          }
          
          const pathwayInfo = getPathwayInfo(pathway);
          
          return (
            <TabsContent key={pathway} value={pathway} className="mt-6">
              {pathwayInfo && (
                <Card className="mb-6" style={{ borderColor: pathwayInfo.color }}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span className="text-2xl">{pathwayInfo.icon}</span>
                      {pathwayInfo.name} Pathway
                    </CardTitle>
                    <CardDescription>{pathwayInfo.description}</CardDescription>
                  </CardHeader>
                </Card>
              )}
              
              <div className="space-y-4">
                {pathwayBookings.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-8">
                      <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No {pathway} pathway bookings</p>
                    </CardContent>
                  </Card>
                ) : (
                  pathwayBookings.map(renderBookingCard)
                )}
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}

function getStatusVariant(status: string): "default" | "secondary" | "outline" | "destructive" {
  switch (status.toUpperCase()) {
    case 'CONFIRMED':
      return 'default';
    case 'PENDING':
      return 'secondary';
    case 'CANCELLED':
      return 'destructive';
    default:
      return 'outline';
  }
}
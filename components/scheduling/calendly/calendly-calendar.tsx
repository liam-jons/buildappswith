'use client';

import React, { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/core/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/core/card';
import { Button } from '@/components/ui/core/button';
import { LoadingSpinner } from '@/components/ui/core/loading-spinner';
import { Badge } from '@/components/ui/core/badge';
import { format, addDays, startOfDay, endOfDay } from 'date-fns';
import { getCalendlyAvailableTimeSlots } from '@/lib/scheduling/calendly/client-api';
import { logger } from '@/lib/logger';
import { Clock, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CalendlyCalendarProps {
  eventTypeUri: string;
  sessionType?: {
    title: string;
    duration: number;
    price: number;
  };
  onSelectTimeSlot: (slot: {
    startTime: Date;
    endTime: Date;
    schedulingUrl: string;
  }) => void;
  className?: string;
}

export function CalendlyCalendar({
  eventTypeUri,
  sessionType,
  onSelectTimeSlot,
  className
}: CalendlyCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableDates, setAvailableDates] = useState<Date[]>([]);

  // Fetch available dates for the next 7 days
  useEffect(() => {
    const fetchAvailableDates = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const startDate = startOfDay(new Date());
        const endDate = endOfDay(addDays(startDate, 6)); // Max 7 days

        const response = await getCalendlyAvailableTimeSlots(
          eventTypeUri,
          startDate,
          endDate
        );

        if (!response.success || !response.timeSlots) {
          throw new Error(response.error || 'Failed to fetch available dates');
        }

        // Extract unique dates that have available slots
        const dates = response.timeSlots
          .map(slot => startOfDay(slot.startTime))
          .filter((date, index, self) => 
            index === self.findIndex(d => d.getTime() === date.getTime())
          );

        setAvailableDates(dates);
      } catch (err) {
        logger.error('Error fetching available dates', { error: err });
        setError(err instanceof Error ? err.message : 'Failed to load available dates');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvailableDates();
  }, [eventTypeUri]);

  // Fetch time slots for selected date
  useEffect(() => {
    if (!selectedDate) return;

    const fetchTimeSlots = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const startDate = startOfDay(selectedDate);
        const endDate = endOfDay(selectedDate);

        const response = await getCalendlyAvailableTimeSlots(
          eventTypeUri,
          startDate,
          endDate
        );

        if (!response.success || !response.timeSlots) {
          throw new Error(response.error || 'Failed to fetch time slots');
        }

        setAvailableSlots(response.timeSlots);
      } catch (err) {
        logger.error('Error fetching time slots', { error: err });
        setError(err instanceof Error ? err.message : 'Failed to load time slots');
        setAvailableSlots([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTimeSlots();
  }, [selectedDate, eventTypeUri]);

  const timeGroups = React.useMemo(() => {
    const groups = {
      morning: [] as typeof availableSlots,
      afternoon: [] as typeof availableSlots,
      evening: [] as typeof availableSlots
    };

    availableSlots.forEach(slot => {
      const hour = slot.startTime.getHours();
      if (hour < 12) {
        groups.morning.push(slot);
      } else if (hour < 17) {
        groups.afternoon.push(slot);
      } else {
        groups.evening.push(slot);
      }
    });

    return groups;
  }, [availableSlots]);

  return (
    <div className={cn("grid md:grid-cols-2 gap-6", className)}>
      {/* Calendar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Select a Date
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            selected={selectedDate}
            onSelect={setSelectedDate}
            disabled={(date) => {
              // Disable past dates
              if (date < startOfDay(new Date())) return true;
              
              // Disable dates without available slots
              return !availableDates.some(availableDate => 
                startOfDay(availableDate).getTime() === startOfDay(date).getTime()
              );
            }}
            className="rounded-md border"
          />
          
          {sessionType && (
            <div className="mt-4 p-3 bg-muted rounded-md">
              <p className="text-sm font-medium">{sessionType.title}</p>
              <p className="text-sm text-muted-foreground">
                {sessionType.duration} minutes • ${sessionType.price}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Time Slots */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {selectedDate ? `Available Times - ${format(selectedDate, 'MMMM d, yyyy')}` : 'Select a date'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner className="h-8 w-8" />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              <p>{error}</p>
              <Button 
                variant="outline" 
                size="sm"
                className="mt-4"
                onClick={() => setSelectedDate(new Date())}
              >
                Try Again
              </Button>
            </div>
          ) : !selectedDate ? (
            <p className="text-center py-8 text-muted-foreground">
              Please select a date to see available times
            </p>
          ) : availableSlots.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              No available times for this date
            </p>
          ) : (
            <div className="space-y-6">
              {timeGroups.morning.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-3">Morning</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {timeGroups.morning.map((slot, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => onSelectTimeSlot(slot)}
                        className="justify-between"
                      >
                        <span>{format(slot.startTime, 'h:mm a')}</span>
                        {slot.inviteesRemaining < 5 && (
                          <Badge variant="secondary" className="ml-2">
                            {slot.inviteesRemaining} left
                          </Badge>
                        )}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {timeGroups.afternoon.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-3">Afternoon</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {timeGroups.afternoon.map((slot, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => onSelectTimeSlot(slot)}
                        className="justify-between"
                      >
                        <span>{format(slot.startTime, 'h:mm a')}</span>
                        {slot.inviteesRemaining < 5 && (
                          <Badge variant="secondary" className="ml-2">
                            {slot.inviteesRemaining} left
                          </Badge>
                        )}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {timeGroups.evening.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-3">Evening</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {timeGroups.evening.map((slot, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => onSelectTimeSlot(slot)}
                        className="justify-between"
                      >
                        <span>{format(slot.startTime, 'h:mm a')}</span>
                        {slot.inviteesRemaining < 5 && (
                          <Badge variant="secondary" className="ml-2">
                            {slot.inviteesRemaining} left
                          </Badge>
                        )}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
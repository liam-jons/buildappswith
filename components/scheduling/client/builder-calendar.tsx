"use client";

import { useState, useEffect } from 'react';
import { BuilderSchedulingProfile, SessionType, TimeSlot } from '@/lib/scheduling/types';
import { generateAvailableTimeSlots, detectClientTimezone, formatInTimezone } from '@/lib/scheduling/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TimezoneSelector } from '../shared/timezone-selector';
import { format, addDays, subDays, isSameDay, parseISO, startOfDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';

interface BuilderCalendarProps {
  builderProfile: BuilderSchedulingProfile;
  onSelectTimeSlot: (timeSlot: TimeSlot, sessionType: SessionType) => void;
}

export function BuilderCalendar({
  builderProfile,
  onSelectTimeSlot
}: BuilderCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [clientTimezone, setClientTimezone] = useState(detectClientTimezone());
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSessionType, setSelectedSessionType] = useState<SessionType | null>(
    builderProfile.sessionTypes.length > 0 ? builderProfile.sessionTypes[0] : null
  );

  // Generate days for the week view
  const generateWeekDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      days.push(addDays(currentDate, i));
    }
    return days;
  };

  // Update available slots when date or session type changes
  useEffect(() => {
    if (selectedDate && selectedSessionType) {
      const slots = generateAvailableTimeSlots(
        selectedDate,
        builderProfile,
        [], // We'd use actual booked slots here in a real implementation
        clientTimezone
      );
      setAvailableSlots(slots);
    } else {
      setAvailableSlots([]);
    }
  }, [selectedDate, selectedSessionType, clientTimezone, builderProfile]);

  // Get formatted day and date
  const formatDayAndDate = (date: Date) => {
    return {
      day: format(date, 'EEE'),
      date: format(date, 'd')
    };
  };

  // Navigate weeks
  const goToPrevWeek = () => setCurrentDate(subDays(currentDate, 7));
  const goToNextWeek = () => setCurrentDate(addDays(currentDate, 7));

  // Handle day selection
  const selectDay = (date: Date) => {
    setSelectedDate(startOfDay(date));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Card className="w-64">
          <CardContent className="p-4">
            <TimezoneSelector
              value={clientTimezone}
              onChange={setClientTimezone}
              label="Your timezone"
            />
          </CardContent>
        </Card>
        
        <div className="flex flex-col items-end">
          <div className="flex items-center space-x-2 mb-2">
            <Button variant="outline" size="icon" onClick={goToPrevWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span>
              {format(currentDate, 'MMMM d')} - {format(addDays(currentDate, 6), 'MMMM d, yyyy')}
            </span>
            <Button variant="outline" size="icon" onClick={goToNextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Select Session Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {builderProfile.sessionTypes
              .filter(type => type.isActive)
              .map(sessionType => (
                <Button
                  key={sessionType.id}
                  variant={selectedSessionType?.id === sessionType.id ? 'default' : 'outline'}
                  onClick={() => setSelectedSessionType(sessionType)}
                  className="relative"
                >
                  <div
                    className="absolute left-0 top-0 w-1 h-full rounded-l-md"
                    style={{ backgroundColor: sessionType.color }}
                  />
                  <span className="ml-2">{sessionType.title}</span>
                </Button>
              ))}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Select Date & Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2 mb-6">
            {generateWeekDays().map((date, index) => {
              const { day, date: dateNum } = formatDayAndDate(date);
              const isSelected = selectedDate && isSameDay(date, selectedDate);
              
              return (
                <Button
                  key={index}
                  variant={isSelected ? 'default' : 'outline'}
                  className={`flex flex-col items-center py-3 
                    ${isSelected ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
                  onClick={() => selectDay(date)}
                >
                  <span className="text-xs">{day}</span>
                  <span className="text-lg font-bold">{dateNum}</span>
                </Button>
              );
            })}
          </div>
          
          {selectedDate && (
            <div>
              <h3 className="font-medium mb-4">
                Available times for {format(selectedDate, 'EEEE, MMMM d')}
              </h3>
              
              {availableSlots.length === 0 ? (
                <div className="text-center p-8 border border-dashed rounded-md border-muted-foreground/20">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">No available slots for this day</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {availableSlots.map(slot => (
                    <Button
                      key={slot.id}
                      variant="outline"
                      className="hover:bg-accent"
                      onClick={() => selectedSessionType && onSelectTimeSlot(slot, selectedSessionType)}
                    >
                      {formatInTimezone(slot.startTime, 'h:mm a', clientTimezone)}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
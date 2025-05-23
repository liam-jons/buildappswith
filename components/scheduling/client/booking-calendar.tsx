'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { format, addMonths, isAfter, isEqual, parseISO, isSameDay } from 'date-fns';
import { Calendar as CalendarIcon, ChevronRight, CheckCircle2 } from 'lucide-react';
import { TimeSlot, SessionType } from '@/lib/scheduling/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/core/card';
// Using Calendly integration instead of the Calendar component
import { CalendlyEmbed } from '@/components/scheduling/calendly';
import { Button } from '@/components/ui/core/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/core/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/core/tabs';
import { Badge } from '@/components/ui/core/badge';
import { toast } from 'sonner';
import TimeSlotSelector from './time-slot-selector';
import { SessionTypeSelector } from './session-type-selector';
import BookingForm from './booking-form';

interface BookingCalendarProps {
  builderId: string;
}

const BookingCalendar: React.FC<BookingCalendarProps> = ({ builderId }) => {
  const { user, isLoaded } = useUser();
  
  // States for the booking flow
  const [currentStep, setCurrentStep] = useState<'session-type' | 'date-time' | 'booking-details'>('session-type');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [selectedSessionType, setSelectedSessionType] = useState<SessionType | null>(null);
  
  // States for loading data
  const [sessionTypes, setSessionTypes] = useState<SessionType[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingTimeSlots, setIsLoadingTimeSlots] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch session types on component mount
  const fetchSessionTypes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/scheduling/session-types?builderId=${builderId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch session types');
      }
      
      const data = await response.json();
      setSessionTypes(data.sessionTypes);
      
      // If only one session type is available, pre-select it
      if (data.sessionTypes.length === 1) {
        setSelectedSessionType(data.sessionTypes[0]);
        setCurrentStep('date-time');
      }
    } catch (error) {
      console.error('Error fetching session types:', error);
      setError('Failed to load session types. Please try again.');
      toast.error('Failed to load session types');
    } finally {
      setIsLoading(false);
    }
  }, [builderId]);

  useEffect(() => {
    if (isLoaded && user) {
      fetchSessionTypes();
    }
  }, [isLoaded, user, fetchSessionTypes]);

  // Fetch available time slots for a specific date range
  const fetchTimeSlots = useCallback(async (startDate: string, endDate: string) => {
    setIsLoadingTimeSlots(true);
    setError(null);
    try {
      // Include session type ID if selected for correct duration handling
      const sessionTypeParam = selectedSessionType ? `&sessionTypeId=${selectedSessionType.id}` : '';
      
      const response = await fetch(
        `/api/scheduling/time-slots?builderId=${builderId}&startDate=${startDate}&endDate=${endDate}${sessionTypeParam}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch available time slots');
      }
      
      const data = await response.json();
      setTimeSlots(data.timeSlots);
      
      // Create a list of unique dates that have available slots
      const dates = data.timeSlots
        .filter((slot: TimeSlot) => !slot.isBooked)
        .map((slot: TimeSlot) => {
          const date = new Date(slot.startTime);
          return new Date(date.getFullYear(), date.getMonth(), date.getDate());
        });
      
      // Remove duplicates
      const uniqueDates = dates.filter((date: Date, index: number, self: Date[]) =>
        index === self.findIndex((d) => isSameDay(d, date))
      );
      
      setAvailableDates(uniqueDates);
      
      // If a date is selected, filter time slots for that date
      if (selectedDate) {
        // Reset selected time slot when fetching new slots
        setSelectedTimeSlot(null);
      }
    } catch (error) {
      console.error('Error fetching time slots:', error);
      setError('Failed to load available time slots. Please try again.');
      toast.error('Failed to load available time slots');
    } finally {
      setIsLoadingTimeSlots(false);
    }
  }, [builderId, selectedSessionType, selectedDate]);

  // Fetch time slots when the date range or session type changes
  useEffect(() => {
    if (selectedSessionType) {
      const today = new Date();
      const startDate = format(today, 'yyyy-MM-dd');
      const endDate = format(addMonths(today, 2), 'yyyy-MM-dd');
      
      fetchTimeSlots(startDate, endDate);
    }
  }, [selectedSessionType, fetchTimeSlots]);

  // Handle session type selection
  const handleSessionTypeSelect = (sessionType: SessionType) => {
    setSelectedSessionType(sessionType);
    setCurrentStep('date-time');
  };

  // Handle date selection
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setDatePickerOpen(false);
    
    // Clear selected time slot when changing date
    setSelectedTimeSlot(null);
  };

  // Handle time slot selection
  const handleTimeSlotSelect = (timeSlot: TimeSlot) => {
    setSelectedTimeSlot(timeSlot);
    setCurrentStep('booking-details');
  };

  // Handle back button
  const handleBack = () => {
    if (currentStep === 'booking-details') {
      setCurrentStep('date-time');
      setSelectedTimeSlot(null);
    } else if (currentStep === 'date-time') {
      setCurrentStep('session-type');
      setSelectedDate(undefined);
    }
  };

  // Filter time slots for the selected date
  const getTimeSlotsForSelectedDate = () => {
    if (!selectedDate) return [];
    
    return timeSlots.filter((slot: TimeSlot) => {
      const slotDate = new Date(slot.startTime);
      return (
        slotDate.getFullYear() === selectedDate.getFullYear() &&
        slotDate.getMonth() === selectedDate.getMonth() &&
        slotDate.getDate() === selectedDate.getDate() &&
        !slot.isBooked
      );
    });
  };

  // Handle booking completion
  const handleBookingComplete = () => {
    toast.success('Booking completed successfully');
    
    // Reset the form
    setSelectedSessionType(null);
    setSelectedDate(undefined);
    setSelectedTimeSlot(null);
    setCurrentStep('session-type');
    
    // Refresh session types
    fetchSessionTypes();
  };

  // Loading state
  if (isLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="pt-6">
          <div className="flex justify-center items-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Book a Session</CardTitle>
        <CardDescription>
          Schedule a session with the builder at a time that works for you.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep === 'session-type' 
                  ? 'bg-primary text-primary-foreground' 
                  : selectedSessionType 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-400'
              }`}>
                {selectedSessionType ? <CheckCircle2 className="h-5 w-5" /> : '1'}
              </div>
              <span className="text-xs mt-1">Session Type</span>
            </div>
            
            <div className="flex-grow mx-2 h-1 bg-gray-200">
              <div 
                className="h-full bg-primary transition-all" 
                style={{ 
                  width: currentStep === 'session-type' 
                    ? '0%' 
                    : currentStep === 'date-time' 
                      ? '50%' 
                      : '100%' 
                }}
              ></div>
            </div>
            
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep === 'date-time' 
                  ? 'bg-primary text-primary-foreground' 
                  : currentStep === 'booking-details' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-400'
              }`}>
                {currentStep === 'booking-details' ? <CheckCircle2 className="h-5 w-5" /> : '2'}
              </div>
              <span className="text-xs mt-1">Date & Time</span>
            </div>
            
            <div className="flex-grow mx-2 h-1 bg-gray-200">
              <div 
                className="h-full bg-primary transition-all" 
                style={{ 
                  width: currentStep === 'booking-details' ? '100%' : '0%' 
                }}
              ></div>
            </div>
            
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep === 'booking-details' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-gray-100 text-gray-400'
              }`}>
                3
              </div>
              <span className="text-xs mt-1">Details</span>
            </div>
          </div>
        </div>
        
        {/* Step 1: Session Type Selection */}
        {currentStep === 'session-type' && (
          <SessionTypeSelector 
            sessionTypes={sessionTypes} 
            onSelect={handleSessionTypeSelect} 
          />
        )}
        
        {/* Step 2: Date and Time Selection */}
        {currentStep === 'date-time' && selectedSessionType && (
          <div className="space-y-6">
            <div>
              <div className="flex items-start mb-4">
                <div className="p-3 bg-primary/10 rounded-md mr-4">
                  <CalendarIcon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">
                    {selectedSessionType.title}
                  </h3>
                  <p className="text-gray-500">
                    {selectedSessionType.durationMinutes} minutes • {selectedSessionType.price} {selectedSessionType.currency}
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setCurrentStep('session-type')}
                  className="ml-auto"
                >
                  Change
                </Button>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-base font-medium mb-3">Select a date</h3>
                  <div className="border rounded-md p-4">
                    <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant={selectedDate ? "outline" : "default"}
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate ? (
                            format(selectedDate, "MMMM d, yyyy")
                          ) : (
                            <span>Select a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={handleDateSelect}
                          disabled={(date) => {
                            // Disable dates without available slots
                            return !availableDates.some(availableDate => 
                              isSameDay(availableDate, date)
                            );
                          }}
                          modifiers={{
                            available: availableDates,
                          }}
                          modifiersClassNames={{
                            available: "bg-primary/10 text-primary",
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    
                    {isLoadingTimeSlots && (
                      <div className="flex justify-center items-center p-4">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      </div>
                    )}
                    
                    {!isLoadingTimeSlots && availableDates.length === 0 && (
                      <div className="text-yellow-600 bg-yellow-50 p-2 rounded mt-3 text-sm">
                        No available dates found. Please try again later.
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-base font-medium mb-3">
                    {selectedDate ? 
                      `Select a time on ${format(selectedDate, "MMMM d, yyyy")}` : 
                      "Select a date to see available times"
                    }
                  </h3>
                  
                  <TimeSlotSelector 
                    timeSlots={getTimeSlotsForSelectedDate()}
                    isLoading={isLoadingTimeSlots}
                    onSelect={handleTimeSlotSelect}
                    selectedDate={selectedDate}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Step 3: Booking Form */}
        {currentStep === 'booking-details' && selectedSessionType && selectedTimeSlot && (
          <BookingForm
            sessionType={selectedSessionType}
            timeSlot={selectedTimeSlot}
            builderId={builderId}
            onComplete={handleBookingComplete}
            onBack={handleBack}
          />
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between border-t pt-4">
        {currentStep !== 'session-type' && (
          <Button variant="outline" onClick={handleBack}>
            Back
          </Button>
        )}
        
        <div className="ml-auto text-sm text-gray-500">
          All times are shown in your local timezone
        </div>
      </CardFooter>
    </Card>
  );
};

export default BookingCalendar;
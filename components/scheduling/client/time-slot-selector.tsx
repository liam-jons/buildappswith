'use client';

import { format, parseISO } from 'date-fns';
import { TimeSlot } from '@/lib/scheduling/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Clock } from 'lucide-react';

interface TimeSlotSelectorProps {
  timeSlots: TimeSlot[];
  isLoading: boolean;
  onSelect: (timeSlot: TimeSlot) => void;
  selectedDate?: Date;
}

const TimeSlotSelector: React.FC<TimeSlotSelectorProps> = ({
  timeSlots,
  isLoading,
  onSelect,
  selectedDate
}) => {
  // Group time slots by morning, afternoon, evening
  const groupedTimeSlots = timeSlots.reduce((groups, slot) => {
    const startTime = parseISO(slot.startTime);
    const hour = startTime.getHours();
    
    if (hour < 12) {
      groups.morning.push(slot);
    } else if (hour < 17) {
      groups.afternoon.push(slot);
    } else {
      groups.evening.push(slot);
    }
    
    return groups;
  }, {
    morning: [] as TimeSlot[],
    afternoon: [] as TimeSlot[],
    evening: [] as TimeSlot[]
  });
  
  // Sort time slots within each group by start time
  const sortTimeSlots = (slots: TimeSlot[]) => {
    return slots.sort((a, b) => {
      return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
    });
  };
  
  if (isLoading) {
    return (
      <div className="border rounded-md p-4 h-[250px] flex justify-center items-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!selectedDate) {
    return (
      <div className="border rounded-md p-4 h-[250px] flex justify-center items-center text-center text-gray-500">
        Please select a date to see available time slots
      </div>
    );
  }
  
  if (timeSlots.length === 0) {
    return (
      <div className="border rounded-md p-4 h-[250px] flex flex-col justify-center items-center text-center text-yellow-600">
        <Clock className="h-8 w-8 mb-2 text-yellow-500" />
        <p>No available time slots for this date</p>
        <p className="text-sm mt-1">Please select another date</p>
      </div>
    );
  }
  
  return (
    <Card className="border rounded-md p-4 max-h-[350px] overflow-y-auto">
      {/* Morning slots */}
      {groupedTimeSlots.morning.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-500 mb-2">Morning</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {sortTimeSlots(groupedTimeSlots.morning).map((slot) => (
              <Button
                key={slot.id}
                variant="outline"
                className="justify-center"
                onClick={() => onSelect(slot)}
              >
                {format(parseISO(slot.startTime), 'h:mm a')}
              </Button>
            ))}
          </div>
        </div>
      )}
      
      {/* Afternoon slots */}
      {groupedTimeSlots.afternoon.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-500 mb-2">Afternoon</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {sortTimeSlots(groupedTimeSlots.afternoon).map((slot) => (
              <Button
                key={slot.id}
                variant="outline"
                className="justify-center"
                onClick={() => onSelect(slot)}
              >
                {format(parseISO(slot.startTime), 'h:mm a')}
              </Button>
            ))}
          </div>
        </div>
      )}
      
      {/* Evening slots */}
      {groupedTimeSlots.evening.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-500 mb-2">Evening</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {sortTimeSlots(groupedTimeSlots.evening).map((slot) => (
              <Button
                key={slot.id}
                variant="outline"
                className="justify-center"
                onClick={() => onSelect(slot)}
              >
                {format(parseISO(slot.startTime), 'h:mm a')}
              </Button>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

export default TimeSlotSelector;
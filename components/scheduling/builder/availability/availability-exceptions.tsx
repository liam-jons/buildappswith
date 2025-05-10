'use client';

import { useState, useEffect, useCallback } from 'react';
import { PlusCircle, Calendar, Save, Trash2, Plus, X } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { format, addMonths, parseISO } from 'date-fns';
import { AvailabilityException, TimeSlot } from '@/lib/scheduling/types';
import { Button } from '@/components/ui/core/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/core/card';
import { Input } from '@/components/ui/core/input';
import { Label } from '@/components/ui/core/label';
import { Switch } from '@/components/ui/core/switch';
import { Calendar as CalendarComponent } from '@/components/ui/core/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/core/popover';
import { toast } from 'sonner';

interface AvailabilityExceptionsProps {
  builderId: string;
}

const AvailabilityExceptions: React.FC<AvailabilityExceptionsProps> = ({ builderId }) => {
  const { user, isLoaded } = useUser();
  const [exceptions, setExceptions] = useState<AvailabilityException[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  
  // State for new exception
  const [newException, setNewException] = useState<Omit<AvailabilityException, 'id'>>({
    builderId,
    date: format(new Date(), 'yyyy-MM-dd'),
    isAvailable: false,
    slots: []
  });
  
  // State for a new slot within the exception
  const [newSlot, setNewSlot] = useState<Omit<TimeSlot, 'id'>>({
    startTime: `${format(new Date(), 'yyyy-MM-dd')}T09:00:00.000Z`,
    endTime: `${format(new Date(), 'yyyy-MM-dd')}T10:00:00.000Z`,
    isBooked: false
  });

  // Fetch availability exceptions on component mount
  const fetchExceptions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    // Get date range for current month and next 3 months
    const startDate = format(new Date(), 'yyyy-MM-dd');
    const endDate = format(addMonths(new Date(), 3), 'yyyy-MM-dd');
    
    try {
      const response = await fetch(
        `/api/scheduling/availability-exceptions?builderId=${builderId}&startDate=${startDate}&endDate=${endDate}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch availability exceptions');
      }
      
      const data = await response.json();
      setExceptions(data.availabilityExceptions);
    } catch (error) {
      console.error('Error fetching availability exceptions:', error);
      setError('Failed to load availability exceptions. Please try again.');
      toast.error('Failed to load availability exceptions');
    } finally {
      setIsLoading(false);
    }
  }, [builderId]);

  useEffect(() => {
    if (isLoaded && user) {
      fetchExceptions();
    }
  }, [isLoaded, user, fetchExceptions]);

  // Handle creating a new availability exception
  const handleCreateException = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Make sure we have slots if isAvailable is true
      if (newException.isAvailable && (!newException.slots || newException.slots.length === 0)) {
        throw new Error('Please add at least one time slot for available days');
      }
      
      const response = await fetch('/api/scheduling/availability-exceptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newException),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create availability exception');
      }
      
      const data = await response.json();
      
      // Update local state with the new exception
      setExceptions(prevExceptions => [...prevExceptions, data.availabilityException]);
      setIsAdding(false);
      
      // Reset form
      setNewException({
        builderId,
        date: format(new Date(), 'yyyy-MM-dd'),
        isAvailable: false,
        slots: []
      });
      
      toast.success('Availability exception created successfully');
    } catch (error: any) {
      console.error('Error creating availability exception:', error);
      setError(error.message || 'Failed to create availability exception');
      toast.error(error.message || 'Failed to create availability exception');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle deleting an availability exception
  const handleDeleteException = async (id: string) => {
    if (!confirm('Are you sure you want to delete this availability exception?')) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/scheduling/availability-exceptions/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete availability exception');
      }
      
      // Update local state by removing the deleted exception
      setExceptions(prevExceptions => prevExceptions.filter(ex => ex.id !== id));
      toast.success('Availability exception deleted successfully');
    } catch (error: any) {
      console.error('Error deleting availability exception:', error);
      setError(error.message || 'Failed to delete availability exception');
      toast.error(error.message || 'Failed to delete availability exception');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle adding a slot to the new exception
  const handleAddSlot = () => {
    // Validate slot times
    const startTime = new Date(newSlot.startTime);
    const endTime = new Date(newSlot.endTime);
    
    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      setError('Invalid time format');
      return;
    }
    
    if (startTime >= endTime) {
      setError('Start time must be before end time');
      return;
    }
    
    // Add the new slot to the exception
    setNewException(prev => ({
      ...prev,
      slots: [...(prev.slots || []), newSlot]
    }));
    
    // Reset new slot form with updated date
    setNewSlot({
      startTime: `${newException.date}T09:00:00.000Z`,
      endTime: `${newException.date}T10:00:00.000Z`,
      isBooked: false
    });
    
    setError(null);
  };

  // Handle removing a slot from the new exception
  const handleRemoveSlot = (index: number) => {
    setNewException(prev => ({
      ...prev,
      slots: prev.slots ? prev.slots.filter((_, i) => i !== index) : []
    }));
  };

  // Handle date selection
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const formattedDate = format(date, 'yyyy-MM-dd');
      setNewException(prev => ({
        ...prev,
        date: formattedDate
      }));
      
      // Update slot dates too
      setNewSlot(prev => ({
        ...prev,
        startTime: `${formattedDate}T09:00:00.000Z`,
        endTime: `${formattedDate}T10:00:00.000Z`,
      }));
      
      setDatePickerOpen(false);
    }
  };

  if (!isLoaded) {
    return <div>Loading user information...</div>;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Availability Exceptions</CardTitle>
        <CardDescription>
          Set specific days off or special availability that overrides your weekly schedule.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        {isLoading && !isAdding ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Display existing exceptions */}
            {exceptions.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                No availability exceptions set. Add days off or special availability.
              </div>
            ) : (
              <div className="space-y-4">
                {exceptions.map(exception => (
                  <div 
                    key={exception.id}
                    className="border rounded-md p-4 relative"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">
                          {format(new Date(exception.date), 'MMMM d, yyyy')}
                          {exception.isAvailable ? (
                            <span className="ml-2 text-sm bg-green-100 text-green-800 px-2 py-0.5 rounded">
                              Special Hours
                            </span>
                          ) : (
                            <span className="ml-2 text-sm bg-red-100 text-red-800 px-2 py-0.5 rounded">
                              Day Off
                            </span>
                          )}
                        </h3>
                        
                        {exception.isAvailable && exception.slots && (
                          <div className="mt-2 space-y-1">
                            <p className="text-sm text-gray-500">Available time slots:</p>
                            {exception.slots.map((slot, index) => (
                              <div key={index} className="text-sm pl-2 border-l-2 border-green-300">
                                {format(parseISO(slot.startTime), 'h:mm a')} - {format(parseISO(slot.endTime), 'h:mm a')}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteException(exception.id)}
                        aria-label={`Delete exception for ${exception.date}`}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Form to add a new exception */}
            {isAdding ? (
              <div className="border rounded-md p-4 mt-4">
                <h3 className="text-lg font-medium mb-4">Add New Exception</h3>
                
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="date">Date</Label>
                    <div className="flex">
                      <div className="relative flex-grow">
                        <Input
                          id="date"
                          type="text"
                          readOnly
                          value={format(new Date(newException.date), 'MMMM d, yyyy')}
                          className="pr-10"
                        />
                        <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full"
                              aria-label="Select date"
                            >
                              <Calendar className="h-4 w-4" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="end">
                            <CalendarComponent
                              mode="single"
                              selected={new Date(newException.date)}
                              onSelect={handleDateSelect}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isAvailable"
                      checked={newException.isAvailable}
                      onCheckedChange={(checked) => {
                        setNewException(prev => ({
                          ...prev,
                          isAvailable: checked,
                          // Clear slots when switching to unavailable
                          slots: checked ? prev.slots : []
                        }));
                      }}
                    />
                    <Label htmlFor="isAvailable">
                      {newException.isAvailable ? 'Available (special hours)' : 'Unavailable (day off)'}
                    </Label>
                  </div>
                  
                  {/* Slot management UI (only show when isAvailable is true) */}
                  {newException.isAvailable && (
                    <div className="border-t pt-4 mt-2">
                      <h4 className="font-medium mb-2">Time Slots</h4>
                      
                      {/* Display slots */}
                      {newException.slots && newException.slots.length > 0 ? (
                        <div className="space-y-2 mb-4">
                          {newException.slots.map((slot, index) => (
                            <div 
                              key={index}
                              className="flex justify-between items-center bg-gray-50 p-2 rounded"
                            >
                              <span>
                                {format(parseISO(slot.startTime), 'h:mm a')} - {format(parseISO(slot.endTime), 'h:mm a')}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveSlot(index)}
                                aria-label="Remove time slot"
                              >
                                <X className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-yellow-600 bg-yellow-50 p-2 rounded mb-4">
                          Please add at least one time slot
                        </div>
                      )}
                      
                      {/* Add new slot form */}
                      <div className="grid grid-cols-2 gap-4 mb-2">
                        <div className="grid gap-2">
                          <Label htmlFor="startTime">Start Time</Label>
                          <Input
                            id="startTime"
                            type="time"
                            value={format(parseISO(newSlot.startTime), 'HH:mm')}
                            onChange={(e) => {
                              const [hours, minutes] = e.target.value.split(':').map(Number);
                              const date = new Date(newException.date);
                              date.setHours(hours, minutes, 0, 0);
                              setNewSlot(prev => ({
                                ...prev,
                                startTime: date.toISOString()
                              }));
                            }}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="endTime">End Time</Label>
                          <Input
                            id="endTime"
                            type="time"
                            value={format(parseISO(newSlot.endTime), 'HH:mm')}
                            onChange={(e) => {
                              const [hours, minutes] = e.target.value.split(':').map(Number);
                              const date = new Date(newException.date);
                              date.setHours(hours, minutes, 0, 0);
                              setNewSlot(prev => ({
                                ...prev,
                                endTime: date.toISOString()
                              }));
                            }}
                          />
                        </div>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={handleAddSlot}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Time Slot
                      </Button>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end space-x-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsAdding(false);
                      setNewException({
                        builderId,
                        date: format(new Date(), 'yyyy-MM-dd'),
                        isAvailable: false,
                        slots: []
                      });
                    }}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateException}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() => setIsAdding(true)}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Exception
              </Button>
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between border-t pt-4">
        <p className="text-sm text-gray-500">
          Add days off or special hours that override your regular weekly schedule.
        </p>
      </CardFooter>
    </Card>
  );
};

export default AvailabilityExceptions;
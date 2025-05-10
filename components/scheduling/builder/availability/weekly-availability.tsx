'use client';

import { useState, useEffect, useCallback } from 'react';
import { PlusCircle, XCircle, Save, Plus, Trash2 } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { AvailabilityRule } from '@/lib/scheduling/types';
import { Button } from '@/components/ui/core/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/core/card';
import { Input } from '@/components/ui/core/input';
import { Label } from '@/components/ui/core/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/core/select';
import { Switch } from '@/components/ui/core/switch';
import { toast } from 'sonner';

interface WeeklyAvailabilityProps {
  builderId: string;
}

const WeeklyAvailability: React.FC<WeeklyAvailabilityProps> = ({ builderId }) => {
  const { user, isLoaded } = useUser();
  const [rules, setRules] = useState<AvailabilityRule[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newRule, setNewRule] = useState<Omit<AvailabilityRule, 'id'>>({
    builderId,
    dayOfWeek: 1, // Monday default
    startTime: '09:00',
    endTime: '17:00',
    isRecurring: true
  });

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  // Fetch availability rules on component mount
  const fetchRules = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/scheduling/availability-rules?builderId=${builderId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch availability rules');
      }
      const data = await response.json();
      setRules(data.availabilityRules);
    } catch (error) {
      console.error('Error fetching availability rules:', error);
      setError('Failed to load availability rules. Please try again.');
      toast.error('Failed to load availability rules');
    } finally {
      setIsLoading(false);
    }
  }, [builderId]);

  useEffect(() => {
    if (isLoaded && user) {
      fetchRules();
    }
  }, [isLoaded, user, fetchRules]);

  // Group rules by day of week for better organization
  const getRulesByDay = () => {
    const rulesByDay: { [key: number]: AvailabilityRule[] } = {};
    for (let i = 0; i < 7; i++) {
      rulesByDay[i] = rules.filter(rule => rule.dayOfWeek === i);
    }
    return rulesByDay;
  };

  // Handle creating a new availability rule
  const handleCreateRule = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Validate time format
      if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(newRule.startTime) || 
          !/^([01]\d|2[0-3]):([0-5]\d)$/.test(newRule.endTime)) {
        throw new Error('Time must be in 24-hour format (HH:MM)');
      }
      
      // Validate that startTime is before endTime
      if (newRule.startTime >= newRule.endTime) {
        throw new Error('Start time must be before end time');
      }
      
      const response = await fetch('/api/scheduling/availability-rules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newRule),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create availability rule');
      }
      
      const data = await response.json();
      
      // Update local state with the new rule
      setRules(prevRules => [...prevRules, data.availabilityRule]);
      setIsAdding(false);
      setNewRule({
        builderId,
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '17:00',
        isRecurring: true
      });
      
      toast.success('Availability rule created successfully');
    } catch (error: any) {
      console.error('Error creating availability rule:', error);
      setError(error.message || 'Failed to create availability rule');
      toast.error(error.message || 'Failed to create availability rule');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle deleting an availability rule
  const handleDeleteRule = async (id: string) => {
    if (!confirm('Are you sure you want to delete this availability rule?')) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/scheduling/availability-rules/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete availability rule');
      }
      
      // Update local state by removing the deleted rule
      setRules(prevRules => prevRules.filter(rule => rule.id !== id));
      toast.success('Availability rule deleted successfully');
    } catch (error: any) {
      console.error('Error deleting availability rule:', error);
      setError(error.message || 'Failed to delete availability rule');
      toast.error(error.message || 'Failed to delete availability rule');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input changes for the new rule form
  const handleInputChange = (field: keyof Omit<AvailabilityRule, 'id'>, value: any) => {
    setNewRule(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  if (!isLoaded) {
    return <div>Loading user information...</div>;
  }

  const rulesByDay = getRulesByDay();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Weekly Availability</CardTitle>
        <CardDescription>
          Set your recurring weekly availability for client bookings.
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
            {/* Display rules grouped by day */}
            {Object.entries(rulesByDay).map(([dayIndex, dayRules]) => {
              const day = parseInt(dayIndex);
              return (
                <div key={day} className="border-b pb-4 last:border-b-0">
                  <h3 className="text-lg font-medium mb-2">{dayNames[day]}</h3>
                  
                  {dayRules.length === 0 ? (
                    <p className="text-gray-500 italic">No availability set</p>
                  ) : (
                    <div className="space-y-2">
                      {dayRules.map(rule => (
                        <div 
                          key={rule.id} 
                          className="flex items-center justify-between bg-gray-50 p-3 rounded-md"
                        >
                          <div>
                            <span className="font-medium">
                              {rule.startTime} - {rule.endTime}
                            </span>
                            {!rule.isRecurring && (
                              <span className="ml-2 text-sm bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                                Non-recurring
                              </span>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteRule(rule.id)}
                            aria-label={`Delete availability rule for ${dayNames[rule.dayOfWeek]}`}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            
            {/* Form to add a new rule */}
            {isAdding ? (
              <div className="border rounded-md p-4 mt-4">
                <h3 className="text-lg font-medium mb-4">Add New Availability</h3>
                
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="dayOfWeek">Day of the Week</Label>
                    <Select 
                      value={newRule.dayOfWeek.toString()} 
                      onValueChange={(value) => handleInputChange('dayOfWeek', parseInt(value))}
                    >
                      <SelectTrigger id="dayOfWeek">
                        <SelectValue placeholder="Select a day" />
                      </SelectTrigger>
                      <SelectContent>
                        {dayNames.map((day, index) => (
                          <SelectItem key={index} value={index.toString()}>
                            {day}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="startTime">Start Time</Label>
                      <Input
                        id="startTime"
                        type="time"
                        value={newRule.startTime}
                        onChange={(e) => handleInputChange('startTime', e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="endTime">End Time</Label>
                      <Input
                        id="endTime"
                        type="time"
                        value={newRule.endTime}
                        onChange={(e) => handleInputChange('endTime', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isRecurring"
                      checked={newRule.isRecurring}
                      onCheckedChange={(checked) => handleInputChange('isRecurring', checked)}
                    />
                    <Label htmlFor="isRecurring">Recurring weekly</Label>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsAdding(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateRule}
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
                Add Availability
              </Button>
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between border-t pt-4">
        <p className="text-sm text-gray-500">
          Set your weekly recurring availability to allow clients to book sessions.
        </p>
      </CardFooter>
    </Card>
  );
};

export default WeeklyAvailability;
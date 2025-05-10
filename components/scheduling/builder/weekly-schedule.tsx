"use client";

import { useState, useEffect, useCallback } from 'react';
import { AvailabilityRule } from '@/lib/scheduling/types';
import { Card, CardContent } from '@/components/ui/core/card';
import { Button } from '@/components/ui/core/button';
import { Input } from '@/components/ui/core/input';
import { Label } from '@/components/ui/core/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/core/tabs';
import { X, Plus, Clock, AlertTriangle } from 'lucide-react';
import { getAvailabilityRules, createAvailabilityRule, deleteAvailabilityRule } from '@/lib/scheduling/actions';
import { toast } from 'sonner';

interface WeeklyScheduleProps {
  availabilityRules: AvailabilityRule[];
  builderId: string;
  onUpdate: (rules: AvailabilityRule[]) => void;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

export function WeeklySchedule({
  availabilityRules,
  builderId,
  onUpdate
}: WeeklyScheduleProps) {
  const [rules, setRules] = useState<AvailabilityRule[]>(availabilityRules);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState<Record<string, boolean>>({});
  const [usingMockData, setUsingMockData] = useState(false);
  
  // Fetch rules from API if needed
  const fetchRules = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const { rules: fetchedRules, warning } = await getAvailabilityRules(builderId);
      setRules(fetchedRules);
      setUsingMockData(!!warning);
      onUpdate(fetchedRules);
    } catch (error) {
      console.error('Error fetching availability rules:', error);
      toast.error('Failed to load availability rules');
    } finally {
      setIsLoading(false);
    }
  }, [builderId, onUpdate]);

  // Fetch rules if none provided
  useEffect(() => {
    if (availabilityRules.length === 0) {
      fetchRules();
    }
  }, [builderId, availabilityRules.length, fetchRules]);

  const getRulesByDay = (dayOfWeek: number) => {
    return rules.filter(rule => rule.dayOfWeek === dayOfWeek);
  };

  const addRule = async (dayOfWeek: number) => {
    const newRule: Omit<AvailabilityRule, 'id'> = {
      builderId,
      dayOfWeek: dayOfWeek as 0 | 1 | 2 | 3 | 4 | 5 | 6,
      startTime: '09:00',
      endTime: '17:00',
      isRecurring: true
    };
    
    try {
      const { rule: createdRule, warning } = await createAvailabilityRule(newRule);
      setUsingMockData(!!warning);
      
      const updatedRules = [...rules, createdRule];
      setRules(updatedRules);
      onUpdate(updatedRules);
      
      toast.success('Time slot added');
    } catch (error) {
      console.error('Error adding availability rule:', error);
      toast.error('Failed to add time slot');
    }
  };

  const updateRule = (ruleId: string, updates: Partial<AvailabilityRule>) => {
    // For now we'll handle this locally, in a full implementation
    // we would call the API to update the rule
    const updatedRules = rules.map(rule => 
      rule.id === ruleId 
        ? { ...rule, ...updates } 
        : rule
    );
    
    setRules(updatedRules);
    onUpdate(updatedRules);
  };

  const deleteRule = async (ruleId: string) => {
    setIsUpdating(prev => ({ ...prev, [ruleId]: true }));
    
    try {
      await deleteAvailabilityRule(ruleId);
      
      const updatedRules = rules.filter(rule => rule.id !== ruleId);
      setRules(updatedRules);
      onUpdate(updatedRules);
      
      toast.success('Time slot removed');
    } catch (error) {
      console.error('Error deleting availability rule:', error);
      toast.error('Failed to remove time slot');
    } finally {
      setIsUpdating(prev => ({ ...prev, [ruleId]: false }));
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6 flex justify-center">
          <div className="animate-pulse space-y-4 w-full">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-10 bg-muted rounded w-full"></div>
            <div className="h-32 bg-muted rounded w-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Weekly Schedule</h3>
          
          {usingMockData && (
            <div className="text-sm text-yellow-600 dark:text-yellow-400 flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4" />
              <span>Using demo data</span>
            </div>
          )}
        </div>
        
        <p className="text-muted-foreground mb-4">
          Set your regular weekly availability. Clients will be able to book sessions during these times.
        </p>
        
        <Tabs defaultValue="1" className="w-full">
          <TabsList className="grid grid-cols-7 mb-4">
            {DAYS_OF_WEEK.map(day => (
              <TabsTrigger key={day.value} value={day.value.toString()}>
                {day.label.substring(0, 3)}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {DAYS_OF_WEEK.map(day => (
            <TabsContent key={day.value} value={day.value.toString()} className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-medium">{day.label}</h4>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => addRule(day.value)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Time Slot
                </Button>
              </div>
              
              {getRulesByDay(day.value).length === 0 ? (
                <div className="text-center p-8 border border-dashed rounded-md border-muted-foreground/20">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">No availability set for {day.label}</p>
                  <Button 
                    size="sm" 
                    variant="link" 
                    onClick={() => addRule(day.value)}
                  >
                    Add availability
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {getRulesByDay(day.value).map(rule => (
                    <div 
                      key={rule.id} 
                      className="flex items-center gap-4 p-3 border rounded-md group hover:bg-accent"
                    >
                      <div className="grid grid-cols-2 gap-4 flex-1">
                        <div>
                          <Label htmlFor={`${rule.id}-start`} className="text-xs">Start Time</Label>
                          <Input
                            id={`${rule.id}-start`}
                            type="time"
                            value={rule.startTime}
                            onChange={(e) => updateRule(rule.id, { startTime: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`${rule.id}-end`} className="text-xs">End Time</Label>
                          <Input
                            id={`${rule.id}-end`}
                            type="time"
                            value={rule.endTime}
                            onChange={(e) => updateRule(rule.id, { endTime: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                      </div>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => deleteRule(rule.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        disabled={isUpdating[rule.id]}
                      >
                        {isUpdating[rule.id] ? (
                          <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <X className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
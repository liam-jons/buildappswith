"use client";

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { SessionType } from '@/lib/scheduling/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { X, Plus, Clock, DollarSign, AlertTriangle, Loader2 } from 'lucide-react';
import { TextShimmer } from '@/components/magicui/text-shimmer';
import { getSessionTypes, createSessionType, deleteSessionType, updateSessionType } from '@/lib/api-client/scheduling';
import { toast } from 'sonner';

interface SessionTypeEditorProps {
  sessionTypes: SessionType[];
  builderId: string;
  onUpdate: (sessionTypes: SessionType[]) => void;
}

// Array of predefined colors for session types
const SESSION_COLORS = [
  '#4CAF50', // Green
  '#2196F3', // Blue
  '#9C27B0', // Purple
  '#FF9800', // Orange
  '#F44336', // Red
  '#607D8B', // Blue Grey
  '#009688', // Teal
  '#795548', // Brown
];

// Currency options with proper localization
const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - British Pound' },
];

export function SessionTypeEditor({
  sessionTypes: initialSessionTypes,
  builderId,
  onUpdate
}: SessionTypeEditorProps) {
  const [types, setTypes] = useState<SessionType[]>(initialSessionTypes);
  const [editingType, setEditingType] = useState<SessionType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState<Record<string, boolean>>({});
  const [usingMockData, setUsingMockData] = useState(false);
  const { user, isLoaded: isUserLoaded } = useUser();

  // Fetch session types from API if needed
  const fetchSessionTypes = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const { sessionTypes: fetchedTypes, warning } = await getSessionTypes(builderId);
      setTypes(fetchedTypes);
      setUsingMockData(!!warning);
      onUpdate(fetchedTypes);
    } catch (error) {
      console.error('Error fetching session types:', error);
      toast.error('Failed to load session types');
    } finally {
      setIsLoading(false);
    }
  }, [builderId, onUpdate]);

  useEffect(() => {
    if (initialSessionTypes.length === 0 && isUserLoaded) {
      fetchSessionTypes();
    }
  }, [initialSessionTypes.length, fetchSessionTypes, isUserLoaded]);

  // Update types when prop changes
  useEffect(() => {
    if (initialSessionTypes.length > 0) {
      setTypes(initialSessionTypes);
    }
  }, [initialSessionTypes]);

  const addSessionType = async () => {
    // Create a new session type with default values
    const newSessionType: Omit<SessionType, 'id'> = {
      builderId,
      title: 'New Session Type',
      description: 'Describe what clients can expect in this session.',
      durationMinutes: 60,
      price: 100,
      currency: 'USD',
      isActive: true,
      color: SESSION_COLORS[types.length % SESSION_COLORS.length]
    };
    
    try {
      const { sessionType: createdType, warning } = await createSessionType(newSessionType);
      setUsingMockData(!!warning);
      
      const updatedTypes = [...types, createdType];
      setTypes(updatedTypes);
      onUpdate(updatedTypes);
      setEditingType(createdType);
      
      toast.success('Session type created');
    } catch (error) {
      console.error('Error creating session type:', error);
      toast.error('Failed to create session type');
    }
  };

  const updateSessionTypeLocal = async (typeId: string, updates: Partial<SessionType>) => {
    setIsUpdating(prev => ({ ...prev, [typeId]: true }));
    
    try {
      // First, update locally for immediate UI feedback
      const updatedTypes = types.map(type => 
        type.id === typeId 
          ? { ...type, ...updates } 
          : type
      );
      
      setTypes(updatedTypes);
      
      // Then update on the server
      const { sessionType: updatedType, warning } = await updateSessionType(typeId, updates);
      setUsingMockData(!!warning);
      
      // Update with the server response if needed
      const finalUpdatedTypes = updatedTypes.map(type => 
        type.id === typeId ? updatedType : type
      );
      
      setTypes(finalUpdatedTypes);
      onUpdate(finalUpdatedTypes);
      
      // Update editing type if it's currently being edited
      if (editingType && editingType.id === typeId) {
        setEditingType(updatedType);
      }
    } catch (error) {
      console.error('Error updating session type:', error);
      toast.error('Failed to update session type');
      
      // Revert the local update on error
      fetchSessionTypes();
    } finally {
      setIsUpdating(prev => ({ ...prev, [typeId]: false }));
    }
  };

  const deleteSessionTypeHandler = async (typeId: string) => {
    setIsUpdating(prev => ({ ...prev, [typeId]: true }));
    
    try {
      await deleteSessionType(typeId);
      
      const updatedTypes = types.filter(type => type.id !== typeId);
      setTypes(updatedTypes);
      onUpdate(updatedTypes);
      
      // Clear editing type if it was being edited
      if (editingType && editingType.id === typeId) {
        setEditingType(null);
      }
      
      toast.success('Session type deleted');
    } catch (error) {
      console.error('Error deleting session type:', error);
      toast.error('Failed to delete session type');
    } finally {
      setIsUpdating(prev => ({ ...prev, [typeId]: false }));
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6 flex justify-center">
          <div className="flex flex-col items-center gap-4 py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading session types...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Authorization check - ensure user has permission to edit
  const isAuthorized = user?.id === builderId || user?.publicMetadata?.roles?.includes('ADMIN');

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <TextShimmer className="text-xl font-semibold">Session Types</TextShimmer>
            <p className="text-muted-foreground">
              Configure the different types of sessions clients can book with you
            </p>
          </div>
          <div className="flex items-center gap-2">
            {usingMockData && (
              <div className="text-sm text-yellow-600 dark:text-yellow-400 flex items-center gap-1.5" aria-live="polite">
                <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                <span>Using demo data</span>
              </div>
            )}
            <Button 
              onClick={addSessionType} 
              disabled={!isAuthorized}
              aria-label="Add new session type"
            >
              <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
              Add Session Type
            </Button>
          </div>
        </div>
        
        {types.length === 0 ? (
          <div className="text-center p-8 border border-dashed rounded-md border-muted-foreground/20 my-4">
            <Clock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" aria-hidden="true" />
            <p className="text-muted-foreground">No session types created yet</p>
            <Button 
              size="sm" 
              variant="link" 
              onClick={addSessionType}
              disabled={!isAuthorized}
            >
              Create your first session type
            </Button>
          </div>
        ) : (
          <div className="space-y-4 mt-6">
            {types.map((type) => {
              const isUpdatingThisType = isUpdating[type.id] || false;
              return (
                <div 
                  key={type.id} 
                  className={`border rounded-md p-4 transition-all ${
                    editingType?.id === type.id ? 'ring-2 ring-primary' : 'hover:bg-accent/50'
                  }`}
                >
                  <div className="flex justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: type.color }}
                        aria-hidden="true"
                      />
                      <h4 className="font-medium">{type.title}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={type.isActive} 
                        onCheckedChange={(checked) => updateSessionTypeLocal(type.id, { isActive: checked })}
                        id={`active-${type.id}`}
                        disabled={isUpdatingThisType || !isAuthorized}
                        aria-label={`Set session type ${type.isActive ? 'inactive' : 'active'}`}
                      />
                      <Label htmlFor={`active-${type.id}`} className="text-sm cursor-pointer">
                        {type.isActive ? 'Active' : 'Inactive'}
                      </Label>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => editingType?.id === type.id 
                          ? setEditingType(null) 
                          : setEditingType(type)
                        }
                        disabled={isUpdatingThisType || !isAuthorized}
                        aria-expanded={editingType?.id === type.id}
                        aria-controls={`edit-form-${type.id}`}
                      >
                        {editingType?.id === type.id ? 'Close' : 'Edit'}
                      </Button>
                      
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteSessionTypeHandler(type.id)}
                        disabled={isUpdatingThisType || !isAuthorized}
                        aria-label={`Delete ${type.title}`}
                      >
                        {isUpdatingThisType ? (
                          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                        ) : (
                          <X className="h-4 w-4" aria-hidden="true" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" aria-hidden="true" />
                      <span>{type.durationMinutes} minutes</span>
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-1" aria-hidden="true" />
                      <span>{type.price} {type.currency}</span>
                    </div>
                  </div>
                  
                  {editingType?.id === type.id && (
                    <div 
                      id={`edit-form-${type.id}`} 
                      className="mt-4 space-y-4 border-t pt-4"
                    >
                      <div>
                        <Label htmlFor={`title-${type.id}`}>Session Title</Label>
                        <Input
                          id={`title-${type.id}`}
                          value={type.title}
                          onChange={(e) => updateSessionTypeLocal(type.id, { title: e.target.value })}
                          className="mt-1"
                          disabled={isUpdatingThisType}
                          aria-describedby={`title-help-${type.id}`}
                        />
                        <p id={`title-help-${type.id}`} className="text-xs text-muted-foreground mt-1">
                          What clients will see when booking this session type
                        </p>
                      </div>
                      
                      <div>
                        <Label htmlFor={`description-${type.id}`}>Description</Label>
                        <Textarea
                          id={`description-${type.id}`}
                          value={type.description}
                          onChange={(e) => updateSessionTypeLocal(type.id, { description: e.target.value })}
                          className="mt-1"
                          rows={3}
                          disabled={isUpdatingThisType}
                          aria-describedby={`description-help-${type.id}`}
                        />
                        <p id={`description-help-${type.id}`} className="text-xs text-muted-foreground mt-1">
                          Explain what clients can expect during this session
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`duration-${type.id}`}>Duration (minutes)</Label>
                          <Input
                            id={`duration-${type.id}`}
                            type="number"
                            value={type.durationMinutes}
                            onChange={(e) => updateSessionTypeLocal(type.id, { 
                              durationMinutes: parseInt(e.target.value) 
                            })}
                            className="mt-1"
                            min={15}
                            step={15}
                            disabled={isUpdatingThisType}
                            aria-describedby={`duration-help-${type.id}`}
                          />
                          <p id={`duration-help-${type.id}`} className="text-xs text-muted-foreground mt-1">
                            Length of session in 15-minute increments
                          </p>
                        </div>
                        
                        <div>
                          <Label htmlFor={`price-${type.id}`}>Price</Label>
                          <div className="flex mt-1">
                            <Input
                              id={`price-${type.id}`}
                              type="number"
                              value={type.price}
                              onChange={(e) => updateSessionTypeLocal(type.id, { 
                                price: parseFloat(e.target.value) 
                              })}
                              className="rounded-r-none"
                              min={0}
                              step={1}
                              disabled={isUpdatingThisType}
                              aria-label="Price amount"
                            />
                            <select
                              value={type.currency}
                              onChange={(e) => updateSessionTypeLocal(type.id, { 
                                currency: e.target.value 
                              })}
                              className="rounded-l-none border border-input bg-background px-3"
                              disabled={isUpdatingThisType}
                              aria-label="Currency"
                            >
                              {CURRENCY_OPTIONS.map(option => (
                                <option key={option.value} value={option.value}>
                                  {option.value}
                                </option>
                              ))}
                            </select>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Amount clients will pay per session
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <Label id={`color-label-${type.id}`}>Color</Label>
                        <div 
                          className="flex gap-2 mt-1"
                          role="radiogroup"
                          aria-labelledby={`color-label-${type.id}`}
                        >
                          {SESSION_COLORS.map((color) => (
                            <button
                              key={color}
                              type="button"
                              className={`w-6 h-6 rounded-full cursor-pointer ${
                                type.color === color ? 'ring-2 ring-primary ring-offset-2' : ''
                              }`}
                              style={{ backgroundColor: color }}
                              onClick={() => updateSessionTypeLocal(type.id, { color })}
                              aria-label={`Select color ${color}`}
                              aria-pressed={type.color === color}
                              disabled={isUpdatingThisType}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Used to identify this session type in the calendar
                        </p>
                      </div>
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
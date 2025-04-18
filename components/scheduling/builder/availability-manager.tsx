"use client";

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { BorderBeam } from "@/components/magicui/border-beam";
import { TextShimmer } from "@/components/magicui/text-shimmer";
import { useReducedMotion } from "framer-motion";
import { BuilderSchedulingProfile } from '@/lib/scheduling/types';
import { mockBuilderSchedulingProfile } from '@/lib/scheduling/mock-data';
import { getBuilderProfile } from '@/lib/api-client/scheduling';
import { WeeklySchedule } from './weekly-schedule';
import { SessionTypeEditor } from './session-type-editor';
import { TimezoneSelector } from '../shared/timezone-selector';
import { toast } from 'sonner';
import { AlertTriangle } from 'lucide-react';

interface AvailabilityManagerProps {
  builderId: string;
  initialProfile?: BuilderSchedulingProfile;
}

export function AvailabilityManager({ 
  builderId,
  initialProfile
}: AvailabilityManagerProps) {
  const [profile, setProfile] = useState<BuilderSchedulingProfile | null>(initialProfile || null);
  const [isLoading, setIsLoading] = useState(!initialProfile);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const [usingMockData, setUsingMockData] = useState(false);

  // Fetch profile data if not provided
  useEffect(() => {
    if (!initialProfile) {
      fetchProfile();
    }
  }, [builderId, initialProfile]);

  // Fetch profile data from API
  const fetchProfile = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { profile, warning } = await getBuilderProfile(builderId);
      setProfile(profile);
      setUsingMockData(!!warning);
    } catch (err: any) {
      console.error('Error fetching builder profile:', err);
      setError('Failed to load profile. Please try again.');
      // Fallback to mock data if API fails completely
      setProfile({
        ...mockBuilderSchedulingProfile,
        builderId
      });
      setUsingMockData(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle save profile changes
  const saveChanges = async () => {
    if (!profile) return;
    
    setIsSaving(true);
    
    try {
      // In a real implementation, this would call an API endpoint
      // to persist the changes to the database
      console.log("Saving profile changes:", profile);
      
      // Simulate API call for now - this would be replaced with
      // actual API calls to update the profile components
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Your availability settings have been saved");
    } catch (err) {
      console.error('Error saving profile:', err);
      toast.error("Failed to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Update specific parts of the profile
  const updateProfile = (updates: Partial<BuilderSchedulingProfile>) => {
    setProfile(prev => prev ? {
      ...prev,
      ...updates
    } : null);
  };

  // Show loading state
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Loading Availability Settings...</CardTitle>
          <CardDescription>Please wait while we fetch your scheduling profile</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <div className="animate-pulse space-y-4 w-full">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-10 bg-muted rounded w-full"></div>
            <div className="h-32 bg-muted rounded w-full"></div>
            <div className="h-32 bg-muted rounded w-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show error state with retry option
  if (error && !profile) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-destructive">Error Loading Profile</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center py-8">
          <Button onClick={fetchProfile}>Retry</Button>
        </CardContent>
      </Card>
    );
  }

  // Ensure we have a profile to display
  if (!profile) return null;

  return (
    <BorderBeam
      className="relative rounded-lg"
      size={shouldReduceMotion ? "none" : "small"}
      delay={1}
      duration={3}
    >
      <Card className="w-full">
        <CardHeader>
          <CardTitle>
            <TextShimmer>Availability Management</TextShimmer>
          </CardTitle>
          <CardDescription>
            Configure when you&apos;re available for clients to book sessions with you
          </CardDescription>
          
          {usingMockData && (
            <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-md flex items-center gap-2 text-sm">
              <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              <span className="text-yellow-700 dark:text-yellow-300">
                Using demo data. Changes won&apos;t be permanently saved.
              </span>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Switch 
                id="accepting-bookings"
                checked={profile.isAcceptingBookings}
                onCheckedChange={(checked) => updateProfile({ isAcceptingBookings: checked })}
              />
              <Label htmlFor="accepting-bookings">
                <span className="font-medium">
                  {profile.isAcceptingBookings ? 'Accepting Bookings' : 'Not Accepting Bookings'}
                </span>
              </Label>
            </div>
            {!profile.isAcceptingBookings && (
              <p className="text-sm text-muted-foreground">
                Your profile will be visible, but clients cannot book sessions
              </p>
            )}
          </div>
          
          <Tabs defaultValue="schedule" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="schedule">Weekly Schedule</TabsTrigger>
              <TabsTrigger value="sessions">Session Types</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="schedule" className="space-y-4">
              <WeeklySchedule 
                availabilityRules={profile.availabilityRules}
                builderId={builderId}
                onUpdate={(rules) => updateProfile({ availabilityRules: rules })}
              />
            </TabsContent>
            
            <TabsContent value="sessions" className="space-y-4">
              <SessionTypeEditor 
                sessionTypes={profile.sessionTypes}
                builderId={builderId}
                onUpdate={(types) => updateProfile({ sessionTypes: types })}
              />
            </TabsContent>
            
            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">General Settings</h3>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="buffer-time">Buffer Between Sessions (minutes)</Label>
                        <Input
                          id="buffer-time"
                          type="number"
                          value={profile.bufferBetweenSessions}
                          onChange={(e) => updateProfile({ 
                            bufferBetweenSessions: parseInt(e.target.value) 
                          })}
                          className="mt-1"
                          min={0}
                          step={5}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Additional time between consecutive sessions
                        </p>
                      </div>
                      
                      <div>
                        <Label htmlFor="minimum-notice">Minimum Booking Notice (minutes)</Label>
                        <Input
                          id="minimum-notice"
                          type="number"
                          value={profile.minimumNotice}
                          onChange={(e) => updateProfile({ 
                            minimumNotice: parseInt(e.target.value) 
                          })}
                          className="mt-1"
                          min={0}
                          step={15}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          How much advance notice you need before a session
                        </p>
                      </div>
                      
                      <div>
                        <Label htmlFor="max-advance">Maximum Advance Booking (days)</Label>
                        <Input
                          id="max-advance"
                          type="number"
                          value={profile.maximumAdvanceBooking}
                          onChange={(e) => updateProfile({ 
                            maximumAdvanceBooking: parseInt(e.target.value) 
                          })}
                          className="mt-1"
                          min={1}
                          max={365}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          How far in advance clients can book sessions
                        </p>
                      </div>
                      
                      <div>
                        <TimezoneSelector 
                          value={profile.timezone}
                          onChange={(timezone) => updateProfile({ timezone })}
                          label="Your Timezone"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
        
        <CardFooter className="flex justify-end gap-4 pt-4">
          <Button variant="outline" onClick={fetchProfile} disabled={isLoading || isSaving}>
            Cancel
          </Button>
          <Button 
            onClick={saveChanges} 
            disabled={isLoading || isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardFooter>
      </Card>
    </BorderBeam>
  );
}
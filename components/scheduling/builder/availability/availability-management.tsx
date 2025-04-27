'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { Settings, Info } from 'lucide-react';
import { BuilderSchedulingProfile } from '@/lib/scheduling/types';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import WeeklyAvailability from './weekly-availability';
import AvailabilityExceptions from './availability-exceptions';

// Timezone data (simplified list)
const TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
  'Australia/Sydney',
  'Pacific/Auckland',
  'Etc/UTC'
];

interface AvailabilityManagementProps {
  builderId: string;
}

const AvailabilityManagement: React.FC<AvailabilityManagementProps> = ({ builderId }) => {
  const { user, isLoaded } = useUser();
  const [profile, setProfile] = useState<BuilderSchedulingProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  // Settings state
  const [settings, setSettings] = useState({
    timezone: 'Etc/UTC',
    minimumNotice: 60, // 60 minutes notice
    bufferBetweenSessions: 15, // 15 minutes buffer
    maximumAdvanceBooking: 60, // 60 days
    isAcceptingBookings: true
  });

  // Fetch builder scheduling profile
  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/scheduling/builder-settings?builderId=${builderId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch builder scheduling profile');
      }
      
      const data = await response.json();
      setProfile(data.schedulingProfile);
      
      // Update settings state
      setSettings({
        timezone: data.schedulingProfile.timezone,
        minimumNotice: data.schedulingProfile.minimumNotice,
        bufferBetweenSessions: data.schedulingProfile.bufferBetweenSessions,
        maximumAdvanceBooking: data.schedulingProfile.maximumAdvanceBooking,
        isAcceptingBookings: data.schedulingProfile.isAcceptingBookings
      });
    } catch (error) {
      console.error('Error fetching builder scheduling profile:', error);
      setError('Failed to load scheduling profile. Please try again.');
      toast.error('Failed to load scheduling profile');
    } finally {
      setIsLoading(false);
    }
  }, [builderId]);

  useEffect(() => {
    if (isLoaded && user) {
      fetchProfile();
    }
  }, [isLoaded, user, fetchProfile]);

  // Handle saving scheduling settings
  const handleSaveSettings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/scheduling/builder-settings/${builderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update scheduling settings');
      }
      
      const data = await response.json();
      setProfile(data.schedulingProfile);
      setSettingsOpen(false);
      toast.success('Scheduling settings updated successfully');
    } catch (error: any) {
      console.error('Error updating scheduling settings:', error);
      setError(error.message || 'Failed to update scheduling settings');
      toast.error(error.message || 'Failed to update scheduling settings');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle settings input changes
  const handleSettingChange = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  if (!isLoaded) {
    return <div>Loading user information...</div>;
  }

  if (!profile && !isLoading) {
    return <div>No scheduling profile found. Please contact support.</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Availability Management</h1>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="isAcceptingBookings"
              checked={profile?.isAcceptingBookings}
              onCheckedChange={(checked) => {
                handleSettingChange('isAcceptingBookings', checked);
                handleSaveSettings();
              }}
            />
            <Label htmlFor="isAcceptingBookings">
              {profile?.isAcceptingBookings ? 'Accepting Bookings' : 'Not Accepting Bookings'}
            </Label>
          </div>
          
          <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Scheduling Settings</DialogTitle>
                <DialogDescription>
                  Configure your booking preferences and availability settings.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select 
                    value={settings.timezone} 
                    onValueChange={(value) => handleSettingChange('timezone', value)}
                  >
                    <SelectTrigger id="timezone">
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIMEZONES.map(timezone => (
                        <SelectItem key={timezone} value={timezone}>
                          {timezone.replace('_', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="minimumNotice">
                    Minimum Notice (minutes)
                  </Label>
                  <Input
                    id="minimumNotice"
                    type="number"
                    min="0"
                    value={settings.minimumNotice}
                    onChange={(e) => handleSettingChange('minimumNotice', parseInt(e.target.value))}
                  />
                  <p className="text-sm text-gray-500">
                    How much notice you need before a client can book a session.
                  </p>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="bufferBetweenSessions">
                    Buffer Between Sessions (minutes)
                  </Label>
                  <Input
                    id="bufferBetweenSessions"
                    type="number"
                    min="0"
                    value={settings.bufferBetweenSessions}
                    onChange={(e) => handleSettingChange('bufferBetweenSessions', parseInt(e.target.value))}
                  />
                  <p className="text-sm text-gray-500">
                    Time buffer between consecutive sessions.
                  </p>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="maximumAdvanceBooking">
                    Maximum Advance Booking (days)
                  </Label>
                  <Input
                    id="maximumAdvanceBooking"
                    type="number"
                    min="1"
                    value={settings.maximumAdvanceBooking}
                    onChange={(e) => handleSettingChange('maximumAdvanceBooking', parseInt(e.target.value))}
                  />
                  <p className="text-sm text-gray-500">
                    How far in advance clients can book sessions.
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="acceptingBookings"
                    checked={settings.isAcceptingBookings}
                    onCheckedChange={(checked) => handleSettingChange('isAcceptingBookings', checked)}
                  />
                  <Label htmlFor="acceptingBookings">Accepting Bookings</Label>
                </div>
              </div>
              
              <DialogFooter>
                <Button
                  type="submit"
                  onClick={handleSaveSettings}
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {isLoading && !profile ? (
        <div className="flex justify-center items-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <Tabs defaultValue="weekly" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="weekly">Weekly Schedule</TabsTrigger>
            <TabsTrigger value="exceptions">Exceptions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="weekly" className="mt-6">
            <WeeklyAvailability builderId={builderId} />
          </TabsContent>
          
          <TabsContent value="exceptions" className="mt-6">
            <AvailabilityExceptions builderId={builderId} />
          </TabsContent>
        </Tabs>
      )}
      
      {/* Instructions panel */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mt-8">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-blue-800">How Availability Works</h3>
            <ul className="mt-2 space-y-1 text-sm text-blue-700 list-disc pl-4">
              <li>Set your weekly recurring availability for each day of the week</li>
              <li>Add exceptions for specific dates (days off or special hours)</li>
              <li>Exceptions always override your regular weekly schedule</li>
              <li>All times are shown in your selected timezone ({profile?.timezone})</li>
              <li>Clients can only book at least {profile?.minimumNotice} minutes in advance</li>
              <li>Clients can book up to {profile?.maximumAdvanceBooking} days in the future</li>
              <li>Sessions will have a {profile?.bufferBetweenSessions}-minute buffer between them</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityManagement;
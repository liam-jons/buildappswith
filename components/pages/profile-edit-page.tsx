'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/core';
import { FormError } from '@/components/ui/composite';
import { Button } from '@/components/ui/core/button';
import { Input } from '@/components/ui/core/input';
import { Textarea } from '@/components/ui/core/textarea';
import { Label } from '@/components/ui/core/label';
import { useToast } from 'sonner';
import { updateProfile } from '@/lib/profile/actions';
import { logger } from '@/lib/logger';

export default function ProfileEditPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData(event.currentTarget);
      
      const result = await updateProfile(formData);
      
      if (result.error) {
        setError(result.error);
        toast.error('Failed to update profile');
      } else if (result.success) {
        toast.success('Profile updated successfully');
        router.push('/profile');
      }
    } catch (err) {
      logger.error('Error updating profile', { 
        error: err instanceof Error ? err.message : String(err)
      });
      
      setError('An unexpected error occurred. Please try again.');
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="profile-edit-container max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Edit Your Profile</h1>
      
      <Card className="p-6">
        {error && <FormError message={error} className="mb-4" />}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input 
                id="name" 
                name="name" 
                placeholder="Your name"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="title">Professional Title</Label>
              <Input 
                id="title" 
                name="title" 
                placeholder="e.g. Full Stack Developer"
              />
            </div>
            
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea 
                id="bio" 
                name="bio" 
                placeholder="Tell us about yourself"
                rows={5}
              />
            </div>
            
            <div>
              <Label htmlFor="location">Location</Label>
              <Input 
                id="location" 
                name="location" 
                placeholder="City, Country"
              />
            </div>
            
            <div>
              <Label htmlFor="website">Website</Label>
              <Input 
                id="website" 
                name="website" 
                placeholder="https://your-website.com"
                type="url"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancel
            </Button>
            
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
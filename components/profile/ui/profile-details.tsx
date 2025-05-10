'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/core/button';

interface ProfileDetailsProps {
  profile: any; // Type should be properly defined based on your schema
  isEditing: boolean;
  onSave: (updatedProfile: any) => void;
  onCancel: () => void;
}

/**
 * ProfileDetails Component
 * 
 * Displays and allows editing of user profile details
 */
export function ProfileDetails({ profile, isEditing, onSave, onCancel }: ProfileDetailsProps) {
  const [formData, setFormData] = useState({
    name: profile.name || '',
    title: profile.title || '',
    bio: profile.bio || '',
    location: profile.location || '',
    email: profile.email || '',
    // Add other fields as needed
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...profile,
      ...formData
    });
  };
  
  // View mode (not editing)
  if (!isEditing) {
    return (
      <div className="p-6 space-y-4">
        {/* Bio */}
        {profile.bio && (
          <div>
            <h3 className="text-sm font-medium text-gray-500">About</h3>
            <p className="mt-1">{profile.bio}</p>
          </div>
        )}
        
        {/* Location */}
        {profile.location && (
          <div>
            <h3 className="text-sm font-medium text-gray-500">Location</h3>
            <p className="mt-1">{profile.location}</p>
          </div>
        )}
        
        {/* Email (only if public) */}
        {profile.email && profile.isEmailPublic && (
          <div>
            <h3 className="text-sm font-medium text-gray-500">Contact</h3>
            <p className="mt-1">{profile.email}</p>
          </div>
        )}
        
        {/* Other profile details can be added here */}
      </div>
    );
  }
  
  // Edit mode
  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
          required
        />
      </div>
      
      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
        />
      </div>
      
      {/* Bio */}
      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
          Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={4}
          value={formData.bio}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
        />
      </div>
      
      {/* Location */}
      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700">
          Location
        </label>
        <input
          type="text"
          id="location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
        />
      </div>
      
      {/* Actions */}
      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="submit"
        >
          Save Changes
        </Button>
      </div>
    </form>
  );
}

export default ProfileDetails;
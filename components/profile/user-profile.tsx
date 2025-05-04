/**
 * User Profile Component
 * Version: 1.0.0
 * 
 * A client-side component for displaying user profiles with
 * different views based on whether it's the current user.
 * Uses standardized authentication hooks.
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/auth';
import { Button } from '@/components/ui';
import { ProfileHeader } from './ui/profile-header';
import { ProfileDetails } from './ui/profile-details';
import { ValidationTierBadge } from './ui/validation-tier-badge';

interface UserProfileProps {
  profile: any; // Type should be properly defined based on your schema
  isCurrentUser?: boolean;
}

export function UserProfile({ profile, isCurrentUser = false }: UserProfileProps) {
  const router = useRouter();
  const { isSignedIn, hasRole, isBuilder } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  
  // Determine if the user can edit this profile
  const canEdit = isCurrentUser || (isSignedIn && hasRole('ADMIN'));
  
  // Handle edit button click
  const handleEditClick = () => {
    if (canEdit) {
      setIsEditing(true);
    }
  };
  
  // Handle cancel edit
  const handleCancelEdit = () => {
    setIsEditing(false);
  };
  
  // Handle save profile
  const handleSaveProfile = async (updatedProfile: any) => {
    try {
      // Implementation of profile update logic
      // This would call an API to update the profile
      console.log('Updating profile:', updatedProfile);
      
      // Reset editing state
      setIsEditing(false);
      
      // Refresh the page to show updated data
      router.refresh();
    } catch (error) {
      console.error('Error updating profile:', error);
      // Handle error (show error message, etc.)
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Profile Header with Avatar and Name */}
      <ProfileHeader
        name={profile.name}
        imageUrl={profile.imageUrl}
        title={profile.title}
        isEditing={isEditing}
      />
      
      {/* Builder Validation Badge (if applicable) */}
      {isBuilder && (
        <div className="px-6 py-2 border-b">
          <ValidationTierBadge tier={profile.validationTier || 'basic'} />
        </div>
      )}
      
      {/* Profile Action Buttons */}
      {canEdit && !isEditing && (
        <div className="px-6 py-3 bg-gray-50 flex justify-end space-x-3 border-b">
          <Button
            variant="outline"
            onClick={handleEditClick}
            size="sm"
          >
            Edit Profile
          </Button>
          
          {isBuilder && (
            <Button
              variant="outline"
              onClick={() => router.push('/profile/session-types')}
              size="sm"
            >
              Manage Session Types
            </Button>
          )}
        </div>
      )}
      
      {/* Profile Details */}
      <ProfileDetails
        profile={profile}
        isEditing={isEditing}
        onSave={handleSaveProfile}
        onCancel={handleCancelEdit}
      />
    </div>
  );
}

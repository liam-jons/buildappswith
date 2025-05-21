/**
 * Builder Profile Wrapper
 *
 * This component handles rendering builder profiles with appropriate data access
 * controls based on authentication state. It ensures profiles are publicly viewable
 * while protecting sensitive information.
 *
 * Version: 1.2.0 - Updated with Calendly Integration
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useProfileAuth } from './profile-auth-provider';
import { BuilderProfile } from './builder-profile';
import { CalendlySessionTypeList } from '@/components/scheduling/calendly';
import { BookingButton } from '@/components/booking/booking-button';
import { ValidationTierBadge } from '@/components/trust/ui/validation-tier-badge';
import { BuilderProfileWrapperProps } from './types';
import { getUserProfile } from '@/lib/profile/actions';
import { Skeleton } from '@/components/ui';
import { BuilderProfileData } from '@/lib/profile/types';
import { ValidationTier } from '@/lib/marketplace/types';
import { BuilderProfileResponseData } from '@/lib/profile/types';
import { validationTierToString } from '@/lib/utils/type-converters';


/**
 * Wrapper component that handles rendering builder profiles with appropriate
 * data access controls based on authentication state
 */
export function BuilderProfileWrapper({ 
  profileId, 
  isPublicView = false, 
  profile: providedProfile,
  userRole,
  authContext,
  loading = false,
  className 
}: BuilderProfileWrapperProps) {
  const [profile, setProfile] = useState(providedProfile);
  const [isLoading, setIsLoading] = useState(loading || !providedProfile);
  
  // Fetch profile data if not provided and profileId is available
  useEffect(() => {
    if (!providedProfile && profileId) {
      setIsLoading(true);
      getUserProfile(profileId)
        .then(({ user }) => {
          if (user) {
            // Transform user data to BuilderProfileData format
            const transformedProfile: BuilderProfileData = {
              id: user.id,
              name: user.name,
              bio: user.bio || '',
              headline: user.title,
              avatarUrl: user.avatarUrl,
              validationTier: user.validationTier || ValidationTier.ENTRY,
              domains: user.specializations || [],
              badges: [],
              completedProjects: user.completedProjects || 0,
              availableForHire: true,
              adhd_focus: false,
              expertiseAreas: {},
              socialLinks: {},
              portfolioItems: [],
              featured: false,
              searchable: true,
              availability: 'available',
              topSkills: user.specializations || [],
              joinDate: user.joinDate,
              rating: user.rating,
            };
            setProfile(transformedProfile);
          }
        })
        .finally(() => setIsLoading(false));
    }
  }, [profileId, providedProfile]);
  
  if (isLoading) {
    return <Skeleton className="w-full h-[600px]" />;
  }
  
  if (!profile) {
    return (
      <div className="p-6 bg-muted rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Profile Not Found</h2>
        <p>The requested profile could not be loaded.</p>
      </div>
    );
  }
  
  const { isOwner, isAdmin, isAuthenticated, permissions } = useProfileAuth();
  
  return (
    <div className={className} data-testid="builder-profile-wrapper">
      {/* Profile header with validation tier */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">{profile.name || profile.displayName}</h1>
        <ValidationTierBadge tier={validationTierToString(profile.validationTier)} />
      </div>
      
      {/* Main profile content */}
      <BuilderProfile 
        profile={profile}
      />
      
      {/* Session types section - Calendly integration */}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Available Sessions</h2>
        <CalendlySessionTypeList
          builderId={profile.id}
          showBookingButtons={!isOwner}
        />
      </div>
      
      {/* Admin-only section */}
      {isAdmin && (
        <div className="mt-8 p-4 border border-amber-200 bg-amber-50 rounded-md">
          <h3 className="text-lg font-medium text-amber-800">Admin Information</h3>
          <div className="mt-2 space-y-2 text-sm">
            <p><span className="font-medium">Profile ID:</span> {profile.id}</p>
            <p><span className="font-medium">Completed Projects:</span> {profile.completedProjects}</p>
            <p><span className="font-medium">Rating:</span> {profile.rating || 0}/5</p>
            <div className="mt-4 flex space-x-4">
              <button className="px-3 py-1 bg-slate-200 hover:bg-slate-300 rounded text-sm">
                Edit Profile
              </button>
              {permissions.canDelete && (
                <button className="px-3 py-1 bg-red-100 hover:bg-red-200 rounded text-sm text-red-700">
                  Suspend Account
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Profile editing options for owners */}
      {isOwner && (
        <div className="mt-8 p-4 border border-blue-200 bg-blue-50 rounded-md">
          <h3 className="text-lg font-medium text-blue-800">Profile Management</h3>
          <div className="mt-4 flex gap-4">
            <button className="px-3 py-1 bg-blue-100 hover:bg-blue-200 rounded text-sm">
              Edit Profile
            </button>
            <button className="px-3 py-1 bg-blue-100 hover:bg-blue-200 rounded text-sm">
              Manage Session Types
            </button>
            <button className="px-3 py-1 bg-blue-100 hover:bg-blue-200 rounded text-sm">
              Manage Availability
            </button>
          </div>
        </div>
      )}
      
      {/* Primary booking call-to-action for authenticated non-owners */}
      {isAuthenticated && !isOwner && (
        <div className="mt-10 flex justify-center">
          <BookingButton 
            builderId={profile.id} 
            size="lg"
            variant="default"
            label="Book a Session with This Builder"
          />
        </div>
      )}
    </div>
  );
}

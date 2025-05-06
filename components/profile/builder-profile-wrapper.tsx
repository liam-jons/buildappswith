/**
 * Builder Profile Wrapper
 * 
 * This component handles rendering builder profiles with appropriate data access
 * controls based on authentication state. It ensures profiles are publicly viewable
 * while protecting sensitive information.
 * 
 * Version: 1.1.0
 */

'use client';

import React from 'react';
import { useProfileAuth } from './profile-auth-provider';
import { BuilderProfile } from './builder-profile';
import { SessionTypeList } from '@/components/scheduling/session-type-list';
import { BookingButton } from '@/components/booking/booking-button';
import { ValidationTierBadge } from './ui/validation-tier-badge';

interface BuilderProfileData {
  id: string;
  name: string;
  bio: string;
  headline?: string;
  imageUrl?: string;
  specializations: string[];
  validationTier: number;
  sessionTypes: {
    id: string;
    title: string;
    description: string;
    duration: number;
    price: number;
  }[];
  // Sensitive fields that should only be visible to authenticated users with proper roles
  email?: string;
  phoneNumber?: string;
  privateNotes?: string;
  earnings?: number;
  stripeAccountId?: string;
}

interface BuilderProfileWrapperProps {
  builder: BuilderProfileData;
  className?: string;
}

/**
 * Wrapper component that handles rendering builder profiles with appropriate
 * data access controls based on authentication state
 */
export function BuilderProfileWrapper({ builder, className }: BuilderProfileWrapperProps) {
  const { isOwner, isAdmin, isAuthenticated, permissions } = useProfileAuth();
  
  // Filter sensitive data for public/unauthorized access
  const filteredBuilder = {
    ...builder,
    // Remove sensitive fields for unauthenticated or unauthorized users
    email: permissions.canEdit ? builder.email : undefined,
    phoneNumber: permissions.canEdit ? builder.phoneNumber : undefined,
    privateNotes: permissions.canEdit ? builder.privateNotes : undefined,
    earnings: permissions.canEdit ? builder.earnings : undefined,
    stripeAccountId: isAdmin ? builder.stripeAccountId : undefined,
  };
  
  return (
    <div className={className} data-testid="builder-profile-wrapper">
      {/* Profile header with validation tier */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">{builder.name}</h1>
        <ValidationTierBadge tier={builder.validationTier} />
      </div>
      
      {/* Main profile content */}
      <BuilderProfile 
        builder={filteredBuilder} 
        showContactInfo={permissions.canEdit}
      />
      
      {/* Session types section */}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Available Sessions</h2>
        <SessionTypeList 
          sessions={builder.sessionTypes} 
          builderId={builder.id}
          showBookingButtons={!isOwner}
        />
      </div>
      
      {/* Admin-only section */}
      {isAdmin && (
        <div className="mt-8 p-4 border border-amber-200 bg-amber-50 rounded-md">
          <h3 className="text-lg font-medium text-amber-800">Admin Information</h3>
          <div className="mt-2 space-y-2 text-sm">
            {builder.stripeAccountId && (
              <p><span className="font-medium">Stripe Account:</span> {builder.stripeAccountId}</p>
            )}
            {builder.earnings !== undefined && (
              <p><span className="font-medium">Total Earnings:</span> ${builder.earnings.toFixed(2)}</p>
            )}
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
            builderId={builder.id} 
            size="lg"
            variant="primary"
            label="Book a Session with This Builder"
          />
        </div>
      )}
    </div>
  );
}

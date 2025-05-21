'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';
import { ProfileHeaderProps } from '../types';
import { BuilderProfileData } from '@/lib/profile/types';

/**
 * ProfileHeader Component
 * 
 * Displays the user's profile header including avatar, name, and title
 */
export function ProfileHeader({ 
  profile,
  showVerification = true,
  showContact = true,
  size = 'md',
  editable = false,
  loading = false,
  className,
  id,
  ...props
}: ProfileHeaderProps) {
  const name = profile.displayName || profile.headline || 'Unknown User';
  const imageUrl = profile.avatarUrl || profile.coverImageUrl;
  const title = profile.headline || profile.tagline;
  
  // Size variants
  const sizeClasses = {
    xs: 'h-20',
    sm: 'h-24', 
    md: 'h-32',
    lg: 'h-40',
    xl: 'h-48'
  };
  
  const avatarSizeClasses = {
    xs: 'h-16 w-16 sm:h-20 sm:w-20',
    sm: 'h-20 w-20 sm:h-24 sm:w-24',
    md: 'h-24 w-24 sm:h-32 sm:w-32',
    lg: 'h-32 w-32 sm:h-40 sm:w-40',
    xl: 'h-40 w-40 sm:h-48 sm:w-48'
  };

  if (loading) {
    return (
      <div className={cn("relative animate-pulse", className)} id={id} {...props}>
        <div className={cn("bg-gray-200 dark:bg-gray-700", sizeClasses[size])} />
        <div className="px-6 pb-5 pt-0 flex flex-col sm:flex-row sm:items-end sm:space-x-5">
          <div className="flex -mt-12 sm:-mt-16">
            <div className={cn("rounded-full bg-gray-200 dark:bg-gray-700", avatarSizeClasses[size])} />
          </div>
          <div className="mt-4 sm:mt-0 flex-grow space-y-2">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48" />
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative", className)} id={id} {...props}>
      {/* Cover background */}
      <div className={cn(
        "bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900",
        sizeClasses[size]
      )} />
      
      <div className="px-6 pb-5 pt-0 flex flex-col sm:flex-row sm:items-end sm:space-x-5">
        {/* Avatar */}
        <div className="flex -mt-12 sm:-mt-16">
          <div className={cn(
            "relative rounded-full border-4 border-white dark:border-gray-900 overflow-hidden bg-gray-200",
            avatarSizeClasses[size]
          )}>
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-primary/10">
                <span className={cn(
                  "font-semibold text-primary",
                  size === 'xs' || size === 'sm' ? 'text-lg' : 'text-2xl'
                )}>
                  {name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </div>
        
        {/* Name and title */}
        <div className="mt-4 sm:mt-0 flex-grow">
          <h1 className={cn(
            "font-bold",
            {
              'text-lg': size === 'xs',
              'text-xl': size === 'sm',
              'text-2xl': size === 'md',
              'text-3xl': size === 'lg',
              'text-4xl': size === 'xl'
            }
          )}>
            {name}
          </h1>
          {title && (
            <p className="text-muted-foreground">
              {title}
            </p>
          )}
          
          {showVerification && profile.validationTier && (
            <div className="mt-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                Verified Tier {profile.validationTier}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfileHeader;
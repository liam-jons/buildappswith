'use client';

import Image from 'next/image';

interface ProfileHeaderProps {
  name: string;
  imageUrl?: string;
  title?: string;
  isEditing?: boolean;
}

/**
 * ProfileHeader Component
 * 
 * Displays the user's profile header including avatar, name, and title
 */
export function ProfileHeader({ name, imageUrl, title, isEditing = false }: ProfileHeaderProps) {
  return (
    <div className="relative">
      {/* Cover background */}
      <div className="h-32 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900" />
      
      <div className="px-6 pb-5 pt-0 flex flex-col sm:flex-row sm:items-end sm:space-x-5">
        {/* Avatar */}
        <div className="flex -mt-12 sm:-mt-16">
          <div className="relative h-24 w-24 sm:h-32 sm:w-32 rounded-full border-4 border-white dark:border-gray-900 overflow-hidden bg-gray-200">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-primary/10">
                <span className="text-2xl font-semibold text-primary">
                  {name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </div>
        
        {/* Name and title */}
        <div className="mt-4 sm:mt-0 flex-grow">
          <h1 className="text-2xl font-bold">
            {name}
          </h1>
          {title && <p className="text-muted-foreground">{title}</p>}
        </div>
      </div>
    </div>
  );
}

export default ProfileHeader;
import React from 'react';
import Image from 'next/image';
import { BuilderProfile, ValidationTier } from '@/types/builder';
import { TextShimmer } from '@/components/magicui/text-shimmer';

interface ProfileHeaderProps {
  profile: BuilderProfile;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ profile }) => {
  // Function to determine badge color based on validation tier
  const getTierBadgeColor = (tier: ValidationTier) => {
    switch (tier) {
      case ValidationTier.EXPERT:
        return 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white';
      case ValidationTier.ESTABLISHED:
        return 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white';
      case ValidationTier.ENTRY:
      default:
        return 'bg-gradient-to-r from-green-600 to-emerald-600 text-white';
    }
  };

  // Format tier label for display
  const formatTierLabel = (tier: ValidationTier) => {
    return tier.charAt(0).toUpperCase() + tier.slice(1);
  };

  return (
    <div className="w-full bg-gradient-to-b from-black/[0.8] to-black/[0.4] p-6 rounded-xl backdrop-blur-lg border border-white/10">
      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Profile Image */}
        <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-white/10">
          {profile.profileImage ? (
            <Image 
              src={profile.profileImage} 
              alt={profile.name} 
              fill 
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
              {profile.name.charAt(0)}
            </div>
          )}
        </div>
        
        {/* Profile Info */}
        <div className="flex-1">
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
            <h1 className="text-2xl md:text-3xl font-bold">
              <TextShimmer>{profile.name}</TextShimmer>
            </h1>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getTierBadgeColor(profile.validationTier)}`}>
              {formatTierLabel(profile.validationTier)} Builder
            </div>
          </div>
          
          <h2 className="text-xl text-gray-200 mb-2">{profile.headline}</h2>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {profile.specializationTags.map((tag, index) => (
              <span 
                key={index} 
                className="px-2 py-1 bg-gray-800 text-gray-200 rounded-md text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
          
          <div className="flex flex-wrap gap-4 text-sm text-gray-300">
            {profile.location && (
              <div className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{profile.location}</span>
              </div>
            )}
            
            {profile.website && (
              <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                <span>Website</span>
              </a>
            )}
            
            {profile.github && (
              <a href={profile.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                <span>GitHub</span>
              </a>
            )}
            
            {profile.linkedin && (
              <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
                <span>LinkedIn</span>
              </a>
            )}
            
            {profile.twitter && (
              <a href={`https://twitter.com/${profile.twitter}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
                <span>Twitter</span>
              </a>
            )}
          </div>
        </div>
        
        {/* Rate Information */}
        <div className="flex flex-col items-center md:items-end gap-2 mt-4 md:mt-0">
          <div className="text-xl font-bold">
            ${profile.ratePer15MinutesUSD} <span className="text-sm font-normal text-gray-400">/ 15 mins</span>
          </div>
          
          {profile.freeSessionMinutes > 0 && (
            <div className="text-sm text-green-400">
              {profile.freeSessionMinutes} min free session available
            </div>
          )}
          
          <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md text-white transition-colors mt-2">
            Schedule Session
          </button>
        </div>
      </div>
    </div>
  );
};

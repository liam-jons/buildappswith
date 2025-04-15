import React from 'react';
import { BuilderProfile, TechStack } from '@/types/builder';

interface SkillsSectionProps {
  profile: BuilderProfile;
}

export const SkillsSection: React.FC<SkillsSectionProps> = ({ profile }) => {
  // Helper function to get progress bar color based on proficiency
  const getProficiencyColor = (proficiency: string) => {
    switch (proficiency) {
      case 'expert':
        return 'bg-indigo-600';
      case 'advanced':
        return 'bg-blue-600';
      case 'intermediate':
        return 'bg-cyan-600';
      case 'beginner':
      default:
        return 'bg-green-600';
    }
  };

  // Helper function to get proficiency percentage
  const getProficiencyPercentage = (proficiency: string) => {
    switch (proficiency) {
      case 'expert':
        return '100%';
      case 'advanced':
        return '75%';
      case 'intermediate':
        return '50%';
      case 'beginner':
      default:
        return '25%';
    }
  };

  // Group tech stack by years of experience (for sorting)
  const groupedTechStack: { [key: string]: TechStack[] } = {};
  
  profile.techStack.forEach(tech => {
    const key = tech.proficiencyLevel;
    if (!groupedTechStack[key]) {
      groupedTechStack[key] = [];
    }
    groupedTechStack[key].push(tech);
  });

  // Sort order for proficiency levels
  const proficiencyOrder = ['expert', 'advanced', 'intermediate', 'beginner'];

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Skills & Expertise</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Tech Stack */}
        <div className="bg-black/[0.3] p-6 rounded-xl backdrop-blur-sm border border-white/5">
          <h3 className="text-xl font-semibold mb-4">Tech Stack</h3>
          
          <div className="space-y-6">
            {proficiencyOrder.map(proficiency => 
              groupedTechStack[proficiency] && (
                <div key={proficiency} className="space-y-4">
                  <h4 className="text-lg font-medium capitalize">{proficiency}</h4>
                  <div className="space-y-3">
                    {groupedTechStack[proficiency].map((tech, index) => (
                      <div key={index}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">{tech.name}</span>
                          <span className="text-xs text-gray-400">{tech.yearsOfExperience} years</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className={`${getProficiencyColor(tech.proficiencyLevel)} h-2 rounded-full`} 
                            style={{ width: getProficiencyPercentage(tech.proficiencyLevel) }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        </div>
        
        {/* Skills */}
        <div className="bg-black/[0.3] p-6 rounded-xl backdrop-blur-sm border border-white/5">
          <h3 className="text-xl font-semibold mb-4">Other Skills</h3>
          
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill, index) => (
              <span 
                key={index} 
                className="px-3 py-1 bg-gray-800 text-gray-200 rounded-md text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
          
          {profile.achievementBadges && profile.achievementBadges.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xl font-semibold mb-4">Achievements & Certifications</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {profile.achievementBadges.map((badge, index) => (
                  <div 
                    key={index} 
                    className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg"
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-indigo-700 flex items-center justify-center">
                      {badge.imageUrl ? (
                        <img src={badge.imageUrl} alt={badge.name} className="w-full h-full object-cover" />
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium">{badge.name}</h4>
                      <p className="text-xs text-gray-400">{badge.category.charAt(0).toUpperCase() + badge.category.slice(1)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import Image from 'next/image';
import { BuilderProfile, PortfolioProject } from '@/types/builder';

interface PortfolioSectionProps {
  profile: BuilderProfile;
}

export const PortfolioSection: React.FC<PortfolioSectionProps> = ({ profile }) => {
  // If there are no portfolio projects yet
  if (!profile.portfolioProjects || profile.portfolioProjects.length === 0) {
    return (
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Portfolio</h2>
        <div className="bg-black/[0.3] p-6 rounded-xl backdrop-blur-sm border border-white/5 text-center">
          <p className="text-gray-400">No portfolio projects available yet.</p>
        </div>
      </div>
    );
  }

  // Sort projects by featured status (featured first)
  const sortedProjects = [...profile.portfolioProjects].sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return 0;
  });

  // Get featured projects
  const featuredProjects = sortedProjects.filter(project => project.featured);
  
  // Other projects
  const otherProjects = sortedProjects.filter(project => !project.featured);

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Portfolio</h2>
      
      {/* Featured Projects */}
      {featuredProjects.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Featured Projects</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      )}
      
      {/* Other Projects */}
      {otherProjects.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Other Projects</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {otherProjects.map((project) => (
              <ProjectCardCompact key={project.id} project={project} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface ProjectCardProps {
  project: PortfolioProject;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  return (
    <div className="bg-black/[0.3] rounded-xl overflow-hidden border border-white/5 transition-all hover:border-white/20 hover:shadow-lg">
      {/* Project Image */}
      <div className="w-full h-48 relative bg-gray-900">
        {project.imageUrl ? (
          <Image 
            src={project.imageUrl} 
            alt={project.title} 
            fill 
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>
      
      {/* Project Content */}
      <div className="p-5">
        <h4 className="text-xl font-bold mb-2">{project.title}</h4>
        <p className="text-gray-400 mb-4 text-sm line-clamp-3">{project.description}</p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {project.technologies.slice(0, 5).map((tech, index) => (
            <span 
              key={index} 
              className="px-2 py-1 bg-gray-800 text-xs text-gray-300 rounded-md"
            >
              {tech}
            </span>
          ))}
          {project.technologies.length > 5 && (
            <span className="px-2 py-1 bg-gray-800 text-xs text-gray-300 rounded-md">
              +{project.technologies.length - 5} more
            </span>
          )}
        </div>
        
        <div className="flex gap-3">
          {project.projectUrl && (
            <a 
              href={project.projectUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Live Project
            </a>
          )}
          
          {project.githubUrl && (
            <a 
              href={project.githubUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

const ProjectCardCompact: React.FC<ProjectCardProps> = ({ project }) => {
  return (
    <div className="bg-black/[0.3] rounded-xl overflow-hidden border border-white/5 hover:border-white/20 transition-all">
      <div className="p-4">
        <h4 className="font-bold mb-2">{project.title}</h4>
        <p className="text-gray-400 text-sm mb-3 line-clamp-2">{project.description}</p>
        
        <div className="flex flex-wrap gap-1 mb-3">
          {project.technologies.slice(0, 3).map((tech, index) => (
            <span 
              key={index} 
              className="px-2 py-0.5 bg-gray-800 text-xs text-gray-300 rounded-md"
            >
              {tech}
            </span>
          ))}
          {project.technologies.length > 3 && (
            <span className="px-2 py-0.5 bg-gray-800 text-xs text-gray-300 rounded-md">
              +{project.technologies.length - 3}
            </span>
          )}
        </div>
        
        <div className="flex gap-3 text-xs">
          {project.projectUrl && (
            <a 
              href={project.projectUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Live Demo
            </a>
          )}
          
          {project.githubUrl && (
            <a 
              href={project.githubUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              Code
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

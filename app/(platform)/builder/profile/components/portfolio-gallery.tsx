'use client';

// Version: 0.1.65

import { useState } from 'react';
import Image from 'next/image';
import { Project } from '@/lib/types/builder';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronRight, Calendar, CheckCircle2 } from 'lucide-react';
import { TextShimmer } from '@/components/magicui/text-shimmer';

type PortfolioGalleryProps = {
  projects: Project[];
};

export function PortfolioGallery({ projects }: PortfolioGalleryProps) {
  const [filter, setFilter] = useState('all');
  
  // Extract unique categories from projects for filters
  const technologies = ['all'];
  projects.forEach(project => {
    if (project.technologies && Array.isArray(project.technologies)) {
      project.technologies.forEach(tech => {
        if (!technologies.includes(tech)) {
          technologies.push(tech);
        }
      });
    }
  });
  
  // Filter projects based on selected technology
  const filteredProjects = filter === 'all' 
    ? projects 
    : projects.filter(p => p.technologies && Array.isArray(p.technologies) && p.technologies.includes(filter));
  
  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <Tabs defaultValue="all" onValueChange={setFilter}>
        <TabsList className="flex flex-wrap">
          {technologies.slice(0, 7).map(tech => (
            <TabsTrigger key={tech} value={tech} className="capitalize">
              {tech}
            </TabsTrigger>
          ))}
          {technologies.length > 7 && (
            <TabsTrigger value="more">More...</TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          <ProjectGrid projects={filteredProjects} />
        </TabsContent>
        
        {technologies.slice(1).map(tech => (
          <TabsContent key={tech} value={tech} className="mt-6">
            <ProjectGrid projects={filteredProjects} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function ProjectGrid({ projects }: { projects: Project[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map(project => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  // Find the most significant outcome to feature
  const featuredOutcome = project.outcomes && Array.isArray(project.outcomes) 
    ? project.outcomes.sort((a, b) => {
        // Prioritize verified outcomes (using isVerified or verified property)
        const aVerified = a.isVerified || a.verified;
        const bVerified = b.isVerified || b.verified;
        if (aVerified && !bVerified) return -1;
        if (!aVerified && bVerified) return 1;
        return 0;
      })[0]
    : undefined;
  
  // Format the date
  const formattedDate = project.date ? new Date(project.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short'
  }) : '';
  
  return (
    <Card className="h-full flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg">
      <div className="relative h-48 overflow-hidden">
        <Image 
          src={(project.images && project.images[0]) || '/placeholder-project.png'} 
          alt={project.title}
          width={400}
          height={300}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          priority={false}
        />
        {(featuredOutcome?.verified || featuredOutcome?.isVerified) && (
          <Badge 
            className="absolute top-2 right-2 bg-green-500 hover:bg-green-600"
            variant="secondary"
          >
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Verified Outcome
          </Badge>
        )}
      </div>
      
      <CardHeader className="p-4 pb-0">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{project.title}</CardTitle>
        </div>
        <div className="flex items-center text-sm text-muted-foreground mt-1">
          <Calendar className="mr-1 h-3 w-3" />
          {formattedDate}
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-2 flex-1">
        <p className="text-sm font-medium">{project.client}</p>
        
        <div className="mt-3">
          <p className="text-sm text-muted-foreground">{project.description.substring(0, 100)}...</p>
        </div>
        
        {featuredOutcome && (
          <div className="mt-4 p-3 bg-muted rounded-md">
            <p className="text-sm font-medium">{featuredOutcome.type || featuredOutcome.label || 'Outcome'}:</p>
            <TextShimmer
              className="text-lg font-bold mt-1 bg-gradient-to-r from-indigo-500 to-violet-500 dark:from-indigo-400 dark:to-violet-400"
            >
              {featuredOutcome.value}
            </TextShimmer>
          </div>
        )}
        
        <div className="flex flex-wrap gap-2 mt-4">
          {project.technologies && Array.isArray(project.technologies) && project.technologies.slice(0, 3).map(tech => (
            <Badge key={tech} variant="outline" className="capitalize">
              {tech}
            </Badge>
          ))}
          {project.technologies && Array.isArray(project.technologies) && project.technologies.length > 3 && (
            <Badge variant="outline">+{project.technologies.length - 3}</Badge>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <Button variant="ghost" className="w-full justify-between">
          View Details
          <ChevronRight className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}

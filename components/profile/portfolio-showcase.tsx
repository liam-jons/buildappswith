"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
// Removed TextShimmer import
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/core/card";
import { Button } from "@/components/ui/core/button";
import { ExternalLinkIcon, PlusIcon, ChevronRightIcon } from "@radix-ui/react-icons";

// Define the portfolio project type
export interface PortfolioProject {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  outcomes: {
    label: string;
    value: string;
    trend?: "up" | "down" | "neutral";
  }[];
  tags: string[];
  projectUrl?: string;
  createdAt: Date;
}

interface PortfolioShowcaseProps {
  projects: PortfolioProject[];
  emptyState?: React.ReactNode;
  className?: string;
  maxDisplay?: number;
  isOwner?: boolean;
  onAddProject?: () => void;
  onViewAllProjects?: () => void;
}

export function PortfolioShowcase({
  projects,
  emptyState,
  className,
  maxDisplay = 3,
  isOwner = false,
  onAddProject,
  onViewAllProjects
}: PortfolioShowcaseProps) {
  const shouldReduceMotion = useReducedMotion();
  const displayProjects = projects.slice(0, maxDisplay);
  const hasMoreProjects = projects.length > maxDisplay;
  
  if (projects.length === 0) {
    return (
      <div className={cn("w-full", className)}>
        {emptyState || (
          <div className="border border-dashed rounded-lg p-8 text-center">
            <h3 className="text-xl font-medium text-muted-foreground mb-4">No projects yet</h3>
            {isOwner ? (
              <Button onClick={onAddProject} className="gap-2">
                <PlusIcon className="h-4 w-4" />
                Add Your First Project
              </Button>
            ) : (
              <p className="text-muted-foreground">This builder hasn&apos;t added any projects yet.</p>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn("w-full space-y-8", className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayProjects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.4, 
              delay: shouldReduceMotion ? 0 : index * 0.1,
              ease: "easeOut" 
            }}
          >
            <ProjectCard project={project} />
          </motion.div>
        ))}
        
        {/* Add project card for owners */}
        {isOwner && (
          <motion.div
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.4, 
              delay: shouldReduceMotion ? 0 : displayProjects.length * 0.1,
              ease: "easeOut" 
            }}
          >
            <Card className="h-full border border-dashed flex flex-col justify-center items-center p-8 hover:border-primary/50 transition-colors duration-200 cursor-pointer" onClick={onAddProject}>
              <div className="rounded-full bg-primary/10 p-4 mb-4">
                <PlusIcon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-medium">Add New Project</h3>
              <p className="text-muted-foreground text-center mt-2">Showcase your work and build your reputation</p>
            </Card>
          </motion.div>
        )}
      </div>
      
      {/* View all projects button */}
      {hasMoreProjects && onViewAllProjects && (
        <div className="flex justify-center">
          <Button 
            variant="outline" 
            onClick={onViewAllProjects} 
            className="group"
          >
            View All Projects
            <ChevronRightIcon className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </Button>
        </div>
      )}
    </div>
  );
}

function ProjectCard({ project }: { project: PortfolioProject }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  
  return (
    <Card className="overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow duration-200">
      {/* Project Image */}
      <div className="relative aspect-video bg-muted overflow-hidden">
        {project.imageUrl ? (
          <>
            <div className={cn(
              "absolute inset-0 bg-muted/80 backdrop-blur-sm transition-opacity duration-300",
              imageLoaded ? "opacity-0" : "opacity-100"
            )} />
            <Image
              src={project.imageUrl}
              alt={project.title}
              fill
              className="object-cover"
              onLoad={() => setImageLoaded(true)}
            />
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <span className="text-lg font-medium">{project.title}</span>
          </div>
        )}
      </div>
      
      <CardHeader className="pb-2">
        <CardTitle className="line-clamp-1">{project.title}</CardTitle>
        <CardDescription className="line-clamp-2">{project.description}</CardDescription>
      </CardHeader>
      
      <CardContent className="flex-grow">
        {/* Outcomes */}
        {project.outcomes.length > 0 && (
          <div className="grid grid-cols-2 gap-4">
            {project.outcomes.slice(0, 4).map((outcome, i) => (
              <div key={i} className="space-y-1">
                <div className="text-xs text-muted-foreground">{outcome.label}</div>
                <div className="text-base font-medium flex items-center">
                  {outcome.value}
                  {outcome.trend && (
                    <span className={cn(
                      "ml-1 text-xs",
                      outcome.trend === "up" && "text-green-500",
                      outcome.trend === "down" && "text-red-500"
                    )}>
                      {outcome.trend === "up" && "↑"}
                      {outcome.trend === "down" && "↓"}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Tags */}
        {project.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {project.tags.map((tag) => (
              <span 
                key={tag} 
                className="px-2 py-1 bg-muted text-xs rounded-full text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-0">
        {project.projectUrl && (
          <Button 
            variant="outline" 
            size="sm" 
            asChild 
            className="w-full gap-2"
          >
            <a href={project.projectUrl} target="_blank" rel="noopener noreferrer">
              View Project <ExternalLinkIcon className="h-3 w-4" />
            </a>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

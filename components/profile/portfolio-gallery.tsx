"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import TextShimmer from "@/components/magicui/text-shimmer";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Cross2Icon, 
  ExternalLinkIcon, 
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowTopRightIcon
} from "@radix-ui/react-icons";
import { ValidationTier } from "./validation-tier-badge";
import { PortfolioProject } from "./portfolio-showcase";

interface PortfolioGalleryProps {
  projects: PortfolioProject[];
  validationTier: ValidationTier;
  className?: string;
  gridView?: boolean;
  onBack?: () => void;
  isOwner?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function PortfolioGallery({
  projects,
  validationTier,
  className,
  gridView = true,
  onBack,
  isOwner = false,
  onEdit,
  onDelete
}: PortfolioGalleryProps) {
  const shouldReduceMotion = useReducedMotion();
  const [selectedProject, setSelectedProject] = useState<PortfolioProject | null>(null);
  const [filter, setFilter] = useState<string | null>(null);
  
  // Create a list of all unique tags
  const allTags = Array.from(
    new Set(projects.flatMap(project => project.tags))
  ).sort();
  
  // Filter projects based on selected tag
  const filteredProjects = filter 
    ? projects.filter(project => project.tags.includes(filter))
    : projects;
  
  // Get color based on validation tier
  const tierColorMap = {
    entry: "border-blue-400 dark:border-blue-400 from-blue-400/80 to-blue-400/0",
    established: "border-purple-500 dark:border-purple-400 from-purple-500/80 to-purple-400/0",
    expert: "border-amber-500 dark:border-amber-400 from-amber-500/80 to-amber-400/0"
  };
  
  const tierColor = tierColorMap[validationTier];

  return (
    <div className={cn("w-full space-y-6", className)}>
      {/* Gallery Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {onBack && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onBack}
              className="h-9 w-9"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </Button>
          )}
          <h2 className="text-2xl font-bold">Portfolio Gallery</h2>
        </div>
        
        {/* Tag Filter */}
        <div className="flex flex-wrap gap-2">
          <Button 
            variant={!filter ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(null)}
            className="h-8"
          >
            All Projects
          </Button>
          
          {allTags.map(tag => (
            <Button
              key={tag}
              variant={filter === tag ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(tag === filter ? null : tag)}
              className="h-8"
            >
              {tag}
            </Button>
          ))}
        </div>
      </div>
      
      {/* Projects Grid/List */}
      {filteredProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-xl font-medium mb-2">No projects match the selected filter</p>
          <p className="text-muted-foreground mb-4">Try selecting a different tag or view all projects</p>
          <Button onClick={() => setFilter(null)}>View All Projects</Button>
        </div>
      ) : gridView ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project, index) => (
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
              <ProjectCard 
                project={project}
                validationTier={validationTier}
                onClick={() => setSelectedProject(project)}
                isOwner={isOwner}
                onEdit={onEdit ? () => onEdit(project.id) : undefined}
                onDelete={onDelete ? () => onDelete(project.id) : undefined}
              />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {filteredProjects.map((project, index) => (
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
              <ProjectListItem 
                project={project}
                validationTier={validationTier}
                onClick={() => setSelectedProject(project)}
                isOwner={isOwner}
                onEdit={onEdit ? () => onEdit(project.id) : undefined}
                onDelete={onDelete ? () => onDelete(project.id) : undefined}
              />
            </motion.div>
          ))}
        </div>
      )}
      
      {/* Project Detail Dialog */}
      <Dialog open={!!selectedProject} onOpenChange={(open) => !open && setSelectedProject(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedProject && (
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedProject.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <DialogHeader>
                  <DialogTitle className="text-2xl">{selectedProject.title}</DialogTitle>
                  <DialogDescription>
                    {new Date(selectedProject.createdAt).toLocaleDateString(undefined, { 
                      year: 'numeric', 
                      month: 'long' 
                    })}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="mt-6 space-y-8">
                  {/* Project Image */}
                  <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                    <Image
                      src={selectedProject.imageUrl}
                      alt={selectedProject.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  
                  {/* Project Description */}
                  <div>
                    <h3 className="text-lg font-medium mb-2">Project Overview</h3>
                    <p className="text-muted-foreground">{selectedProject.description}</p>
                  </div>
                  
                  {/* Project Outcomes */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Key Outcomes</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {selectedProject.outcomes.map((outcome, i) => (
                        <div 
                          key={i} 
                          className={cn(
                            "p-4 rounded-lg border bg-gradient-to-br",
                            tierColor.split(' ').slice(0, 2).join(' '),
                            "from-opacity-20 to-opacity-0"
                          )}
                        >
                          <div className="text-sm font-medium text-muted-foreground mb-1">{outcome.label}</div>
                          <div className="flex items-baseline gap-1">
                            <div className="text-2xl font-bold">{outcome.value}</div>
                            {outcome.trend && (
                              <span className={cn(
                                "text-lg font-semibold",
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
                  </div>
                  
                  {/* Project Tags */}
                  <div>
                    <h3 className="text-lg font-medium mb-2">Technologies & Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.tags.map((tag) => (
                        <span 
                          key={tag} 
                          className="px-2.5 py-1 bg-muted rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {/* Project Links */}
                  <div className="flex justify-end pt-4">
                    {selectedProject.projectUrl && (
                      <Button asChild className="gap-2">
                        <a 
                          href={selectedProject.projectUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          View Live Project
                          <ExternalLinkIcon className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface ProjectCardProps {
  project: PortfolioProject;
  validationTier: ValidationTier;
  onClick: () => void;
  isOwner?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

function ProjectCard({ project, validationTier, onClick, isOwner, onEdit, onDelete }: ProjectCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showActions, setShowActions] = useState(false);
  
  // Get highlight outcome (largest number or first in list)
  const highlightOutcome = project.outcomes[0];
  
  return (
    <Card 
      className="overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow duration-200 group"
      onMouseEnter={() => isOwner && setShowActions(true)}
      onMouseLeave={() => isOwner && setShowActions(false)}
    >
      {/* Project Image with Quick View */}
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
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              onLoad={() => setImageLoaded(true)}
            />
            
            {/* Quick view overlay */}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Button variant="secondary" size="sm" onClick={onClick} className="gap-1.5">
                <MagnifyingGlassIcon className="h-4 w-4" />
                Quick View
              </Button>
            </div>
            
            {/* Owner actions */}
            {isOwner && showActions && onEdit && onDelete && (
              <div className="absolute top-2 right-2 flex gap-2">
                <Button 
                  variant="secondary" 
                  size="icon" 
                  className="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                  }}
                >
                  <Cross2Icon className="h-4 w-4 rotate-45" />
                </Button>
                <Button 
                  variant="destructive" 
                  size="icon" 
                  className="h-8 w-8 bg-destructive/80 backdrop-blur-sm hover:bg-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                >
                  <Cross2Icon className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <TextShimmer>{project.title}</TextShimmer>
          </div>
        )}
      </div>
      
      <CardHeader className="pb-2">
        <CardTitle className="line-clamp-1">{project.title}</CardTitle>
        <CardDescription className="line-clamp-2">{project.description}</CardDescription>
      </CardHeader>
      
      <CardContent className="flex-grow">
        {/* Featured Outcome */}
        {highlightOutcome && (
          <div 
            className={cn(
              "p-3 rounded-md border mb-4",
              validationTier === "entry" && "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30",
              validationTier === "established" && "border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/30",
              validationTier === "expert" && "border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30",
            )}
          >
            <div className="text-sm font-medium">{highlightOutcome.label}</div>
            <div className="flex items-baseline gap-1">
              <div className="text-xl font-bold">{highlightOutcome.value}</div>
              {highlightOutcome.trend && (
                <span className={cn(
                  "text-sm font-semibold",
                  highlightOutcome.trend === "up" && "text-green-500",
                  highlightOutcome.trend === "down" && "text-red-500"
                )}>
                  {highlightOutcome.trend === "up" && "↑"}
                  {highlightOutcome.trend === "down" && "↓"}
                </span>
              )}
            </div>
          </div>
        )}
        
        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {project.tags.slice(0, 3).map((tag) => (
            <span 
              key={tag} 
              className="px-2 py-1 bg-muted text-xs rounded-full text-muted-foreground"
            >
              {tag}
            </span>
          ))}
          {project.tags.length > 3 && (
            <span className="px-2 py-1 bg-muted text-xs rounded-full text-muted-foreground">
              +{project.tags.length - 3} more
            </span>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="pt-0">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onClick}
          className="w-full gap-1.5"
        >
          View Details
          <ArrowTopRightIcon className="h-3.5 w-3.5" />
        </Button>
      </CardFooter>
    </Card>
  );
}

function ProjectListItem({ project, validationTier, onClick, isOwner, onEdit, onDelete }: ProjectCardProps) {
  return (
    <div 
      className={cn(
        "flex flex-col md:flex-row gap-4 p-4 border rounded-lg hover:shadow-md transition-all duration-200 group",
        isOwner && "relative"
      )}
    >
      {/* Project Image */}
      <div className="relative aspect-video md:w-64 flex-shrink-0 bg-muted rounded-md overflow-hidden">
        <Image
          src={project.imageUrl}
          alt={project.title}
          fill
          className="object-cover"
        />
        
        {/* Owner actions */}
        {isOwner && onEdit && onDelete && (
          <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button 
              variant="secondary" 
              size="icon" 
              className="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              <Cross2Icon className="h-4 w-4 rotate-45" />
            </Button>
            <Button 
              variant="destructive" 
              size="icon" 
              className="h-8 w-8 bg-destructive/80 backdrop-blur-sm hover:bg-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Cross2Icon className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      
      {/* Project Details */}
      <div className="flex-grow flex flex-col">
        <div className="mb-2">
          <h3 className="text-lg font-medium">{project.title}</h3>
          <p className="text-muted-foreground line-clamp-2">{project.description}</p>
        </div>
        
        {/* Project Outcomes */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
          {project.outcomes.slice(0, 3).map((outcome, i) => (
            <div key={i} className="space-y-0.5">
              <div className="text-xs text-muted-foreground">{outcome.label}</div>
              <div className="flex items-baseline gap-1">
                <span className="font-medium">{outcome.value}</span>
                {outcome.trend && (
                  <span className={cn(
                    "text-xs",
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
        
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-3">
          {project.tags.map((tag) => (
            <span 
              key={tag} 
              className="px-2 py-0.5 bg-muted text-xs rounded-full text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
        
        {/* Actions */}
        <div className="mt-auto flex justify-end">
          <Button 
            variant="outline" 
            size="sm"
            onClick={onClick}
            className="gap-1.5"
          >
            View Details
            <ArrowTopRightIcon className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
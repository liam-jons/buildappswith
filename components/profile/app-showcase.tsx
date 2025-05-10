"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/core/card";
import { Button } from "@/components/ui/core/button";
import { 
  ExternalLinkIcon, 
  PlusIcon, 
  ChevronRightIcon,
  HeartFilledIcon,
  StarFilledIcon,
  RocketIcon
} from "@radix-ui/react-icons";
import { AppStatus } from "@prisma/client";

// Define the app item type
export interface AppItem {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  technologies: string[];
  status: AppStatus;
  appUrl?: string;
  adhd_focused: boolean;
  createdAt: Date;
}

interface AppShowcaseProps {
  apps: AppItem[];
  emptyState?: React.ReactNode;
  className?: string;
  maxDisplay?: number;
  isOwner?: boolean;
  onAddApp?: () => void;
  onViewAllApps?: () => void;
}

export function AppShowcase({
  apps,
  emptyState,
  className,
  maxDisplay = 3,
  isOwner = false,
  onAddApp,
  onViewAllApps
}: AppShowcaseProps) {
  const shouldReduceMotion = useReducedMotion();
  const displayApps = apps.slice(0, maxDisplay);
  const hasMoreApps = apps.length > maxDisplay;
  
  if (apps.length === 0) {
    return (
      <div className={cn("w-full", className)}>
        {emptyState || (
          <div className="border border-dashed rounded-lg p-8 text-center">
            <h3 className="text-xl font-medium text-muted-foreground mb-4">No apps yet</h3>
            {isOwner ? (
              <Button onClick={onAddApp} className="gap-2">
                <PlusIcon className="h-4 w-4" />
                Add Your First App
              </Button>
            ) : (
              <p className="text-muted-foreground">This builder hasn&apos;t added any apps yet.</p>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn("w-full space-y-8", className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayApps.map((app, index) => (
          <motion.div
            key={app.id}
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.4, 
              delay: shouldReduceMotion ? 0 : index * 0.1,
              ease: "easeOut" 
            }}
          >
            <AppCard app={app} />
          </motion.div>
        ))}
        
        {/* Add app card for owners */}
        {isOwner && onAddApp && (
          <motion.div
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.4, 
              delay: shouldReduceMotion ? 0 : displayApps.length * 0.1,
              ease: "easeOut" 
            }}
          >
            <Card className="h-full border border-dashed flex flex-col justify-center items-center p-8 hover:border-primary/50 transition-colors duration-200 cursor-pointer" onClick={onAddApp}>
              <div className="rounded-full bg-primary/10 p-4 mb-4">
                <PlusIcon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-medium">Add New App</h3>
              <p className="text-muted-foreground text-center mt-2">Showcase your AI applications</p>
            </Card>
          </motion.div>
        )}
      </div>
      
      {/* View all apps button */}
      {hasMoreApps && onViewAllApps && (
        <div className="flex justify-center">
          <Button 
            variant="outline" 
            onClick={onViewAllApps} 
            className="group"
          >
            View All Apps
            <ChevronRightIcon className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </Button>
        </div>
      )}
    </div>
  );
}

function AppCard({ app }: { app: AppItem }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Status display setup
  const statusConfig = {
    LIVE: {
      color: "bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-400",
      label: "Live"
    },
    DEMO: {
      color: "bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-400",
      label: "Demo"
    },
    CONCEPT: {
      color: "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-400",
      label: "Concept"
    }
  };
  
  return (
    <Card className="overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow duration-200">
      {/* App Image */}
      <div className="relative aspect-video bg-muted overflow-hidden">
        {app.imageUrl ? (
          <>
            <div className={cn(
              "absolute inset-0 bg-muted/80 backdrop-blur-sm transition-opacity duration-300",
              imageLoaded ? "opacity-0" : "opacity-100"
            )} />
            <Image
              src={app.imageUrl}
              alt={app.title}
              fill
              className="object-cover"
              onLoad={() => setImageLoaded(true)}
            />
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <span className="text-lg font-bold">{app.title}</span>
          </div>
        )}
        
        {/* Status badge */}
        <div className={cn(
          "absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium",
          statusConfig[app.status].color
        )}>
          {statusConfig[app.status].label}
        </div>
        
        {/* ADHD Focused badge */}
        {app.adhd_focused && (
          <div className="absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-950/50 dark:text-purple-400 flex items-center gap-1">
            <HeartFilledIcon className="h-3 w-3" />
            ADHD Focused
          </div>
        )}
      </div>
      
      <CardHeader className="pb-2">
        <CardTitle className="line-clamp-1">{app.title}</CardTitle>
        <CardDescription className="line-clamp-2">{app.description}</CardDescription>
      </CardHeader>
      
      <CardContent className="flex-grow">
        {/* Technologies */}
        {app.technologies.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {app.technologies.map((tech) => (
              <span 
                key={tech} 
                className="px-2 py-1 bg-muted text-xs rounded-full text-muted-foreground"
              >
                {tech}
              </span>
            ))}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-0">
        {app.appUrl && app.status !== "CONCEPT" && (
          <Button 
            variant="outline" 
            size="sm" 
            asChild 
            className="w-full gap-2"
          >
            <a href={app.appUrl} target="_blank" rel="noopener noreferrer">
              {app.status === "LIVE" ? "Use App" : "Try Demo"} 
              <ExternalLinkIcon className="h-3 w-4" />
            </a>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

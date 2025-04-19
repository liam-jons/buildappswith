"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { BorderBeam } from "@/components/magicui/border-beam";
import { Button } from "@/components/ui/button";
import { ValidationTierBadge } from "@/components/profile/validation-tier-badge";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import { 
  CalendarIcon, 
  ChatBubbleIcon, 
  StarFilledIcon, 
  CheckIcon, 
  ExternalLinkIcon
} from "@radix-ui/react-icons";
import { BuilderProfileData } from "@/components/profile/builder-profile";

interface FeaturedBuilderCardProps {
  builder: BuilderProfileData;
  className?: string;
}

export function FeaturedBuilderCard({ builder, className }: FeaturedBuilderCardProps) {
  const shouldReduceMotion = useReducedMotion();
  
  // Get appropriate availability badge
  const availabilityLabel = builder.availability ? {
    available: "Available Now",
    limited: "Limited Availability",
    unavailable: "Unavailable"
  }[builder.availability.status] : "Availability Unknown";
  
  const availabilityStyle = builder.availability ? {
    available: "text-green-600 dark:text-green-500 bg-green-50 dark:bg-green-950/30",
    limited: "text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-950/30",
    unavailable: "text-red-600 dark:text-red-500 bg-red-50 dark:bg-red-950/30"
  }[builder.availability.status] : "text-muted-foreground bg-muted";
  
  // Truncate bio to 120 characters
  const truncatedBio = builder.bio.length > 120 
    ? builder.bio.slice(0, 120) + "..."
    : builder.bio;
  
  return (
    <div className="relative rounded-lg">
      <BorderBeam
        className="absolute inset-0 rounded-lg"
        size={shouldReduceMotion ? 0 : 50}
        colorFrom="from-amber-400/40"
        colorTo="to-purple-400/40"
        delay={1}
        duration={4}
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5 }}
        transition={{ duration: 0.3 }}
        className={cn(
          "group relative overflow-hidden rounded-lg border bg-card shadow-md hover:shadow-lg transition-all duration-300",
          className
        )}
      >
        {/* Featured Badge */}
        <div className="absolute -top-1 -right-1 z-10">
          <Badge variant="default" className="bg-gradient-to-r from-amber-500 to-purple-600">
            <Sparkles className="h-3.5 w-3.5 mr-1" />
            Featured Builder
          </Badge>
        </div>
        
        {/* Card Content */}
        <div className="p-6">
          <div className="flex flex-row gap-4 items-start mb-4">
            {/* Avatar */}
            <div className="relative h-16 w-16 rounded-full border-2 border-amber-200 dark:border-amber-700 overflow-hidden flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-100 to-purple-100 dark:from-amber-900 dark:to-purple-900">
                {!shouldReduceMotion && (
                  <div className="relative w-full h-full">
                    <BorderBeam 
                      className="absolute inset-0 opacity-70" 
                      size={80} 
                      duration={3}
                      colorFrom="from-amber-400/60" 
                      colorTo="to-purple-400/0" 
                    />
                  </div>
                )}
              </div>
              {builder.avatarUrl && (
                <Image
                  src={builder.avatarUrl}
                  alt={builder.name}
                  fill
                  className="object-cover"
                />
              )}
            </div>
            
            {/* Name and title */}
            <div className="flex-grow">
              <div className="flex items-center flex-wrap gap-2 mb-1">
                <h3 className="text-lg font-semibold">{builder.name}</h3>
                <ValidationTierBadge tier={builder.validationTier} size="sm" />
              </div>
              <p className="text-sm text-muted-foreground mb-1">{builder.title}</p>
              <div className={cn(
                "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                availabilityStyle
              )}>
                {availabilityLabel}
              </div>
            </div>
          </div>
          
          {/* Bio */}
          <p className="text-sm text-muted-foreground mb-4">{truncatedBio}</p>
          
          {/* Stats */}
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs mb-4">
            <div className="flex items-center gap-1">
              <StarFilledIcon className="h-3.5 w-3.5 text-amber-500" />
              <span>{builder.rating.toFixed(1)} Rating</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckIcon className="h-3.5 w-3.5 text-green-500" />
              <span>{builder.completedProjects} Projects</span>
            </div>
            <div className="flex items-center gap-1">
              <CalendarIcon className="h-3.5 w-3.5 text-blue-500" />
              <span>Since {builder.joinDate.toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</span>
            </div>
          </div>
          
          {/* Skills */}
          <div className="flex flex-wrap gap-1.5 mb-6">
            {builder.skills.slice(0, 3).map((skill) => (
              <span
                key={skill}
                className="px-2 py-0.5 bg-muted rounded-full text-xs"
              >
                {skill}
              </span>
            ))}
            {builder.skills.length > 3 && (
              <span className="px-2 py-0.5 bg-muted rounded-full text-xs">
                +{builder.skills.length - 3} more
              </span>
            )}
          </div>

          {/* Featured message */}
          <div className="mb-4 text-sm p-3 bg-amber-50 dark:bg-amber-950/30 rounded-md border border-amber-100 dark:border-amber-800/40">
            <p className="text-amber-800 dark:text-amber-300">
              Book a paid session with our featured builder for expert guidance on your AI project.
            </p>
          </div>
          
          {/* Action buttons */}
          <div className="flex gap-2">
            <Button variant="default" size="sm" asChild className="flex-1 bg-gradient-to-r from-amber-600 to-purple-600 hover:from-amber-700 hover:to-purple-700">
              <Link href={`/profile/${builder.id}`} prefetch={false}>
                <ExternalLinkIcon className="mr-1.5 h-3.5 w-3.5" />
                View Profile
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <ChatBubbleIcon className="mr-1.5 h-3.5 w-3.5" />
              Contact
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

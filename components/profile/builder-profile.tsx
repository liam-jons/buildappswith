"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { BorderBeam } from "@/components/magicui/border-beam";
import { Button } from "@/components/ui/button";
import { 
  CalendarIcon, 
  ChatBubbleIcon, 
  Pencil1Icon,
  StarFilledIcon,
  CheckIcon,
  GlobeIcon,
  LinkedInLogoIcon,
  GitHubLogoIcon,
  TwitterLogoIcon,
  BarChartIcon,
  MixerHorizontalIcon
} from "@radix-ui/react-icons";
import { ValidationTierBadge, ValidationTier } from "./validation-tier-badge";
import { PortfolioShowcase, PortfolioProject } from "./portfolio-showcase";
import { SuccessMetricsDashboard, MetricsCategory } from "./success-metrics-dashboard";

export interface BuilderProfileData {
  id: string;
  name: string;
  title: string;
  bio: string;
  avatarUrl?: string;
  coverImageUrl?: string;
  validationTier: ValidationTier;
  joinDate: Date;
  completedProjects: number;
  rating: number;
  responseRate: number;
  skills: string[];
  availability?: {
    status: "available" | "limited" | "unavailable";
    nextAvailable?: Date;
  };
  socialLinks?: {
    website?: string;
    linkedin?: string;
    github?: string;
    twitter?: string;
  };
  portfolio: PortfolioProject[];
  metrics?: MetricsCategory[];
}

interface BuilderProfileProps {
  profile: BuilderProfileData;
  isOwner?: boolean;
  className?: string;
  onEditProfile?: () => void;
  onScheduleSession?: () => void;
  onSendMessage?: () => void;
  onAddProject?: () => void;
  onViewAllProjects?: () => void;
}

export function BuilderProfile({
  profile,
  isOwner = false,
  className,
  onEditProfile,
  onScheduleSession,
  onSendMessage,
  onAddProject,
  onViewAllProjects
}: BuilderProfileProps) {
  const shouldReduceMotion = useReducedMotion();
  const [showFullBio, setShowFullBio] = useState(false);
  
  // Format bio with show more/less if longer than 280 characters
  const bioIsTruncated = profile.bio.length > 280;
  const displayBio = showFullBio ? profile.bio : bioIsTruncated ? profile.bio.slice(0, 280) + "..." : profile.bio;
  
  // Get appropriate availability label and styling
  const availabilityLabel = profile.availability ? {
    available: "Available Now",
    limited: "Limited Availability",
    unavailable: "Unavailable"
  }[profile.availability.status] : "Availability Unknown";
  
  const availabilityStyle = profile.availability ? {
    available: "text-green-600 dark:text-green-500 bg-green-50 dark:bg-green-950/30",
    limited: "text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-950/30",
    unavailable: "text-red-600 dark:text-red-500 bg-red-50 dark:bg-red-950/30"
  }[profile.availability.status] : "text-muted-foreground bg-muted";
  
  return (
    <div className={cn("w-full", className)}>
      {/* Cover image */}
      <div className="relative w-full h-48 sm:h-56 md:h-64 lg:h-72 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-950 dark:to-purple-950 rounded-t-lg overflow-hidden">
        {profile.coverImageUrl && (
          <Image
            src={profile.coverImageUrl}
            alt={`${profile.name}'s cover image`}
            fill
            className="object-cover"
          />
        )}
        
        {/* Edit button for profile owner */}
        {isOwner && onEditProfile && (
          <Button
            variant="secondary"
            size="sm"
            className="absolute top-4 right-4 gap-1.5"
            onClick={onEditProfile}
          >
            <Pencil1Icon className="h-3.5 w-3.5" /> {/* Fixed: Changed from PencilIcon to Pencil1Icon */}
            Edit Profile
          </Button>
        )}
      </div>
      
      {/* Profile header */}
      <div className="relative px-4 sm:px-6 lg:px-8 pb-6 -mt-16">
        <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-6">
          {/* Avatar */}
          <div className="relative h-32 w-32 rounded-full border-4 border-background overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900">
              {!shouldReduceMotion && (
                <BorderBeam 
                  className="opacity-50" 
                  size={100} 
                  duration={4}
                  colorFrom="from-blue-400/80" 
                  colorTo="to-purple-400/0" 
                />
              )}
            </div>
            {profile.avatarUrl && (
              <Image
                src={profile.avatarUrl}
                alt={profile.name}
                fill
                className="object-cover"
              />
            )}
          </div>
          
          {/* Name and basic info */}
          <div className="flex-grow">
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h1 className="text-2xl md:text-3xl font-bold">{profile.name}</h1>
              <ValidationTierBadge tier={profile.validationTier} />
            </div>
            <h2 className="text-lg text-muted-foreground mb-2">{profile.title}</h2>
            
            {/* Key stats */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              <div className="flex items-center gap-1.5">
                <StarFilledIcon className="h-4 w-4 text-amber-500" />
                <span>{profile.rating.toFixed(1)} Rating</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckIcon className="h-4 w-4 text-green-500" />
                <span>{profile.completedProjects} Completed Projects</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CalendarIcon className="h-4 w-4 text-blue-500" />
                <span>Joined {profile.joinDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
              </div>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex gap-3 mt-4 md:mt-0">
            {!isOwner && (
              <>
                {onScheduleSession && (
                  <Button variant="default" onClick={onScheduleSession} className="gap-1.5">
                    <CalendarIcon className="h-4 w-4" />
                    Schedule
                  </Button>
                )}
                {onSendMessage && (
                  <Button variant="outline" onClick={onSendMessage} className="gap-1.5">
                    <ChatBubbleIcon className="h-4 w-4" />
                    Message
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4 sm:px-6 lg:px-8 pb-12">
        {/* Sidebar */}
        <div className="space-y-8">
          {/* Bio section */}
          <section>
            <h3 className="text-lg font-medium mb-3">About</h3>
            <p className="text-muted-foreground">
              {displayBio}
              {bioIsTruncated && (
                <button 
                  onClick={() => setShowFullBio(!showFullBio)}
                  className="ml-1 text-primary hover:underline"
                >
                  {showFullBio ? "Show less" : "Show more"}
                </button>
              )}
            </p>
          </section>
          
          {/* Availability */}
          <section>
            <h3 className="text-lg font-medium mb-3">Availability</h3>
            <div className={cn(
              "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium",
              availabilityStyle
            )}>
              {availabilityLabel}
            </div>
            {profile.availability?.status === "unavailable" && profile.availability.nextAvailable && (
              <p className="text-sm text-muted-foreground mt-2">
                Available from {profile.availability.nextAvailable.toLocaleDateString()}
              </p>
            )}
          </section>
          
          {/* Skills */}
          <section>
            <h3 className="text-lg font-medium mb-3">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-2.5 py-1 bg-muted rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>
          
          {/* Social links */}
          {profile.socialLinks && Object.values(profile.socialLinks).some(Boolean) && (
            <section>
              <h3 className="text-lg font-medium mb-3">Connect</h3>
              <div className="flex flex-wrap gap-3">
                {profile.socialLinks.website && (
                  <a 
                    href={profile.socialLinks.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                    aria-label="Website"
                  >
                    <GlobeIcon className="h-5 w-5" />
                  </a>
                )}
                {profile.socialLinks.linkedin && (
                  <a 
                    href={profile.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                    aria-label="LinkedIn"
                  >
                    <LinkedInLogoIcon className="h-5 w-5" />
                  </a>
                )}
                {profile.socialLinks.github && (
                  <a 
                    href={profile.socialLinks.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                    aria-label="GitHub"
                  >
                    <GitHubLogoIcon className="h-5 w-5" />
                  </a>
                )}
                {profile.socialLinks.twitter && (
                  <a 
                    href={profile.socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                    aria-label="Twitter"
                  >
                    <TwitterLogoIcon className="h-5 w-5" />
                  </a>
                )}
              </div>
            </section>
          )}
        </div>
        
        {/* Portfolio */}
        <div className="lg:col-span-2 space-y-12">
        {/* Success Metrics Dashboard */}
        {profile.metrics && profile.metrics.length > 0 && (
        <section>
        <SuccessMetricsDashboard
          validationTier={profile.validationTier}
          metrics={profile.metrics}
        />
        </section>
        )}
        
          {/* Portfolio Section */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium">Portfolio</h3>
              
              {onViewAllProjects && profile.portfolio.length > 3 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onViewAllProjects}
                  className="gap-1.5 text-muted-foreground hover:text-foreground"
                >
                  <MixerHorizontalIcon className="h-4 w-4" />
                  View All
                </Button>
              )}
            </div>
            
            <PortfolioShowcase 
              projects={profile.portfolio}
              isOwner={isOwner}
              onAddProject={onAddProject}
              onViewAllProjects={onViewAllProjects}
              maxDisplay={3}
            />
          </section>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { BorderBeam } from "@/components/magicui/border-beam";
import { Button } from "@/components/ui/core/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/core/tabs";
import { IntegratedBooking } from "@/components/scheduling/client/integrated-booking";
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
  MixerHorizontalIcon,
  RocketIcon,
  StackIcon,
  HeartFilledIcon,
  LightningBoltIcon,
  PersonIcon,
  MagicWandIcon,
  TargetIcon
} from "@radix-ui/react-icons";
import { ValidationTierBadge } from "@/components/trust/ui/validation-tier-badge";
import { ValidationTier } from "@/lib/trust/types";
import { PortfolioShowcase, PortfolioProject } from "./portfolio-showcase";
import { AppShowcase, AppItem } from "./app-showcase";
import { SuccessMetricsDashboard, MetricsCategory } from "./success-metrics-dashboard";
import { MultiRoleBadge } from "./role-badges";
import { UserRole } from "@prisma/client";
import { 
  SpecializationArea, 
  SpecializationContent,
  ExpertiseAreas,
  Testimonial
} from "@/lib/profile/types";

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
  roles?: UserRole[];
  isFounder?: boolean;
  adhdFocus?: boolean;
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
  apps?: AppItem[];
  metrics?: MetricsCategory[];
  expertiseAreas?: ExpertiseAreas;
  sessionTypes?: Array<{
    id: string;
    name: string;
    description?: string;
    duration: number;
    price?: number;
    calendlyEventTypeUri?: string;
  }>;
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
  onAddApp?: () => void;
  onViewAllApps?: () => void;
}

export function BuilderProfile({
  profile,
  isOwner = false,
  className,
  onEditProfile,
  onScheduleSession,
  onSendMessage,
  onAddProject,
  onViewAllProjects,
  onAddApp,
  onViewAllApps
}: BuilderProfileProps) {
  const shouldReduceMotion = useReducedMotion();
  const [showFullBio, setShowFullBio] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("expertise");
  
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
  
  // Determine tabs to show
  const showAppsTab = !!profile.apps && (profile.apps.length > 0 || isOwner);
  const showMetricsTab = !!profile.metrics && profile.metrics.length > 0;
  
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
            <Pencil1Icon className="h-3.5 w-3.5" />
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
              
              {/* ADHD Focus Badge */}
              {profile.adhdFocus && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-800 dark:bg-purple-950/50 dark:text-purple-400 rounded-full text-xs font-medium">
                  <HeartFilledIcon className="h-3 w-3" />
                  ADHD Focus
                </span>
              )}
            </div>
            
            {/* Role badges if available */}
            {profile.roles && profile.roles.length > 0 && (
              <div className="mb-2">
                <MultiRoleBadge 
                  roles={profile.roles} 
                  isFounder={profile.isFounder}
                  size="sm"
                />
              </div>
            )}
            
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
                <IntegratedBooking
                  builderId={profile.id}
                  sessionTypes={profile.sessionTypes || []}
                  className="gap-1.5"
                >
                  <CalendarIcon className="h-4 w-4" />
                  Schedule
                </IntegratedBooking>
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
        
        {/* Content Tabs */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="w-full mb-6">
              <TabsTrigger 
                value="portfolio" 
                className="flex items-center gap-1.5"
              >
                <StackIcon className="h-4 w-4" />
                Portfolio
              </TabsTrigger>
              
              {showAppsTab && (
                <TabsTrigger 
                  value="apps" 
                  className="flex items-center gap-1.5"
                >
                  <RocketIcon className="h-4 w-4" />
                  Apps
                </TabsTrigger>
              )}
              
              {showMetricsTab && (
                <TabsTrigger 
                  value="metrics" 
                  className="flex items-center gap-1.5"
                >
                  <BarChartIcon className="h-4 w-4" />
                  Metrics
                </TabsTrigger>
              )}
            </TabsList>
            
            {/* Portfolio Tab */}
            <TabsContent value="portfolio" className="mt-0">
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium">Portfolio Projects</h3>
                  
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
                  maxDisplay={6}
                />
              </section>
            </TabsContent>
            
            {/* Apps Tab */}
            {showAppsTab && (
              <TabsContent value="apps" className="mt-0">
                <section>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-medium">
                      {profile.adhdFocus 
                        ? "AI Applications for ADHD" 
                        : "AI Applications"}
                    </h3>
                    
                    {onViewAllApps && profile.apps && profile.apps.length > 3 && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={onViewAllApps}
                        className="gap-1.5 text-muted-foreground hover:text-foreground"
                      >
                        <MixerHorizontalIcon className="h-4 w-4" />
                        View All
                      </Button>
                    )}
                  </div>
                  
                  <AppShowcase 
                    apps={profile.apps || []}
                    isOwner={isOwner}
                    onAddApp={onAddApp}
                    onViewAllApps={onViewAllApps}
                    maxDisplay={6}
                  />
                </section>
              </TabsContent>
            )}
            
            {/* Metrics Tab */}
            {showMetricsTab && (
              <TabsContent value="metrics" className="mt-0">
                <section>
                  <SuccessMetricsDashboard
                    validationTier={profile.validationTier}
                    metrics={profile.metrics || []}
                  />
                </section>
              </TabsContent>
            )}

            {/* Expertise Areas Tab */}
            {profile.expertiseAreas && Object.keys(profile.expertiseAreas).length > 0 && (
              <TabsTrigger 
                value="expertise" 
                className="flex items-center gap-1.5"
              >
                <MagicWandIcon className="h-4 w-4" />
                Expertise Areas
              </TabsTrigger>
            )}
            
            {profile.expertiseAreas && Object.keys(profile.expertiseAreas).length > 0 && (
              <TabsContent value="expertise" className="mt-0">
                <section className="space-y-8">
                  <h3 className="text-lg font-medium mb-4">Specialized Expertise</h3>
                  
                  {/* ADHD Productivity */}
                  {profile.expertiseAreas[SpecializationArea.ADHD_PRODUCTIVITY] && (
                    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <LightningBoltIcon className="h-5 w-5 text-purple-500" />
                        <h4 className="text-xl font-semibold">ADHD Productivity Enhancement</h4>
                      </div>
                      <p className="text-muted-foreground mb-4">
                        {profile.expertiseAreas[SpecializationArea.ADHD_PRODUCTIVITY].description}
                      </p>
                      
                      <ul className="space-y-2 mb-6">
                        {profile.expertiseAreas[SpecializationArea.ADHD_PRODUCTIVITY].bulletPoints.map((point, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckIcon className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                      
                      {profile.expertiseAreas[SpecializationArea.ADHD_PRODUCTIVITY].testimonials.length > 0 && (
                        <div className="bg-muted/50 rounded-md p-4 border border-border">
                          <blockquote className="italic">
                            "{profile.expertiseAreas[SpecializationArea.ADHD_PRODUCTIVITY].testimonials[0].content}"
                          </blockquote>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="font-medium">{profile.expertiseAreas[SpecializationArea.ADHD_PRODUCTIVITY].testimonials[0].author}</div>
                            {profile.expertiseAreas[SpecializationArea.ADHD_PRODUCTIVITY].testimonials[0].role && (
                              <div className="text-sm text-muted-foreground">
                                {profile.expertiseAreas[SpecializationArea.ADHD_PRODUCTIVITY].testimonials[0].role}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* AI Literacy */}
                  {profile.expertiseAreas[SpecializationArea.AI_LITERACY] && (
                    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <PersonIcon className="h-5 w-5 text-blue-500" />
                        <h4 className="text-xl font-semibold">AI Literacy Development</h4>
                      </div>
                      <p className="text-muted-foreground mb-4">
                        {profile.expertiseAreas[SpecializationArea.AI_LITERACY].description}
                      </p>
                      
                      <ul className="space-y-2 mb-6">
                        {profile.expertiseAreas[SpecializationArea.AI_LITERACY].bulletPoints.map((point, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckIcon className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                      
                      {profile.expertiseAreas[SpecializationArea.AI_LITERACY].testimonials.length > 0 && (
                        <div className="bg-muted/50 rounded-md p-4 border border-border">
                          <blockquote className="italic">
                            "{profile.expertiseAreas[SpecializationArea.AI_LITERACY].testimonials[0].content}"
                          </blockquote>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="font-medium">{profile.expertiseAreas[SpecializationArea.AI_LITERACY].testimonials[0].author}</div>
                            {profile.expertiseAreas[SpecializationArea.AI_LITERACY].testimonials[0].role && (
                              <div className="text-sm text-muted-foreground">
                                {profile.expertiseAreas[SpecializationArea.AI_LITERACY].testimonials[0].role}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Building with AI */}
                  {profile.expertiseAreas[SpecializationArea.BUILDING_WITH_AI] && (
                    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <StackIcon className="h-5 w-5 text-teal-500" />
                        <h4 className="text-xl font-semibold">Building with AI</h4>
                      </div>
                      <p className="text-muted-foreground mb-4">
                        {profile.expertiseAreas[SpecializationArea.BUILDING_WITH_AI].description}
                      </p>
                      
                      <ul className="space-y-2 mb-6">
                        {profile.expertiseAreas[SpecializationArea.BUILDING_WITH_AI].bulletPoints.map((point, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckIcon className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                      
                      {profile.expertiseAreas[SpecializationArea.BUILDING_WITH_AI].testimonials.length > 0 && (
                        <div className="bg-muted/50 rounded-md p-4 border border-border">
                          <blockquote className="italic">
                            "{profile.expertiseAreas[SpecializationArea.BUILDING_WITH_AI].testimonials[0].content}"
                          </blockquote>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="font-medium">{profile.expertiseAreas[SpecializationArea.BUILDING_WITH_AI].testimonials[0].author}</div>
                            {profile.expertiseAreas[SpecializationArea.BUILDING_WITH_AI].testimonials[0].role && (
                              <div className="text-sm text-muted-foreground">
                                {profile.expertiseAreas[SpecializationArea.BUILDING_WITH_AI].testimonials[0].role}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Business Value */}
                  {profile.expertiseAreas[SpecializationArea.BUSINESS_VALUE] && (
                    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <TargetIcon className="h-5 w-5 text-red-500" />
                        <h4 className="text-xl font-semibold">Business Value Opportunities</h4>
                      </div>
                      <p className="text-muted-foreground mb-4">
                        {profile.expertiseAreas[SpecializationArea.BUSINESS_VALUE].description}
                      </p>
                      
                      <ul className="space-y-2 mb-6">
                        {profile.expertiseAreas[SpecializationArea.BUSINESS_VALUE].bulletPoints.map((point, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckIcon className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                      
                      {profile.expertiseAreas[SpecializationArea.BUSINESS_VALUE].testimonials.length > 0 && (
                        <div className="bg-muted/50 rounded-md p-4 border border-border">
                          <blockquote className="italic">
                            "{profile.expertiseAreas[SpecializationArea.BUSINESS_VALUE].testimonials[0].content}"
                          </blockquote>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="font-medium">{profile.expertiseAreas[SpecializationArea.BUSINESS_VALUE].testimonials[0].author}</div>
                            {profile.expertiseAreas[SpecializationArea.BUSINESS_VALUE].testimonials[0].role && (
                              <div className="text-sm text-muted-foreground">
                                {profile.expertiseAreas[SpecializationArea.BUSINESS_VALUE].testimonials[0].role}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </section>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  );
}

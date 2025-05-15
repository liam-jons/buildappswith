"use client";

import React, { useState } from 'react';
import { ValidationTierBadge } from "@/components/trust/ui/validation-tier-badge";
// Import SimplifiedBuilderImage instead of BuilderImage
import { SimplifiedBuilderImage } from "@/components/marketplace/simplified-builder-image";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/core/card";
import { Button } from "@/components/ui/core/button";
import { BuilderProfileListing } from '@/lib/marketplace/types';
import { DemoBadge } from '@/components/marketplace/ui/demo-badge';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ShineBorder } from '@/components/magicui/shine-border';

/**
 * BuilderCard component for displaying builder profiles in the marketplace
 * Uses a production-ready approach for image loading
 */
export function BuilderCard({ builder }: { builder: BuilderProfileListing }) {
  const [isHovering, setIsHovering] = useState(false);
  
  // Determine the validation tier string
  const getTierString = (tier: number): 'basic' | 'verified' | 'expert' => {
    switch (tier) {
      case 3:
        return 'expert';
      case 2:
        return 'verified';
      case 1:
      default:
        return 'basic';
    }
  };

  // Format hourly rate with currency symbol
  const formatHourlyRate = (rate?: number) => {
    if (!rate) return null;
    return `$${rate.toFixed(0)}/hr`;
  };

  // Get tier string for display
  const tierString = getTierString(builder.validationTier);

  return (
    <div className="relative">
      {/* Shine border for featured profiles */}
      {builder.featured && (
        <ShineBorder
          borderWidth={2}
          duration={8}
          shineColor={["#ffbd7a", "#fe8bbb", "#9e7aff"]}
          className="opacity-70"
        />
      )}
      
      <Card 
        className={cn(
          "overflow-hidden flex flex-col h-full transition-all duration-300 relative",
          "hover:shadow-md",
          builder.isDemo && isHovering && "blur-sm",
          builder.featured && "border-0"
        )}
        onMouseEnter={() => builder.isDemo && setIsHovering(true)}
        onMouseLeave={() => builder.isDemo && setIsHovering(false)}
      >
        {/* Demo overlay */}
        {builder.isDemo && isHovering && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <span className="text-2xl font-bold text-muted-foreground">Demo Account</span>
          </div>
        )}
      
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-4">
          <SimplifiedBuilderImage
            src={builder.avatarUrl}
            alt={builder.name}
            fallbackText={builder.name}
            size="md"
          />
          <div>
            <div className="flex items-center">
              <h3 className="text-lg font-semibold mr-2">{builder.name}</h3>
              <ValidationTierBadge tier={tierString} size="sm" />
              {builder.isDemo && <DemoBadge size="small" className="ml-2" />}
            </div>
            <p className="text-sm text-muted-foreground">
              {builder.headline || builder.tagline || formatHourlyRate(builder.hourlyRate)}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm line-clamp-3 mb-3">
          {builder.bio || "This builder hasn't added a bio yet."}
        </p>
        
        {/* Skills */}
        <div className="flex flex-wrap gap-1.5 mt-2">
          {(builder.topSkills?.length > 0 ? builder.topSkills : builder.skills)
            ?.slice(0, 5).map((skill: string) => (
            <span
              key={skill}
              className="px-2 py-0.5 bg-muted text-xs rounded-full"
            >
              {skill}
            </span>
          ))}
          {(builder.skills?.length || 0) > 5 && (
            <span className="px-2 py-0.5 bg-muted text-xs rounded-full">
              +{(builder.skills?.length || 0) - 5} more
            </span>
          )}
        </div>

        {/* Availability indicator */}
        {builder.availability && (
          <div className="mt-3 flex items-center">
            <span 
              className={`w-2 h-2 rounded-full mr-2 ${
                builder.isDemo
                  ? 'bg-gray-500'
                  : builder.availability === 'available' 
                    ? 'bg-green-500' 
                    : builder.availability === 'limited' 
                      ? 'bg-yellow-500' 
                      : 'bg-red-500'
              }`}
            />
            <span className="text-xs text-muted-foreground">
              {builder.isDemo
                ? 'Demo Account'
                : builder.availability === 'available' 
                  ? 'Available for hire' 
                  : builder.availability === 'limited' 
                    ? 'Limited availability' 
                    : 'Currently unavailable'}
            </span>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0">
        <Link
          href={`/marketplace/builders/${builder.id}`}
          className="w-full"
        >
          <Button 
            variant="default" 
            className="w-full"
          >
            View Profile
          </Button>
        </Link>
      </CardFooter>
    </Card>
    </div>
  );
}
"use client";

import React from 'react';
import Link from 'next/link';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader 
} from "@/components/ui/core/card";
import { Button } from "@/components/ui/core/button";
import { ValidationTierBadge } from "@/components/trust/ui/validation-tier-badge";
import { BuilderImage } from '@/components/marketplace/components/builder-image';
import { MarketplaceErrorBoundary } from '@/components/marketplace/components/error-boundaries';
import { BuilderProfileListing } from '@/lib/marketplace';
import { cn } from '@/lib/utils';

interface BuilderCardProps {
  builder: BuilderProfileListing;
  className?: string;
}

/**
 * BuilderCard component
 * 
 * Displays a builder profile card with their information, skills, and availability
 * Uses the consolidated BuilderImage component and includes proper error handling
 */
export function BuilderCard({ builder, className }: BuilderCardProps) {
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
    <MarketplaceErrorBoundary componentName="BuilderCard">
      <Card className={cn(
        "overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow duration-200",
        className
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-4">
            <BuilderImage
              src={builder.avatarUrl}
              alt={builder.name}
              size="md"
            />
            <div>
              <div className="flex items-center">
                <h3 className="text-lg font-semibold mr-2">{builder.name}</h3>
                <ValidationTierBadge tier={tierString} size="sm" />
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
              ?.slice(0, 5).map((skill: string, index) => (
              <span
                key={`${builder.id}-skill-${index}`}
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
                  builder.availability === 'available' 
                    ? 'bg-green-500' 
                    : builder.availability === 'limited' 
                      ? 'bg-yellow-500' 
                      : 'bg-red-500'
                }`}
              />
              <span className="text-xs text-muted-foreground">
                {builder.availability === 'available' 
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
    </MarketplaceErrorBoundary>
  );
}
"use client";

import React from 'react';
import { ValidationTierBadge } from "@/components/profile/validation-tier-badge";
import { BuilderImage } from "@/components/marketplace/builder-image";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Builder {
  id: string;
  name: string;
  title?: string;
  bio?: string;
  avatarUrl?: string;
  validationTier: 'entry' | 'established' | 'expert';
  skills?: string[];
}

/**
 * BuilderCard component for displaying builder profiles in the marketplace
 * Uses a production-ready approach for image loading
 */
export function BuilderCard({ builder }: { builder: Builder }) {
  return (
    <Card className="overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-4">
          <BuilderImage 
            src={builder.avatarUrl} 
            alt={builder.name}
            fallbackText={builder.name}
            size="md"
          />
          <div>
            <div className="flex items-center">
              <h3 className="text-lg font-semibold mr-2">{builder.name}</h3>
              <ValidationTierBadge tier={builder.validationTier} size="sm" />
            </div>
            <p className="text-sm text-muted-foreground">{builder.title}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm line-clamp-3 mb-3">
          {builder.bio || "This builder hasn't added a bio yet."}
        </p>
        
        {/* Skills */}
        <div className="flex flex-wrap gap-1.5 mt-2">
          {builder.skills?.slice(0, 5).map((skill: string) => (
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
      </CardContent>
      <CardFooter className="pt-0">
        <Button 
          variant="default" 
          className="w-full"
          onClick={() => window.location.href = `/marketplace/${builder.id}`}
        >
          View Profile
        </Button>
      </CardFooter>
    </Card>
  );
}

'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/core/card';
import { Button } from '@/components/ui/core/button';
import { PATHWAYS, PathwayId } from '@/lib/constants/pathways';
import { cn } from '@/lib/utils';

interface PathwaySelectorProps {
  onSelect: (pathway: string) => void;
  selectedPathway?: string;
  className?: string;
}

export function PathwaySelector({ onSelect, selectedPathway, className }: PathwaySelectorProps) {
  const pathways = Object.values(PATHWAYS);

  return (
    <div className={cn("grid gap-6 md:grid-cols-3", className)}>
      {pathways.map((pathway) => (
        <Card
          key={pathway.id}
          className={cn(
            "cursor-pointer transition-all hover:shadow-lg",
            selectedPathway === pathway.id && "ring-2 ring-primary"
          )}
          onClick={() => onSelect(pathway.id)}
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <span className="text-4xl">{pathway.icon}</span>
              <CardTitle style={{ color: pathway.color }}>{pathway.name}</CardTitle>
            </div>
            <CardDescription>{pathway.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(pathway.tiers).map(([tierId, tier]) => (
                <div key={tierId} className="text-sm">
                  <span className="font-medium">{tier.name}:</span>
                  <span className="text-muted-foreground ml-1">{tier.description}</span>
                </div>
              ))}
            </div>
            <Button
              variant={selectedPathway === pathway.id ? "default" : "outline"}
              className="w-full mt-4"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(pathway.id);
              }}
            >
              {selectedPathway === pathway.id ? "Selected" : "Select Pathway"}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
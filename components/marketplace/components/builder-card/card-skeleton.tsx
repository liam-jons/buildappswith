"use client";

import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/core/card";
import { cn } from '@/lib/utils';

interface CardSkeletonProps {
  className?: string;
}

/**
 * Loading skeleton for BuilderCard
 * Displays a placeholder UI while content is loading
 */
export function CardSkeleton({ className }: CardSkeletonProps) {
  return (
    <Card className={cn("overflow-hidden flex flex-col h-full", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse"></div>
          <div className="space-y-2">
            <div className="h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
            <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <div className="space-y-2">
          <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
          <div className="h-4 w-5/6 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {Array(4).fill(0).map((_, i) => (
            <div 
              key={i} 
              className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse"
            ></div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <div className="h-9 w-full bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
      </CardFooter>
    </Card>
  );
}
/**
 * Skeleton UI component for loading states
 * Version: 1.0.0
 */

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

/**
 * Skeleton component for showing loading states
 * 
 * This component provides a pulsing placeholder for content
 * that is being loaded, which helps improve perceived performance
 */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "h-4 w-full rounded-md bg-muted/40 animate-pulse",
        className
      )}
    />
  );
}
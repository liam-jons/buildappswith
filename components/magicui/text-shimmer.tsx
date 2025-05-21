'use client';

import { cn } from "@/lib/utils";

export interface TextShimmerProps {
  children: React.ReactNode;
  className?: string;
  shimmerWidth?: number; // Width of the shimmer effect in pixels
}

/**
 * TextShimmer component
 * 
 * Adds a shimmer effect to text content
 * 
 * @example
 * ```tsx
 * <TextShimmer>Glowing text</TextShimmer>
 * ```
 */
export function TextShimmer({ children, className, shimmerWidth = 200 }: TextShimmerProps) {
  return (
    <span 
      className={cn(
        "inline-block bg-gradient-to-r from-transparent via-white to-transparent",
        "bg-clip-text animate-shimmer text-transparent",
        "dark:from-transparent dark:via-white dark:to-transparent",
        className
      )}
      style={{
        backgroundSize: `${shimmerWidth}% 100%`
      }}
    >
      {children}
    </span>
  );
}

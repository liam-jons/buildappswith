"use client";

import * as React from "react";
import Image from "next/image";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

/**
 * BuilderImage size variants using class-variance-authority pattern
 * for consistent styling across the application
 */
const builderImageVariants = cva(
  "relative overflow-hidden rounded-full border border-muted",
  {
    variants: {
      size: {
        sm: "h-12 w-12",
        md: "h-16 w-16",
        lg: "h-24 w-24",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

export interface BuilderImageProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof builderImageVariants> {
  src?: string | null;
  alt: string;
  fallbackText?: string;
}

/**
 * A production-ready builder profile image component
 * - Uses Radix UI Avatar for consistent design system integration
 * - Handles loading states and errors gracefully
 * - Provides consistent fallback for missing images
 * - Supports different size variants through cva
 * - Fully accessible with appropriate ARIA attributes
 */
export function BuilderImage({
  src,
  alt,
  fallbackText,
  size,
  className,
  ...props
}: BuilderImageProps) {
  const [isLoaded, setIsLoaded] = React.useState(false);
  
  // Get initials for fallback
  const getInitials = React.useCallback(() => {
    // Use fallbackText if provided, otherwise extract from alt
    const text = fallbackText || alt;
    return text.trim().charAt(0).toUpperCase();
  }, [fallbackText, alt]);

  // Handle image load complete
  const handleLoadComplete = React.useCallback(() => {
    setIsLoaded(true);
  }, []);
  
  return (
    <Avatar 
      className={cn(builderImageVariants({ size }), className)} 
      {...props}
    >
      {src ? (
        <AvatarImage 
          asChild
          alt={alt}
        >
          <div className="relative aspect-square h-full w-full">
            <Image
              src={src}
              alt={alt}
              fill
              className={cn(
                "object-cover transition-opacity duration-300",
                isLoaded ? "opacity-100" : "opacity-0"
              )}
              onLoad={handleLoadComplete}
              sizes={
                size === "sm" 
                  ? "48px" 
                  : size === "md" 
                    ? "64px" 
                    : "96px"
              }
              priority={size === "lg"}
            />
          </div>
        </AvatarImage>
      ) : null}
      
      <AvatarFallback 
        className="bg-primary/10 text-primary flex items-center justify-center"
        delayMs={src ? 600 : 0} // Only delay if we're trying to load an image
      >
        <span 
          className={cn(
            "font-semibold",
            size === "sm" ? "text-base" : size === "md" ? "text-xl" : "text-2xl"
          )}
          aria-hidden="true"
        >
          {getInitials()}
        </span>
        <span className="sr-only">{alt}</span>
      </AvatarFallback>
    </Avatar>
  );
}

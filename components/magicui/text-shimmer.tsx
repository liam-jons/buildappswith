"use client"

import { cn } from "@/lib/utils"
import { shouldReduceMotion } from "@/lib/utils"

interface TextShimmerProps {
  children: React.ReactNode
  className?: string
  disableAnimation?: boolean
}

export function TextShimmer({
  children,
  className,
  disableAnimation = false,
}: TextShimmerProps) {
  // Don't apply shimmer effect if user prefers reduced motion
  const reduceMotion = shouldReduceMotion()

  return (
    <span
      className={cn(
        "inline-flex",
        !disableAnimation && !reduceMotion && "text-shimmer",
        className
      )}
    >
      {children}
    </span>
  )
}

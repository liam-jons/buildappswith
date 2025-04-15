"use client"

import { useRef, useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface BorderBeamProps {
  className?: string
  children?: React.ReactNode
  containerClassName?: string
  duration?: number
  size?: "small" | "medium" | "large"
  delay?: number
  shouldReduceMotion?: boolean
}

export function BorderBeam({
  className,
  children,
  containerClassName,
  duration = 5,
  size = "medium",
  delay,
  shouldReduceMotion = false,
}: BorderBeamProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [hasStarted, setHasStarted] = useState(false)
  
  useEffect(() => {
    // If reduced motion is preferred, don't show the animation
    if (shouldReduceMotion) return
    
    if (delay) {
      const timeout = setTimeout(() => setHasStarted(true), delay)
      return () => clearTimeout(timeout)
    } else {
      setHasStarted(true)
    }
  }, [delay, shouldReduceMotion])

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full rounded-lg overflow-hidden p-[1px]",
        containerClassName
      )}
    >
      {hasStarted && !shouldReduceMotion && (
        <div
          className={cn(
            "border-beam",
            size === "small" && "before:w-20",
            size === "medium" && "before:w-32",
            size === "large" && "before:w-48",
            className
          )}
          style={{ "--duration": duration } as React.CSSProperties}
        />
      )}
      {children}
    </div>
  )
}

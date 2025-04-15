"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface MarqueeProps {
  className?: string
  containerClassName?: string
  reverse?: boolean
  pauseOnHover?: boolean
  children: React.ReactNode
  speed?: number
  shouldReduceMotion?: boolean
}

export function Marquee({
  className,
  containerClassName,
  reverse = false,
  pauseOnHover = false,
  children,
  speed = 20,
  shouldReduceMotion = false,
}: MarqueeProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [start, setStart] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(shouldReduceMotion)

  useEffect(() => {
    // Check if the user prefers reduced motion
    if (!shouldReduceMotion && typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
      setPrefersReducedMotion(mediaQuery.matches)
      
      const handleChange = () => setPrefersReducedMotion(mediaQuery.matches)
      mediaQuery.addEventListener("change", handleChange)
      return () => mediaQuery.removeEventListener("change", handleChange)
    }
  }, [shouldReduceMotion])

  useEffect(() => {
    // Don't animate if reduced motion is preferred
    if (prefersReducedMotion) return
    
    // Calculate if we need to duplicate the children for a seamless loop
    if (!containerRef.current || !scrollerRef.current) return
    
    const container = containerRef.current
    const scroller = scrollerRef.current
    
    // Make a deep clone of the children for the loop
    if (scroller.children.length === 1) {
      const duplicate = scroller.children[0].cloneNode(true)
      scroller.appendChild(duplicate)
    }
    
    setStart(true)
  }, [prefersReducedMotion])

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative flex w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]",
        containerClassName
      )}
    >
      <div
        ref={scrollerRef}
        className={cn(
          "flex min-w-full shrink-0 gap-4 py-4",
          start && !prefersReducedMotion && "animate-marquee",
          start && !prefersReducedMotion && pauseOnHover && "hover:[animation-play-state:paused]",
          reverse && "flex-row-reverse",
          className
        )}
        style={
          start && !prefersReducedMotion
            ? { "--duration": `${speed}s` } as React.CSSProperties
            : undefined
        }
      >
        <div className="flex shrink-0 gap-4">{children}</div>
      </div>
    </div>
  )
}

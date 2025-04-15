"use client"

import { useRef, useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface SphereMaskProps {
  children: React.ReactNode
  className?: string
  revealSpeed?: number
  shrinkSpeed?: number
  delay?: number
  shouldReduceMotion?: boolean
}

export function SphereMask({
  children,
  className,
  revealSpeed = 0.5,
  shrinkSpeed = 0.5,
  delay = 0,
  shouldReduceMotion = false,
}: SphereMaskProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [isVisible, setIsVisible] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(shouldReduceMotion)

  useEffect(() => {
    if (!shouldReduceMotion && typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
      setPrefersReducedMotion(mediaQuery.matches)
      
      const handleChange = () => setPrefersReducedMotion(mediaQuery.matches)
      mediaQuery.addEventListener("change", handleChange)
      return () => mediaQuery.removeEventListener("change", handleChange)
    }
  }, [shouldReduceMotion])

  useEffect(() => {
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect()
      setDimensions({ width, height })
      
      // Set a timeout to start the animation after the delay
      const timer = setTimeout(() => {
        setIsVisible(true)
        
        // Set another timeout for when the animation should complete
        const loadedTimer = setTimeout(() => {
          setIsLoaded(true)
        }, prefersReducedMotion ? 0 : revealSpeed * 1000 + shrinkSpeed * 1000)
        
        return () => clearTimeout(loadedTimer)
      }, delay)
      
      return () => clearTimeout(timer)
    }
  }, [delay, revealSpeed, shrinkSpeed, prefersReducedMotion])

  // Calculate the diagonal of the container for the mask size
  const diagonal = Math.ceil(
    Math.sqrt(dimensions.width ** 2 + dimensions.height ** 2)
  )
  
  // Double the diagonal to ensure it covers the entire container
  const maskSize = diagonal * 2
  
  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-hidden", className)}
    >
      <div
        className="absolute inset-0"
        style={{
          maskImage: !prefersReducedMotion && !isLoaded ? "radial-gradient(circle, black, transparent)" : undefined,
          WebkitMaskImage: !prefersReducedMotion && !isLoaded ? "radial-gradient(circle, black, transparent)" : undefined,
          maskSize: !prefersReducedMotion && !isLoaded ? `${isVisible ? 100 : 0}%` : undefined,
          WebkitMaskSize: !prefersReducedMotion && !isLoaded ? `${isVisible ? 100 : 0}%` : undefined,
          maskPosition: "center",
          WebkitMaskPosition: "center",
          transition: !prefersReducedMotion && !isLoaded
            ? `mask-size ${revealSpeed}s ease-out${
                isVisible ? `, transform ${shrinkSpeed}s ease-out` : ""
              }`
            : undefined,
          transform: !prefersReducedMotion && !isLoaded && isVisible ? "scale(0.8)" : undefined,
        }}
      >
        {children}
      </div>
    </div>
  )
}

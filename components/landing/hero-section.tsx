"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { TextShimmer } from "@/components/magicui/text-shimmer"
import { BorderBeam } from "@/components/magicui/border-beam"
import { Particles } from "@/components/magicui/particles"
import { shouldReduceMotion } from "@/lib/utils"

export function HeroSection() {
  const [reduceMotion, setReduceMotion] = useState(false)
  
  useEffect(() => {
    setReduceMotion(shouldReduceMotion())
  }, [])

  return (
    <section className="relative w-full py-12 md:py-24 lg:py-32 xl:py-48 overflow-hidden">
      {/* Background particles */}
      {!reduceMotion && (
        <Particles
          className="absolute inset-0 opacity-50"
          quantity={50}
          staticity={30}
          color="hsl(var(--brand-blue) / 0.2)"
          varyColor={true}
        />
      )}
      
      <div className="container px-4 md:px-6 space-y-12 md:space-y-16 relative z-10">
        <div className="flex flex-col items-center gap-6 text-center">
          {/* Main headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter text-balance max-w-3xl">
            Democratizing AI App Development through{" "}
            <TextShimmer
              className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-green-500 to-amber-500"
              disableAnimation={reduceMotion}
            >
              Validation & Education
            </TextShimmer>
          </h1>
          
          {/* Subheadline */}
          <p className="text-muted-foreground text-base md:text-xl max-w-[42rem] text-balance leading-normal">
            AI app development is too expensive and complex. Buildappswith connects you with verified experts to build affordable AI apps, or teaches you to build them yourself.
          </p>
          
          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <BorderBeam
              containerClassName="rounded-full"
              className="rounded-full"
              size="small"
              shouldReduceMotion={reduceMotion}
            >
              <Link href="/marketplace">
                <Button size="lg" className="rounded-full px-8">
                  Find an AI Builder
                </Button>
              </Link>
            </BorderBeam>
            
            <Link href="/learning">
              <Button variant="outline" size="lg" className="rounded-full px-8">
                Learn to Build
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Hero image or mockup */}
        <div className="w-full flex justify-center">
          <div className="relative w-full max-w-4xl aspect-video rounded-lg overflow-hidden border bg-background/50 shadow-xl">
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
              {/* Placeholder for actual platform screenshot/mockup */}
              <p className="text-sm">Platform Preview</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

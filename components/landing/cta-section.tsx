"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BorderBeam } from "@/components/magicui/border-beam"
import { TextShimmer } from "@/components/magicui/text-shimmer"
import { shouldReduceMotion } from "@/lib/utils"

export function CtaSection() {
  const [reduceMotion, setReduceMotion] = useState(false)
  
  useEffect(() => {
    setReduceMotion(shouldReduceMotion())
  }, [])

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-background to-muted/30">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center text-center space-y-8 md:space-y-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold max-w-3xl text-balance">
            Start Your AI Journey Today with{" "}
            <TextShimmer
              className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-green-500 to-amber-500"
              disableAnimation={reduceMotion}
            >
              Buildappswith
            </TextShimmer>
          </h2>
          
          <p className="text-muted-foreground text-lg md:text-xl max-w-[42rem] text-balance leading-normal">
            Whether you're looking to build an AI-powered app or develop valuable skills for the future, our platform provides the tools, community, and validation you need to succeed.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <BorderBeam
              containerClassName="rounded-full"
              className="rounded-full"
              size="small"
              shouldReduceMotion={reduceMotion}
            >
              <Link href="/register">
                <Button size="lg" className="rounded-full px-8">
                  Get Started For Free
                </Button>
              </Link>
            </BorderBeam>
            
            <Link href="/about">
              <Button variant="outline" size="lg" className="rounded-full px-8">
                Learn More About Us
              </Button>
            </Link>
          </div>
          
          <div className="text-sm text-muted-foreground mt-6">
            <p>No credit card required. Start building or learning today.</p>
          </div>
        </div>
      </div>
    </section>
  )
}

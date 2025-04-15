"use client"

import { useState, useEffect } from "react"
import { Marquee } from "@/components/magicui/marquee"
import { shouldReduceMotion } from "@/lib/utils"

export function TrustedBySection() {
  const [reduceMotion, setReduceMotion] = useState(false)
  
  useEffect(() => {
    setReduceMotion(shouldReduceMotion())
  }, [])

  // Statistics about the platform (placeholder numbers for MVP)
  const stats = [
    { value: "1,000+", label: "Skilled Builders" },
    { value: "2,500+", label: "Happy Clients" },
    { value: "10,000+", label: "Learners" },
    { value: "150+", label: "AI Skills Taught" },
  ]

  // Partner logos (placeholders for MVP)
  const partners = [
    "Company A",
    "Company B", 
    "Organization C",
    "Institution D",
    "Partner E",
    "Accelerator F",
    "Venture G",
    "Studio H",
  ]

  return (
    <section className="w-full py-12 border-t border-b bg-muted/40">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center gap-8">
          {/* Section headline */}
          <h2 className="text-2xl font-semibold text-center">
            Trusted by Builders, Entrepreneurs, and Learners
          </h2>
          
          {/* Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12 w-full max-w-4xl">
            {stats.map((stat, index) => (
              <div key={index} className="flex flex-col items-center text-center">
                <p className="text-3xl md:text-4xl font-bold text-primary">
                  {stat.value}
                </p>
                <p className="text-sm md:text-base text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
          
          {/* Partner logos marquee */}
          <div className="w-full mt-8">
            <Marquee 
              className="py-8" 
              pauseOnHover={true} 
              speed={40} 
              reverse={false} 
              shouldReduceMotion={reduceMotion}
            >
              {partners.map((partner, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-center h-10 mx-8 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all"
                >
                  {/* Placeholder for partner logo */}
                  <div className="bg-muted px-6 py-2 rounded text-muted-foreground text-sm">
                    {partner}
                  </div>
                </div>
              ))}
            </Marquee>
          </div>
        </div>
      </div>
    </section>
  )
}

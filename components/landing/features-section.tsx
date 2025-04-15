"use client"

import { SphereMask } from "@/components/magicui/sphere-mask"
import { BorderBeam } from "@/components/magicui/border-beam"
import { shouldReduceMotion } from "@/lib/utils"
import { useEffect, useState } from "react"

export function FeaturesSection() {
  const [reduceMotion, setReduceMotion] = useState(false)
  
  useEffect(() => {
    setReduceMotion(shouldReduceMotion())
  }, [])

  // Core features based on our 3-step process
  const coreFeatures = [
    {
      title: "Discover",
      description: "Find skilled AI builders verified through transparent metrics or explore learning paths to build skills yourself.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-10 w-10"
        >
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.3-4.3"></path>
        </svg>
      ),
    },
    {
      title: "Create",
      description: "Develop custom applications at affordable prices through our marketplace or by following our learning hub.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-10 w-10"
        >
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
        </svg>
      ),
    },
    {
      title: "Grow",
      description: "Join a community dedicated to democratizing AI through knowledge sharing and continuous learning.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-10 w-10"
        >
          <path d="M18 6 7 17l-5-5"></path>
          <path d="m22 10-7.5 7.5L13 16"></path>
        </svg>
      ),
    },
  ]

  // Additional features highlighting platform capabilities
  const additionalFeatures = [
    {
      title: "AI Literacy Timeline",
      description: "Explore what AI can and can't do with our constantly updated interactive timeline.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6"
        >
          <path d="M12 8v4l3 3"></path>
          <circle cx="12" cy="12" r="10"></circle>
        </svg>
      ),
    },
    {
      title: "Skill Tree",
      description: "Visualize your learning journey with our gamified skill progression system.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6"
        >
          <path d="M12 3v18"></path>
          <rect x="3" y="8" width="7" height="6" rx="2"></rect>
          <rect x="14" y="8" width="7" height="6" rx="2"></rect>
        </svg>
      ),
    },
    {
      title: "Validation System",
      description: "Find builders you can trust with our transparent, outcome-based validation metrics.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        </svg>
      ),
    },
    {
      title: "Community Learning",
      description: "Learn together through collaborative projects and knowledge sharing.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      ),
    },
  ]

  return (
    <section className="w-full py-12 md:py-24">
      <div className="container px-4 md:px-6">
        {/* Core features (3-step process) */}
        <div className="flex flex-col items-center gap-4 text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold">
            Your Journey to AI Empowerment
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl max-w-[42rem]">
            Our platform guides you through a simple three-step process to harness the power of AI
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-16 md:mb-24">
          {coreFeatures.map((feature, index) => (
            <BorderBeam
              key={index}
              containerClassName="h-full"
              className="rounded-xl"
              size="small"
              shouldReduceMotion={reduceMotion}
            >
              <div className="relative h-full p-6 bg-background rounded-xl border flex flex-col items-center text-center gap-4">
                <div className="p-2 rounded-full bg-primary/10 text-primary">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            </BorderBeam>
          ))}
        </div>
        
        {/* Additional features */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            <h3 className="text-2xl md:text-3xl font-bold">
              Unique Features That Set Us Apart
            </h3>
            <p className="text-muted-foreground">
              Buildappswith combines marketplace functionality with educational resources to democratize AI application development
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
              {additionalFeatures.map((feature, index) => (
                <div key={index} className="flex gap-4">
                  <div className="mt-1 p-1 rounded-lg bg-primary/10 text-primary h-fit">
                    {feature.icon}
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-medium">{feature.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <SphereMask
            shouldReduceMotion={reduceMotion}
            revealSpeed={0.8}
            className="w-full aspect-square lg:aspect-auto"
          >
            <div className="w-full h-full min-h-[320px] bg-muted rounded-lg p-4 flex items-center justify-center">
              {/* Placeholder for an actual feature visualization/illustration */}
              <div className="text-center text-muted-foreground">
                <p className="text-sm">Feature Visualization</p>
                <p className="text-xs">(Skill Tree or AI Timeline Preview)</p>
              </div>
            </div>
          </SphereMask>
        </div>
      </div>
    </section>
  )
}

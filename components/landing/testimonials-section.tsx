"use client"

import { BorderBeam } from "@/components/magicui/border-beam"
import { shouldReduceMotion } from "@/lib/utils"
import { useEffect, useState } from "react"

export function TestimonialsSection() {
  const [reduceMotion, setReduceMotion] = useState(false)
  
  useEffect(() => {
    setReduceMotion(shouldReduceMotion())
  }, [])

  // Sample testimonials based on our user personas
  const testimonials = [
    {
      quote: "I was able to build a custom inventory management app for a fraction of what agencies quoted me. The builder I worked with explained everything clearly and delivered exactly what I needed.",
      name: "Sarah Johnson",
      role: "Small Business Owner",
      avatar: "S",  // Placeholder for actual avatar image
      persona: "client",
    },
    {
      quote: "The skill tree approach made learning AI development practical and engaging. In just two months, I built my first AI-powered app and landed a new job with double my previous salary.",
      name: "Miguel Reyes",
      role: "Former Marketing Professional",
      avatar: "M",  // Placeholder for actual avatar image
      persona: "learner",
    },
    {
      quote: "As a developer, I finally found a platform that values quality over price wars. The validation system means clients understand my value, and I can focus on delivering excellence.",
      name: "Aisha Patel",
      role: "AI Application Developer",
      avatar: "A",  // Placeholder for actual avatar image
      persona: "builder",
    },
  ]

  // Success stories highlighting tangible outcomes
  const successStories = [
    {
      title: "From Idea to Launch in 3 Weeks",
      description: "A fitness startup used Buildappswith to create a custom workout recommendation app, launching 75% faster than traditional development.",
      metric: "75%",
      metricLabel: "Faster Launch",
    },
    {
      title: "Career Transformation",
      description: "Over 200 learners have successfully transitioned to technical roles after completing our AI application development paths.",
      metric: "200+",
      metricLabel: "Career Transitions",
    },
    {
      title: "Business Growth",
      description: "Small businesses report an average 32% increase in operational efficiency after implementing apps built through our platform.",
      metric: "32%",
      metricLabel: "Efficiency Increase",
    },
  ]

  return (
    <section className="w-full py-12 md:py-24 bg-muted/30">
      <div className="container px-4 md:px-6">
        {/* Section header */}
        <div className="flex flex-col items-center gap-4 text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold">
            Real People, Real Results
          </h2>
          <p className="text-muted-foreground text-lg max-w-[42rem]">
            Don't just take our word for it — hear from our community of clients, learners, and builders
          </p>
        </div>
        
        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <BorderBeam
              key={index}
              containerClassName="h-full"
              className="rounded-xl"
              size="small"
              delay={index * 200}
              shouldReduceMotion={reduceMotion}
            >
              <div className="h-full p-6 bg-background rounded-xl border flex flex-col">
                <div className="flex-1">
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
                    className="h-8 w-8 text-muted-foreground/50 mb-4"
                  >
                    <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"></path>
                    <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"></path>
                  </svg>
                  <p className="text-base italic mb-6">{testimonial.quote}</p>
                </div>
                
                <div className="flex items-center gap-3 pt-4 border-t">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-medium">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="font-medium">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            </BorderBeam>
          ))}
        </div>
        
        {/* Success Stories */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-center mb-8">Success Stories</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {successStories.map((story, index) => (
              <div key={index} className="relative p-6 bg-background rounded-xl border flex flex-col items-center text-center gap-4">
                <div className="text-3xl md:text-4xl font-bold text-primary">{story.metric}</div>
                <p className="text-sm text-muted-foreground">{story.metricLabel}</p>
                <h4 className="text-lg font-medium">{story.title}</h4>
                <p className="text-sm text-muted-foreground">{story.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

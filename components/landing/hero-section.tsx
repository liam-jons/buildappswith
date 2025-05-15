"use client";

import { cn } from "@/lib/utils";
import { BrandWordRotate } from "./brand-word-rotate";
import { HeroContent, HeroSectionProps } from "./types";
import { heroContent } from "./data.tsx";
import Link from "next/link";
import { motion } from "framer-motion";
import { AuroraText } from "@/components/magicui/aurora-text";
import { Terminal, TerminalTypingAnimation, AnimatedSpan } from "@/components/magicui/terminal";

export function HeroSection({ 
  className, 
  content = heroContent 
}: HeroSectionProps) {
  // Extract content data
  const { headline, subheadline, rotatingNames, primaryCTA, secondaryCTA } = content;

  return (
    <section 
      id="hero" 
      className={cn(
        "w-full py-20 md:py-28 lg:py-32 relative overflow-hidden",
        className
      )}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 h-full w-full [background:radial-gradient(125%_125%_at_50%_10%,var(--background)_40%,var(--secondary)_100%)]"></div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-20 left-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 right-0 w-80 h-80 bg-secondary/10 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Content */}
          <div className="flex flex-col items-center text-center space-y-8">
            {/* Two-row headline */}
            <div className="space-y-6">
              {/* First row - "Build apps with" */}
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-balance">
                Build <AuroraText className="inline-block">apps</AuroraText> with
              </h1>
              
              {/* Second row - Word rotation with brand colors */}
              <h2 className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight">
                <BrandWordRotate
                  words={rotatingNames}
                  duration={2000}
                  motionProps={{
                    initial: { opacity: 0, y: 20 },
                    animate: { opacity: 1, y: 0 },
                    exit: { opacity: 0, y: -20 },
                    transition: { duration: 0.3, ease: "easeOut" },
                  }}
                />
              </h2>
            </div>
            
            {/* Start benefiting from AI today on its own row */}
            <p className="text-2xl md:text-3xl font-medium text-black dark:text-white max-w-3xl mx-auto text-balance">
              Start benefiting from AI today.
            </p>
            
            {/* Remaining subheadline text */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto text-balance leading-relaxed -mt-4">
              Whether you want to be better at what you do, pivot to something new, or just to stay up-to-date - Build Apps With is the only place you&apos;ll need.
            </p>
            
            {/* Updated CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href="/how-it-works"
                  className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 text-base font-medium text-white shadow-lg hover:bg-primary/90 transition-colors"
                >
                  Learn How It Works
                </Link>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href="/signup"
                  className="inline-flex h-12 items-center justify-center rounded-full bg-secondary/50 px-8 text-base font-medium text-primary border border-primary/10 hover:bg-secondary/70 transition-colors"
                >
                  Sign Up Now
                </Link>
              </motion.div>
            </div>
          </div>
          
          {/* Terminal component */}
          <div className="mt-16 flex justify-center">
            <Terminal className="w-full max-w-3xl">
              <AnimatedSpan delay={0}>
                $ buildappswith --help
              </AnimatedSpan>
              <AnimatedSpan delay={100}>
                Welcome to Build Apps With - Your AI App Development Platform
              </AnimatedSpan>
              <AnimatedSpan delay={200}>
                
              </AnimatedSpan>
              <AnimatedSpan delay={300}>
                Available commands:
              </AnimatedSpan>
              <AnimatedSpan delay={400}>
                  accelerate    - Boost your AI development skills
              </AnimatedSpan>
              <AnimatedSpan delay={500}>
                  pivot         - Transition to AI-powered roles
              </AnimatedSpan>
              <AnimatedSpan delay={600}>
                  play          - Explore AI tools and experiments
              </AnimatedSpan>
              <AnimatedSpan delay={700}>
                  marketplace   - Find AI builders and experts
              </AnimatedSpan>
              <AnimatedSpan delay={800}>
                
              </AnimatedSpan>
              <AnimatedSpan delay={900}>
                $ buildappswith accelerate
              </AnimatedSpan>
              <TerminalTypingAnimation delay={1000} duration={40}>
                Connecting you with AI experts to accelerate your learning...
              </TerminalTypingAnimation>
            </Terminal>
          </div>
        </div>
      </div>
    </section>
  );
}
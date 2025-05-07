"use client";

import { cn } from "@/lib/utils";
import { WordRotate } from "@/components/magicui/word-rotate";
import { HeroContent, HeroSectionProps } from "./types";
import { heroContent } from "./data.tsx";
import Link from "next/link";
import { motion } from "framer-motion";

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
            <div className="space-y-2">
              {/* First row - "Build apps with" */}
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-balance">
                Build <span className="text-teal-500">apps</span> with
              </h1>
              
              {/* Second row - Word rotation in purple */}
              <h2 className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-purple-600 dark:text-purple-400">
                <WordRotate
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
              Whether you want to become more efficient in what you do, pivot to something new, or just to stay up-to-date - Build Apps With, is the only place you&apos;ll need.
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
          
          {/* Hero image */}
          <div className="mt-16 relative">
            <div className="aspect-[16/9] overflow-hidden rounded-2xl border border-primary/10 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent z-10"></div>
              
              <img 
                src="/hero-light.png" 
                alt="Learn AI with people, not just prompts" 
                className="block dark:hidden w-full h-full object-cover"
                loading="eager"
              />
              <img 
                src="/hero-dark.png" 
                alt="Learn AI with people, not just prompts" 
                className="hidden dark:block w-full h-full object-cover"
                loading="eager"
              />
            </div>
            
            {/* Visual indicators of human interaction */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="absolute -bottom-5 -left-5 size-24 rounded-full bg-white dark:bg-zinc-900 shadow-lg p-3 border border-primary/10 md:block hidden"
            >
              <img 
                src="https://i.pravatar.cc/150?img=3" 
                alt="AI mentor" 
                className="w-full h-full rounded-full object-cover"
              />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="absolute -bottom-5 right-12 size-16 rounded-full bg-white dark:bg-zinc-900 shadow-lg p-2 border border-primary/10 md:block hidden"
            >
              <img 
                src="https://i.pravatar.cc/150?img=8" 
                alt="AI learner" 
                className="w-full h-full rounded-full object-cover"
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
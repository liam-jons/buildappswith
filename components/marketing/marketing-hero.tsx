"use client";

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

export interface MarketingHeroProps {
  badge?: string;
  badgeIcon?: React.ReactNode;
  headline?: string;
  subheadline?: string;
  primaryCTA?: {
    text: string;
    href: string;
  };
  secondaryCTA?: {
    text: string;
    href: string;
  };
  disableAnimations?: boolean;
  imageLightSrc?: string;
  imageDarkSrc?: string;
  imageAlt?: string;
  className?: string;
  headlineRotatingWords?: string[];
}

export function MarketingHero({
  badge = "Build Apps With AI",
  badgeIcon = "🚀",
  headline = "Launch your product with expert AI builders",
  subheadline = "Connect with AI-proficient developers to bring your ideas to life. Our platform makes it easy to find, book, and collaborate with the best technical talent.",
  primaryCTA = {
    text: "Find Builders",
    href: "/marketplace",
  },
  secondaryCTA = {
    text: "How It Works",
    href: "/how-it-works",
  },
  disableAnimations = false,
  imageLightSrc = "/hero-light.png",
  imageDarkSrc = "/hero-dark.png",
  imageAlt = "Build Apps With Hero",
  className,
  headlineRotatingWords,
}: MarketingHeroProps) {
  const [rotatingWordIndex, setRotatingWordIndex] = useState(0);
  const [displayHeadline, setDisplayHeadline] = useState(headline);
  
  // If rotating words are provided, implement the rotation effect
  useEffect(() => {
    if (!headlineRotatingWords || !headlineRotatingWords.length || disableAnimations) return;
    
    const interval = setInterval(() => {
      setRotatingWordIndex((prev) => (prev + 1) % headlineRotatingWords.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [headlineRotatingWords, disableAnimations]);
  
  // Update the headline with the rotating word
  useEffect(() => {
    if (!headlineRotatingWords || !headlineRotatingWords.length) return;
    
    setDisplayHeadline(headline.replace('[word]', headlineRotatingWords[rotatingWordIndex]));
  }, [rotatingWordIndex, headline, headlineRotatingWords]);

  return (
    <section id="hero" className={cn("w-full relative", className)}>
      <div className="relative flex flex-col items-center w-full px-6">
        <div className="absolute inset-0">
          <div className="absolute inset-0 -z-10 h-[600px] md:h-[800px] w-full [background:radial-gradient(125%_125%_at_50%_10%,var(--background)_40%,var(--secondary)_100%)] rounded-b-xl"></div>
        </div>
        <div className="relative z-10 pt-32 max-w-3xl mx-auto h-full w-full flex flex-col gap-10 items-center justify-center">
          <p className="border border-border bg-accent rounded-full text-sm h-8 px-3 flex items-center gap-2">
            {badgeIcon}
            {badge}
          </p>
          <div className="flex flex-col items-center justify-center gap-5">
            <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-medium tracking-tighter text-balance text-center text-primary">
              {displayHeadline}
            </h1>
            <p className="text-base md:text-lg text-center text-muted-foreground font-medium text-balance leading-relaxed tracking-tight">
              {subheadline}
            </p>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap justify-center">
            <Link
              href={primaryCTA.href}
              className="bg-secondary h-9 flex items-center justify-center text-sm font-normal tracking-wide rounded-full text-primary-foreground dark:text-secondary-foreground w-32 px-4 shadow-[inset_0_1px_2px_rgba(255,255,255,0.25),0_3px_3px_-1.5px_rgba(16,24,40,0.06),0_1px_1px_rgba(16,24,40,0.08)] border border-white/[0.12] hover:bg-secondary/80 transition-all ease-out active:scale-95"
            >
              {primaryCTA.text}
            </Link>
            <Link
              href={secondaryCTA.href}
              className="h-10 flex items-center justify-center w-32 px-5 text-sm font-normal tracking-wide text-primary rounded-full transition-all ease-out active:scale-95 bg-white dark:bg-background border border-[#E5E7EB] dark:border-[#27272A] hover:bg-white/80 dark:hover:bg-background/80"
            >
              {secondaryCTA.text}
            </Link>
          </div>
        </div>
      </div>
      <div className="relative px-6 mt-10">
        <div className="relative size-full shadow-xl rounded-2xl overflow-hidden">
          <img 
            src={imageLightSrc} 
            alt={imageAlt} 
            className="block dark:hidden w-full h-auto"
          />
          <img 
            src={imageDarkSrc} 
            alt={imageAlt} 
            className="hidden dark:block w-full h-auto"
          />
        </div>
      </div>
    </section>
  );
}

// Maintain default export for backward compatibility
export default MarketingHero;
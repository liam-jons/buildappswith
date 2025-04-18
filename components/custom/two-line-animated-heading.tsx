"use client";

import { cn } from "@/lib/utils";
import { WordRotate } from "@/components/magicui/word-rotate";
import TextShimmer from "@/components/magicui/text-shimmer";

interface TwoLineAnimatedHeadingProps {
  names?: string[];
  interval?: number; // in milliseconds
  className?: string;
  headingClassName?: string;
  staticTextClassName?: string;
  appsClassName?: string;
  animatedTextClassName?: string;
  shimmerAnimatedText?: boolean;
}

export default function TwoLineAnimatedHeading({
  names = [
    "Liam", 
    "Peter", 
    "Kenny", 
    "Ryan", 
    "Sheri", 
    "Kemi", 
    "Stormzy", 
    "Steven",
    "your team",
    "your friends",
    "your community",
    "someone you trust"
  ],
  interval = 2500,
  className = "",
  headingClassName = "",
  staticTextClassName = "bg-gradient-to-br dark:from-white from-black from-30% dark:to-white/40 to-black/40 bg-clip-text text-transparent",
  appsClassName = "text-blue-500 dark:text-blue-400",
  animatedTextClassName = "text-[#9c40ff] dark:text-[#ffaa40]",
  shimmerAnimatedText = true,
}: TwoLineAnimatedHeadingProps) {
  
  return (
    <div className={cn("text-center", className)}>
      {/* First line - static text */}
      <h1 className={cn("text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-medium leading-tight tracking-tighter", headingClassName)}>
        <span className={staticTextClassName}>Build </span>
        <span className={appsClassName}>apps </span>
        <span className={staticTextClassName}>with</span>
      </h1>
      
      {/* Second line - WordRotate */}
      <div className="mt-6 sm:mt-8 md:mt-10 lg:mt-12 mb-6 lg:mb-8 min-h-[1.5em] flex justify-center items-center w-full">
        {shimmerAnimatedText ? (
          <TextShimmer className="overflow-visible">
            <div className="overflow-visible">
              <WordRotate
                words={names}
                duration={interval}
                className={cn("text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-medium leading-tight tracking-tighter inline-block whitespace-nowrap", animatedTextClassName)}
                motionProps={{
                  initial: { opacity: 0, y: 15 },
                  animate: { opacity: 1, y: 0 },
                  exit: { opacity: 0, y: -15 },
                  transition: { duration: 0.3, ease: "easeInOut" }
                }}
              />
            </div>
          </TextShimmer>
        ) : (
          <div className="overflow-visible">
            <WordRotate
              words={names}
              duration={interval}
              className={cn("text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-medium leading-tight tracking-tighter inline-block whitespace-nowrap", animatedTextClassName)}
              motionProps={{
                initial: { opacity: 0, y: 15 },
                animate: { opacity: 1, y: 0 },
                exit: { opacity: 0, y: -15 },
                transition: { duration: 0.3, ease: "easeInOut" }
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
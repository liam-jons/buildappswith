"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import TextShimmer from "@/components/magicui/text-shimmer";

interface InlineAnimatedHeadingProps {
  names?: string[];
  interval?: number; // in milliseconds
  className?: string;
  headingClassName?: string;
  appsClassName?: string;
  animatedTextClassName?: string;
  shimmerAnimatedText?: boolean;
}

export default function InlineAnimatedHeading({
  names = [
    "Liam", 
    "Kenny", 
    "Jonathan", 
    "Sheri", 
    "Sarah", 
    "Miguel", 
    "Aisha",
    "your team",
    "your friends",
    "your enemy",
    "Stormzy",
    "Steven",
    "Peter",
    "Ryan",
    "Kemi"
  ],
  interval = 3000,
  className = "",
  headingClassName = "",
  appsClassName = "text-[#9c40ff] dark:text-[#ffaa40]",
  animatedTextClassName = "text-[#9c40ff] dark:text-[#ffaa40]",
  shimmerAnimatedText = false,
}: InlineAnimatedHeadingProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const shouldReduceMotion = useReducedMotion();
  
  // Find the longest name to calculate min-width
  const findLongestName = () => {
    if (!names.length) return "";
    return names.reduce((longest, current) => 
      current.length > longest.length ? current : longest
    );
  };
  
  // Store the longest name for width calculation
  const longestName = findLongestName();
  
  useEffect(() => {
    // If user prefers reduced motion, use longer intervals
    const adjustedInterval = shouldReduceMotion ? interval * 2 : interval;
    
    // Toggle visibility for transition effect
    const visibilityTimer = setInterval(() => {
      setIsVisible(false);
      
      // Change name after exit animation completes
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % names.length);
        setIsVisible(true);
      }, shouldReduceMotion ? 100 : 300); // Shorter delay for reduced motion
      
    }, adjustedInterval);
    
    return () => {
      clearInterval(visibilityTimer);
    };
  }, [interval, names.length, shouldReduceMotion]);
  
  return (
    <div className={cn("text-center", className)}>
      <h1 className={cn("text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-medium leading-none tracking-tighter whitespace-nowrap", headingClassName)}>
        <span className="bg-gradient-to-br dark:from-white from-black from-30% dark:to-white/40 to-black/40 bg-clip-text text-transparent">Build </span>
        <span className={appsClassName}>apps </span>
        <span className="bg-gradient-to-br dark:from-white from-black from-30% dark:to-white/40 to-black/40 bg-clip-text text-transparent">with </span>
        
        <span className="inline-block">
          <AnimatePresence mode="wait">
            {isVisible && (
              <motion.span
                key={names[currentIndex]}
                initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
                animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
                transition={{ duration: shouldReduceMotion ? 0.2 : 0.3, ease: "easeInOut" }}
                className={cn("inline-block", animatedTextClassName)}
              >
                {shimmerAnimatedText ? (
                  <TextShimmer className="inline-block font-medium">
                    {names[currentIndex]}
                  </TextShimmer>
                ) : (
                  names[currentIndex]
                )}
              </motion.span>
            )}
          </AnimatePresence>
        </span>
      </h1>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
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
    "Kenny", 
    "Jonathan", 
    "Sheri", 
    "Sarah", 
    "Miguel", 
    "Aisha",
    "your team",
    "your friends",
    "your business",
    "your customers",
    "your community",
    "your future",
    "everyone"
  ],
  interval = 3000,
  className = "",
  headingClassName = "",
  staticTextClassName = "bg-gradient-to-br dark:from-white from-black from-30% dark:to-white/40 to-black/40 bg-clip-text text-transparent",
  appsClassName = "text-blue-500 dark:text-blue-400",
  animatedTextClassName = "text-[#9c40ff] dark:text-[#ffaa40]",
  shimmerAnimatedText = false,
}: TwoLineAnimatedHeadingProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const shouldReduceMotion = useReducedMotion();
  
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
      {/* First line - static text */}
      <h1 className={cn("text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-medium leading-tight tracking-tighter", headingClassName)}>
        <span className={staticTextClassName}>Build </span>
        <span className={appsClassName}>apps </span>
        <span className={staticTextClassName}>with</span>
      </h1>
      
      {/* Second line - animated text - increased spacing */}
      <div className="h-[1.2em] mt-6 sm:mt-8 md:mt-10 lg:mt-12 mb-6 lg:mb-8 relative flex justify-center items-center w-full">
        <AnimatePresence mode="wait">
          {isVisible && (
            <motion.h1
              key={names[currentIndex]}
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
              animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
              transition={{ duration: shouldReduceMotion ? 0.2 : 0.3, ease: "easeInOut" }}
              className={cn("text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-medium leading-tight tracking-tighter text-center", animatedTextClassName)}
            >
              {shimmerAnimatedText ? (
                <TextShimmer className="inline-block font-medium">
                  {names[currentIndex]}
                </TextShimmer>
              ) : (
                names[currentIndex]
              )}
            </motion.h1>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
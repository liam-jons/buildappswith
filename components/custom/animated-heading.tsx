"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import TextShimmer from "@/components/magicui/text-shimmer";

interface AnimatedHeadingProps {
  staticText?: string;
  names?: string[];
  interval?: number; // in milliseconds
  className?: string;
  staticTextClassName?: string;
  animatedTextClassName?: string;
  shimmerAnimatedText?: boolean;
}

export default function AnimatedHeading({
  staticText = "Build Apps With",
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
  staticTextClassName = "",
  animatedTextClassName = "text-[#9c40ff] dark:text-[#ffaa40]", // Using Magic UI border-beam colors
  shimmerAnimatedText = true,
}: AnimatedHeadingProps) {
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
    <h1 className={cn("flex flex-wrap justify-center items-baseline gap-x-3 gap-y-1", className)}>
      <span className={cn("", staticTextClassName)}>{staticText}</span>
      
      <div className="relative inline-block" style={{ minWidth: `${longestName.length * 0.6}em` }}>
        <AnimatePresence mode="wait">
          {isVisible && (
            <motion.span
              key={names[currentIndex]}
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
              animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
              transition={{ duration: shouldReduceMotion ? 0.2 : 0.3, ease: "easeInOut" }}
              className={cn("absolute left-0 top-0", animatedTextClassName)}
              style={{ whiteSpace: "nowrap" }}
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
      </div>
    </h1>
  );
}

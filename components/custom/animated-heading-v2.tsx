"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import TextShimmer from "@/components/magicui/text-shimmer";

interface AnimatedHeadingProps {
  prefixText?: string;
  highlightedText?: string;
  suffixText?: string;
  names?: string[];
  interval?: number; // in milliseconds
  className?: string;
  staticTextClassName?: string;
  highlightedTextClassName?: string;
  animatedTextClassName?: string;
  shimmerAnimatedText?: boolean;
}

export default function AnimatedHeadingV2({
  prefixText = "Build",
  highlightedText = "apps",
  suffixText = "with",
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
  highlightedTextClassName = "text-[#9c40ff] dark:text-[#ffaa40]",
  animatedTextClassName = "text-[#9c40ff] dark:text-[#ffaa40]", // Using Magic UI border-beam colors
  shimmerAnimatedText = false,
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
    <h1 className={cn("inline-flex flex-row items-baseline justify-center gap-x-1 md:gap-x-3 text-center", className)}>
      <span className={cn("", staticTextClassName)}>
        {prefixText}{" "}
        <span className={cn("", highlightedTextClassName)}>{highlightedText}</span>
        {" "}{suffixText}
      </span>
      {" "}
      <span className="relative inline-block" style={{ minWidth: `${longestName.length * 0.7}em` }}>
        <AnimatePresence mode="wait">
          {isVisible && (
            <motion.span
              key={names[currentIndex]}
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
              animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
              transition={{ duration: shouldReduceMotion ? 0.2 : 0.3, ease: "easeInOut" }}
              className={cn("absolute left-0 top-0 whitespace-nowrap", animatedTextClassName)}
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
  );
}

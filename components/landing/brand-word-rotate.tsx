"use client";

import { AnimatePresence, motion, MotionProps } from "motion/react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

// Define the brand config type
interface BrandConfig {
  className: string;
  font: string;
  additionalStyles?: string;
}

// Brand configurations with approximate colors and fonts
const brandConfigs: Record<string, BrandConfig> = {
  Claude: {
    className: "text-[#D97757]", // Claude's orange/coral color
    font: "Inter, sans-serif",
  },
  Gemini: {
    className: "text-[#4285F4]", // Google blue
    font: "Product Sans, Inter, sans-serif",
  },
  Cursor: {
    className: "text-[#646cff]", // Cursor's purple-blue
    font: "Inter, sans-serif",
  },
  Lovable: {
    className: "text-[#FF4785]", // Lovable's pink
    font: "Inter, sans-serif",
  },
  ChatGPT: {
    className: "text-[#10A37F]", // OpenAI green
    font: "Inter, sans-serif",
  },
  Bolt: {
    className: "text-[#FFCE00]", // Bolt's yellow
    font: "Inter, sans-serif",
    additionalStyles: "drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]", // Add shadow for yellow text
  },
};

interface BrandWordRotateProps {
  words: string[];
  duration?: number;
  motionProps?: MotionProps;
  className?: string;
}

export function BrandWordRotate({
  words,
  duration = 2500,
  motionProps = {
    initial: { opacity: 0, y: -50 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 50 },
    transition: { duration: 0.25, ease: "easeOut" },
  },
  className,
}: BrandWordRotateProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, duration);

    return () => clearInterval(interval);
  }, [words, duration]);

  const currentWord = words[index];
  const brandConfig = brandConfigs[currentWord as keyof typeof brandConfigs];
  
  // Use brand styling if available, otherwise use a distinguished color
  const wordClassName = brandConfig 
    ? cn(brandConfig.className, brandConfig.additionalStyles || "")
    : "text-purple-600 dark:text-purple-400"; // Default purple for non-brand words
  const wordFont = brandConfig?.font;

  return (
    <div className="overflow-hidden py-2">
      <AnimatePresence mode="wait">
        <motion.h1
          key={currentWord}
          className={cn(className, wordClassName)}
          style={{ fontFamily: wordFont }}
          {...motionProps}
        >
          {currentWord}
        </motion.h1>
      </AnimatePresence>
    </div>
  );
}
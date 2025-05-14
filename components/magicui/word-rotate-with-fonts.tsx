"use client";

import { AnimatePresence, motion, MotionProps } from "motion/react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface WordConfig {
  text: string;
  font?: string;
  className?: string;
}

interface WordRotateWithFontsProps {
  words: (string | WordConfig)[];
  duration?: number;
  motionProps?: MotionProps;
  className?: string;
}

export function WordRotateWithFonts({
  words,
  duration = 2500,
  motionProps = {
    initial: { opacity: 0, y: -50 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 50 },
    transition: { duration: 0.25, ease: "easeOut" },
  },
  className,
}: WordRotateWithFontsProps) {
  const [index, setIndex] = useState(0);

  // Normalize words to WordConfig format
  const normalizedWords: WordConfig[] = words.map((word) => {
    if (typeof word === "string") {
      return { text: word };
    }
    return word;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % normalizedWords.length);
    }, duration);

    return () => clearInterval(interval);
  }, [normalizedWords, duration]);

  const currentWord = normalizedWords[index];

  return (
    <div className="overflow-hidden py-2">
      <AnimatePresence mode="wait">
        <motion.h1
          key={currentWord.text}
          className={cn(className, currentWord.className)}
          style={{ fontFamily: currentWord.font }}
          {...motionProps}
        >
          {currentWord.text}
        </motion.h1>
      </AnimatePresence>
    </div>
  );
}
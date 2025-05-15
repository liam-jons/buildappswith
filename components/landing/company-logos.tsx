"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

// Logo configurations with proper titles
const logoConfigs = [
  { file: "anthropic-logo.svg", title: "Anthropic", colorClass: "text-[#D97757]" },
  { file: "supabase-logo.svg", title: "Supabase", colorClass: "text-[#3ECF8E]" },
  { file: "neon-logo.svg", title: "Neon", colorClass: "text-[#00E699]" },
  { file: "lovable-logo.svg", title: "Lovable", colorClass: "text-[#FF4785]" },
  { file: "perplexity-logo.svg", title: "Perplexity", colorClass: "text-[#1FB8CD]" },
  { file: "vercel-logo.svg", title: "Vercel", colorClass: "text-black dark:text-white" },
];

interface CompanyLogosProps {
  animated?: boolean;
  className?: string;
}

export function CompanyLogos({ animated = true, className = "" }: CompanyLogosProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!animated) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % logoConfigs.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [animated]);

  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-8 items-center ${className}`}>
      {logoConfigs.map((config, idx) => (
        <div
          key={config.file}
          className="relative flex items-center justify-center group"
        >
          {animated ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={`${config.file}-${currentIndex === idx}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: currentIndex === idx ? 1 : 0.3,
                  scale: currentIndex === idx ? 1.05 : 1 
                }}
                exit={{ opacity: 0.3, scale: 1 }}
                transition={{
                  duration: 0.5,
                  ease: "easeInOut",
                }}
                className="flex flex-col items-center"
              >
                <Image
                  width={120}
                  height={60}
                  src={`/logos/${config.file}`}
                  className="h-12 w-auto grayscale hover:grayscale-0 transition-all duration-200 ease-out"
                  alt={config.title}
                />
                <span 
                  className={`text-sm font-medium mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${config.colorClass}`}
                >
                  {config.title}
                </span>
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="flex flex-col items-center">
              <Image
                width={120}
                height={60}
                src={`/logos/${config.file}`}
                className="h-12 w-auto grayscale hover:grayscale-0 transition-all duration-200 ease-out opacity-30 hover:opacity-100"
                alt={config.title}
              />
              <span 
                className={`text-sm font-medium mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${config.colorClass}`}
              >
                {config.title}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
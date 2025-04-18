'use client';

import { AICapability } from '@/lib/timeline/types';
import { CapabilityCard } from './capability-card';
import { motion } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';

interface TimelineTrackProps {
  capabilities: AICapability[];
  lastItemRef: (node: HTMLDivElement) => void;
}

/**
 * TimelineTrack Component
 * 
 * Renders the visual timeline track with capability cards positioned chronologically.
 * Includes the vertical line connecting all items and version markers for model improvements.
 */
export function TimelineTrack({ capabilities, lastItemRef }: TimelineTrackProps) {
  const shouldReduceMotion = useReducedMotion();
  
  // Animation variants for the timeline track
  const trackVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: shouldReduceMotion ? 0 : 0.3
      }
    }
  };
  
  // Animation variants for individual cards
  const cardVariants = {
    hidden: { 
      opacity: 0,
      y: shouldReduceMotion ? 0 : 20 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0 : 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="relative pt-4 pb-12">
      {/* The vertical timeline track/line */}
      <motion.div 
        className="absolute left-4 sm:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary/70 to-primary/30 dark:from-primary/50 dark:to-primary/20"
        variants={trackVariants}
        aria-hidden="true"
      />
      
      {/* Timeline items */}
      <div className="relative">
        {capabilities.map((capability, index) => {
          const isLast = index === capabilities.length - 1;
          const ref = isLast ? lastItemRef : undefined;
          
          // Place items on alternating sides, except on mobile where all are on the right
          const isEven = index % 2 === 0;
          
          return (
            <motion.div
              key={capability.id}
              ref={ref}
              className={`mb-12 ${isEven ? 'sm:ml-[50%] pl-12 sm:pl-8' : 'sm:mr-[50%] sm:pr-8 pl-12'} sm:w-1/2 w-full relative`}
              variants={cardVariants}
              layout={!shouldReduceMotion}
            >
              {/* Timeline node marker */}
              <div 
                className={`absolute left-3 sm:left-auto ${isEven ? 'sm:-left-3' : 'sm:-right-3'} top-6 w-6 h-6 rounded-full bg-background border-4 ${capability.isModelImprovement ? 'border-amber-500' : 'border-primary'} z-10`}
                aria-hidden="true"
              />
              
              {/* Horizontal connector line */}
              <div 
                className={`absolute top-8 left-0 w-12 h-px ${capability.isModelImprovement ? 'bg-amber-500' : 'bg-primary'}`}
                aria-hidden="true"
              />
              
              {/* The capability card */}
              <CapabilityCard capability={capability} />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

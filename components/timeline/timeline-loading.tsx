'use client';

import { motion } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * TimelineLoading Component
 * 
 * Displays a skeleton loading state for the timeline
 * with accessibility considerations.
 */
export function TimelineLoading() {
  const shouldReduceMotion = useReducedMotion();
  
  // Pulse animation for skeletons
  const pulseVariants = {
    initial: { opacity: 0.7 },
    animate: { 
      opacity: 1,
      transition: { 
        repeat: shouldReduceMotion ? 0 : Infinity, 
        repeatType: "reverse" as const,
        duration: 1 
      }
    }
  };
  
  return (
    <div className="relative flex justify-center py-6" aria-label="Loading timeline content">
      <motion.div
        variants={pulseVariants}
        initial="initial"
        animate="animate"
        className="w-full max-w-md"
      >
        <Card className="mb-6 overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center mb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <Skeleton className="h-6 w-4/5 mb-2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3 mt-1" />
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <Skeleton className="h-28 w-full rounded-md" />
            <Skeleton className="h-24 w-full rounded-md" />
          </CardContent>
        </Card>
        
        <Card className="mb-6 overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center mb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <Skeleton className="h-6 w-3/5 mb-2" />
            <Skeleton className="h-4 w-full" />
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <Skeleton className="h-20 w-full rounded-md" />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

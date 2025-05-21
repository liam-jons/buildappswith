"use client"; // Client directive for interactive components

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";
import { LearningCapability } from "@/lib/learning/types";

import { Button } from "@/components/ui";

interface TimelineItemProps {
  capability: LearningCapability;
  className?: string;
}

/**
 * Timeline Item Component
 * 
 * Displays a single capability item in the AI timeline with interactive
 * elements for expanding details and examples.
 * 
 * @param capability - The learning capability data to display
 * @param className - Optional additional classes
 */
export function TimelineItem({ 
  capability,
  className
}: TimelineItemProps) {
  // State for expanded view
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Accessibility - respect reduced motion preferences
  const shouldReduceMotion = useReducedMotion();
  
  // Status indicator styling
  const statusColor = capability.status === "can" 
    ? "bg-green-500" 
    : capability.status === "cannot" 
      ? "bg-red-500" 
      : "bg-yellow-500";
  
  return (
    <motion.div
      className={cn(
        "timeline-item border rounded-lg p-4 bg-white shadow-sm",
        className
      )}
      animate={shouldReduceMotion ? {} : {
        scale: isExpanded ? 1.02 : 1,
        boxShadow: isExpanded 
          ? "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)" 
          : "0 1px 2px 0 rgba(0, 0, 0, 0.05)"
      }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-start gap-3">
        <div className={cn("w-3 h-3 rounded-full mt-1.5", statusColor)} />
        <div className="flex-1">
          <h4 className="font-medium text-lg">{capability.title}</h4>
          <p className="text-gray-600 mt-1">{capability.description}</p>
          
          {isExpanded && (
            <motion.div 
              className="mt-4 space-y-3"
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, height: 0 }}
              animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, height: "auto" }}
              transition={{ duration: 0.3 }}
            >
              {capability.examples && capability.examples.length > 0 && (
                <div>
                  <h5 className="font-medium mb-2">Examples</h5>
                  <ul className="list-disc pl-5 space-y-1">
                    {capability.examples.map((example: string, index: number) => (
                      <li key={index}>{example}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {capability.limitations && capability.limitations.length > 0 && (
                <div>
                  <h5 className="font-medium mb-2">Limitations</h5>
                  <ul className="list-disc pl-5 space-y-1">
                    {capability.limitations.map((limitation: string, index: number) => (
                      <li key={index} className="text-gray-600">{limitation}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {capability.dateAdded && (
                <div className="text-sm text-gray-500">
                  Added: {new Date(capability.dateAdded).toLocaleDateString()}
                </div>
              )}
            </motion.div>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            className="mt-2"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? "Show Less" : "Show More"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

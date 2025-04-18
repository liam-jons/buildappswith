'use client';

import { useState } from 'react';
import { AICapability, Domain } from '@/lib/timeline/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, Calendar, Check, AlertTriangle, Cpu, ExternalLink } from 'lucide-react';
import { BorderBeam } from '@/components/magicui/border-beam';
import { motion } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';

// Map domains to colors for badges
const domainColors: Record<Domain, { bg: string, border: string, text: string }> = {
  'business': { bg: 'bg-blue-100 dark:bg-blue-950', border: 'border-blue-300 dark:border-blue-800', text: 'text-blue-700 dark:text-blue-300' },
  'education': { bg: 'bg-green-100 dark:bg-green-950', border: 'border-green-300 dark:border-green-800', text: 'text-green-700 dark:text-green-300' },
  'creative': { bg: 'bg-purple-100 dark:bg-purple-950', border: 'border-purple-300 dark:border-purple-800', text: 'text-purple-700 dark:text-purple-300' },
  'healthcare': { bg: 'bg-red-100 dark:bg-red-950', border: 'border-red-300 dark:border-red-800', text: 'text-red-700 dark:text-red-300' },
  'finance': { bg: 'bg-emerald-100 dark:bg-emerald-950', border: 'border-emerald-300 dark:border-emerald-800', text: 'text-emerald-700 dark:text-emerald-300' },
  'science': { bg: 'bg-cyan-100 dark:bg-cyan-950', border: 'border-cyan-300 dark:border-cyan-800', text: 'text-cyan-700 dark:text-cyan-300' },
  'general': { bg: 'bg-gray-100 dark:bg-gray-800', border: 'border-gray-300 dark:border-gray-700', text: 'text-gray-700 dark:text-gray-300' }
};

interface CapabilityCardProps {
  capability: AICapability;
}

/**
 * CapabilityCard Component
 * 
 * Displays information about an individual AI capability, including
 * its description, examples, limitations, and technical requirements.
 */
export function CapabilityCard({ capability }: CapabilityCardProps) {
  const [isExamplesOpen, setIsExamplesOpen] = useState(false);
  const [isLimitationsOpen, setIsLimitationsOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  
  // Format the date to be more readable
  const formattedDate = new Date(capability.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  
  const domainStyle = domainColors[capability.domain];
  
  return (
    <BorderBeam
      duration={15}
      borderWidth={1}
      colorFrom={capability.isModelImprovement ? "#F59E0B" : "#3B82F6"}
      colorTo={capability.isModelImprovement ? "#B45309" : "#1E40AF"}
      className={`bg-background rounded-xl shadow-md`}
    >
      <Card className="overflow-hidden border-none bg-transparent">
        <CardHeader className="pb-2">
          {/* Date and domain badge */}
          <div className="flex flex-wrap justify-between items-center gap-2 mb-1">
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="inline-block w-4 h-4 mr-1" aria-hidden="true" />
              <span>{formattedDate}</span>
            </div>
            
            <Badge 
              variant="outline" 
              className={`${domainStyle.bg} ${domainStyle.border} ${domainStyle.text}`}
            >
              {capability.domain.charAt(0).toUpperCase() + capability.domain.slice(1)}
            </Badge>
          </div>
          
          {/* Title with model improvement badge if applicable */}
          <CardTitle className="flex items-start gap-2">
            {capability.title}
            {capability.isModelImprovement && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800">
                Model Release
              </span>
            )}
          </CardTitle>
          
          {/* Model name if applicable */}
          {capability.modelName && (
            <div className="text-sm font-medium text-muted-foreground -mt-1">
              {capability.modelName}
            </div>
          )}
          
          <CardDescription className="mt-2">
            {capability.description}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4 pt-2">
          {/* Examples section - collapsible */}
          <Collapsible
            open={isExamplesOpen}
            onOpenChange={setIsExamplesOpen}
            className="rounded-md border p-2"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold flex items-center">
                <Check className="w-4 h-4 mr-2 text-green-500" aria-hidden="true" />
                Practical Applications
              </h3>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="p-1 h-8 w-8">
                  {isExamplesOpen ? 
                    <ChevronUp className="h-4 w-4" /> : 
                    <ChevronDown className="h-4 w-4" />
                  }
                  <span className="sr-only">
                    {isExamplesOpen ? "Hide examples" : "Show examples"}
                  </span>
                </Button>
              </CollapsibleTrigger>
            </div>
            
            <CollapsibleContent className="mt-2">
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ 
                  opacity: 1, 
                  height: "auto", 
                  transition: { 
                    duration: shouldReduceMotion ? 0 : 0.3 
                  } 
                }}
                exit={{ opacity: 0, height: 0 }}
              >
                <ul className="space-y-3">
                  {capability.examples.map((example, i) => (
                    <li key={i} className="p-2 rounded-md bg-muted/50">
                      <h4 className="font-medium">{example.title}</h4>
                      <p className="text-sm mt-1 text-muted-foreground">{example.description}</p>
                      {example.implementation && (
                        <div className="mt-2 text-xs text-muted-foreground bg-muted p-2 rounded-md border">
                          <strong>Implementation:</strong> {example.implementation}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </CollapsibleContent>
          </Collapsible>
          
          {/* Limitations section - collapsible */}
          <Collapsible
            open={isLimitationsOpen}
            onOpenChange={setIsLimitationsOpen}
            className="rounded-md border p-2"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2 text-amber-500" aria-hidden="true" />
                Limitations
              </h3>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="p-1 h-8 w-8">
                  {isLimitationsOpen ? 
                    <ChevronUp className="h-4 w-4" /> : 
                    <ChevronDown className="h-4 w-4" />
                  }
                  <span className="sr-only">
                    {isLimitationsOpen ? "Hide limitations" : "Show limitations"}
                  </span>
                </Button>
              </CollapsibleTrigger>
            </div>
            
            <CollapsibleContent className="mt-2">
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ 
                  opacity: 1, 
                  height: "auto", 
                  transition: { 
                    duration: shouldReduceMotion ? 0 : 0.3 
                  } 
                }}
                exit={{ opacity: 0, height: 0 }}
              >
                <ul className="space-y-1 pl-2">
                  {capability.limitations.map((limitation, i) => (
                    <li key={i} className="text-sm flex items-start py-1">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 mr-2 flex-shrink-0" aria-hidden="true" />
                      {limitation}
                    </li>
                  ))}
                </ul>
                
                {/* Technical requirements if available */}
                {capability.technicalRequirements && capability.technicalRequirements.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <h4 className="text-xs font-semibold flex items-center mb-2">
                      <Cpu className="w-3 h-3 mr-1" aria-hidden="true" />
                      Technical Requirements
                    </h4>
                    <ul className="space-y-1 pl-2">
                      {capability.technicalRequirements.map((req, i) => (
                        <li key={i} className="text-xs text-muted-foreground flex items-start">
                          <span className="inline-block w-1 h-1 rounded-full bg-primary mt-1.5 mr-1.5 flex-shrink-0" aria-hidden="true" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
        
        {capability.source && (
          <CardFooter className="pt-0 pb-4">
            <a 
              href={capability.source} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-primary flex items-center transition-colors"
            >
              <ExternalLink className="h-3 w-3 mr-1" aria-hidden="true" />
              Learn more
              <span className="sr-only">about {capability.title} (opens in a new tab)</span>
            </a>
          </CardFooter>
        )}
      </Card>
    </BorderBeam>
  );
}

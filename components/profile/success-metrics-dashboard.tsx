"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/core/tabs";
// Removed TextShimmer import
import { InfoCircledIcon, LightningBoltIcon, BarChartIcon, LapTimerIcon, RocketIcon } from "@radix-ui/react-icons";
import { ValidationTier } from "@/lib/marketplace/types";
import { getValidationTierStyle, validationTierToString } from "@/lib/utils/type-converters";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/core/tooltip";

export interface MetricItem {
  label: string;
  value: string | number;
  description: string;
  trend?: "up" | "down" | "neutral";
  isHighlighted?: boolean;
}

export interface MetricsCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  metrics: MetricItem[];
}

export interface SuccessMetricsDashboardProps {
  validationTier: ValidationTier;
  metrics: MetricsCategory[];
  className?: string;
}

export function SuccessMetricsDashboard({
  validationTier,
  metrics,
  className
}: SuccessMetricsDashboardProps) {
  const shouldReduceMotion = useReducedMotion();
  const [activeCategory, setActiveCategory] = useState(metrics[0]?.id || "");
  
  // No metrics to display
  if (!metrics.length) {
    return null;
  }

  return (
    <div className={cn("w-full space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <BarChartIcon className="h-4 w-4" />
          Success Metrics
        </h3>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="inline-flex items-center text-sm text-muted-foreground">
                <InfoCircledIcon className="h-4 w-4 mr-1" />
                About Metrics
              </button>
            </TooltipTrigger>
            <TooltipContent side="left" className="max-w-xs">
              <p className="font-medium mb-1">Validated Success Metrics</p>
              <p className="text-sm">These metrics represent verified outcomes from this builder&apos;s projects. They are collected through client verification and proven results.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <Tabs 
        value={activeCategory} 
        onValueChange={setActiveCategory}
        className="w-full"
      >
        <TabsList className="w-full mb-4">
          {metrics.map((category) => (
            <TabsTrigger
              key={category.id}
              value={category.id}
              className="flex items-center gap-1.5"
            >
              {category.icon}
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {metrics.map((category) => (
          <TabsContent key={category.id} value={category.id} className="mt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {category.metrics.map((metric, index) => (
                <motion.div
                  key={`${category.id}-${index}`}
                  initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
                  animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.3, 
                    delay: shouldReduceMotion ? 0 : index * 0.1 
                  }}
                >
                  <MetricCard 
                    metric={metric} 
                    validationTier={validationTier}
                  />
                </motion.div>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

interface MetricCardProps {
  metric: MetricItem;
  validationTier: ValidationTier;
}

function MetricCard({ metric, validationTier }: MetricCardProps) {
  // Get color based on validation tier
  const tierStyle = getValidationTierStyle(validationTier);
  
  // Get trend indicator
  const trendIndicator = metric.trend ? {
    up: "↑",
    down: "↓",
    neutral: "―"
  }[metric.trend] : null;
  
  const trendColor = metric.trend ? {
    up: "text-green-600 dark:text-green-500",
    down: "text-red-600 dark:text-red-500",
    neutral: "text-muted-foreground"
  }[metric.trend] : null;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div 
            className={cn(
              "relative h-full p-4 rounded-lg border bg-gradient-to-br",
              tierStyle.borderClass,
              tierStyle.bgClass,
              metric.isHighlighted && "ring-2 ring-offset-2 ring-primary/50"
            )}
          >
            {metric.isHighlighted && (
              <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs font-medium">
                Top Result
              </div>
            )}
            <div className="text-sm font-medium text-muted-foreground mb-1">{metric.label}</div>
            <div className="flex items-baseline gap-1">
              <div className="text-2xl font-bold">
                {typeof metric.value === 'string' && metric.value.startsWith('+') ? (
                  <span className="text-primary">+{metric.value.substring(1)}</span>
                ) : (
                  metric.value
                )}
              </div>
              {trendIndicator && (
                <span className={cn("text-lg font-semibold", trendColor)}>
                  {trendIndicator}
                </span>
              )}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p>{metric.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Preset metric category icons for convenience
export const MetricIcons = {
  Impact: <RocketIcon className="h-4 w-4" />,
  Performance: <LightningBoltIcon className="h-4 w-4" />,
  Efficiency: <LapTimerIcon className="h-4 w-4" />,
};
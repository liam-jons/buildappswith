"use client"; // Client directive for components using React hooks

// Imports organized by category
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

// Internal utilities
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/utils/format-utils";

// Internal components using barrel exports
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";

// Types and interfaces
interface ProfileStat {
  label: string;
  value: number;
  change?: number;
  icon?: React.ReactNode;
}

interface ProfileStatsProps {
  stats: ProfileStat[];
  className?: string;
  isLoading?: boolean;
}

/**
 * ProfileStats - A component to display key metrics for a user profile
 * 
 * This component renders a grid of stats cards showing key metrics for a user profile.
 * Each card displays a label, value, and optional change percentage.
 * 
 * @param stats - Array of statistics to display
 * @param className - Optional additional CSS classes
 * @param isLoading - Whether the stats are currently loading
 */
export function ProfileStats({ stats, className, isLoading = false }: ProfileStatsProps) {
  // Accessibility hook
  const shouldReduceMotion = useReducedMotion();

  // Local state
  const [hoveredStat, setHoveredStat] = useState<number | null>(null);

  // Event handlers
  const handleStatHover = (index: number) => {
    setHoveredStat(index);
  };

  const handleStatLeave = () => {
    setHoveredStat(null);
  };

  // Conditional rendering for loading state
  if (isLoading) {
    return (
      <div className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-4", className)}>
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground h-4 w-20 bg-muted rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-7 w-24 bg-muted rounded mb-1" />
              <p className="h-4 w-16 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-4", className)}>
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
          whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
          onMouseEnter={() => handleStatHover(index)}
          onMouseLeave={handleStatLeave}
        >
          <Card className={cn(
            "transition-shadow",
            hoveredStat === index && "shadow-md"
          )}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(stat.value)}</div>
              {stat.change !== undefined && (
                <p className={cn(
                  "text-xs",
                  stat.change > 0 ? "text-green-500" : "text-red-500"
                )}>
                  {stat.change > 0 ? "+" : ""}{stat.change}% from last month
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

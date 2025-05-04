"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export interface MarketingStatProps {
  label: string;
  value: string | number;
  description?: string;
  prefix?: string;
  suffix?: string;
  trend?: {
    direction: "up" | "down" | "neutral";
    value: string | number;
  };
  variant?: "default" | "card" | "simple";
  withAnimation?: boolean;
  className?: string;
}

export function MarketingStat({
  label,
  value,
  description,
  prefix = "",
  suffix = "",
  trend,
  variant = "default",
  withAnimation = false,
  className,
}: MarketingStatProps) {
  const Component = withAnimation ? motion.div : "div";

  // Format numbers with British formatting
  const formattedValue = typeof value === "number" 
    ? value.toLocaleString("en-GB")
    : value;

  // Format trend value
  const formattedTrend = trend && typeof trend.value === "number"
    ? trend.value.toLocaleString("en-GB")
    : trend?.value;

  // Trend indicator styles
  const trendStyles = trend
    ? {
        up: "text-green-500",
        down: "text-red-500",
        neutral: "text-gray-500",
      }[trend.direction]
    : "";

  if (variant === "card") {
    return (
      <Component
        className={cn(
          "bg-card border border-border rounded-lg p-6 shadow-sm",
          className
        )}
        initial={withAnimation ? { opacity: 0, y: 20 } : undefined}
        animate={withAnimation ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 0.4 }}
      >
        <p className="text-sm font-medium text-muted-foreground mb-1">{label}</p>
        <div className="flex items-baseline gap-1">
          {prefix && <span className="text-sm text-muted-foreground">{prefix}</span>}
          <h3 className="text-3xl md:text-4xl font-bold tracking-tight">{formattedValue}</h3>
          {suffix && <span className="text-sm text-muted-foreground">{suffix}</span>}
        </div>
        {trend && (
          <div className={cn("flex items-center mt-2 text-sm font-medium", trendStyles)}>
            {trend.direction === "up" && "↑"}
            {trend.direction === "down" && "↓"}
            {trend.direction === "neutral" && "→"}
            <span className="ml-1">{formattedTrend}</span>
          </div>
        )}
        {description && <p className="mt-2 text-sm text-muted-foreground">{description}</p>}
      </Component>
    );
  }

  if (variant === "simple") {
    return (
      <Component 
        className={cn("flex flex-col", className)}
        initial={withAnimation ? { opacity: 0, y: 20 } : undefined}
        animate={withAnimation ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 0.4 }}
      >
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-xl font-semibold">
          {prefix}{formattedValue}{suffix}
        </p>
      </Component>
    );
  }

  // Default variant
  return (
    <Component
      className={cn("flex flex-col items-center text-center", className)}
      initial={withAnimation ? { opacity: 0, y: 20 } : undefined}
      animate={withAnimation ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.4 }}
    >
      <h3 className="text-3xl md:text-5xl font-bold mb-2">
        {prefix}{formattedValue}{suffix}
      </h3>
      <p className="text-lg font-medium mb-1">{label}</p>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
      {trend && (
        <div className={cn("flex items-center mt-2 text-sm font-medium", trendStyles)}>
          {trend.direction === "up" && "↑"}
          {trend.direction === "down" && "↓"}
          {trend.direction === "neutral" && "→"}
          <span className="ml-1">{formattedTrend}</span>
        </div>
      )}
    </Component>
  );
}
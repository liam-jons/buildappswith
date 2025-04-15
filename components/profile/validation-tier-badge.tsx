"use client";

import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { BorderBeam } from "@/components/magicui/border-beam";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Define validation tier types and descriptions
export type ValidationTier = "entry" | "established" | "expert";

const tierConfig = {
  entry: {
    label: "Entry",
    color: "border-blue-400 dark:border-blue-400",
    beamColor: "from-blue-400/80 to-blue-400/0",
    description: "Verified identity with basic competency in claimed areas",
    criteria: [
      "Identity verification",
      "Basic competency quiz",
      "One reviewed code sample"
    ],
    backgroundColor: "bg-blue-50 dark:bg-blue-950/30"
  },
  established: {
    label: "Established",
    color: "border-purple-500 dark:border-purple-400",
    beamColor: "from-purple-500/80 to-purple-400/0",
    description: "Successful completion of 3+ projects or $1,000+ in value",
    criteria: [
      "Documented previous outcomes",
      "Technical assessment",
      "Structured client feedback"
    ],
    backgroundColor: "bg-purple-50 dark:bg-purple-950/30"
  },
  expert: {
    label: "Expert",
    color: "border-amber-500 dark:border-amber-400",
    beamColor: "from-amber-500/80 to-amber-400/0",
    description: "Consistently successful with proven long-term impact",
    criteria: [
      "Specialized expertise certification",
      "Long-term impact tracking",
      "Verified business outcomes"
    ],
    backgroundColor: "bg-amber-50 dark:bg-amber-950/30"
  }
};

interface ValidationTierBadgeProps {
  tier: ValidationTier;
  showTooltip?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ValidationTierBadge({
  tier,
  showTooltip = true,
  size = "md",
  className
}: ValidationTierBadgeProps) {
  const shouldReduceMotion = useReducedMotion();
  const config = tierConfig[tier];
  
  // Size-based styling
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5"
  };
  
  const badge = (
    <div className={cn(
      "relative inline-flex items-center rounded-full border-2 font-medium",
      config.color,
      config.backgroundColor,
      sizeClasses[size],
      className
    )}>
      {/* Only apply BorderBeam effect for medium and large badges */}
      {(size === "md" || size === "lg") && !shouldReduceMotion && (
        <BorderBeam
          className="opacity-70"
          size={size === "lg" ? 40 : 30}
          delay={0}
          duration={2.5}
          colorFrom={config.beamColor.split(" ")[0]}
          colorTo={config.beamColor.split(" ")[1]}
        />
      )}
      <span>{config.label}</span>
      
      {/* Info icon for sm/md badges with tooltip */}
      {showTooltip && size !== "lg" && (
        <InfoCircledIcon className="ml-1 h-3 w-3 opacity-70" />
      )}
    </div>
  );
  
  if (showTooltip) {
    return (
      <TooltipProvider>
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            {badge}
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <div className="space-y-2">
              <p className="font-medium">{config.description}</p>
              <ul className="text-xs space-y-1 list-disc pl-4">
                {config.criteria.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  return badge;
}

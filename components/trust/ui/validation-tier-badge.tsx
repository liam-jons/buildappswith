/**
 * Trust Validation Tier Badge Component
 * 
 * This component displays a builder's validation tier in a visually
 * distinctive badge that represents their verified trust level.
 */

import { cn } from "@/lib/utils";
import { ValidationTier, formatValidationTier, getTierColorCode } from "@/lib/trust";

interface ValidationTierBadgeProps {
  tier: ValidationTier;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ValidationTierBadge({ 
  tier, 
  showLabel = true, 
  size = "md", 
  className 
}: ValidationTierBadgeProps) {
  const formattedTier = formatValidationTier(tier);
  const colorCode = getTierColorCode(tier);
  
  // Size-based styling
  const sizeStyles = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5"
  };
  
  // Badge icon based on tier
  const badgeIcon = () => {
    switch (tier) {
      case "basic":
        return (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
          </svg>
        );
      case "verified":
        return (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case "expert":
        return (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" 
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      default:
        return null;
    }
  };
  
  return (
    <div 
      className={cn(
        "flex items-center gap-1.5 rounded-full font-medium text-white",
        sizeStyles[size],
        className
      )}
      style={{ backgroundColor: colorCode }}
      title={`${formattedTier} Builder`}
    >
      {badgeIcon()}
      {showLabel && (
        <span>{formattedTier}</span>
      )}
    </div>
  );
}

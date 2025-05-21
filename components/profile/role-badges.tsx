"use client";

import { UserRole } from "@prisma/client";
import { cn } from "@/lib/utils";
import {
  PersonIcon,
  CubeIcon,
  GearIcon,
} from "@radix-ui/react-icons";
import { Crown } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/core/tooltip";

interface RoleBadgeProps {
  role: UserRole;
  className?: string;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

export function RoleBadge({
  role,
  className,
  showLabel = true,
  size = "md"
}: RoleBadgeProps) {
  // Config for different roles
  const roleConfig = {
    CLIENT: {
      icon: <PersonIcon className={size === "sm" ? "h-3 w-3" : "h-4 w-4"} />,
      label: "Client",
      color: "bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-400 border-blue-200 dark:border-blue-800/50",
      description: "Someone who uses the platform to find and work with builders"
    },
    BUILDER: {
      icon: <CubeIcon className={size === "sm" ? "h-3 w-3" : "h-4 w-4"} />,
      label: "Builder",
      color: "bg-purple-100 text-purple-800 dark:bg-purple-950/50 dark:text-purple-400 border-purple-200 dark:border-purple-800/50",
      description: "Creates AI applications and provides expertise to clients"
    },
    ADMIN: {
      icon: <GearIcon className={size === "sm" ? "h-3 w-3" : "h-4 w-4"} />,
      label: "Admin",
      color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50",
      description: "Platform administrator with moderation and management capabilities"
    },
    SUBSCRIBER: {
      icon: <Crown className={size === "sm" ? "h-3 w-3" : "h-4 w-4"} />,
      label: "Subscriber",
      color: "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-400 border-amber-200 dark:border-amber-800/50",
      description: "Premium subscriber with access to exclusive features and content"
    }
  };
  
  const config = roleConfig[role];
  
  // Size-specific styling
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5 gap-1",
    md: "text-sm px-2.5 py-1 gap-1.5",
    lg: "text-base px-3 py-1.5 gap-2"
  };
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "inline-flex items-center rounded-md border",
              config.color,
              sizeClasses[size],
              className
            )}
          >
            {config.icon}
            {showLabel && <span>{config.label}</span>}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{config.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface FounderBadgeProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function FounderBadge({
  className,
  size = "md"
}: FounderBadgeProps) {
  // Size-specific styling
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5 gap-1",
    md: "text-sm px-2.5 py-1 gap-1.5",
    lg: "text-base px-3 py-1.5 gap-2"
  };
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "inline-flex items-center rounded-md border bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-400 border-amber-200 dark:border-amber-800/50",
              sizeClasses[size],
              className
            )}
          >
            <Crown className={size === "sm" ? "h-3 w-3" : "h-4 w-4"} />
            <span>Founder</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Original founder and key contributor to the Buildappswith platform</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface MultiRoleBadgeProps {
  roles: UserRole[];
  isFounder?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
  layout?: "horizontal" | "vertical";
}

export function MultiRoleBadge({
  roles,
  isFounder = false,
  className,
  size = "md",
  layout = "horizontal"
}: MultiRoleBadgeProps) {
  if (roles.length === 0) {
    return null;
  }
  
  // Only show the first 3 roles maximum
  const displayRoles = roles.slice(0, 3);
  
  // Layout classes
  const layoutClasses = {
    horizontal: "flex-row",
    vertical: "flex-col"
  };
  
  return (
    <div className={cn(
      "flex gap-2",
      layoutClasses[layout],
      className
    )}>
      {isFounder && (
        <FounderBadge size={size} />
      )}
      
      {displayRoles.map(role => (
        <RoleBadge
          key={role}
          role={role}
          size={size}
          showLabel={true}
        />
      ))}
      
      {roles.length > 3 && (
        <div
          className={cn(
            "inline-flex items-center rounded-md border bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-400",
            size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-2.5 py-1",
            size === "lg" && "text-base px-3 py-1.5"
          )}
        >
          +{roles.length - 3} more
        </div>
      )}
    </div>
  );
}

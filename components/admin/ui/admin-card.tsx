"use client"; // Client directive for components using React hooks

// Imports organized by category
import { useState } from "react";

// Internal utilities
import { cn } from "@/lib/utils";

// Internal components using barrel exports
import { Button, Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui";

// Types and interfaces
interface AdminCardProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  status?: "default" | "warning" | "error" | "success";
  className?: string;
  children?: React.ReactNode;
}

/**
 * AdminCard component for displaying administrative information and actions
 * 
 * Used throughout the admin interface for displaying settings, statistics,
 * and management options in a consistent format.
 */
export function AdminCard({
  title,
  description,
  actionLabel,
  onAction,
  icon,
  status = "default",
  className,
  children
}: AdminCardProps) {
  // State for interaction tracking
  const [isLoading, setIsLoading] = useState(false);
  
  // Event handler for action button
  const handleAction = async () => {
    if (!onAction) return;
    
    try {
      setIsLoading(true);
      await onAction();
    } catch (error) {
      console.error("Error in admin card action:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Status class mapping
  const statusClasses = {
    default: "",
    warning: "border-yellow-500",
    error: "border-red-500",
    success: "border-green-500"
  };
  
  // Main render
  return (
    <Card className={cn("w-full", statusClasses[status], className)}>
      <CardHeader className="flex flex-row items-center space-x-2">
        {icon && <div className="flex-shrink-0">{icon}</div>}
        <div className="space-y-1">
          <CardTitle>{title}</CardTitle>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
      {actionLabel && onAction && (
        <CardFooter>
          <Button 
            onClick={handleAction} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Processing..." : actionLabel}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

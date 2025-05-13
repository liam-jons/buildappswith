import React from 'react';
import { Badge } from '@/components/ui/core/badge';
import { cn } from '@/lib/utils';

interface DemoBadgeProps {
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

/**
 * Demo badge component to indicate demo accounts in the marketplace
 * 
 * Usage:
 * <DemoBadge />
 * <DemoBadge size="small" className="ml-2" />
 */
export function DemoBadge({ className = '', size = 'medium' }: DemoBadgeProps) {
  const sizeStyles = {
    small: 'text-xs px-1.5 py-0.5',
    medium: 'text-sm px-2 py-1',
    large: 'text-base px-3 py-1.5'
  };

  return (
    <Badge 
      variant="outline" 
      className={cn(
        "bg-amber-50 text-amber-800 border border-amber-300 font-medium",
        sizeStyles[size],
        className
      )}
    >
      Demo Account
    </Badge>
  );
}

export default DemoBadge;
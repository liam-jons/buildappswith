'use client';

import { ValidationTier as TierType } from '@/lib/types/builder';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { BorderBeam } from '@/components/magicui/border-beam';
import { TextShimmer } from '@/components/magicui/text-shimmer';

// Update version number
// Version: 0.1.65

type ValidationTierProps = {
  tier: TierType;
  size?: 'small' | 'medium' | 'large';
};

const tierColors = {
  entry: {
    bg: 'bg-blue-100 dark:bg-blue-950',
    border: 'border-blue-300 dark:border-blue-700',
    text: 'text-blue-700 dark:text-blue-300',
    shimmer: 'from-blue-400 to-blue-600 dark:from-blue-500 dark:to-blue-300'
  },
  established: {
    bg: 'bg-purple-100 dark:bg-purple-950',
    border: 'border-purple-300 dark:border-purple-700',
    text: 'text-purple-700 dark:text-purple-300',
    shimmer: 'from-purple-400 to-purple-600 dark:from-purple-500 dark:to-purple-300'
  },
  expert: {
    bg: 'bg-amber-100 dark:bg-amber-950',
    border: 'border-amber-300 dark:border-amber-700',
    text: 'text-amber-700 dark:text-amber-300',
    shimmer: 'from-amber-400 to-amber-600 dark:from-amber-500 dark:to-amber-300'
  }
};

const tierDescriptions = {
  entry: 'Entry level builders have verified their identity and demonstrated basic competencies. They are ready to take on smaller projects and build their reputation.',
  established: 'Established builders have completed multiple projects with positive outcomes. They have demonstrated consistent quality and reliability.',
  expert: 'Expert builders have a proven track record of delivering exceptional results. They have specialized expertise and a history of transformative business outcomes.'
};

const tierRequirements = {
  entry: [
    'Identity verification',
    'Basic competency quiz in claimed areas',
    'Code sample review'
  ],
  established: [
    'Completed 3+ projects or $1,000+ in value',
    'Documentation of outcomes from previous projects',
    'Thorough technical assessment',
    'Structured client feedback'
  ],
  expert: [
    'Specialized expertise certification',
    'Long-term impact tracking (3-6 months post-completion)',
    'Verified business outcome documentation',
    'Peer recognition from other builders'
  ]
};

export function ValidationTier({ tier, size = 'medium' }: ValidationTierProps) {
  // Use type assertion to fix the property access
const colors = tierColors[tier as keyof typeof tierColors];
  
  const sizeClasses = {
    small: {
      badge: 'p-1.5',
      text: 'text-xs',
      padding: 'p-0.5'
    },
    medium: {
      badge: 'p-2',
      text: 'text-sm',
      padding: 'p-1'
    },
    large: {
      badge: 'p-3',
      text: 'text-base',
      padding: 'p-1.5'
    }
  };
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative inline-block">
            {/* BorderBeam is positioned absolutely to create a glowing border effect */}
            <BorderBeam
              className={`absolute inset-0 rounded-full ${colors.border} ${sizeClasses[size].padding}`}
              size={50}
            />
            {/* Content is rendered as a sibling, not a child of BorderBeam */}
            <div className={`rounded-full ${colors.bg} ${sizeClasses[size].badge} relative`}>
              <TextShimmer
                className={`font-semibold ${colors.text} ${sizeClasses[size].text}`}
                shimmerWidth={80}
              >
                {/* Capitalize first letter for display */}
              {tier.charAt(0).toUpperCase() + tier.slice(1)}
              </TextShimmer>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div>
            <h3 className="font-semibold mb-1 text-base">{tier} Builder</h3>
            <p className="text-sm mb-2">{tierDescriptions[tier as keyof typeof tierDescriptions]}</p>
            <div className="mt-2">
              <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1">Requirements:</h4>
              <ul className="text-xs list-disc pl-4 space-y-1">
                {tierRequirements[tier as keyof typeof tierRequirements].map((req, index) => (
                  <li key={index}>{req}</li>
                ))}
              </ul>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

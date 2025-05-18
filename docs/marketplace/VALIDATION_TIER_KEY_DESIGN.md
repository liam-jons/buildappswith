# Validation Tier Key/Legend Component Design

## Overview

The Validation Tier Key component provides a clear explanation of the three validation tiers (Basic, Verified, Expert) to help marketplace visitors understand builder credibility levels.

## Component Variants

### 1. Inline Key (Compact)
Used within the builder card grid header or as a tooltip.

```
Validation Tiers: ⭕ Basic | ✓ Verified | ⭐ Expert
```

### 2. Expandable Legend (Default)
Appears as a collapsible section above the builder grid.

```
┌─────────────────────────────────────────────────┐
│ ℹ️ Builder Validation Tiers  [Expand ▼]         │
├─────────────────────────────────────────────────┤
│ ⭕ Basic                                        │
│    • New builders on the platform               │
│    • Basic profile verification                 │
│                                                 │
│ ✓ Verified                                     │
│    • Completed identity verification            │
│    • Demonstrated platform expertise            │
│    • 10+ successful sessions                    │
│                                                 │
│ ⭐ Expert                                       │
│    • Top 10% of builders                        │
│    • 50+ successful sessions                    │
│    • 4.8+ average rating                        │
│    • Advanced certifications                    │
└─────────────────────────────────────────────────┘
```

### 3. Modal Legend (Detailed)
Full explanation accessible via "Learn More" link.

```
┌─────────────────────────────────────────────────┐
│ Understanding Builder Validation Tiers      [X] │
├─────────────────────────────────────────────────┤
│                                                 │
│ BuildAppsWith verifies all builders through a   │
│ comprehensive validation process:               │
│                                                 │
│ ⭕ Basic Tier                                   │
│ ────────────                                    │
│ Requirements:                                   │
│ • Email verification                            │
│ • Complete profile information                  │
│ • Accept platform terms                         │
│                                                 │
│ Benefits:                                       │
│ • List services on marketplace                 │
│ • Accept client bookings                        │
│ • Basic platform features                       │
│                                                 │
│ ✓ Verified Tier                                │
│ ──────────────                                  │
│ Requirements:                                   │
│ • Government ID verification                    │
│ • Skill assessment completion                   │
│ • 10+ completed sessions                        │
│ • 4.0+ average rating                          │
│                                                 │
│ Benefits:                                       │
│ • "Verified" badge on profile                   │
│ • Priority in search results                    │
│ • Access to premium clients                     │
│                                                 │
│ ⭐ Expert Tier                                  │
│ ────────────                                    │
│ Requirements:                                   │
│ • 50+ completed sessions                        │
│ • 4.8+ average rating                          │
│ • Advanced certifications                       │
│ • Consistent performance metrics                │
│                                                 │
│ Benefits:                                       │
│ • "Expert" badge on profile                     │
│ • Top placement in search                       │
│ • Premium pricing options                       │
│ • Featured builder opportunities                │
│                                                 │
└─────────────────────────────────────────────────┘
```

## Visual Specifications

### Icons and Colors
```css
/* Tier Icons */
--tier-basic-icon: "⭕";
--tier-verified-icon: "✓";
--tier-expert-icon: "⭐";

/* Tier Colors */
--tier-basic-color: #6B7280;    /* Gray-500 */
--tier-verified-color: #3B82F6; /* Blue-500 */
--tier-expert-color: #F59E0B;   /* Amber-500 */

/* Background Colors */
--tier-basic-bg: #F3F4F6;       /* Gray-100 */
--tier-verified-bg: #DBEAFE;    /* Blue-100 */
--tier-expert-bg: #FEF3C7;      /* Amber-100 */
```

### Typography
```css
/* Tier Names */
.tier-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--tier-color);
}

/* Descriptions */
.tier-description {
  font-size: 14px;
  font-weight: 400;
  color: var(--text-muted);
  line-height: 1.5;
}

/* Requirements */
.tier-requirement {
  font-size: 13px;
  font-weight: 400;
  color: var(--text-secondary);
}
```

## Component Structure

### ValidationTierKey Component
```tsx
interface ValidationTierKeyProps {
  variant?: 'inline' | 'expandable' | 'modal';
  initialState?: 'collapsed' | 'expanded';
  position?: 'top' | 'bottom' | 'floating';
  showDetailedInfo?: boolean;
  className?: string;
}

export function ValidationTierKey({
  variant = 'expandable',
  initialState = 'collapsed',
  position = 'top',
  showDetailedInfo = false,
  className
}: ValidationTierKeyProps) {
  // Component implementation
}
```

### Tier Definition Interface
```tsx
interface TierDefinition {
  id: 'basic' | 'verified' | 'expert';
  name: string;
  icon: string;
  color: string;
  backgroundColor: string;
  requirements: string[];
  benefits: string[];
  metrics?: {
    minSessions?: number;
    minRating?: number;
    otherRequirements?: string[];
  };
}

const TIER_DEFINITIONS: TierDefinition[] = [
  {
    id: 'basic',
    name: 'Basic',
    icon: '⭕',
    color: '#6B7280',
    backgroundColor: '#F3F4F6',
    requirements: [
      'Email verification',
      'Complete profile information',
      'Accept platform terms'
    ],
    benefits: [
      'List services on marketplace',
      'Accept client bookings',
      'Basic platform features'
    ]
  },
  // ... other tiers
];
```

## Interaction Patterns

### Expandable Behavior
```tsx
const [isExpanded, setIsExpanded] = useState(initialState === 'expanded');

const toggleExpanded = () => {
  setIsExpanded(!isExpanded);
  // Track analytics event
  trackEvent('validation_tier_key_toggle', { 
    action: isExpanded ? 'collapse' : 'expand' 
  });
};
```

### Modal Trigger
```tsx
const [showModal, setShowModal] = useState(false);

const openDetailedView = () => {
  setShowModal(true);
  trackEvent('validation_tier_key_learn_more');
};
```

## Responsive Design

### Mobile View
```
┌─────────────────────────┐
│ ℹ️ Validation Tiers     │
│ ⭕ Basic               │
│ ✓ Verified             │
│ ⭐ Expert              │
│ [Learn More]           │
└─────────────────────────┘
```

### Tablet/Desktop View
Full expandable or modal view as shown above.

## Animation Specifications

### Expand/Collapse Animation
```css
.tier-key-content {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease-out;
}

.tier-key-content.expanded {
  max-height: 500px;
  transition: max-height 0.3s ease-in;
}
```

### Hover Effects
```css
.tier-item:hover {
  background-color: var(--tier-bg-hover);
  transform: translateX(4px);
  transition: all 0.2s ease;
}
```

## Accessibility Features

### ARIA Labels
```html
<div 
  role="region" 
  aria-label="Builder validation tier information"
  aria-expanded={isExpanded}
>
  <button 
    aria-controls="tier-key-content"
    aria-label="Toggle validation tier information"
  >
    Builder Validation Tiers
  </button>
</div>
```

### Keyboard Navigation
- Enter/Space: Toggle expanded state
- Escape: Close modal view
- Tab: Navigate between tiers

## Usage Examples

### In Marketplace Header
```tsx
<MarketplaceHeader>
  <h1>Browse AI Builders</h1>
  <ValidationTierKey variant="inline" />
</MarketplaceHeader>
```

### Above Builder Grid
```tsx
<div className="marketplace-content">
  <ValidationTierKey 
    variant="expandable" 
    position="top"
    initialState="collapsed"
  />
  <BuilderGrid builders={builders} />
</div>
```

### As Tooltip Content
```tsx
<Tooltip
  content={<ValidationTierKey variant="inline" />}
  trigger="hover"
>
  <InfoIcon className="w-4 h-4" />
</Tooltip>
```

## Implementation Notes

1. Use `framer-motion` for smooth animations
2. Implement lazy loading for modal content
3. Cache tier definitions to avoid re-renders
4. Track user interactions for analytics
5. Ensure color contrast meets WCAG AA standards
6. Test with screen readers
7. Support reduced motion preferences

## Performance Considerations

- Use CSS-only animations where possible
- Implement virtual scrolling for long tier lists
- Lazy load detailed descriptions
- Memoize tier definitions
- Use React.memo for tier items

## Future Enhancements

1. Interactive tier progression visualization
2. Animated tier achievement notifications
3. Personalized tier recommendations
4. Tier comparison tool
5. Builder tier statistics dashboard
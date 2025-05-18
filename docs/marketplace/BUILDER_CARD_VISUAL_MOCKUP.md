# Builder Card Visual Mockup & Specifications

## Visual Design Mockup

### Desktop View (Default)
```
┌───────────────────────────────────────────────────────────────┐
│  ┌─────┐                                                      │
│  │ IMG │  Jane Smith ⭐️ Expert    🚀 🔄 🎨                   │
│  │ 80px│  AI Integration Specialist                           │
│  └─────┘                                                      │
│ ─────────────────────────────────────────────────────────────── │
│  Top Skills:                                                  │
│  • React & Next.js                                           │
│  • AI API Integration                                        │ 
│  • Cloud Architecture                                        │
│  + 5 more skills                                             │
│ ─────────────────────────────────────────────────────────────── │
│  Sessions Available:                                          │
│  ┌──────┐ ┌─────────┐ ┌──────────────┐                      │
│  │ Free │ │ Pathway │ │ Specialized │                       │
│  │  1   │ │    3    │ │      2       │                      │
│  └──────┘ └─────────┘ └──────────────┘                      │
│  Starting from $50                                           │
│ ─────────────────────────────────────────────────────────────── │
│  ⭐ 4.9 · 156 sessions · 95% success                         │
│ ─────────────────────────────────────────────────────────────── │
│  ┌─────────────────┐  ┌──────────────────┐                  │
│  │  Book Session   │  │  View Profile    │                  │
│  └─────────────────┘  └──────────────────┘                  │
└───────────────────────────────────────────────────────────────┘
```

### Mobile View
```
┌─────────────────────────┐
│  ┌───┐ Jane Smith ⭐    │
│  │IMG│ AI Specialist    │
│  └───┘ 🚀 🔄 🎨         │
│ ─────────────────────── │
│  Top Skills:            │
│  • React & Next.js      │
│  • AI APIs              │ 
│  + 6 more               │
│ ─────────────────────── │
│  Sessions: Free (1)     │
│  Pathway (3) Special(2) │
│  From $50               │
│ ─────────────────────── │
│  ⭐ 4.9 · 156 sessions  │
│ ─────────────────────── │
│  ┌───────────────────┐  │
│  │   Book Session    │  │
│  └───────────────────┘  │
│  ┌───────────────────┐  │
│  │   View Profile    │  │
│  └───────────────────┘  │
└─────────────────────────┘
```

## Component Specifications

### 1. Profile Header Component
```tsx
interface ProfileHeaderProps {
  name: string;
  tagline: string;
  avatarUrl?: string;
  validationTier: 'basic' | 'verified' | 'expert';
}

// Visual specs:
// - Avatar: 80x80px (desktop), 48x48px (mobile)
// - Name: 18px font, 600 weight
// - Tagline: 14px font, 400 weight, text-muted-foreground
// - Tier badge: Inline with name, 12px font
```

### 2. Pathway Indicators Component
```tsx
interface PathwayIndicatorsProps {
  pathways: Array<{
    id: 'accelerate' | 'pivot' | 'play';
    isActive: boolean;
    clientCount?: number;
  }>;
}

// Visual specs:
// - Icon size: 20px
// - Active: Full color (green/blue/purple)
// - Inactive: Gray-400
// - Client count: 10px font, as superscript
// - Spacing: 8px between indicators
```

### 3. Skills List Component
```tsx
interface SkillsListProps {
  skills: string[];
  maxDisplay?: number; // Default: 3
  showTotal?: boolean;
}

// Visual specs:
// - Title: "Top Skills:" 14px font, 500 weight
// - Bullet points: • character, 14px font
// - More link: "+X more skills" 14px font, primary color
// - Line height: 1.5
```

### 4. Session Availability Component
```tsx
interface SessionAvailabilityProps {
  sessionTypes: {
    free: { count: number; available: boolean };
    pathway: { count: number; available: boolean; authRequired: boolean };
    specialized: { count: number; available: boolean; priceRange?: PriceRange };
  };
  startingPrice?: number;
  currency?: string;
}

// Visual specs:
// - Badge height: 24px
// - Badge padding: 8px horizontal, 4px vertical
// - Badge colors:
//   - Free: bg-green-100, text-green-800
//   - Pathway: bg-blue-100, text-blue-800  
//   - Specialized: bg-purple-100, text-purple-800
// - Price text: 14px font, text-muted-foreground
```

### 5. Metrics Bar Component
```tsx
interface MetricsBarProps {
  rating?: number;
  sessionCount: number;
  successRate?: number;
}

// Visual specs:
// - Container: 1px top border, 8px padding
// - Metrics: 14px font, 500 weight
// - Separators: • character, text-muted-foreground
// - Icons: ⭐ for rating, 16px
```

### 6. Action Buttons Component
```tsx
interface ActionButtonsProps {
  builderId: string;
  hasFreeSessions: boolean;
  isAuthenticated: boolean;
  onBookSession: () => void;
  onViewProfile: () => void;
}

// Visual specs:
// - Button height: 36px
// - Button spacing: 8px gap
// - Primary button: Full color background
// - Secondary button: Outline variant
// - Mobile: Stack vertically, full width
```

## Color Specifications

```css
/* Background colors */
--card-bg: hsl(var(--card));
--card-border: hsl(var(--border));

/* Pathway colors */
--pathway-accelerate: #10B981;
--pathway-pivot: #3B82F6;
--pathway-play: #8B5CF6;

/* Session type colors */
--session-free-bg: #D1FAE5;
--session-free-text: #065F46;
--session-pathway-bg: #DBEAFE;
--session-pathway-text: #1E40AF;
--session-specialized-bg: #E9D5FF;
--session-specialized-text: #5B21B6;

/* Text colors */
--text-primary: hsl(var(--foreground));
--text-muted: hsl(var(--muted-foreground));
```

## Spacing System

```css
/* Padding */
--card-padding: 16px;
--section-gap: 16px;
--element-gap: 8px;

/* Border radius */
--card-radius: 8px;
--badge-radius: 9999px;
--button-radius: 6px;
```

## Animation Specifications

```css
/* Hover states */
.builder-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease-in-out;
}

.pathway-indicator:hover {
  transform: scale(1.1);
  transition: transform 0.15s ease-in-out;
}

.book-button:hover {
  background-color: var(--primary-hover);
  transition: background-color 0.15s ease-in-out;
}
```

## Responsive Breakpoints

```css
/* Mobile */
@media (max-width: 639px) {
  .builder-card {
    min-height: 400px;
  }
}

/* Tablet */
@media (min-width: 640px) and (max-width: 1023px) {
  .builder-card {
    min-height: 350px;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .builder-card {
    min-height: 320px;
  }
}
```

## Accessibility Specifications

### Focus States
```css
.builder-card:focus-within {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}

.book-button:focus {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5);
}
```

### ARIA Labels
```html
<article 
  role="article" 
  aria-label="Builder profile card for Jane Smith"
>
  <button 
    aria-label="Book session with Jane Smith"
  >
    Book Session
  </button>
</article>
```

## Loading States

```tsx
// Skeleton loader
<div className="builder-card-skeleton">
  <div className="skeleton-avatar" />
  <div className="skeleton-text" />
  <div className="skeleton-badges" />
  <div className="skeleton-button" />
</div>
```

## Error States

```tsx
// Error display
<div className="builder-card-error">
  <p>Unable to load builder information</p>
  <button onClick={retry}>Try Again</button>
</div>
```

## Interactive States

### Hover Effects
- Card: Subtle elevation and shadow
- Buttons: Color darkening
- Pathway indicators: Scale up 10%
- Session badges: Slight brightness increase

### Active States
- Buttons: Pressed appearance (scale 0.98)
- Links: Underline on hover

### Disabled States
- Buttons: 50% opacity, no hover effects
- Unavailable sessions: Grayed out badges

## Implementation Notes

1. Use CSS Grid for card layout
2. Implement with mobile-first approach
3. Ensure all interactive elements are keyboard accessible
4. Use semantic HTML throughout
5. Implement proper loading and error boundaries
6. Cache builder data for performance
7. Lazy load images with blur placeholders
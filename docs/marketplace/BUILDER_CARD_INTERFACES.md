# Builder Card Interface Definitions

## Extended Data Structures

### Core Builder Profile Extension
```typescript
// Extends the existing BuilderProfileListing
export interface ExtendedBuilderProfile extends BuilderProfileListing {
  // Pathway specializations
  pathwaySpecializations: PathwaySpecialization[];
  
  // Session type availability
  sessionTypeAvailability: SessionTypeAvailability;
  
  // Enhanced metrics
  performanceMetrics: BuilderPerformanceMetrics;
  
  // Booking information
  bookingInfo: BookingInfo;
  
  // Additional computed fields
  displayPriority?: number;
  lastActiveDate?: Date;
}
```

### Pathway Specialization
```typescript
export interface PathwaySpecialization {
  pathwayId: 'accelerate' | 'pivot' | 'play';
  isActive: boolean;
  
  // Metrics per pathway
  metrics: {
    activeClients: number;
    completedClients: number;
    successRate: number;
    totalSessions: number;
    averageRating?: number;
  };
  
  // Specialization details
  specializationLevel: 'beginner' | 'intermediate' | 'expert';
  certificationDate?: Date;
  
  // Visual display
  displayOrder: number;
  isHighlighted: boolean;
}
```

### Session Type Availability
```typescript
export interface SessionTypeAvailability {
  categories: {
    free: SessionCategoryInfo;
    pathway: SessionCategoryInfo;
    specialized: SessionCategoryInfo;
  };
  
  // Aggregate information
  totalAvailable: number;
  nextAvailableSlot?: Date;
  bookingUrl?: string;
  
  // Pricing information
  priceRange: {
    min: number;
    max: number;
    currency: string;
    displayFormat: string; // e.g., "$50-150"
  };
}

export interface SessionCategoryInfo {
  count: number;
  available: boolean;
  sessions: SessionTypeSummary[];
  authRequired: boolean;
  
  // Category-specific info
  description?: string;
  icon?: string;
  color?: string;
}

export interface SessionTypeSummary {
  id: string;
  title: string;
  duration: number;
  price: number;
  isAvailable: boolean;
  requiresAuth: boolean;
  calendlyUri?: string;
}
```

### Performance Metrics
```typescript
export interface BuilderPerformanceMetrics {
  // Overall metrics
  overallRating: number;
  totalSessions: number;
  successRate: number;
  responseTime: string; // e.g., "< 1 hour"
  
  // Time-based metrics
  last30Days: {
    sessions: number;
    newClients: number;
    completionRate: number;
  };
  
  // Category breakdowns
  categoryMetrics: {
    [category: string]: {
      sessions: number;
      rating: number;
      completionRate: number;
    };
  };
  
  // Badges and achievements
  achievements: Achievement[];
}

export interface Achievement {
  id: string;
  type: 'milestone' | 'certification' | 'recognition';
  title: string;
  description: string;
  dateEarned: Date;
  icon?: string;
}
```

### Booking Information
```typescript
export interface BookingInfo {
  calendlyUsername?: string;
  bookingEnabled: boolean;
  
  // Availability windows
  availability: {
    timezone: string;
    workingHours: WorkingHours[];
    nextAvailable: Date;
    blockedDates?: Date[];
  };
  
  // Booking preferences
  preferences: {
    minNoticeHours: number;
    maxAdvanceBookingDays: number;
    bufferBetweenSessions: number;
  };
  
  // Integration status
  integrations: {
    calendly: boolean;
    stripe: boolean;
    zoom?: boolean;
  };
}

export interface WorkingHours {
  dayOfWeek: number; // 0-6
  startTime: string; // "09:00"
  endTime: string;   // "17:00"
  isAvailable: boolean;
}
```

## Component Prop Interfaces

### Main Builder Card Props
```typescript
export interface BuilderCardProps {
  // Core data
  builder: ExtendedBuilderProfile;
  
  // Authentication context
  isAuthenticated?: boolean;
  userRole?: 'client' | 'builder' | 'admin';
  
  // Display options
  variant?: 'default' | 'compact' | 'expanded';
  showMetrics?: boolean;
  showPathways?: boolean;
  
  // Interactive callbacks
  onBookSession?: (builderId: string, sessionType?: string) => void;
  onViewProfile?: (builderId: string) => void;
  onPathwayClick?: (builderId: string, pathwayId: string) => void;
  
  // Loading states
  isLoading?: boolean;
  error?: Error | null;
  
  // Feature flags
  features?: {
    enableQuickBook?: boolean;
    showPricing?: boolean;
    enableAnalytics?: boolean;
  };
}
```

### Sub-component Props

#### Builder Header Props
```typescript
export interface BuilderHeaderProps {
  name: string;
  tagline?: string;
  headline?: string;
  avatarUrl?: string;
  validationTier: number;
  isDemo?: boolean;
  
  // Display options
  size?: 'small' | 'medium' | 'large';
  showBadges?: boolean;
}
```

#### Pathway Indicators Props
```typescript
export interface PathwayIndicatorsProps {
  specializations: PathwaySpecialization[];
  
  // Display options
  layout?: 'horizontal' | 'vertical';
  showMetrics?: boolean;
  interactive?: boolean;
  
  // Callbacks
  onPathwayClick?: (pathwayId: string) => void;
  onPathwayHover?: (pathwayId: string) => void;
}
```

#### Skills Display Props
```typescript
export interface SkillsDisplayProps {
  skills: string[];
  topSkills?: string[];
  
  // Display options
  format?: 'bullets' | 'chips' | 'list';
  maxDisplay?: number;
  showViewMore?: boolean;
  
  // Styling
  className?: string;
  bulletStyle?: 'dot' | 'check' | 'arrow';
}
```

#### Session Availability Props
```typescript
export interface SessionAvailabilityProps {
  availability: SessionTypeAvailability;
  isAuthenticated: boolean;
  
  // Display options
  showPricing?: boolean;
  showCounts?: boolean;
  layout?: 'badges' | 'list' | 'grid';
  
  // Callbacks
  onSessionTypeClick?: (category: string) => void;
}
```

#### Metrics Display Props
```typescript
export interface MetricsDisplayProps {
  metrics: BuilderPerformanceMetrics;
  
  // Display options
  variant?: 'minimal' | 'detailed' | 'expanded';
  showTrends?: boolean;
  timeframe?: '7d' | '30d' | '90d' | 'all';
  
  // Feature toggles
  showRating?: boolean;
  showSessions?: boolean;
  showSuccessRate?: boolean;
  showResponseTime?: boolean;
}
```

#### Action Buttons Props
```typescript
export interface ActionButtonsProps {
  builderId: string;
  
  // Button configuration
  primaryAction: 'book' | 'view' | 'contact';
  secondaryAction?: 'book' | 'view' | 'contact' | null;
  
  // State
  isAuthenticated: boolean;
  hasAvailableSessions: boolean;
  isLoading?: boolean;
  
  // Button text overrides
  primaryText?: string;
  secondaryText?: string;
  
  // Callbacks
  onPrimaryClick: () => void;
  onSecondaryClick?: () => void;
  
  // Styling
  layout?: 'horizontal' | 'vertical' | 'stacked';
  size?: 'small' | 'medium' | 'large';
}
```

## Hook Interfaces

### useBuilderCard Hook
```typescript
export interface UseBuilderCardOptions {
  builderId: string;
  enableRealTimeUpdates?: boolean;
  fetchSessionTypes?: boolean;
  fetchMetrics?: boolean;
}

export interface UseBuilderCardReturn {
  builder: ExtendedBuilderProfile | null;
  isLoading: boolean;
  error: Error | null;
  
  // Actions
  bookSession: (sessionType?: string) => Promise<void>;
  viewProfile: () => void;
  refreshData: () => Promise<void>;
  
  // Computed values
  canBook: boolean;
  nextAvailable: Date | null;
  displayPrice: string;
}
```

### useSessionAvailability Hook
```typescript
export interface UseSessionAvailabilityOptions {
  builderId: string;
  refreshInterval?: number;
}

export interface UseSessionAvailabilityReturn {
  availability: SessionTypeAvailability | null;
  isLoading: boolean;
  error: Error | null;
  
  // Computed values
  hasFreeSessions: boolean;
  hasAuthSessions: boolean;
  totalAvailable: number;
  
  // Actions
  refreshAvailability: () => Promise<void>;
}
```

## Context Interfaces

### BuilderCardContext
```typescript
export interface BuilderCardContextValue {
  // Card state
  isExpanded: boolean;
  isHovered: boolean;
  selectedPathway: string | null;
  
  // Actions
  setExpanded: (expanded: boolean) => void;
  setHovered: (hovered: boolean) => void;
  selectPathway: (pathwayId: string | null) => void;
  
  // Configuration
  config: {
    enableAnimations: boolean;
    compactMode: boolean;
    showDebugInfo: boolean;
  };
}
```

## Event Interfaces

### Builder Card Events
```typescript
export interface BuilderCardEvents {
  onView: (event: BuilderCardViewEvent) => void;
  onInteraction: (event: BuilderCardInteractionEvent) => void;
  onBook: (event: BuilderCardBookEvent) => void;
}

export interface BuilderCardViewEvent {
  builderId: string;
  timestamp: Date;
  viewDuration?: number;
  source: 'marketplace' | 'search' | 'recommendation';
}

export interface BuilderCardInteractionEvent {
  builderId: string;
  action: 'hover' | 'click' | 'expand' | 'pathway-select';
  target: string;
  timestamp: Date;
}

export interface BuilderCardBookEvent {
  builderId: string;
  sessionType?: string;
  pathway?: string;
  timestamp: Date;
  outcome: 'initiated' | 'completed' | 'cancelled';
}
```

## API Response Interfaces

### Get Builder Card Data
```typescript
export interface GetBuilderCardDataRequest {
  builderId: string;
  includeMetrics?: boolean;
  includeSessionTypes?: boolean;
  includePathways?: boolean;
}

export interface GetBuilderCardDataResponse {
  success: boolean;
  data?: ExtendedBuilderProfile;
  error?: {
    code: string;
    message: string;
  };
  metadata?: {
    cached: boolean;
    timestamp: Date;
  };
}
```

### Update Builder Card Data
```typescript
export interface UpdateBuilderCardDataRequest {
  builderId: string;
  updates: Partial<ExtendedBuilderProfile>;
}

export interface UpdateBuilderCardDataResponse {
  success: boolean;
  data?: ExtendedBuilderProfile;
  error?: {
    code: string;
    message: string;
    field?: string;
  };
}
```

## Validation Schemas

### Builder Card Validation
```typescript
import { z } from 'zod';

export const PathwaySpecializationSchema = z.object({
  pathwayId: z.enum(['accelerate', 'pivot', 'play']),
  isActive: z.boolean(),
  metrics: z.object({
    activeClients: z.number().min(0),
    completedClients: z.number().min(0),
    successRate: z.number().min(0).max(100),
    totalSessions: z.number().min(0),
    averageRating: z.number().min(0).max(5).optional()
  }),
  specializationLevel: z.enum(['beginner', 'intermediate', 'expert']),
  certificationDate: z.date().optional(),
  displayOrder: z.number(),
  isHighlighted: z.boolean()
});

export const ExtendedBuilderProfileSchema = z.object({
  // ... existing fields ...
  pathwaySpecializations: z.array(PathwaySpecializationSchema),
  sessionTypeAvailability: SessionTypeAvailabilitySchema,
  performanceMetrics: BuilderPerformanceMetricsSchema,
  bookingInfo: BookingInfoSchema
});
```

## Type Guards

```typescript
export function isExtendedBuilderProfile(
  profile: any
): profile is ExtendedBuilderProfile {
  return (
    profile &&
    typeof profile === 'object' &&
    'pathwaySpecializations' in profile &&
    'sessionTypeAvailability' in profile &&
    'performanceMetrics' in profile
  );
}

export function hasAvailableSessions(
  availability: SessionTypeAvailability
): boolean {
  return availability.totalAvailable > 0;
}

export function canBookSession(
  builder: ExtendedBuilderProfile,
  isAuthenticated: boolean
): boolean {
  const { sessionTypeAvailability } = builder;
  
  if (!hasAvailableSessions(sessionTypeAvailability)) {
    return false;
  }
  
  // Check if there are free sessions or user is authenticated
  return (
    sessionTypeAvailability.categories.free.available ||
    (isAuthenticated && (
      sessionTypeAvailability.categories.pathway.available ||
      sessionTypeAvailability.categories.specialized.available
    ))
  );
}
```
# Session 5: Deployment Implementation

## Session Context
- Session Type: Implementation
- Component Focus: Builder Card V2 Deployment - Feature flags, monitoring, gradual rollout, and documentation
- Current Branch: feature/builder-card-redesign
- Related Documentation: 
  - /docs/marketplace/BUILDER_CARD_IMPLEMENTATION_ROADMAP.md
  - /docs/DEPLOYMENT.md
  - /docs/ENVIRONMENT_MANAGEMENT.md
- Project root directory: /Users/liamj/Documents/development/buildappswith

## Implementation Objectives
- Configure feature flag system for gradual rollout
- Set up comprehensive monitoring and analytics
- Implement rollout strategy with kill switch
- Complete documentation for all components
- Prepare production deployment checklist
- Configure alerts and dashboards

## Implementation Plan

### 1. Feature Flag Configuration
- Set up LaunchDarkly/custom feature flag service
- Create user segmentation rules
- Implement percentage-based rollout
- Add kill switch functionality
- Configure flag inheritance

### 2. Monitoring Setup
- Implement error tracking with Sentry
- Set up performance monitoring
- Create custom metrics tracking
- Configure real-time dashboards
- Add user behavior analytics

### 3. Gradual Rollout Strategy
- 5% internal team testing
- 10% beta users program
- 25% general availability
- 50% expanded rollout
- 100% full deployment

### 4. Documentation Completion
- API documentation updates
- Component usage guides
- Migration documentation
- Troubleshooting guides
- Performance best practices

### 5. Production Preparation
- Database migration scripts
- Environment variable setup
- CDN configuration
- Cache strategies
- Rollback procedures

### 6. Post-Deployment Monitoring
- Set up alerts for errors
- Monitor performance metrics
- Track user engagement
- Gather feedback channels
- Plan iteration cycles

## Technical Specifications

### Feature Flag Implementation
```typescript
// lib/feature-flags/builder-cards.ts
export const BUILDER_CARD_FLAGS = {
  USE_NEW_BUILDER_CARDS: 'use_new_builder_cards',
  BUILDER_CARD_ROLLOUT_PERCENTAGE: 'builder_card_rollout_percentage',
  BUILDER_CARD_BETA_USERS: 'builder_card_beta_users',
} as const;

export function useNewBuilderCards() {
  const { user } = useAuth();
  const flags = useFeatureFlags();
  
  // Check kill switch first
  if (flags[BUILDER_CARD_FLAGS.USE_NEW_BUILDER_CARDS] === false) {
    return false;
  }
  
  // Check beta users
  if (flags[BUILDER_CARD_FLAGS.BUILDER_CARD_BETA_USERS]?.includes(user?.id)) {
    return true;
  }
  
  // Check percentage rollout
  const rolloutPercentage = flags[BUILDER_CARD_FLAGS.BUILDER_CARD_ROLLOUT_PERCENTAGE] || 0;
  return hashUserId(user?.id) < rolloutPercentage;
}

// Feature flag wrapper component
export function BuilderCardFeatureFlag({ children }: { children: React.ReactNode }) {
  const useNewCards = useNewBuilderCards();
  
  return (
    <FeatureFlagProvider value={{ useNewCards }}>
      {children}
    </FeatureFlagProvider>
  );
}
```

### Monitoring Configuration
```typescript
// instrumentation/builder-cards.ts
import { datadogRum } from '@datadog/browser-rum';

export function initBuilderCardMonitoring() {
  // Initialize RUM
  datadogRum.init({
    applicationId: process.env.NEXT_PUBLIC_DD_APP_ID,
    clientToken: process.env.NEXT_PUBLIC_DD_CLIENT_TOKEN,
    site: 'datadoghq.com',
    service: 'buildappswith-marketplace',
    version: process.env.NEXT_PUBLIC_APP_VERSION,
    trackInteractions: true,
    trackResources: true,
    trackLongTasks: true,
  });
  
  // Custom metrics
  datadogRum.addAction('builder_card_view', {
    component: 'BuilderCardV2',
  });
}

// Error boundary with monitoring
export function BuilderCardErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={<BuilderCardError />}
      onError={(error, errorInfo) => {
        // Log to Sentry
        Sentry.captureException(error, {
          tags: {
            component: 'BuilderCardV2',
            version: 'v2',
          },
          extra: errorInfo,
        });
        
        // Log to Datadog
        datadogRum.addError(error, {
          source: 'builder-card',
          ...errorInfo,
        });
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
```

### Rollout Configuration
```typescript
// config/rollout-strategy.ts
export const ROLLOUT_STAGES = {
  INTERNAL: {
    percentage: 5,
    userGroups: ['internal', 'developers'],
    startDate: '2024-01-15',
    duration: 3, // days
  },
  BETA: {
    percentage: 10,
    userGroups: ['beta_testers'],
    startDate: '2024-01-18',
    duration: 7,
  },
  LIMITED: {
    percentage: 25,
    userGroups: ['early_adopters'],
    startDate: '2024-01-25',
    duration: 7,
  },
  EXPANDED: {
    percentage: 50,
    userGroups: ['general'],
    startDate: '2024-02-01',
    duration: 7,
  },
  FULL: {
    percentage: 100,
    userGroups: ['all'],
    startDate: '2024-02-08',
    duration: null,
  },
};

export async function updateRolloutStage(stage: keyof typeof ROLLOUT_STAGES) {
  const config = ROLLOUT_STAGES[stage];
  
  await updateFeatureFlag(
    BUILDER_CARD_FLAGS.BUILDER_CARD_ROLLOUT_PERCENTAGE,
    config.percentage
  );
  
  await trackRolloutEvent('stage_updated', {
    stage,
    percentage: config.percentage,
    startDate: config.startDate,
  });
}
```

### Analytics Implementation
```typescript
// analytics/builder-card-analytics.ts
export function trackBuilderCardEvent(
  eventName: string,
  properties: Record<string, any>
) {
  // Send to analytics service
  analytics.track(eventName, {
    ...properties,
    component: 'BuilderCardV2',
    version: 'v2',
    timestamp: new Date().toISOString(),
  });
  
  // Send to Datadog RUM
  datadogRum.addAction(eventName, properties);
}

// Usage in components
export function BuilderCardV2({ builder }: BuilderCardProps) {
  useEffect(() => {
    trackBuilderCardEvent('card_viewed', {
      builderId: builder.id,
      builderTier: builder.validationTier,
      hasPathways: builder.pathwaySpecializations.length > 0,
    });
  }, [builder.id]);
  
  const handleBookClick = () => {
    trackBuilderCardEvent('book_clicked', {
      builderId: builder.id,
      sessionType: 'free',
    });
  };
  
  // Component implementation
}
```

### Deployment Checklist
```typescript
// scripts/deployment-checklist.ts
export const DEPLOYMENT_CHECKLIST = {
  preDeployment: [
    'Run all tests (unit, integration, e2e)',
    'Verify visual regression tests',
    'Check bundle size',
    'Update documentation',
    'Review security scan',
    'Test rollback procedure',
  ],
  deployment: [
    'Update environment variables',
    'Run database migrations',
    'Clear CDN cache',
    'Update feature flags',
    'Deploy to staging',
    'Smoke test staging',
    'Deploy to production',
  ],
  postDeployment: [
    'Monitor error rates',
    'Check performance metrics',
    'Verify analytics tracking',
    'Test feature flags',
    'Update status page',
    'Notify stakeholders',
  ],
};

export async function runDeploymentChecklist(stage: keyof typeof DEPLOYMENT_CHECKLIST) {
  const tasks = DEPLOYMENT_CHECKLIST[stage];
  
  for (const task of tasks) {
    console.log(`Executing: ${task}`);
    // Implementation for each task
  }
}
```

### Documentation Updates
```typescript
// docs/marketplace/builder-card-v2.md
/**
 * # Builder Card V2 Documentation
 * 
 * ## Overview
 * The new Builder Card V2 component provides enhanced functionality...
 * 
 * ## Usage
 * ```tsx
 * import { BuilderCardV2 } from '@/components/marketplace/builder-card-v2';
 * 
 * <BuilderCardV2 
 *   builder={builderData}
 *   isAuthenticated={true}
 *   onBookSession={(id) => router.push(`/book/${id}`)}
 * />
 * ```
 * 
 * ## Props
 * - builder: ExtendedBuilderProfile
 * - isAuthenticated?: boolean
 * - onBookSession?: (builderId: string) => void
 * 
 * ## Feature Flags
 * Controlled by: USE_NEW_BUILDER_CARDS
 * 
 * ## Migration Guide
 * To migrate from v1 to v2...
 */
```

### Alert Configuration
```typescript
// monitoring/alerts.ts
export const BUILDER_CARD_ALERTS = {
  highErrorRate: {
    name: 'Builder Card High Error Rate',
    condition: 'error_rate > 1%',
    duration: '5 minutes',
    severity: 'critical',
    notification: ['engineering-team'],
  },
  slowRender: {
    name: 'Builder Card Slow Render',
    condition: 'render_time > 100ms',
    duration: '10 minutes',
    severity: 'warning',
    notification: ['frontend-team'],
  },
  lowConversion: {
    name: 'Builder Card Low Conversion',
    condition: 'click_through_rate < 5%',
    duration: '1 hour',
    severity: 'info',
    notification: ['product-team'],
  },
};

export async function configureAlerts() {
  for (const [key, alert] of Object.entries(BUILDER_CARD_ALERTS)) {
    await createMonitoringAlert(alert);
  }
}
```

## Implementation Notes
1. Rollout Safety: Always test kill switch functionality
2. Monitoring: Set up alerts before deployment
3. Documentation: Keep it updated with changes
4. Rollback Plan: Test rollback procedure
5. Communication: Keep stakeholders informed

## Expected Outputs
- Feature flag system fully configured
- Monitoring dashboards operational
- Rollout strategy documented
- Complete component documentation
- Deployment checklist verified
- Alert system configured
- Analytics tracking implemented
- Production deployment completed

There MUST BE NO WORKAROUNDS at this critical stage - if you get stuck with anything, please stop and ask for guidance.
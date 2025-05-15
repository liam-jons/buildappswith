# Session 4: Testing & Optimization Implementation

## Session Context
- Session Type: Implementation
- Component Focus: Builder Card V2 Testing & Optimization - Comprehensive testing, performance optimization, and accessibility
- Current Branch: feature/builder-card-redesign
- Related Documentation: 
  - /docs/marketplace/BUILDER_CARD_IMPLEMENTATION_ROADMAP.md
  - /docs/testing/COMPREHENSIVE_TESTING_STRATEGY.md
  - /docs/testing/ACCESSIBILITY_TESTING_GUIDELINES.md
- Project root directory: /Users/liamj/Documents/development/buildappswith

## Implementation Objectives
- Create comprehensive unit tests for all components
- Implement integration tests for data flow
- Build E2E tests for key user journeys
- Execute performance optimizations
- Complete accessibility audit and fixes
- Set up visual regression testing

## Implementation Plan

### 1. Unit Testing Suite
- Test each sub-component in isolation
- Mock external dependencies properly
- Test error states and edge cases
- Verify prop types and defaults
- Test responsive behavior

### 2. Integration Testing
- Test data flow between components
- Verify API integration
- Test feature flag behavior
- Test authentication states
- Verify booking flow integration

### 3. E2E Testing
- Test marketplace browsing flow
- Test builder card interactions
- Test booking flow from card
- Test authentication requirements
- Test mobile experience

### 4. Performance Optimization
- Implement code splitting
- Optimize bundle sizes
- Add lazy loading
- Improve render performance
- Optimize image loading

### 5. Accessibility Implementation
- Add proper ARIA labels
- Implement keyboard navigation
- Test with screen readers
- Verify color contrast
- Add focus indicators

### 6. Visual Regression Testing
- Set up Chromatic/Percy
- Create visual test scenarios
- Test responsive breakpoints
- Verify animation states
- Document visual baselines

## Technical Specifications

### Unit Test Structure
```typescript
// __tests__/components/marketplace/builder-card-v2/BuilderCardV2.test.tsx
describe('BuilderCardV2', () => {
  const mockBuilder = createMockBuilder({
    pathwaySpecializations: [
      { pathwayId: 'accelerate', isActive: true }
    ]
  });

  it('renders builder information correctly', () => {
    const { getByText, getByRole } = render(
      <BuilderCardV2 builder={mockBuilder} />
    );
    
    expect(getByText(mockBuilder.name)).toBeInTheDocument();
    expect(getByRole('img', { name: mockBuilder.name })).toBeInTheDocument();
  });

  it('displays pathway indicators', () => {
    const { container } = render(
      <BuilderCardV2 builder={mockBuilder} />
    );
    
    const pathwayBadges = container.querySelectorAll('.pathway-badge');
    expect(pathwayBadges).toHaveLength(3);
    expect(pathwayBadges[0]).toHaveClass('pathway-active');
  });

  it('shows correct CTAs based on auth state', () => {
    const { getByRole, rerender } = render(
      <BuilderCardV2 builder={mockBuilder} isAuthenticated={false} />
    );
    
    expect(getByRole('button', { name: /sign in to book/i })).toBeInTheDocument();
    
    rerender(<BuilderCardV2 builder={mockBuilder} isAuthenticated={true} />);
    expect(getByRole('button', { name: /book session/i })).toBeInTheDocument();
  });
});

describe('PathwayIndicators', () => {
  it('shows tooltips on hover', async () => {
    const { getByRole, findByText } = render(
      <PathwayIndicators specializations={mockSpecializations} />
    );
    
    const accelerateBadge = getByRole('button', { name: /accelerate/i });
    await userEvent.hover(accelerateBadge);
    
    expect(await findByText('12 active clients')).toBeInTheDocument();
  });
});
```

### Integration Tests
```typescript
// __tests__/integration/builder-card-booking-flow.test.tsx
describe('Builder Card Booking Flow', () => {
  it('navigates to booking page with correct session type', async () => {
    const { getByRole, history } = renderWithRouter(
      <BuilderCardV2 builder={mockBuilder} isAuthenticated={true} />
    );
    
    const bookButton = getByRole('button', { name: /book session/i });
    await userEvent.click(bookButton);
    
    expect(history.location.pathname).toBe(`/book/${mockBuilder.id}`);
    expect(history.location.search).toContain('session=free');
  });

  it('fetches session availability on mount', async () => {
    const fetchSpy = jest.spyOn(api, 'getSessionAvailability');
    
    render(<BuilderCardV2 builder={mockBuilder} />);
    
    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith(mockBuilder.id);
    });
  });
});
```

### E2E Tests
```typescript
// __tests__/e2e/builder-card-journey.test.ts
test('complete builder card interaction flow', async ({ page }) => {
  // Navigate to marketplace
  await page.goto('/marketplace');
  
  // Find a builder card
  const builderCard = page.locator('.builder-card-v2').first();
  await expect(builderCard).toBeVisible();
  
  // Check pathway indicators
  const pathwayBadges = builderCard.locator('.pathway-badge');
  await expect(pathwayBadges).toHaveCount(3);
  
  // Hover for metrics
  await builderCard.hover();
  const metrics = builderCard.locator('.metrics-enhanced');
  await expect(metrics).toBeVisible();
  
  // Click book session
  const bookButton = builderCard.locator('button:has-text("Book Session")');
  await bookButton.click();
  
  // Verify navigation
  await expect(page).toHaveURL(/\/book\/[\w-]+/);
});
```

### Performance Optimization
```typescript
// Lazy load heavy components
const BuilderMetricsChart = lazy(() => 
  import('./components/BuilderMetricsChart')
);

// Optimize re-renders
const BuilderCardV2 = memo(({ builder, ...props }) => {
  // Memoize expensive calculations
  const canBook = useMemo(() => 
    calculateBookingEligibility(builder, props.isAuthenticated),
    [builder.id, props.isAuthenticated]
  );
  
  // Use callback for event handlers
  const handleBook = useCallback(() => {
    router.push(`/book/${builder.id}`);
  }, [builder.id]);
  
  return (
    // Component JSX
  );
});

// Image optimization
export function BuilderImage({ src, alt, ...props }) {
  return (
    <Image
      src={src}
      alt={alt}
      placeholder="blur"
      blurDataURL={generateBase64Blur(src)}
      loading="lazy"
      {...props}
    />
  );
}
```

### Accessibility Implementation
```tsx
// components/marketplace/builder-card-v2/BuilderCardV2.tsx
export function BuilderCardV2({ builder, ...props }) {
  const headingId = `builder-${builder.id}-name`;
  
  return (
    <article
      aria-labelledby={headingId}
      className="builder-card-v2"
      tabIndex={0}
    >
      <h3 id={headingId} className="sr-only">
        {builder.name} - {builder.tagline}
      </h3>
      
      <BuilderHeader {...builder} />
      
      <div role="list" aria-label="Pathway specializations">
        {builder.pathwaySpecializations.map(spec => (
          <div
            key={spec.pathwayId}
            role="listitem"
            aria-label={`${spec.pathwayId}: ${spec.isActive ? 'Active' : 'Inactive'}`}
          >
            <PathwayBadge spec={spec} />
          </div>
        ))}
      </div>
      
      <div role="region" aria-label="Skills">
        <SkillsList skills={builder.skills} />
      </div>
      
      <div role="group" aria-label="Actions">
        <CardActions {...props} />
      </div>
    </article>
  );
}
```

### Visual Regression Tests
```typescript
// .storybook/stories/BuilderCardV2.stories.tsx
export default {
  title: 'Marketplace/BuilderCardV2',
  component: BuilderCardV2,
} as Meta;

export const Default = () => (
  <BuilderCardV2 builder={mockBuilder} />
);

export const Authenticated = () => (
  <BuilderCardV2 builder={mockBuilder} isAuthenticated={true} />
);

export const Loading = () => (
  <BuilderCardSkeleton />
);

export const Error = () => (
  <BuilderCardError error={new Error('Failed to load')} />
);

export const Mobile = () => (
  <div style={{ width: 320 }}>
    <BuilderCardV2 builder={mockBuilder} />
  </div>
);
```

### Performance Monitoring
```typescript
// hooks/usePerformanceMonitoring.ts
export function usePerformanceMonitoring(componentName: string) {
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Send to analytics
      trackMetric('component_render_time', {
        component: componentName,
        duration: renderTime,
      });
      
      // Log slow renders
      if (renderTime > 16) { // More than one frame
        logger.warn(`Slow render detected`, {
          component: componentName,
          duration: renderTime,
        });
      }
    };
  }, [componentName]);
}
```

## Implementation Notes
1. Test Coverage: Aim for >90% coverage
2. Performance Budget: Keep bundle < 50KB
3. Accessibility: Meet WCAG AA standards
4. Visual Testing: Test all states and variants
5. Browser Support: Test on all major browsers

## Expected Outputs
- Complete test suite with >90% coverage
- Performance metrics within budget
- Accessibility audit passing
- Visual regression test baselines
- Optimized bundle size
- Documentation for test scenarios
- CI/CD integration for automated testing
- Performance monitoring dashboard

There MUST BE NO WORKAROUNDS at this critical stage - if you get stuck with anything, please stop and ask for guidance.
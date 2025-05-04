# Barrel Export Usage Examples

This document provides practical examples of using barrel exports across different domains in the Buildappswith platform. These examples demonstrate best practices for importing components, hooks, and utility functions while maintaining clean and maintainable code.

## Basic Import Examples

### Importing Components

```typescript
// ✅ Good - Using barrel exports
import { Button, Card } from "@/components/ui";
import { BuilderCard, FilterPanel } from "@/components/marketplace";
import { SessionTypeSelector } from "@/components/scheduling";
import { ValidationTierBadge } from "@/components/trust";

// ❌ Bad - Direct imports without barrel exports
import { Button } from "@/components/ui/core/button";
import { BuilderCard } from "@/components/marketplace/builder-card";
import { SessionTypeSelector } from "@/components/scheduling/ui/session-type-selector";
import { ValidationTierBadge } from "@/components/trust/ui/validation-tier-badge";
```

### Importing Hooks

```typescript
// ✅ Good - Using barrel exports
import { useAuth, useIsAdmin } from "@/hooks/auth";
import { useBooking } from "@/hooks/scheduling";
import { useMarketplaceFilter } from "@/hooks/marketplace";

// ❌ Bad - Direct imports without barrel exports
import { useAuth } from "@/hooks/auth/use-auth";
import { useIsAdmin } from "@/hooks/auth/use-is-admin";
import { useBooking } from "@/hooks/scheduling/use-booking";
```

### Importing Utilities and Types

```typescript
// ✅ Good - Using barrel exports
import { createCheckoutSession } from "@/lib/payment/api";
import { BuilderProfile } from "@/lib/marketplace/types";
import { formatDateTime } from "@/lib/scheduling/utils";

// ❌ Bad - Direct imports without barrel exports
import { createCheckoutSession } from "@/lib/payment/api/checkout";
import { BuilderProfile } from "@/lib/marketplace/types/builder";
import { formatDateTime } from "@/lib/scheduling/utils/date-utils";
```

## Advanced Usage Examples

### Domain-Specific Component Example

This example shows how to use the marketplace domain components in a page:

```tsx
// app/(platform)/marketplace/page.tsx
import { Metadata } from "next";

// Import domain-specific actions
import { getMarketplaceBuilders } from "@/lib/marketplace/actions";

// Import components using barrel exports
import { BuilderGrid, FilterPanel, SortOptions } from "@/components/marketplace";
import { PageHeader } from "@/components/ui";

export const metadata: Metadata = {
  title: "Find a Builder | Buildappswith",
  description: "Discover verified builders to help with your AI implementation",
};

export default async function MarketplacePage() {
  // Server-side data fetching
  const builders = await getMarketplaceBuilders();
  
  return (
    <div className="container py-8">
      <PageHeader
        title="Find a Builder"
        description="Connect with verified builders who can help bring your AI ideas to life"
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-8">
        <div className="lg:col-span-1">
          <FilterPanel />
        </div>
        <div className="lg:col-span-3">
          <SortOptions />
          <BuilderGrid builders={builders} />
        </div>
      </div>
    </div>
  );
}
```

### Scheduling Domain Example

This example demonstrates using the scheduling domain components in a booking page:

```tsx
// app/(platform)/booking/[builderId]/page.tsx
import { notFound } from "next/navigation";

// Import domain-specific actions and types
import { getBuilderById } from "@/lib/marketplace/actions";
import { getAvailableTimeSlots } from "@/lib/scheduling/actions";
import { TimeSlot } from "@/lib/scheduling/types";

// Import components using barrel exports
import { BuilderProfile } from "@/components/marketplace";
import { BookingCalendar, SessionTypeSelector, TimeSlotPicker } from "@/components/scheduling";
import { PageHeader } from "@/components/ui";

export default async function BookingPage({ 
  params 
}: { 
  params: { builderId: string } 
}) {
  // Server-side data fetching
  const builder = await getBuilderById(params.builderId);
  
  if (!builder) {
    notFound();
  }
  
  const timeSlots = await getAvailableTimeSlots(params.builderId);
  
  return (
    <div className="container py-8">
      <PageHeader
        title={`Book a Session with ${builder.name}`}
        description="Select a session type and time that works for you"
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <div className="lg:col-span-1">
          <BuilderProfile builder={builder} compact />
          <SessionTypeSelector builderId={params.builderId} />
        </div>
        <div className="lg:col-span-2">
          <BookingCalendar builderId={params.builderId} />
          <TimeSlotPicker timeSlots={timeSlots} />
        </div>
      </div>
    </div>
  );
}
```

### Trust Domain Example

This example shows how to use trust components within a profile:

```tsx
// components/profile/builder-profile-full.tsx
import { getCurrentUser } from "@/lib/auth/actions";
import { getBuilderProfile } from "@/lib/marketplace/actions";

// Import components using barrel exports
import { ValidationTierBadge, TrustIndicators } from "@/components/trust";
import { SessionTypeList } from "@/components/scheduling";
import { Button } from "@/components/ui";

interface BuilderProfileFullProps {
  builderId: string;
}

export async function BuilderProfileFull({ builderId }: BuilderProfileFullProps) {
  const builder = await getBuilderProfile(builderId);
  const currentUser = await getCurrentUser();
  
  if (!builder) {
    return <div>Builder not found</div>;
  }
  
  return (
    <div className="rounded-lg border p-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold">{builder.name}</h2>
          <p className="text-gray-500">{builder.tagline}</p>
          
          <div className="mt-2">
            <ValidationTierBadge tier={builder.validationTier} />
          </div>
        </div>
        
        <Button href={`/booking/${builderId}`}>Book a Session</Button>
      </div>
      
      <TrustIndicators 
        completedProjects={builder.completedProjects}
        clientSatisfaction={builder.clientSatisfaction}
        responseRate={builder.responseRate}
      />
      
      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-4">Session Types</h3>
        <SessionTypeList builderId={builderId} />
      </div>
    </div>
  );
}
```

## Cross-Domain Integration Examples

This example demonstrates how multiple domains interact in a complex page:

```tsx
// app/(platform)/dashboard/page.tsx
import { redirect } from "next/navigation";

// Import domain-specific actions
import { getCurrentUser } from "@/lib/auth/actions";
import { getUserBookings } from "@/lib/scheduling/actions";
import { getRecommendedBuilders } from "@/lib/marketplace/actions";
import { getCommunityStats } from "@/lib/community/actions";
import { getTrustLevel } from "@/lib/trust/actions";

// Import components using barrel exports
import { DashboardHeader, RoleBasedContent } from "@/components/dashboard";
import { BookingList, UpcomingBookings } from "@/components/scheduling";
import { BuilderRecommendations } from "@/components/marketplace";
import { CommunityStats, RecentDiscussions } from "@/components/community";
import { ValidationTierProgress } from "@/components/trust";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/login");
  }
  
  // Fetch data from multiple domains
  const [bookings, recommendedBuilders, communityStats, trustLevel] = await Promise.all([
    getUserBookings(user.id),
    getRecommendedBuilders(user.id),
    getCommunityStats(user.id),
    getTrustLevel(user.id)
  ]);
  
  return (
    <div className="container py-8">
      <DashboardHeader user={user} />
      
      <RoleBasedContent userRoles={user.roles}>
        {/* Different dashboard layouts for different user roles */}
      </RoleBasedContent>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        <UpcomingBookings bookings={bookings} />
        <BuilderRecommendations builders={recommendedBuilders} />
        <RecentDiscussions />
      </div>
      
      <div className="mt-8">
        <ValidationTierProgress level={trustLevel} />
      </div>
    </div>
  );
}
```

## Server vs. Client Component Examples

### Server Component

```tsx
// components/profile/user-stats.tsx
import { getUserStats } from "@/lib/profile/actions";

// Import components using barrel exports
import { StatsCard } from "@/components/ui";

interface UserStatsProps {
  userId: string;
}

export async function UserStats({ userId }: UserStatsProps) {
  // Server-side data fetching
  const stats = await getUserStats(userId);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatsCard
        title="Completed Projects"
        value={stats.completedProjects}
        icon="checkCircle"
      />
      <StatsCard
        title="Client Satisfaction"
        value={`${stats.clientSatisfaction}%`}
        icon="star"
      />
      <StatsCard
        title="Response Rate"
        value={`${stats.responseRate}%`}
        icon="messageCircle"
      />
    </div>
  );
}
```

### Client Component

```tsx
// components/marketplace/ui/filter-panel.tsx
"use client"; // Client directive for components using hooks

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// Import domain-specific utilities
import { encodeFilters } from "@/lib/marketplace/utils";
import { useMarketplaceFilters } from "@/hooks/marketplace";

// Import components using barrel exports
import { Checkbox, Button, Select } from "@/components/ui";

export function FilterPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { filters, setFilters } = useMarketplaceFilters();
  
  // Client-side filter handling
  const handleFilterChange = (name: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value
    }));
  };
  
  const applyFilters = () => {
    const queryString = encodeFilters(filters);
    router.push(`/marketplace?${queryString}`);
  };
  
  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-medium mb-4">Filter Results</h3>
      
      {/* Filter UI with interactive components */}
      <div className="space-y-6">
        {/* Specialization filter */}
        <div>
          <h4 className="font-medium mb-2">Specialization</h4>
          <div className="space-y-2">
            {specializations.map((spec) => (
              <Checkbox
                key={spec.value}
                label={spec.label}
                checked={filters.specializations.includes(spec.value)}
                onChange={(checked) => {
                  const newSpecs = checked
                    ? [...filters.specializations, spec.value]
                    : filters.specializations.filter((s) => s !== spec.value);
                  handleFilterChange('specializations', newSpecs);
                }}
              />
            ))}
          </div>
        </div>
        
        {/* Other filters */}
        
        <Button onClick={applyFilters} variant="primary" className="w-full">
          Apply Filters
        </Button>
      </div>
    </div>
  );
}

const specializations = [
  { label: "ADHD Productivity", value: "adhd-productivity" },
  { label: "Data Analysis", value: "data-analysis" },
  { label: "Content Creation", value: "content-creation" },
  { label: "Workflow Automation", value: "workflow-automation" },
  { label: "Custom AI Development", value: "custom-ai" },
];
```

## Conclusion

These examples demonstrate how to effectively use barrel exports and domain-first organization across different parts of the Buildappswith platform. By following these patterns, we maintain a clean, maintainable codebase with clear separation of concerns and simplified imports.

Always remember:
- Import from barrel exports (index.ts) instead of direct component files
- Keep domain boundaries clear while enabling cross-domain integration
- Use server components by default, with client components only when necessary
- Follow the established naming conventions and folder structure
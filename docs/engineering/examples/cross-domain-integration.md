# Cross-Domain Integration Guide

This document explains how different domains interact with each other in the Buildappswith platform. It provides examples and best practices for maintaining clear domain boundaries while enabling effective integration.

## Table of Contents

1. [Domain Integration Principles](#domain-integration-principles)
2. [Common Integration Patterns](#common-integration-patterns)
3. [Domain Relationship Map](#domain-relationship-map)
4. [Integration Examples](#integration-examples)
5. [Best Practices](#best-practices)

## Domain Integration Principles

The Buildappswith platform follows these core principles for domain integration:

1. **Clear Domain Boundaries**: Each domain has clear responsibilities and owns its own data models and business logic
2. **Explicit Integration Points**: Domains interact through well-defined interfaces and actions
3. **Minimal Coupling**: Reduce unnecessary dependencies between domains
4. **Data Flow Direction**: Understand which domain should own specific data and operations
5. **Composition Over Inheritance**: Use component composition to build complex interfaces from simpler domain-specific components

## Common Integration Patterns

### Client-Side Integration

Domains often integrate at the UI level through component composition:

```tsx
// app/(platform)/profile/[id]/page.tsx
import { ProfileHeader } from "@/components/profile";
import { ValidationTierBadge } from "@/components/trust";
import { SessionTypeList } from "@/components/scheduling";
```

### Server-Side Integration

Domains integrate through server actions and data fetching:

```tsx
// lib/profile/actions.ts
import { getTrustLevel } from "@/lib/trust/actions";
import { getUserBookings } from "@/lib/scheduling/actions";

export async function getCompleteUserProfile(userId: string) {
  const [profile, trustLevel, bookings] = await Promise.all([
    getUserProfile(userId),
    getTrustLevel(userId),
    getUserBookings(userId)
  ]);
  
  return {
    ...profile,
    trustLevel,
    bookings
  };
}
```

### Shared Types and Interfaces

Domains can share types when necessary:

```tsx
// lib/shared-types.ts
export interface UserIdentifier {
  id: string;
  name: string;
  email: string;
  imageUrl?: string;
}
```

## Domain Relationship Map

This diagram illustrates the primary relationships between domains:

```
               +-------------+
               |             |
               |    AUTH     |
               |             |
               +------+------+
                      |
                      | Authentication & Authorization
                      |
+-------------+       v       +-------------+
|             |               |             |
|  MARKETPLACE+--------------->   PROFILE   |
|             |    User      |             |
+------+------+    Profiles  +------+------+
       |                            |
       | Builders                   | User Identity
       |                            |
+------v------+               +-----v-------+
|             |               |             |
|  SCHEDULING +--------------->    TRUST    |
|             |  Completed    |             |
+------+------+  Bookings     +-------------+
       |
       | Payments
       |
+------v------+               +-------------+
|             |               |             |
|   PAYMENT   |               |  COMMUNITY  |
|             |               |             |
+-------------+               +-------------+
                                    ^
                                    |
                                    | Learning Resources
                                    |
                              +-----+-------+
                              |             |
                              |  LEARNING   |
                              |             |
                              +-------------+
```

## Integration Examples

### Authentication and Profiles

The Auth domain provides user identity that's used by the Profile domain:

```tsx
// lib/profile/actions.ts
import { getCurrentUser } from "@/lib/auth/actions";

export async function getUserProfile() {
  // Get authenticated user from Auth domain
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }
  
  // Use user ID to fetch profile data
  const profile = await db.userProfile.findUnique({
    where: { userId: user.id }
  });
  
  return profile;
}
```

### Marketplace and Scheduling

The Marketplace domain provides builder information used by the Scheduling domain:

```tsx
// components/scheduling/booking-form.tsx
import { BuilderCard } from "@/components/marketplace";
import { SessionTypeSelector, BookingCalendar } from "@/components/scheduling";

interface BookingFormProps {
  builderId: string;
}

export async function BookingForm({ builderId }: BookingFormProps) {
  const builder = await getBuilderById(builderId);
  
  return (
    <div className="space-y-6">
      <BuilderCard builder={builder} compact />
      
      <SessionTypeSelector builderId={builderId} />
      
      <BookingCalendar builderId={builderId} />
    </div>
  );
}
```

### Scheduling and Payment

The Scheduling domain creates bookings that trigger the Payment domain:

```tsx
// lib/scheduling/actions.ts
import { createCheckoutSession } from "@/lib/payment/api";
import { BookingStatus } from "@/lib/scheduling/types";

export async function createBooking(data) {
  // First create the booking in pending state
  const booking = await db.booking.create({
    data: {
      ...data,
      status: BookingStatus.PENDING,
      paymentStatus: "unpaid"
    }
  });
  
  // Then create a payment checkout session
  const checkoutSession = await createCheckoutSession({
    bookingId: booking.id,
    amount: data.amount,
    currency: "usd",
    description: `Booking with ${data.builderName} - ${data.sessionTypeName}`,
    successUrl: `/booking/success?bookingId=${booking.id}`,
    cancelUrl: `/booking/cancel?bookingId=${booking.id}`
  });
  
  // Update booking with payment information
  await db.booking.update({
    where: { id: booking.id },
    data: {
      checkoutSessionId: checkoutSession.id
    }
  });
  
  return {
    booking,
    checkoutUrl: checkoutSession.url
  };
}
```

### Profiles and Trust

The Trust domain enhances profiles with trust indicators:

```tsx
// components/profile/builder-profile-full.tsx
import { ValidationTierBadge, TrustIndicators } from "@/components/trust";
import { ProfileHeader, ProfileTabs } from "@/components/profile";

interface BuilderProfileFullProps {
  builderId: string;
}

export async function BuilderProfileFull({ builderId }: BuilderProfileFullProps) {
  const builder = await getBuilderProfile(builderId);
  const trustMetrics = await getBuilderTrustMetrics(builderId);
  
  return (
    <div>
      <ProfileHeader
        name={builder.name}
        title={builder.title}
        imageUrl={builder.imageUrl}
        actions={<BookButton builderId={builderId} />}
      />
      
      <div className="mt-4 flex items-center gap-4">
        <ValidationTierBadge tier={builder.validationTier} />
        <TrustIndicators metrics={trustMetrics} />
      </div>
      
      <ProfileTabs builder={builder} />
    </div>
  );
}
```

### Community and Learning

The Learning domain provides content for the Community:

```tsx
// components/community/knowledge-base.tsx
import { Timeline } from "@/components/learning";
import { DiscussionPanel } from "@/components/community";

export async function KnowledgeBasePage() {
  const aiCapabilities = await getAICapabilities();
  const discussions = await getRelatedDiscussions();
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <Timeline capabilities={aiCapabilities} interactive />
      </div>
      <div className="lg:col-span-1">
        <DiscussionPanel discussions={discussions} />
      </div>
    </div>
  );
}
```

## Domain Integration in the Dashboard

The dashboard integrates multiple domains to create a cohesive user experience:

```tsx
// app/(platform)/dashboard/page.tsx
import { redirect } from "next/navigation";

// Auth domain provides user identity
import { getCurrentUser } from "@/lib/auth/actions";

// Import components from multiple domains
import { DashboardHeader, WelcomeMessage } from "@/components/dashboard";
import { UpcomingBookings } from "@/components/scheduling";
import { BuilderRecommendations } from "@/components/marketplace";
import { CommunityActivity } from "@/components/community";
import { ValidationTierProgress } from "@/components/trust";
import { LearningProgress } from "@/components/learning";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/login");
  }
  
  return (
    <div className="container py-8">
      <DashboardHeader user={user} />
      <WelcomeMessage name={user.name} />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="md:col-span-2">
          <UpcomingBookings userId={user.id} />
          
          {user.roles.includes("CLIENT") && (
            <BuilderRecommendations userId={user.id} />
          )}
          
          {user.roles.includes("BUILDER") && (
            <ValidationTierProgress userId={user.id} />
          )}
        </div>
        
        <div className="md:col-span-1">
          <CommunityActivity userId={user.id} />
          <LearningProgress userId={user.id} />
        </div>
      </div>
    </div>
  );
}
```

## Best Practices

### 1. Use Server Actions for Domain Integration

When domains need to interact, use server actions to bridge them:

```tsx
// lib/dashboard/actions.ts
import { getUserProfile } from "@/lib/profile/actions";
import { getUserBookings } from "@/lib/scheduling/actions";
import { getRecommendedBuilders } from "@/lib/marketplace/actions";

export async function getDashboardData(userId: string) {
  const [profile, bookings, recommendations] = await Promise.all([
    getUserProfile(userId),
    getUserBookings(userId),
    getRecommendedBuilders(userId)
  ]);
  
  return {
    profile,
    bookings,
    recommendations
  };
}
```

### 2. Maintain Clear Type Boundaries

Create explicit types for domain integration:

```tsx
// lib/scheduling/types.ts
import type { UserIdentifier } from "@/lib/shared-types";

export interface Booking {
  id: string;
  client: UserIdentifier;
  builder: UserIdentifier;
  sessionType: {
    id: string;
    name: string;
    duration: number;
  };
  startTime: string;
  endTime: string;
  status: BookingStatus;
}
```

### 3. Avoid Circular Dependencies

Structure domain relationships to avoid circular dependencies:

```
// Good: Linear dependency
Auth → Profile → Scheduling → Payment

// Bad: Circular dependency
Auth → Profile → Auth
```

### 4. Component Composition for UI Integration

Use component composition when integrating UI from multiple domains:

```tsx
// Good: Component composition
<ProfileContainer>
  <ValidationTierBadge tier={builder.validationTier} />
  <SessionTypeList builderId={builder.id} />
</ProfileContainer>

// Bad: Direct component importing between domains
// components/trust/validation-tier-badge.tsx importing from profile
```

### 5. Document Cross-Domain Relationships

Document the relationships between domains in README.md files:

```markdown
# Trust Domain

## Integration Points

- **Profile Domain**: Trust components enhance builder profiles with validation badges and trust indicators
- **Marketplace Domain**: Trust metrics influence builder search rankings
- **Scheduling Domain**: Trust level determines available session types and booking options
```

## Conclusion

Effective cross-domain integration is essential for creating a cohesive user experience while maintaining clear domain boundaries. By following the principles and patterns in this guide, you can implement clean, maintainable code with proper separation of concerns.

Always consider:
- Which domain should own specific data and operations
- How domains should communicate with each other
- How to minimize dependencies between domains
- How to compose components from multiple domains effectively
- How to document the relationships between domains
# Component Reference Guide

This document provides a comprehensive reference for the components available across all domains in the Buildappswith platform. Use this guide to understand what components are available, how to import them, and how to use them effectively.

## Table of Contents

1. [UI Components](#ui-components)
2. [Marketplace Components](#marketplace-components)
3. [Scheduling Components](#scheduling-components)
4. [Profile Components](#profile-components)
5. [Trust Components](#trust-components)
6. [Community Components](#community-components)
7. [Learning Components](#learning-components)
8. [Payment Components](#payment-components)
9. [Admin Components](#admin-components)
10. [Dashboard Components](#dashboard-components)

## UI Components

The UI domain contains shared components used throughout the platform. These components are divided into core and composite categories.

### Core UI Components

```tsx
import { Button, Card, Input, Select, Checkbox, Radio, Toggle } from "@/components/ui";
```

#### Button

A versatile button component with multiple variants and sizes.

```tsx
<Button 
  variant="default" // "default" | "outline" | "ghost" | "link"
  size="md" // "sm" | "md" | "lg"
  onClick={() => console.log("Clicked")}
>
  Click Me
</Button>
```

#### Card

A container component for grouping related content.

```tsx
<Card>
  <Card.Header>
    <Card.Title>Card Title</Card.Title>
    <Card.Description>Card description text</Card.Description>
  </Card.Header>
  <Card.Content>
    <p>Main content goes here</p>
  </Card.Content>
  <Card.Footer>
    <Button>Action Button</Button>
  </Card.Footer>
</Card>
```

### Composite UI Components

```tsx
import { PageHeader, DataTable, Tabs, Modal, Toast } from "@/components/ui";
```

#### PageHeader

A consistent page header component with title and optional description.

```tsx
<PageHeader
  title="Page Title"
  description="Detailed description of the page content and purpose"
  actions={
    <Button variant="primary">Action Button</Button>
  }
/>
```

#### DataTable

A feature-rich data table with sorting, filtering, and pagination.

```tsx
<DataTable
  columns={[
    { id: "name", header: "Name" },
    { id: "email", header: "Email" },
    { id: "role", header: "Role" }
  ]}
  data={users}
  pagination={{ pageSize: 10 }}
  sortable
  filterable
/>
```

## Marketplace Components

The marketplace domain contains components for builder discovery and profiles.

```tsx
import { BuilderCard, BuilderGrid, FilterPanel, SortOptions } from "@/components/marketplace";
```

#### BuilderCard

Displays a builder's profile in a card format.

```tsx
<BuilderCard
  builder={{
    id: "builder-1",
    name: "Jane Smith",
    title: "AI Implementation Specialist",
    imageUrl: "/images/jane-smith.jpg",
    specializations: ["ADHD Productivity", "Workflow Automation"],
    validationTier: "VERIFIED",
    hourlyRate: 150
  }}
  compact={false} // Whether to show a compact version of the card
/>
```

#### BuilderGrid

Displays a grid of builder cards with responsive layout.

```tsx
<BuilderGrid
  builders={buildersList}
  columns={{ sm: 1, md: 2, lg: 3 }}
  filter={(builder) => builder.validationTier === "VERIFIED"}
/>
```

## Scheduling Components

The scheduling domain contains components for booking sessions and managing availability.

```tsx
import { 
  BookingCalendar, 
  SessionTypeSelector, 
  TimeSlotPicker,
  BookingList
} from "@/components/scheduling";
```

#### BookingCalendar

A calendar component for selecting booking dates.

```tsx
<BookingCalendar
  builderId="builder-1"
  selectedDate={selectedDate}
  onDateChange={setSelectedDate}
  highlightAvailableDates
/>
```

#### SessionTypeSelector

A component for selecting from available session types.

```tsx
<SessionTypeSelector
  builderId="builder-1"
  onSelect={handleSessionTypeSelect}
  selectedSessionTypeId={selectedSessionType?.id}
/>
```

## Profile Components

The profile domain contains components for user profiles and settings.

```tsx
import { 
  ProfileHeader, 
  ProfileTabs, 
  AccountSettings,
  ProfileStats 
} from "@/components/profile";
```

#### ProfileHeader

Displays user profile information with customizable actions.

```tsx
<ProfileHeader
  user={{
    name: "John Doe",
    title: "Product Designer",
    imageUrl: "/images/john-doe.jpg"
  }}
  actions={
    <Button variant="primary">Edit Profile</Button>
  }
/>
```

#### ProfileTabs

A tabbed interface for organizing profile content.

```tsx
<ProfileTabs
  tabs={[
    { label: "Overview", content: <OverviewTab userId={userId} /> },
    { label: "Portfolio", content: <PortfolioTab userId={userId} /> },
    { label: "Reviews", content: <ReviewsTab userId={userId} /> }
  ]}
  defaultTab="Overview"
/>
```

## Trust Components

The trust domain contains components for displaying trust indicators and validation.

```tsx
import { 
  ValidationTierBadge, 
  TrustIndicators, 
  ValidationTierProgress 
} from "@/components/trust";
```

#### ValidationTierBadge

Displays a user's validation tier with an appropriate visual indicator.

```tsx
<ValidationTierBadge 
  tier="VERIFIED" // "BASIC" | "VERIFIED" | "EXPERT" | "MASTER"
  size="md" // "sm" | "md" | "lg"
/>
```

#### TrustIndicators

Displays a set of trust metrics for a builder.

```tsx
<TrustIndicators
  metrics={{
    completedProjects: 37,
    clientSatisfaction: 98,
    responseRate: 95,
    onTimeDelivery: 94
  }}
  compact={false} // Whether to show a compact version
/>
```

## Community Components

The community domain contains components for discussions and knowledge sharing.

```tsx
import { 
  DiscussionCard, 
  DiscussionList, 
  KnowledgeBase,
  CommentSection 
} from "@/components/community";
```

#### DiscussionCard

Displays a community discussion with metadata and preview.

```tsx
<DiscussionCard
  discussion={{
    id: "discussion-1",
    title: "Best practices for AI-assisted writing",
    author: {
      name: "Sarah Johnson",
      imageUrl: "/images/sarah-johnson.jpg"
    },
    createdAt: "2025-04-28T14:32:00Z",
    commentsCount: 12,
    preview: "I've been experimenting with different approaches to..."
  }}
  onClick={() => router.push(`/community/discussions/${discussion.id}`)}
/>
```

#### KnowledgeBase

Displays knowledge base articles with search and filtering.

```tsx
<KnowledgeBase
  categories={["Getting Started", "Implementation Guides", "Best Practices"]}
  selectedCategory={selectedCategory}
  onCategoryChange={setSelectedCategory}
  searchQuery={searchQuery}
  onSearchChange={setSearchQuery}
/>
```

## Learning Components

The learning domain contains components for educational content and tracking.

```tsx
import { 
  Timeline, 
  LearningPathCard, 
  ProgressTracker,
  CapabilityCard 
} from "@/components/learning";
```

#### Timeline

Displays an interactive timeline of AI capabilities.

```tsx
<Timeline
  capabilities={aiCapabilities}
  interactive={true}
  filter={(capability) => capability.category === selectedCategory}
  onCapabilitySelect={handleCapabilitySelect}
/>
```

#### LearningPathCard

Displays a learning path with progress information.

```tsx
<LearningPathCard
  path={{
    id: "path-1",
    title: "Getting Started with AI",
    description: "Learn the basics of AI and how to apply it",
    modules: 5,
    estimatedTime: "2 hours",
    completedModules: 2
  }}
  onClick={() => router.push(`/learning/paths/${path.id}`)}
/>
```

## Payment Components

The payment domain contains components for payment processing and history.

```tsx
import { 
  PaymentSummary, 
  PaymentHistory, 
  InvoiceDetails,
  PricingCard 
} from "@/components/payment";
```

#### PaymentSummary

Displays a summary of payment information for a booking.

```tsx
<PaymentSummary
  booking={{
    id: "booking-1",
    sessionType: {
      name: "Strategy Session",
      duration: 60,
    },
    price: 150,
    currency: "USD",
    date: "2025-05-10T15:00:00Z"
  }}
/>
```

#### PricingCard

Displays pricing information for a session type or subscription.

```tsx
<PricingCard
  title="Strategy Session"
  price={150}
  currency="USD"
  interval="session" // "session" | "hour" | "month" | "year"
  features={[
    "60-minute video call",
    "Session recording",
    "Follow-up action items",
    "Email support for 7 days"
  ]}
  ctaText="Book Now"
  onCtaClick={handleBooking}
  popular={true}
/>
```

## Admin Components

The admin domain contains components for administrative interfaces.

```tsx
import { 
  AdminCard, 
  SettingsPanel, 
  UserList,
  SystemStatus 
} from "@/components/admin";
```

#### AdminCard

A card component designed for admin interfaces with standardized styling.

```tsx
<AdminCard
  title="User Management"
  description="Manage users and their permissions"
  icon={<UserIcon />}
  stats={{ total: 423, active: 387, pending: 36 }}
  actions={
    <Button variant="primary" size="sm">View All Users</Button>
  }
/>
```

#### SettingsPanel

A configurable settings panel with categorized options.

```tsx
<SettingsPanel
  categories={[
    {
      name: "General",
      settings: [
        { id: "site-name", label: "Site Name", type: "text", value: "Buildappswith" },
        { id: "site-description", label: "Site Description", type: "textarea", value: "..." }
      ]
    },
    {
      name: "Security",
      settings: [
        { id: "require-mfa", label: "Require MFA", type: "toggle", value: true },
        { id: "session-timeout", label: "Session Timeout (minutes)", type: "number", value: 30 }
      ]
    }
  ]}
  onSave={handleSaveSettings}
/>
```

## Dashboard Components

The dashboard domain contains components specific to the dashboard interface.

```tsx
import { 
  DashboardHeader, 
  StatCard, 
  ActivityFeed,
  WelcomeMessage 
} from "@/components/dashboard";
```

#### DashboardHeader

A header component for the dashboard with user information and actions.

```tsx
<DashboardHeader
  user={{
    name: "John Doe",
    imageUrl: "/images/john-doe.jpg",
    roles: ["CLIENT"]
  }}
  notifications={3}
  actions={[
    { label: "Settings", icon: <SettingsIcon />, href: "/settings" },
    { label: "Help", icon: <HelpIcon />, href: "/help" }
  ]}
/>
```

#### StatCard

Displays a statistic with icon, title, and value.

```tsx
<StatCard
  title="Completed Sessions"
  value={12}
  icon={<CheckCircleIcon />}
  trend={{ 
    value: 33, 
    direction: "up", 
    label: "vs. last month" 
  }}
/>
```

## Component Composition Examples

### Combining Components from Multiple Domains

This example shows how to compose components from multiple domains to create a complete page:

```tsx
// app/(platform)/marketplace/[id]/page.tsx
import { notFound } from "next/navigation";

// Import domain-specific actions
import { getBuilderById } from "@/lib/marketplace/actions";
import { getBuilderSchedule } from "@/lib/scheduling/actions";
import { getBuilderTrustMetrics } from "@/lib/trust/actions";

// Import components using barrel exports
import { PageHeader } from "@/components/ui";
import { BuilderProfileFull } from "@/components/marketplace";
import { SessionTypeList, AvailabilityCalendar } from "@/components/scheduling";
import { ValidationTierBadge, TrustIndicators } from "@/components/trust";
import { ReviewList } from "@/components/community";

export default async function BuilderProfilePage({ 
  params 
}: { 
  params: { id: string } 
}) {
  // Server-side data fetching
  const builder = await getBuilderById(params.id);
  
  if (!builder) {
    notFound();
  }
  
  const [schedule, trustMetrics] = await Promise.all([
    getBuilderSchedule(params.id),
    getBuilderTrustMetrics(params.id)
  ]);
  
  return (
    <div className="container py-8">
      <PageHeader
        title={builder.name}
        description={builder.title}
        breadcrumbs={[
          { label: "Marketplace", href: "/marketplace" },
          { label: builder.name, href: `/marketplace/${params.id}` }
        ]}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <div className="lg:col-span-2">
          <BuilderProfileFull builder={builder} />
          
          <div className="mt-6">
            <h2 className="text-2xl font-bold mb-4">Sessions & Availability</h2>
            <SessionTypeList builderId={params.id} />
            <AvailabilityCalendar schedule={schedule} className="mt-6" />
          </div>
          
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Reviews</h2>
            <ReviewList builderId={params.id} />
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <div className="sticky top-8">
            <div className="border rounded-lg p-6">
              <div className="flex items-center space-x-2 mb-4">
                <ValidationTierBadge tier={builder.validationTier} />
                <span className="text-sm text-gray-500">Since {new Date(builder.verifiedAt).getFullYear()}</span>
              </div>
              
              <TrustIndicators metrics={trustMetrics} />
              
              <div className="mt-6">
                <Button variant="primary" size="lg" className="w-full">
                  Book a Session
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

## Usage Guidelines

### When to Create New Components vs. Using Existing Ones

- **Use existing components** when the UI pattern is already implemented elsewhere
- **Create domain-specific UI components** when the component has special needs for a particular domain
- **Create new shared components** when the pattern will be used across multiple domains
- **Extend existing components** through composition rather than duplication

### Accessibility Considerations

All components should follow these accessibility guidelines:

- Use semantic HTML elements
- Include proper ARIA attributes
- Support keyboard navigation
- Ensure sufficient color contrast
- Provide text alternatives for non-text content
- Support screen readers
- Respect motion preferences

Example of respecting motion preferences:

```tsx
import { motion, useReducedMotion } from "framer-motion";

export function AnimatedComponent() {
  const shouldReduceMotion = useReducedMotion();
  
  return (
    <motion.div
      animate={shouldReduceMotion ? {} : { scale: 1.1 }}
      // Other properties
    />
  );
}
```

### Performance Best Practices

- Use server components by default
- Only use client components when necessary (interactivity, hooks)
- Implement proper memoization for expensive computations
- Use code splitting with dynamic imports for heavy components
- Optimize image loading with next/image
- Implement windowing for long lists

## Conclusion

This component reference guide provides an overview of the available components across all domains in the Buildappswith platform. By following the import patterns and usage examples shown here, you can create consistent and maintainable user interfaces that align with the platform's design system.

Remember to always use barrel exports for imports, maintain clear domain boundaries, and follow the established folder structure and naming conventions when creating new components.
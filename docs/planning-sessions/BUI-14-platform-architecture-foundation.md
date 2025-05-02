# Platform Architecture Foundation - Planning Session

## 1. Executive Summary

After analyzing the technical evaluation and PRD 3.1, it's clear that the Buildappswith platform requires significant architectural refactoring to enable the critical revenue-generating path. The current codebase contains multiple competing implementations, inconsistent patterns, and fragmented user journeys that must be addressed.

This planning document outlines a comprehensive architecture foundation design that will provide the infrastructure for all subsequent components in the critical path. The design focuses on:

1. **Domain-Driven Organization**: Consolidating the codebase into a clear, domain-first structure
2. **Authentication Consolidation**: Completing the Clerk migration and removing NextAuth remnants
3. **Component Library Architecture**: Establishing a consistent pattern for component development
4. **API Standardization**: Implementing consistent API patterns across all domains
5. **Unified Navigation**: Creating a role-based navigation system with consistent user journeys

## 2. Architecture Principles

Based on PRD 3.1 requirements and the technical evaluation, we will adhere to these core principles:

1. **Domain-First Organization**: Group code by business domain rather than technical type
2. **Progressive Enhancement**: Use server components by default with client components only where necessary
3. **Minimalist Implementation**: Focus on the critical path with minimal complexity
4. **Consistent Patterns**: Apply standardized patterns across all platform areas
5. **Accessibility-First**: Ensure WCAG 2.1 AA compliance from the foundation
6. **Performance Optimization**: Implement performance best practices from the start

These principles align with the PRD's emphasis on practical application, human-centered design, and efficient implementation.

## 3. Folder Structure Design

### 3.1 Root Directory Structure

The platform will follow a domain-first organization as outlined in FOLDER_STRUCTURE_GUIDE.md, with refinements specific to our implementation:

```
/
├── app/                     # Next.js App Router pages
│   ├── (auth)/              # Authentication routes
│   ├── (marketing)/         # Marketing pages
│   ├── (platform)/          # Platform functionality
│   │   ├── dashboard/       # Role-based dashboard
│   │   ├── profile/         # Unified profile system
│   │   ├── booking/         # Booking functionality
│   │   ├── payment/         # Payment processing
│   │   └── admin/           # Admin functionality
│   └── api/                 # API routes organized by domain
├── components/              # Shared components
│   ├── [domain]/            # Domain-specific components
│   ├── ui/                  # UI components
│   └── providers/           # Context providers
├── hooks/                   # Custom React hooks
├── lib/                     # Non-React code
│   ├── [domain]/            # Domain business logic
│   ├── utils/               # Shared utilities
│   └── api/                 # API client utilities
├── public/                  # Static assets
└── styles/                  # Global styles
```

### 3.2 Platform Route Structure

The `/app/(platform)` directory will be reorganized into a clear domain-based structure:

```
/app/(platform)
├── layout.tsx               # Platform layout with role-based navigation
├── dashboard/               # Role-based dashboard
│   ├── page.tsx             # Dashboard router
│   ├── client/              # Client dashboard
│   └── builder/             # Builder dashboard
├── profile/                 # Unified profile system
│   ├── page.tsx             # Profile router
│   ├── [id]/                # Dynamic profile pages
│   ├── edit/                # Profile editing
│   └── liam-jons/           # Liam Jons featured profile
├── booking/                 # Booking functionality
│   ├── page.tsx             # Booking router
│   └── [builderId]/         # Builder-specific booking
├── payment/                 # Payment processing
│   ├── checkout/            # Checkout flow
│   ├── success/             # Payment success
│   └── cancel/              # Payment cancellation
└── admin/                   # Admin functionality
    ├── page.tsx             # Admin dashboard
    ├── builders/            # Builder management
    └── session-types/       # Session type management
```

This structure eliminates the duplicate implementations and creates a clear organization around platform domains.

### 3.3 API Directory Structure

The `/app/api` directory will follow a consistent domain-based organization:

```
/app/api
├── profile/                 # Profile management
│   ├── route.ts             # Profile retrieval and updating
│   └── [id]/                # Dynamic profile endpoints
├── booking/                 # Booking functionality
│   ├── route.ts             # Booking creation and management
│   ├── session-types/       # Session type management
│   └── availability/        # Availability management
├── payment/                 # Payment processing
│   ├── checkout/            # Checkout session creation
│   └── webhook/             # Payment webhooks
├── marketplace/             # Marketplace functionality
│   └── builders/            # Builder discovery
└── admin/                   # Admin functionality
    ├── builders/            # Builder management
    └── session-types/       # Session type management
```

Each API domain will follow the standardized patterns outlined in API_IMPLEMENTATION_GUIDE.md.

## 4. Component Library Architecture

### 4.1 Component Organization

The component library will follow a domain-first approach as outlined in COMPONENT_STYLE_GUIDE.md:

```
/components
├── profile/                 # Profile domain components
│   ├── builder-card.tsx     # Builder card component
│   ├── validation-badge.tsx # Validation tier badge
│   ├── session-types.tsx    # Session type display
│   └── index.ts             # Barrel exports
├── booking/                 # Booking domain components
│   ├── calendar.tsx         # Calendar component
│   ├── time-selector.tsx    # Time slot selector
│   ├── session-selector.tsx # Session type selector
│   └── index.ts             # Barrel exports
├── payment/                 # Payment domain components
│   ├── checkout-button.tsx  # Checkout button
│   ├── payment-summary.tsx  # Payment summary
│   └── index.ts             # Barrel exports
├── ui/                      # Shared UI components
│   ├── core/                # Core UI components (buttons, inputs, etc.)
│   ├── composite/           # Composed UI components
│   └── index.ts             # Barrel exports
└── providers/               # Context providers
    ├── auth-provider.tsx    # Authentication provider
    ├── theme-provider.tsx   # Theme provider
    └── index.ts             # Barrel exports
```

### 4.2 Component Patterns

Each component will follow these standardized patterns:

1. **Server-First Approach**: Use server components by default
2. **Progressive Enhancement**: Add client functionality only when necessary
3. **Accessibility-First**: Ensure WCAG 2.1 AA compliance
4. **Responsive Design**: Support all screen sizes from the start
5. **Performance Optimization**: Minimize client-side JavaScript

Example component structure:

```typescript
// profile/builder-card.tsx
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";
import { ValidationBadge } from "@/components/profile";

interface BuilderCardProps {
  builderId: string;
  name: string;
  title: string;
  specialization: string;
  validationTier: "starter" | "verified" | "expert";
  imageSrc?: string;
  className?: string;
}

export function BuilderCard({
  builderId,
  name,
  title,
  specialization,
  validationTier,
  imageSrc,
  className,
}: BuilderCardProps) {
  return (
    <div className={cn("rounded-lg border p-4", className)}>
      {/* Card content */}
      <ValidationBadge tier={validationTier} />
      <Button href={`/platform/profile/${builderId}`}>View Profile</Button>
    </div>
  );
}
```

### 4.3 Shared UI Components

The shared UI library will be built on Shadcn/UI components with consistent styling and behavior:

1. **Core Components**: Buttons, inputs, cards, alerts, etc.
2. **Composite Components**: Forms, modals, data displays, etc.
3. **Layout Components**: Containers, grids, sidebars, etc.

These components will form the foundation of the platform's design system.

## 5. Authentication System Consolidation

### 5.1 Clerk Migration Completion

The authentication system will be fully migrated to Clerk, with these key aspects:

1. **NextAuth Removal**: Complete removal of all NextAuth references
2. **Standardized Auth Hooks**: Unified set of authentication hooks
3. **Role-Based Access**: Consistent role checking across the platform
4. **Webhook Handler Enhancement**: Improved security and error handling

### 5.2 Authentication Logic

Authentication will be managed through a combination of:

1. **Middleware**: Route protection using Clerk middleware
2. **Context Provider**: Auth state management with React context
3. **Custom Hooks**: Simplified auth access with custom hooks

Example authentication hook:

```typescript
// hooks/use-auth.ts
import { useAuth as useClerkAuth } from "@clerk/nextjs";
import { UserRole } from "@/lib/auth/types";

export function useAuth() {
  const { userId, sessionId, isLoaded, isSignedIn, user } = useClerkAuth();
  
  const roles = user?.publicMetadata?.roles as UserRole[] || [];
  
  const hasRole = (role: UserRole) => roles.includes(role);
  const isBuilder = hasRole(UserRole.BUILDER);
  const isClient = hasRole(UserRole.CLIENT);
  const isAdmin = hasRole(UserRole.ADMIN);
  
  return {
    userId,
    sessionId,
    isLoaded,
    isSignedIn,
    user,
    roles,
    hasRole,
    isBuilder,
    isClient,
    isAdmin,
  };
}
```

### 5.3 Protected Routes

Routes will be protected using a combination of middleware and component-level checks:

1. **Route Protection**: Using Clerk middleware for server-side protection
2. **Role-Based Access**: Component-level checks for role-specific content
3. **Redirection**: Appropriate redirection for unauthorized access

## 6. API Architecture

### 6.1 API Design Patterns

The API will follow these standardized patterns:

1. **Domain-Based Organization**: Endpoints grouped by domain
2. **RESTful Design**: Consistent use of HTTP methods
3. **Standard Response Format**: Unified response structure
4. **Error Handling**: Comprehensive error classification
5. **Input Validation**: Thorough validation with Zod
6. **Authentication**: Consistent auth middleware

### 6.2 Standard Response Format

All API endpoints will use this standard response format:

```typescript
interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: {
    type: ErrorType;
    detail: string;
    fields?: Record<string, string[]>;
  };
}

enum ErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  RESOURCE_ERROR = 'RESOURCE_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  PAYMENT_ERROR = 'PAYMENT_ERROR',
}
```

### 6.3 API Implementation Pattern

Each API route will follow this standardized implementation:

```typescript
// app/api/profile/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withRole } from '@/lib/auth/api-auth';
import { UserRole } from '@/lib/auth/types';
import { getProfileById } from '@/lib/profile/service';
import { logger } from '@/lib/logger';

export const GET = withRole(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    try {
      const profile = await getProfileById(params.id);
      
      if (!profile) {
        return NextResponse.json(
          {
            success: false,
            message: 'Profile not found',
            error: {
              type: 'RESOURCE_ERROR',
              detail: `Profile with ID ${params.id} not found`,
            },
          },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        message: 'Profile retrieved successfully',
        data: profile,
      });
    } catch (error) {
      logger.error('Error retrieving profile', {
        profileId: params.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to retrieve profile',
          error: {
            type: 'INTERNAL_ERROR',
            detail: 'An unexpected error occurred',
          },
        },
        { status: 500 }
      );
    }
  },
  UserRole.CLIENT // Minimum required role
);
```

## 7. Navigation and Layout System

### 7.1 Layout Architecture

The platform will use a nested layout approach:

1. **Root Layout**: Base HTML structure with providers
2. **Platform Layout**: Common elements for platform pages
3. **Domain-Specific Layouts**: Additional structure for specific domains

```
RootLayout
└── PlatformLayout (Header, Sidebar, Footer)
    ├── DashboardLayout (Dashboard-specific elements)
    ├── ProfileLayout (Profile-specific elements)
    ├── BookingLayout (Booking-specific elements)
    └── AdminLayout (Admin-specific elements)
```

### 7.2 Role-Based Navigation

Navigation will be dynamically generated based on user roles:

1. **Common Navigation**: Elements visible to all authenticated users
2. **Role-Specific Navigation**: Items shown only to specific roles
3. **Context-Aware Links**: Dynamic links based on current context

Example navigation component:

```typescript
// components/layout/navigation.tsx
import { useAuth } from "@/hooks/use-auth";
import { UserRole } from "@/lib/auth/types";

export function Navigation() {
  const { isSignedIn, hasRole } = useAuth();
  
  if (!isSignedIn) {
    return (
      <nav>
        <a href="/login">Login</a>
        <a href="/signup">Sign Up</a>
      </nav>
    );
  }
  
  return (
    <nav>
      <a href="/platform/dashboard">Dashboard</a>
      <a href="/platform/profile">Profile</a>
      
      {hasRole(UserRole.CLIENT) && (
        <>
          <a href="/platform/booking">Book a Session</a>
          <a href="/platform/dashboard/client">My Sessions</a>
        </>
      )}
      
      {hasRole(UserRole.BUILDER) && (
        <>
          <a href="/platform/dashboard/builder">My Clients</a>
          <a href="/platform/profile/edit">Edit Profile</a>
        </>
      )}
      
      {hasRole(UserRole.ADMIN) && (
        <a href="/platform/admin">Admin</a>
      )}
    </nav>
  );
}
```

### 7.3 Dashboard Consolidation

The fragmented dashboard system will be consolidated into a single role-based dashboard:

1. **Dashboard Router**: Directs users to the appropriate dashboard based on role
2. **Role-Specific Content**: Customized content for each user role
3. **Consistent Layout**: Unified design across all dashboard variants

```typescript
// app/(platform)/dashboard/page.tsx
import { redirect } from 'next/navigation';
import { getRole } from '@/lib/auth/server';
import { UserRole } from '@/lib/auth/types';

export default async function DashboardPage() {
  const role = await getRole();
  
  // Redirect to role-specific dashboard
  if (role.includes(UserRole.BUILDER)) {
    redirect('/platform/dashboard/builder');
  }
  
  if (role.includes(UserRole.CLIENT)) {
    redirect('/platform/dashboard/client');
  }
  
  if (role.includes(UserRole.ADMIN)) {
    redirect('/platform/admin');
  }
  
  // Default dashboard for users without specific roles
  return <GenericDashboard />;
}
```

## 8. Implementation Plan

### 8.1 Phase 1: Core Infrastructure (Week 1)

1. **Folder Structure Reorganization** [BUI-19]
   - Implement domain-driven organization
   - Consolidate duplicate implementations
   - Establish barrel exports for simplified imports

2. **Authentication Consolidation** [BUI-20]
   - Complete Clerk migration
   - Remove all NextAuth references
   - Implement standardized auth hooks

3. **Component Library Foundation** [BUI-21]
   - Create core UI component library
   - Implement shared design system
   - Establish component patterns

### 8.2 Phase 2: Feature Infrastructure (Week 2)

1. **Navigation and Layout System** [BUI-22]
   - Implement role-based navigation
   - Create consistent layout structure
   - Develop dashboard router

2. **API Standardization** [BUI-23]
   - Implement API response patterns
   - Standardize error handling
   - Create domain-specific API routes

3. **Profile System Foundation** [BUI-24]
   - Consolidate profile implementations
   - Prepare for Liam Jons' profile
   - Establish profile route structure

### 8.3 Implementation Dependencies

The implementation will follow this dependency chain:

1. Folder Structure → Component Library → Navigation
2. Authentication → API Standardization → Profile System
3. Profile System → Booking System → Payment Processing

This ensures that the most fundamental components are implemented first, providing the foundation for subsequent components.

## 9. Risk Assessment

### 9.1 Technical Risks

| Risk | Probability | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| **Dashboard consolidation disrupts existing functionality** | High | Medium | Implement parallel development with feature flags, comprehensive testing |
| **Authentication migration causes issues** | Medium | High | Create detailed migration checklist, fallback authentication mechanism |
| **Component reorganization breaks references** | High | Medium | Implement automated path updates, comprehensive test coverage |
| **API standardization affects existing integrations** | Medium | Medium | Create compatibility layer, gradual migration approach |
| **Performance degradation during refactoring** | Medium | Low | Continuous performance monitoring, incremental changes |

### 9.2 Mitigation Strategies

1. **Parallel Development**
   - Implement new components alongside existing ones
   - Use feature flags for controlled rollout
   - Create comprehensive testing for both systems

2. **Incremental Migration**
   - Break changes into smaller, manageable units
   - Implement changes progressively with validation
   - Establish rollback mechanisms for failures

3. **Enhanced Testing**
   - Create specific test cases for refactored components
   - Implement integration tests for user flows
   - Verify accessibility and performance

## 10. Linear Issues

Based on this architecture design, we've created Linear issues for implementation tasks with clear acceptance criteria.

### 10.1 Parent Issue

**Issue:** Platform Architecture Foundation [BUI-14]
**Description:** Implement the core architecture foundation for the platform, establishing the infrastructure for all revenue-generating components.

### 10.2 Child Issues

1. **Issue:** Folder Structure Reorganization [BUI-19]
   **Description:** Reorganize the codebase into a domain-driven structure, eliminating duplicate implementations.
   **Acceptance Criteria:**
   - Implement domain-first folder organization
   - Consolidate duplicate implementations
   - Establish barrel exports for simplified imports
   - Create comprehensive documentation for the new structure

2. **Issue:** Authentication System Consolidation [BUI-20]
   **Description:** Complete the migration from NextAuth to Clerk, implementing standardized authentication patterns.
   **Acceptance Criteria:**
   - Remove all NextAuth references
   - Implement standardized auth hooks
   - Create role-based access control
   - Enhance webhook handling for security

3. **Issue:** Component Library Foundation [BUI-21]
   **Description:** Establish the core component library with consistent patterns and design system integration.
   **Acceptance Criteria:**
   - Create core UI component library
   - Implement shared design system
   - Establish component patterns
   - Document component usage guidelines

4. **Issue:** Navigation and Layout System [BUI-22]
   **Description:** Implement a role-based navigation system with consistent layout structure.
   **Acceptance Criteria:**
   - Create role-based navigation component
   - Implement nested layout architecture
   - Develop dashboard router
   - Ensure responsive design across all screen sizes

5. **Issue:** API Standardization [BUI-23]
   **Description:** Implement standardized API patterns across all domains.
   **Acceptance Criteria:**
   - Create API response format utilities
   - Implement comprehensive error handling
   - Standardize input validation
   - Document API design patterns

6. **Issue:** Profile System Foundation [BUI-24]
   **Description:** Consolidate profile implementations into a unified system.
   **Acceptance Criteria:**
   - Reorganize profile routes
   - Implement profile components
   - Create profile API endpoints
   - Prepare for Liam Jons' profile implementation

## 11. Conclusion and Next Steps

This architecture design provides a comprehensive foundation for the Buildappswith platform, addressing the issues identified in the technical evaluation while establishing the infrastructure needed for the revenue-generating features outlined in PRD 3.1.

### 11.1 Key Outcomes

1. Consolidated implementation with clear domain organization
2. Simplified maintenance through consistent patterns
3. Enhanced user experience with cohesive navigation
4. Standardized API with comprehensive error handling
5. Foundation for all subsequent components in the critical path

### 11.2 Next Steps

1. Review and approve architecture design
2. Prioritize Linear issues for implementation
3. Begin implementation with Folder Structure Reorganization [BUI-19]
4. Schedule regular progress reviews
5. Prepare for Liam Jons' profile implementation in the next phase

With this foundation in place, we'll be able to efficiently implement the revenue-generating features outlined in PRD 3.1, starting with Liam Jons' profile as the centerpiece of the marketplace.
# Buildappswith Folder Structure Reorganization Plan

## 1. Overview

This document outlines the comprehensive plan for reorganizing the Buildappswith platform's folder structure based on the requirements in [BUI-19: Folder Structure Reorganization](https://linear.app/buildappswith/issue/BUI-19/folder-structure-reorganization). The goal is to establish a fresh, domain-driven folder structure that supports the implementation of the revenue-generating critical path identified in PRD 3.1.

## 2. Current State Analysis

The current codebase exhibits several structural issues that impede efficient development:

- **Multiple competing implementations:** Three dashboard implementations, four profile management systems
- **Inconsistent organization patterns:** Mix of group-by-type, domain-driven, and feature-first approaches
- **Disconnected user journeys:** Separate implementations for booking, profile, and payment systems
- **Duplicate functionality:** Redundant code across similar features
- **Unclear component boundaries:** Overlapping responsibilities between components

These issues create maintenance challenges and confusion for developers working on the platform, as evidenced by the Technical Evaluation and Platform Area Analysis documents.

### 2.1 Implementation Order Context

According to the implementation-order-recommendation.md document, this folder structure reorganization (BUI-19) is part of the critical foundation phase and is the first in a sequence of initiatives:

```
Phase 1: Foundation (Weeks 1-2)
1. Folder Structure Reorganization (BUI-19)
2. Authentication System Consolidation (BUI-20)
3. Component Library Foundation (BUI-21)
4. Navigation and Layout System (BUI-22)
5. API Standardization (BUI-23)
```

This work provides the architectural foundation for subsequent revenue-generating components in the critical path:
```
Platform Architecture → Landing Page → Marketplace → Liam's Profile → Session Booking → Payment Processing → Marketing Activation
```

## 3. New Folder Structure

### 3.1 Root Directory Structure

```
/
├── app/                     # Next.js App Router pages
│   ├── (auth)/              # Auth-related pages
│   ├── (marketing)/         # Marketing pages
│   ├── (platform)/          # Platform pages
│   │   ├── dashboard/       # Role-based dashboard
│   │   ├── profile/         # Unified profile system
│   │   ├── booking/         # Booking functionality
│   │   ├── payment/         # Payment processing
│   │   ├── marketplace/     # Marketplace functionality
│   │   └── admin/           # Admin functionality
│   └── api/                 # API routes organized by domain
├── components/              # Shared components
│   ├── [domain]/            # Domain-specific components
│   │   ├── ui/              # Domain-specific UI components
│   │   └── index.ts         # Barrel exports
│   ├── ui/                  # Shared UI components
│   │   ├── core/            # Foundational UI components
│   │   ├── composite/       # Composed UI components
│   │   └── index.ts         # Barrel exports
│   └── providers/           # Context providers
├── hooks/                   # Custom React hooks
│   ├── [domain]/            # Domain-specific hooks
│   └── index.ts             # Barrel exports for global hooks
├── lib/                     # Non-React code
│   ├── [domain]/            # Domain business logic
│   │   ├── actions.ts       # Server actions
│   │   ├── api.ts           # API client functions
│   │   ├── schemas.ts       # Zod schemas
│   │   ├── types.ts         # TypeScript types
│   │   └── utils.ts         # Domain utilities
│   ├── utils/               # Shared utilities
│   └── constants/           # Global constants
├── public/                  # Static assets
├── styles/                  # Global styles
└── types/                   # Global TypeScript types
```

### 3.2 Domain Organization

For clarity and consistency, we'll organize the codebase around these core domains:

1. **auth** - Authentication and authorization (Clerk)
2. **marketplace** - Builder discovery and profiles
3. **scheduling** - Booking and availability management
4. **payment** - Payment processing (Stripe)
5. **profile** - User profile management
6. **admin** - Administration functionality
7. **trust** - Trust architecture components
8. **community** - Community and knowledge sharing
9. **learning** - Educational components

Each domain will follow the same structure pattern for consistency.

## 4. Implementation Tasks

For our implementation session, we'll focus on these four specific tasks:

### 4.1. Core Directory Structure Setup (BUI-XX)

**Objective:** Create the base folder structure following domain-first organization principles.

**Acceptance Criteria:**
- [ ] Create root directory structure as outlined in section 3.1
- [ ] Implement domain-specific directories for core domains
- [ ] Create README.md files explaining directory purposes
- [ ] Verify directory structure follows domain-first principles

**Implementation Steps:**
1. Verify existing directories before creating new ones
2. Create missing directories
3. Add README.md files to each major directory explaining its purpose
4. Document any deviations or existing structures that need to be addressed later

### 4.2. App Directory Reorganization (BUI-XX)

**Objective:** Implement new route group structure for the Next.js App Router.

**Acceptance Criteria:**
- [ ] Reorganize `/app/(platform)` into a role-based structure
- [ ] Create unified dashboard with role-specific content
- [ ] Setup booking functionality within platform group
- [ ] Move profile management to platform group
- [ ] Maintain existing auth and marketing route groups

**Implementation Steps:**
1. Verify existing directories in `/app` before creating new ones
2. Create the new structure in `/app/(platform)`
3. Create template files for key platform pages
4. Implement role-based routing in the platform layout

### 4.3. Components Directory Reorganization (BUI-XX)

**Objective:** Implement domain-first component organization with proper barrel exports.

**Acceptance Criteria:**
- [ ] Organize components by domain first, then by type
- [ ] Create UI component hierarchy (core, composite, domain-specific)
- [ ] Implement barrel exports for simplified imports
- [ ] Create template components for each domain

**Implementation Steps:**
1. Verify existing directory structure in `/components`
2. Create domain-specific component directories
3. Organize UI components into core and composite directories
4. Implement barrel exports through index.ts files
5. Create template components for each domain

### 4.4. Library Directory Reorganization (BUI-XX)

**Objective:** Reorganize non-React code into domain-specific business logic.

**Acceptance Criteria:**
- [ ] Implement domain-specific directories for business logic
- [ ] Create consistent file structure within domains
- [ ] Organize utilities and constants
- [ ] Implement proper typing and exports

**Implementation Steps:**
1. Verify existing directory structure in `/lib`
2. Create domain-specific directories
3. Implement standard files (actions.ts, api.ts, schemas.ts, types.ts, utils.ts)
4. Organize utilities and constants
5. Create barrel exports for simplified imports

## 5. Component Templates

### 5.1 Page Component Template

```typescript
// app/(platform)/[domain]/[page]/page.tsx

import { Metadata } from "next";

// Metadata export for Next.js
export const metadata: Metadata = {
  title: "Page Title | Buildappswith",
  description: "Page description for SEO",
};

// Import server-side data fetching
import { getDomainData } from "@/lib/[domain]/actions";

// Import components - using barrel exports
import { PageComponent } from "@/components/[domain]";

// Server Component by default - no "use client" directive
export default async function Page({ params }: { params: { id?: string } }) {
  // Server-side data fetching
  const data = await getDomainData(params.id);
  
  // Error handling
  if (!data) {
    // Handle the error case
    return <div>Error: Could not load data</div>;
  }
  
  // Render the page using imported components
  return <PageComponent data={data} />;
}
```

### 5.2 API Route Handler Template

```typescript
// app/api/[domain]/[endpoint]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withRole } from "@/lib/auth/clerk/api-auth";
import { UserRole } from "@/lib/auth/types";
import { logger } from "@/lib/logger";

// Input validation schema
const inputSchema = z.object({
  // Schema definition
  field1: z.string(),
  field2: z.number().optional(),
});

// Type safe with input validation
export const POST = withRole(
  async (request: NextRequest, user: AuthUser) => {
    try {
      // Parse and validate request body
      const body = await request.json();
      const result = inputSchema.safeParse(body);
      
      if (!result.success) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid input data",
            error: {
              type: "VALIDATION_ERROR",
              detail: "Validation failed",
              fields: result.error.format(),
            },
          },
          { status: 400 }
        );
      }
      
      // Business logic implementation
      // ...
      
      // Return successful response
      return NextResponse.json({
        success: true,
        message: "Operation completed successfully",
        data: {
          // Operation result
        },
      });
    } catch (error) {
      // Log error with context
      logger.error("Error processing request", {
        userId: user.id,
        error: error instanceof Error ? error.message : "Unknown error",
        path: request.nextUrl.pathname,
      });
      
      // Return error response
      return NextResponse.json(
        {
          success: false,
          message: "An error occurred",
          error: {
            type: "INTERNAL_ERROR",
            detail: "Failed to process request",
          },
        },
        { status: 500 }
      );
    }
  },
  UserRole.REQUIRED_ROLE // Specify required role
);
```

### 5.3 UI Component Template (Server)

```typescript
// components/[domain]/server-component.tsx

import { cn } from "@/lib/utils";

// Types and interfaces
interface ServerComponentProps {
  data: {
    id: string;
    title: string;
  };
  className?: string;
}

// Server Component - no "use client" directive
export function ServerComponent({ data, className }: ServerComponentProps) {
  return (
    <div className={cn("base-styles", className)}>
      <h2>{data.title}</h2>
      {/* Component content */}
    </div>
  );
}
```

### 5.4 UI Component Template (Client)

```typescript
// components/[domain]/client-component.tsx
"use client"; // Client directive for components using React hooks

// Imports organized by category
import { useState } from "react";

// Internal utilities
import { cn } from "@/lib/utils";
import { useDomainState } from "@/hooks/[domain]/use-domain-state";

// Internal components using barrel exports
import { Button } from "@/components/ui";

// Types and interfaces
interface ClientComponentProps {
  initialData: {
    id: string;
    title: string;
  };
  className?: string;
}

// Component implementation
export function ClientComponent({ initialData, className }: ClientComponentProps) {
  // State and hooks
  const [isOpen, setIsOpen] = useState(false);
  const { data, loading, error } = useDomainState(initialData.id);
  
  // Event handlers
  const handleToggle = () => {
    setIsOpen(prev => !prev);
  };
  
  // Conditional rendering for loading/error states
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  // Main render
  return (
    <div className={cn("base-styles", className)}>
      <h2>{data.title}</h2>
      <Button onClick={handleToggle}>
        {isOpen ? "Close" : "Open"}
      </Button>
      {isOpen && (
        <div className="content">
          {/* Expanded content */}
        </div>
      )}
    </div>
  );
}
```

## 6. Authentication System

The platform uses Clerk for authentication with role-based access control. The middleware integration is configuration-driven and includes:

- Authentication via Clerk
- Role-based access control for protected resources
- API route protection with rate limiting
- CSRF protection for mutation operations
- Security headers for all responses
- Error handling with structured logging
- Performance monitoring with header-based metrics

User roles in the system are:
- CLIENT: Regular users accessing the platform
- BUILDER: Professionals offering services
- ADMIN: System administrators

The authentication system is implemented in `/lib/auth` with these key components:
- `clerk-middleware.ts`: Middleware for route protection
- `api-auth.ts`: API route authentication with role checking
- `hooks.ts`: Client-side authentication hooks
- `types.ts`: TypeScript types for auth system

### 6.1 Human-AI Collaboration Model

Our implementation approach reflects the human-AI collaboration model emphasized in PRD 3.1. This approach leverages:

- **Complementary Strengths**: Human strategic guidance and domain expertise paired with AI implementation capabilities
- **Transparent Collaboration**: Clear delineation of human vs. AI responsibilities
- **Efficient Development**: Using AI-assisted development while maintaining human oversight

This collaboration model will be reflected in our folder structure, with clear organization that supports both human and AI contributions to the codebase. The folder structure will facilitate this collaboration through clear patterns and organization that both human and AI team members can easily follow.

## 7. Barrel Export Pattern

Establish consistent barrel export patterns to simplify imports:

```typescript
// components/[domain]/index.ts

// Export all components from this domain
export * from "./component-one";
export * from "./component-two";
export * from "./ui";

// components/[domain]/ui/index.ts

// Export all UI components from this domain
export * from "./special-button";
export * from "./domain-card";
```

Usage example:

```typescript
// Good - Use barrel exports
import { ComponentOne, ComponentTwo } from "@/components/domain";
import { SpecialButton } from "@/components/domain/ui";

// Avoid - Don't import directly from component files
import { ComponentOne } from "@/components/domain/component-one";
```

## 8. Naming Conventions

Enforce consistent naming across all files and directories:

### Files

- **React Components**: `kebab-case.tsx` (e.g., `builder-card.tsx`)
- **Component Export**: `PascalCase` (e.g., `export function BuilderCard() {}`)
- **Utility Functions**: `kebab-case.ts` (e.g., `date-utils.ts`)
- **Types/Interfaces**: `kebab-case.ts` (e.g., `user-types.ts` with `interface UserProfile {}`)
- **Barrel Exports**: `index.ts`
- **API Routes**: `route.ts`
- **Server Actions**: `actions.ts`
- **Constants**: `constants.ts` or `[domain]-constants.ts`

### Directories

- **Feature/Domain Directories**: `kebab-case` (e.g., `marketplace`)
- **Route Groups**: `(kebab-case)` (e.g., `(platform)`)
- **Dynamic Routes**: `[kebab-case]` (e.g., `[builderId]`)

### TypeScript

- **Component Names**: `PascalCase` (e.g., `BuilderCard`)
- **Custom Hooks**: `useKebabCase` (e.g., `useFormState`)
- **Types/Interfaces**: `PascalCase` (e.g., `UserProfile`)
- **Constants**: `UPPER_SNAKE_CASE` for unchanging values
- **Functions**: `camelCase` (e.g., `formatDate`)

## 9. Implementation Guidelines

### Safety Measures

1. **Directory Verification**:
   - Always check if a directory exists before creating it
   - Document existing directories that don't match the plan, but don't modify them yet
   - Continue with other tasks if a specific directory creation fails

2. **No Workarounds**:
   - Follow the detailed plan precisely
   - Do not implement workarounds if issues are encountered
   - Document any issues for later resolution

3. **Thorough Documentation**:
   - Document all created directories and files
   - Add README.md files explaining directory purposes
   - Note any deviations from the plan for future resolution

### File System Operation Protocol

Due to MCP limitations, certain file system operations will require direct user intervention:

1. **Required User Interventions**:
   - Explicitly document any folder/file removal that requires user action
   - Note any file renaming that requires user action
   - List any file movement that requires user action
   - Provide detailed paths for each required operation

2. **Operation Sequencing**:
   - List file system operations in sequential order
   - Wait for confirmation of manual operations before proceeding with dependent tasks
   - Clearly indicate which steps can be performed automatically and which require user action

3. **Failure Documentation**:
   - Record any MCP failures precisely without attempting workarounds
   - Document exact command that failed and the intended outcome
   - Continue with other tasks when possible

### Implementation Approach

1. **Sequential Implementation**:
   - Complete one task fully before moving to the next
   - Verify success after each major step
   - Document progress clearly

2. **Safe Execution**:
   - Use proper error handling for all operations
   - Verify state before making changes
   - Provide clear success/failure logs

## 10. Linear Issues for Implementation

The following issues will be created in Linear for the implementation:

1. **BUI-XX: Core Directory Structure Setup**
   - Create base folder structure following domain-first organization
   - Implement barrel exports for all directories
   - Setup documentation for new structure

2. **BUI-XX: App Directory Reorganization**
   - Implement new route group structure
   - Create role-based platform pages
   - Organize API routes by domain

3. **BUI-XX: Components Directory Reorganization**
   - Implement domain-first component organization
   - Create UI component hierarchy (core, composite, domain-specific)
   - Setup barrel exports for simplified imports

4. **BUI-XX: Library Directory Reorganization**
   - Implement domain-specific business logic organization
   - Create utility organization structure
   - Setup proper typing and exports

5. **BUI-XX: Legacy Code Removal Plan**
   - Document legacy code to be removed after new implementation
   - Create detailed removal strategy with verification steps
   - Set up testing approach to ensure functionality is maintained

These issues will use the Component Implementation Template (BUI-11) format with clear acceptance criteria and implementation details.

### 10.1 Implementation Timeline Context

Our implementation aligns with the timeline outlined in implementation-order-recommendation.md:

**Phase 1: Foundation (Weeks 1-2)**
1. **Folder Structure Reorganization (BUI-19)** - Current focus
2. Authentication System Consolidation (BUI-20)
3. Component Library Foundation (BUI-21)
4. Navigation and Layout System (BUI-22)
5. API Standardization (BUI-23)

For our current implementation session, we will focus only on tasks 1-4 as specified, laying the groundwork for subsequent components. The folder structure we create will specifically support the critical path:

```
Platform Architecture → Landing Page → Marketplace → Liam's Profile → Session Booking → Payment Processing → Marketing Activation
```

## 11. References

- PRD 3.1 - Section 5: Technical Implementation Strategy
- FOLDER_STRUCTURE_GUIDE.md
- COMPONENT_STYLE_GUIDE.md
- Platform Area Analysis (platform-area-analysis.md)
- Technical Evaluation Report (Comparison - Current Platform versus PRD 3.1)
- Middleware documentation
- Clerk Authentication documentation
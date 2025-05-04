# Next.js App Directory Structure

This directory contains the Next.js App Router implementation for the Buildappswith platform. The application follows a domain-driven organization with clear route groups for different areas of functionality.

## Route Group Organization

The app directory is organized into the following route groups:

/app
├── (auth)/                  # Authentication routes
│   ├── login/               # Login page
│   ├── signup/              # Signup page
│   └── ...                  # Other auth pages
├── (marketing)/             # Marketing pages
│   ├── about/               # About page
│   ├── contact/             # Contact page
│   └── ...                  # Other marketing pages
├── (platform)/              # Platform functionality
│   ├── dashboard/           # Role-based dashboard
│   ├── profile/             # User profile management
│   ├── booking/             # Booking functionality
│   ├── payment/             # Payment processing
│   ├── marketplace/         # Marketplace functionality
│   ├── admin/               # Admin functionality
│   ├── trust/               # Trust architecture
│   ├── community/           # Community functionality
│   ├── learning/            # Learning experience
│   └── ...                  # Other platform pages
└── api/                     # API routes
├── [domain]/            # Domain-specific API routes
│   └── route.ts         # Route handler
└── ...                  # Other API routes

## Route Groups

1. **`(auth)`**: Contains authentication-related pages including login, signup, and account management. These routes handle user authentication through Clerk.

2. **`(marketing)`**: Contains public-facing marketing pages such as the home page, about page, landing pages, and other content focused on user acquisition.

3. **`(platform)`**: Contains the main platform functionality for authenticated and public users. This includes the marketplace, profiles, booking system, and other core platform features.

4. **`api`**: Contains all API routes organized by domain. These routes follow a consistent pattern and authentication approach.

## Layout Structure

Each route group has its own layout that provides consistent navigation and structure:

- **`(auth)/layout.tsx`**: Minimal layout for authentication pages
- **`(marketing)/layout.tsx`**: Marketing-specific layout with appropriate navigation
- **`(platform)/layout.tsx`**: Main platform layout with role-based navigation

## Key Design Principles

1. **Public-First Access**: Marketplace and builder profiles are publicly accessible without authentication, with authentication only required at the booking/payment stage.

2. **Role-Based Access**: The dashboard and other protected pages adapt their content based on the user's role (Client, Builder, Admin).

3. **Domain Separation**: Each functional domain has its own directory structure with clear boundaries.

4. **Server-First Components**: Uses React Server Components by default for improved performance, with client components only as needed.

5. **Progressive Enhancement**: Pages are designed to function with minimal JavaScript for better performance and accessibility.

## Page Implementation Pattern

Pages follow a consistent implementation pattern:

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

API Routes Implementation Pattern
API routes follow a consistent implementation pattern with proper authentication and validation:

// app/api/[domain]/[endpoint]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withRole } from "@/lib/auth/clerk/api-auth";
import { UserRole } from "@/lib/auth/types";
import { logger } from "@/lib/logger";

// Input validation schema
const inputSchema = z.object({
  // Schema definition
});

// Type safe with input validation
export const POST = withRole(
  async (request: NextRequest, user: AuthUser) => {
    try {
      // Implementation...
      
      return NextResponse.json({
        success: true,
        message: "Operation completed successfully",
        data: { /* Result */ },
      });
    } catch (error) {
      // Error handling...
      
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

Related Documentation
For more detailed information, refer to:

API Documentation
Authentication Documentation
Component Style Guide
Folder Structure Guide


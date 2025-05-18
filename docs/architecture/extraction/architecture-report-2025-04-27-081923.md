# Buildappswith Architecture Report

*Generated on: 2025-04-27*

## Architecture Overview

### System Containers

The architecture is divided into the following containers based on PRD 2.1:

| Container | Description | Technology |
|-----------|-------------|------------|
| WebApplication | Next.js web application serving the Buildappswith platform | Next.js 15.3.1 + React 19.1.0 + TypeScript |
| Database | Stores user data, builder profiles, session information, and learning content | PostgreSQL + Prisma ORM |
| AuthenticationService | Handles user authentication and authorization | Clerk Authentication |
| PaymentService | Processes payments for sessions | Stripe API |
| BookingSystem | Manages session scheduling and availability | Custom calendar integration |

Total Components: **304**

Component Types:
- Utility: 48
- Middleware: 7
- Page Component: 55
- UI Component: 91
- Context Provider: 12
- Authentication Component: 25
- Data Model: 22
- Service: 8
- API Endpoint: 36

Technical Debt Components: **3** (1% of total)
Legacy Components: **3** (1% of total)

### Components by Container

#### WebApplication

Contains 225 components.

Representative components:

| Component | Type | Technical Debt | Legacy |
|-----------|------|----------------|--------|
| instrumentation-client | Utility |  |  |
| instrumentation | Utility |  |  |
| middleware | Middleware |  |  |
| next-env.d | Utility |  |  |
| sentry.edge.config | Utility |  |  |

*... and 220 more components*

#### Database

Contains 22 components.

Representative components:

| Component | Type | Technical Debt | Legacy |
|-----------|------|----------------|--------|
| schema | Data Model |  |  |
| User | Data Model |  |  |
| Account | Data Model |  |  |
| Session | Data Model |  |  |
| VerificationToken | Data Model |  |  |

*... and 17 more components*

#### AuthenticationService

Contains 35 components.

Representative components:

| Component | Type | Technical Debt | Legacy |
|-----------|------|----------------|--------|
| auth-utils | Authentication Component |  |  |
| architecture-utils | Authentication Component | ✓ |  |
| extract-auth-architecture | Authentication Component |  | ✓ |
| auth-error-boundary | UI Component |  |  |
| auth-provider | Context Provider |  |  |

*... and 30 more components*

#### PaymentService

Contains 11 components.

Representative components:

| Component | Type | Technical Debt | Legacy |
|-----------|------|----------------|--------|
| payment-status-indicator | Context Provider |  |  |
| payment-status-page | UI Component |  |  |
| index | Service |  |  |
| stripe-client | Service |  |  |
| stripe-server | Utility | ✓ |  |

*... and 6 more components*

#### BookingSystem

Contains 11 components.

Representative components:

| Component | Type | Technical Debt | Legacy |
|-----------|------|----------------|--------|
| booking-overview | UI Component |  |  |
| weekly-schedule | UI Component |  |  |
| booking-form | UI Component |  |  |
| builder-calendar | UI Component |  |  |
| route | API Endpoint |  |  |

*... and 6 more components*

### Technical Debt Components

| Component | Type | Container | Path |
|-----------|------|-----------|------|
| architecture-utils | Authentication Component | AuthenticationService | /Users/liamj/Documents/Development/buildappswith/scripts/architecture-utils.ts |
| builder-image | UI Component | WebApplication | /Users/liamj/Documents/Development/buildappswith/components/marketplace/builder-image.tsx |
| stripe-server | Utility | PaymentService | /Users/liamj/Documents/Development/buildappswith/lib/stripe/stripe-server.ts |

### Legacy Components

| Component | Type | Container | Path |
|-----------|------|-----------|------|
| extract-auth-architecture | Authentication Component | AuthenticationService | /Users/liamj/Documents/Development/buildappswith/scripts/extract-auth-architecture.ts |
| generate-architecture-report | Utility | WebApplication | /Users/liamj/Documents/Development/buildappswith/scripts/generate-architecture-report.ts |
| index | Authentication Component | AuthenticationService | /Users/liamj/Documents/Development/buildappswith/lib/auth/index.ts |

## Authentication Architecture

Authentication Components: **44**

### Authentication Containers

| Container | Description | Technology |
|-----------|-------------|------------|
| AuthenticationService | Handles user authentication and authorization | Clerk Authentication |
| WebApplication | Next.js web application serving the Buildappswith platform | Next.js 15.3.1 + React 19.1.0 + TypeScript |
| Database | Stores user data, builder profiles, session information, and learning content | PostgreSQL + Prisma ORM |

### Authentication Components by Container

#### AuthenticationService

| Component | Type | Description |
|-----------|------|-------------|
| auth-utils | Authentication Component | * Helper function to check authentication status on the server
 * Redirects to login if not authenticated |
| architecture-utils | Authentication Component | * Architecture Extraction Utilities for Buildappswith
 * Version: 1.0.122
 * 
 * This file contains utility functions for architecture extraction and analysis. |
| extract-auth-architecture | Authentication Component | * Authentication Architecture Extraction Script for Buildappswith
 * Version: 1.0.121
 * 
 * This script focuses specifically on extracting the authentication architecture,
 * particularly the Clerk implementation that has replaced NextAuth.
 * 
 * Important: This version uses direct TypeScript analysis without structurizr-typescript |
| nextjs | Authentication Component | * Mock implementation for @clerk/nextjs
 * Version: 1.0.112
 * 
 * This centralized mock definition provides consistent behavior across tests
 * and avoids the hoisting issues that can occur with inline vi.mock() calls.
 * 
 * Uses Vitest's MockInstance type for proper TypeScript support of method chaining. |
| auth-provider | Context Provider (Clerk) | * AuthProvider component using Clerk
 * Enhanced with error handling and theme integration
 * @version 1.0.108 |
| clerk-auth-form | UI Component (Clerk) | * Clerk authentication form component with theme support |
| loading-state | UI Component (Clerk) | * Component to handle authentication loading states
 * Prevents blank pages by showing a loading state while Clerk auth is initializing |
| login-button | UI Component (Clerk) | * LoginButton component using direct Clerk authentication
 * Handles both login and signup scenarios based on variant prop
 * @version 1.0.108 |
| user-profile | UI Component (Clerk) | * User profile component using direct Clerk authentication
 * Displays user avatar and dropdown menu with profile options
 * @version 1.0.108 |
| clerk-provider | Context Provider (Clerk) | * ClerkProvider wrapper component that supports theme switching |
| factory-test-solution | Authentication Component | * Modified Middleware Factory Test
 * Version: 1.0.84
 *
 * This version uses the improved mock implementation to avoid TypeScript errors |
| improved-integration-test | Authentication Component | * Improved Middleware Integration Test Example
 * Using Vitest's built-in MockInstance type for proper TypeScript support |
| improved-solution | Authentication Component | * Enhanced solution for Clerk authentication mocking
 * Using Vitest's built-in MockInstance type |
| nextjs-mock-solution | Authentication Component | * Improved mock implementation for @clerk/nextjs
 * Version: 1.0.84
 * 
 * This solution solves the "mockImplementationOnce is not a function" TypeScript error
 * by ensuring the mock functions are properly typed. |
| clerk-hooks | Authentication Component | * Enhanced authentication hook that provides a consistent interface
 * @returns Object containing auth state and user information
 * @version 1.0.108 |
| clerk-middleware | Authentication Component | * Public routes that don't require authentication |
| index | Authentication Component | * Buildappswith Authentication Module
 * Version: 1.0.108
 * 
 * Centralizes all authentication-related exports for the application.
 * This module has been fully migrated from NextAuth.js to Clerk. |
| factory | Authentication Component | * Middleware Factory for Buildappswith Platform
 * Version: 1.0.80
 * 
 * Creates middleware composition based on configuration
 * Allows easy addition and removal of middleware components
 * Validates configuration before creating middleware |
| rbac | Authentication Component | * Role-Based Access Control Middleware
 * Version: 1.0.78
 * 
 * Provides enhanced RBAC functionality for middleware
 * with flexible permission models and policy enforcement. |
| page | Page Component (Clerk) | * Test page for Clerk authentication
 * Tests various auth states and displays user information
 * Version: 1.0.108 |
| protected-route | UI Component (Clerk) | * Protected route component using Clerk authentication
 * Redirects to login if not authenticated |
| helpers | Authentication Component | * Extended user type with combined Clerk and database data |
| route | API Endpoint (Clerk) | * Clerk Webhook Handler
 * 
 * This API route handles webhook events from Clerk. It synchronizes user data
 * between Clerk and our database, ensuring user profiles are created and updated
 * appropriately based on authentication events.
 * 
 * Supported events:
 * - user.created: Creates a new user record in our database
 * - user.updated: Updates user information in our database
 * 
 * @version 1.0.64 |

#### WebApplication

| Component | Type | Description |
|-----------|------|-------------|
| site-header | UI Component (Clerk) | N/A |
| user-auth-form | UI Component (Clerk) | * User authentication form component migrated to use Clerk directly |
| page | Page Component (Clerk) | N/A |
| page | Page Component (Clerk) | N/A |
| page | Page Component (Clerk) | N/A |
| providers | Context Provider (Clerk) | * Combined providers wrapper for the application |
| page | Page Component (Clerk) | N/A |
| booking-overview | UI Component (Clerk) | N/A |
| session-type-editor | UI Component (Clerk) | N/A |
| page | Page Component (Clerk) | N/A |
| route | API Endpoint (Clerk) | * GET handler for fetching current user profile |
| route | API Endpoint (Clerk) | * Stripe checkout API route
 * @version 1.0.110 |
| availability-exceptions | UI Component (Clerk) | N/A |
| availability-management | UI Component (Clerk) | N/A |
| weekly-availability | UI Component (Clerk) | N/A |
| route | API Endpoint (Clerk) | N/A |
| route | API Endpoint (Clerk) | * API route for retrieving Stripe session information
 * @version 1.0.111 |

#### Database

| Component | Type | Description |
|-----------|------|-------------|
| User | Data Model | User data model with authentication fields |
| Account | Data Model | Account data model for authentication providers |
| Session | Data Model | Session data model for authentication state |
| VerificationToken | Data Model | Verification token model for email verification |

### Authentication Flows

| Flow | Description |
|------|-------------|
| Sign-In Flow | Process for authenticating existing users |
| Sign-Up Flow | Process for registering new users |
| Sign-Out Flow | Process for signing out users |
| API Authentication | Process for authenticating API requests |
| Role-Based Access Control | Process for enforcing role-based permissions |

### Clerk Authentication Migration

The authentication system has been successfully migrated from NextAuth.js to Clerk, providing improved user management capabilities, enhanced security features, and better multi-tenant support.

The migration includes:
- Updated middleware for authentication and authorization
- Webhook handlers for Clerk events
- Role-based access control using Clerk metadata
- Database synchronization for user data

## Viewing the Complete Architecture

### Mermaid Diagrams

The extraction process has generated Mermaid diagrams that can be viewed with any Mermaid renderer:

- [General Architecture Diagram](./architecture-diagram.mmd)
- [Authentication Architecture Diagram](./auth-architecture.mmd)
- [Technical Debt Diagram](./technical-debt-diagram.mmd)

### Authentication Flow Diagrams

Individual authentication flows have been visualized as separate diagrams:

- [Sign-In Flow](./auth-flow-sign-in-flow.mmd)
- [Sign-Up Flow](./auth-flow-sign-up-flow.mmd)
- [Sign-Out Flow](./auth-flow-sign-out-flow.mmd)
- [API Authentication](./auth-flow-api-authentication.mmd)
- [Role-Based Access Control](./auth-flow-role-based-access-control.mmd)

### Structurizr Visualization

To view the complete architecture model with interactive diagrams:

1. Navigate to the project root directory
2. Run `cd docs/architecture/structurizr && docker-compose up -d`
3. Open http://localhost:8080 in your browser

The architecture model includes:
- System Context diagram
- Container diagram
- Component diagrams
- Technical debt and legacy code visualization

## Alignment with PRD 2.1

This architecture extraction is based on PRD 2.1, which organizes the system into the following core containers:

1. **WebApplication**: Next.js web application serving the Buildappswith platform
2. **Database**: Stores user data, builder profiles, session information, and learning content
3. **AuthenticationService**: Handles user authentication and authorization with Clerk
4. **PaymentService**: Processes payments for sessions using Stripe
5. **BookingSystem**: Manages session scheduling and availability

The MVP focuses on establishing Liam Jons' profile as the foundation for marketplace growth and community building.

### Online Mermaid Viewing

You can also view the generated Mermaid diagrams using online tools:

1. Copy the content of any .mmd file
2. Paste it into https://mermaid.live
3. View the rendered diagram


# Authentication Architecture

## Overview

The Buildappswith platform uses Clerk for authentication and user management. This document describes the authentication architecture and components based on PRD 2.1.

## Authentication Containers

| Container | Description | Technology |
|-----------|-------------|------------|
| AuthenticationService | Handles user authentication and authorization | Clerk Authentication |
| WebApplication | Next.js web application serving the Buildappswith platform | Next.js 15.3.1 + React 19.1.0 + TypeScript |
| Database | Stores user data, builder profiles, session information, and learning content | PostgreSQL + Prisma ORM |

## Authentication Components by Container

### AuthenticationService

| Component | Type | Description |
|-----------|------|-------------|
| auth-utils | Authentication Component | * Helper function to check authentication status on the server
 * Redirects to login if not authenticated |
| architecture-utils | Authentication Component | * Architecture Extraction Utilities for Buildappswith
 * Version: 1.0.123
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

### WebApplication

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

### Database

| Component | Type | Description |
|-----------|------|-------------|
| User | Data Model | User data model with authentication fields |
| Account | Data Model | Account data model for authentication providers |
| Session | Data Model | Session data model for authentication state |
| VerificationToken | Data Model | Verification token model for email verification |

## Authentication Flows

### Sign-In Flow

Process for authenticating existing users

1. User navigates to /login
2. ClerkProvider initializes authentication state
3. Authentication form collects credentials
4. Credentials are validated by Clerk
5. Upon success, user is redirected to dashboard
6. Middleware verifies authentication on protected routes

### Sign-Up Flow

Process for registering new users

1. User navigates to /signup
2. ClerkProvider initializes registration form
3. User enters registration information
4. Clerk validates and creates user account
5. Webhook receives user.created event
6. Database record is created with clerkId
7. User is redirected to onboarding

### Sign-Out Flow

Process for signing out users

1. User triggers sign-out action
2. Clerk signOut method is called
3. Session is terminated
4. User is redirected to homepage
5. Middleware enforces authentication on subsequent requests

### API Authentication

Process for authenticating API requests

1. Client sends request to API endpoint
2. Middleware intercepts the request
3. Authentication is verified using Clerk
4. If authenticated, request proceeds to API handler
5. API handler uses Clerk currentUser to access user data
6. Response is returned to client

### Role-Based Access Control

Process for enforcing role-based permissions

1. User requests access to protected resource
2. Middleware intercepts the request
3. User roles are retrieved from Clerk publicMetadata
4. Authorization checks verify proper role access
5. Access is granted or denied based on role
6. For API routes, appropriate status codes are returned

## Component Dependencies

### site-header

### user-auth-form

### auth-utils

### architecture-utils

Used by:
- extract-auth-architecture

### extract-auth-architecture

### nextjs

### page

### page

### page

### auth-provider

### clerk-auth-form

### loading-state

### login-button

### user-profile

### clerk-provider

Used by:
- providers

### providers

### factory-test-solution

### improved-integration-test

### improved-solution

### nextjs-mock-solution

### clerk-hooks

Used by:
- index

### clerk-middleware

### index

### factory

Dependencies:
- rbac

### rbac

Used by:
- factory

### page

### page

### protected-route

### booking-overview

### session-type-editor

### helpers

### page

### route

### route

### route

### availability-exceptions

Used by:
- availability-management

### availability-management

Dependencies:
- weekly-availability

### weekly-availability

Used by:
- availability-management

### route

### route

### User

### Account

### Session

### VerificationToken

## NextAuth to Clerk Migration

The authentication system has been successfully migrated from NextAuth.js to Clerk. This migration provides several benefits:

- Enhanced security features
- Improved user management capabilities
- Better multi-tenant support
- Simplified role-based access control
- Webhook integration for authentication events

The migration involved:

1. Adding Clerk Provider to wrap application
2. Implementing Clerk middleware for route protection
3. Setting up webhook handlers for authentication events
4. Creating database synchronization for user data
5. Updating protected routes and components
6. Implementing role-based access control using Clerk metadata


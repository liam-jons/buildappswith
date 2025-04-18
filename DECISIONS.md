# Architecture and Design Decisions

This document records key architecture and design decisions for the Buildappswith platform, including their rationales.

## Database and ORM

### Decision: Use PostgreSQL with Prisma ORM
**Date**: 2025-04-19

**Context**: We needed a robust, scalable database solution for the platform. Options included various SQL and NoSQL databases, as well as different ORM/query builder approaches.

**Decision**: We chose PostgreSQL as our database with Prisma as the ORM.

**Rationale**:
- PostgreSQL offers excellent reliability, feature set, and ecosystem support
- Prisma provides type-safe database access with an excellent developer experience
- The combination supports both structured data (users, projects) and JSON for flexible schema portions
- Prisma's migration system allows for controlled schema evolution
- PostgreSQL's JSONB support gives us flexibility similar to document databases where needed

**Implementation**:
- Database schema defined in `/prisma/schema.prisma`
- Database access through central utility in `/lib/db.ts`
- Service pattern for data access logic
- Neon PostgreSQL for cloud hosting

### Decision: Environment-aware Database Configuration
**Date**: 2025-04-19

**Context**: We needed a reliable way to manage database connections across different environments (development, staging, production).

**Decision**: Implemented a hierarchical environment variable system with specialized loading scripts.

**Rationale**:
- Different environments require different connection strings
- Direct environment variable usage led to inconsistent behavior
- Developers needed a standardized approach to configuration
- Database operations like seeding require proper environment setup

**Implementation**:
- Environment loading scripts in `/scripts/` directory
- Hierarchical .env file structure with clear precedence
- Database-specific scripts that handle environment setup
- Documentation in `docs/ENVIRONMENT_MANAGEMENT.md`

## Authentication and Authorization

### Decision: Use NextAuth.js with Database Adapter
**Date**: 2025-04-18

**Context**: We needed a secure, flexible authentication system that supports multiple providers.

**Decision**: Implemented NextAuth.js with Prisma database adapter.

**Rationale**:
- NextAuth.js provides a comprehensive auth solution
- Support for multiple providers (email, GitHub, etc.)
- Prisma adapter enables persistent sessions and user management
- Role-based access control can be implemented on top
- Simplified security management with best practices built-in

**Implementation**:
- NextAuth.js configuration in `/lib/auth/auth.ts`
- User model with role-based access defined in schema
- Protected routes using middleware
- Custom pages for sign-in, sign-up, etc.

## Frontend Architecture

### Decision: Next.js with App Router
**Date**: 2025-04-10

**Context**: We needed a framework for building the frontend that supports server components, routing, and SEO.

**Decision**: Chose Next.js with the App Router pattern.

**Rationale**:
- Server components reduce client bundle size
- Built-in routing simplifies navigation
- Excellent TypeScript support
- Server-side rendering improves SEO and performance
- React Server Components reduce client-side JavaScript

**Implementation**:
- App directory structure for routes
- Mix of client and server components
- Data fetching primarily on the server
- Page-specific layouts with shared components

### Decision: Shadcn UI with Magic UI Enhancements
**Date**: 2025-04-10

**Context**: We needed a component system that is both accessible and visually appealing.

**Decision**: Used Shadcn UI components enhanced with Magic UI for improved visuals.

**Rationale**:
- Shadcn UI provides accessible, unstyled components
- Magic UI adds visual polish while maintaining accessibility
- Components can be customized for specific needs
- Consistent styling system across the platform
- Reduced development time for common UI patterns

**Implementation**:
- Shadcn UI components in `/components/ui/`
- Magic UI enhancements in `/components/magicui/`
- Custom component composition in feature-specific directories
- Consistent usage of design tokens and themes

## Data Access Pattern

### Decision: Service Layer Pattern
**Date**: 2025-04-19

**Context**: We needed a consistent approach to database access that separates concerns.

**Decision**: Implemented a service layer pattern for database access.

**Rationale**:
- Separates database access from API routes and UI components
- Enables reuse of data access logic
- Simplifies testing and mocking
- Provides a clear boundary for business logic
- Easier to maintain and extend

**Implementation**:
- Service modules in feature-specific directories (e.g., `/lib/timeline/real-data/`)
- Clear input/output interfaces
- Error handling standardization
- Consistent patterns for filtering, pagination, etc.

### Decision: Real vs. Mock Data Services
**Date**: 2025-04-19

**Context**: We needed to transition from mock data to real database integration while maintaining compatibility.

**Decision**: Created parallel implementation paths with consistent interfaces.

**Rationale**:
- Allowed for gradual migration from mock to real data
- Maintained compatibility with existing components
- Enabled testing with mock data when needed
- Simplified the transition process
- Provided fallback options if database issues occur

**Implementation**:
- Mock data services in feature-specific directories
- Real data services with matching interfaces
- Data-service.ts as the main entry point that can switch implementations
- Clear migration path for each feature

## API Design

### Decision: Route Handler Pattern with Zod Validation
**Date**: 2025-04-19

**Context**: We needed a consistent pattern for API endpoints with proper validation.

**Decision**: Implemented route handlers with Zod schema validation.

**Rationale**:
- Provides type-safe request validation
- Consistent error handling across endpoints
- Clear separation between validation and business logic
- Improved security through strict input checking
- Better developer experience with typed parameters

**Implementation**:
- Route handlers in `/app/api/` directory
- Zod schemas for request validation
- Standardized response formats
- Clear error messages for invalid requests
- Documentation of API contracts

## Deployment Strategy

### Decision: Vercel Deployment with Environment-Specific Configuration
**Date**: 2025-04-15

**Context**: We needed a reliable deployment strategy for different environments.

**Decision**: Use Vercel for deployments with environment-specific configuration.

**Rationale**:
- Vercel provides excellent Next.js support
- Preview deployments for pull requests
- Easy environment variable management
- Edge function support for improved performance
- Simplified CI/CD integration

**Implementation**:
- Vercel configuration in `vercel.json`
- Environment-specific setup in Vercel dashboard
- GitHub integration for automated deployments
- Documentation in `DEPLOYMENT.md`

## Stagehand Testing Relocation

### Decision: Move Stagehand Testing Tool to /tests Directory
**Date**: 2025-04-17

**Context**: The Stagehand testing tool was nested in a `/buildappswith` subdirectory, causing confusion and potential conflicts.

**Decision**: Relocated Stagehand testing infrastructure to `/tests/stagehand-tests`.

**Rationale**:
- Improves project organization with a dedicated testing directory
- Follows standard conventions for test location
- Reduces confusion with similarly named directories
- Simplifies documentation and references
- Prepares for additional testing approaches

**Implementation**:
- Created `/tests` directory for all testing infrastructure
- Moved Stagehand tests to `/tests/stagehand-tests`
- Updated documentation and references
- Preserved test functionality and configuration

## Database Seeding Approach

### Decision: Create Specialized Database Seeding Script
**Date**: 2025-04-19

**Context**: Standard Prisma seeding had environment variable issues when running in different contexts.

**Decision**: Created a specialized script (`scripts/seed-with-env.js`) for database seeding.

**Rationale**:
- Ensures proper environment variable loading
- Provides better error reporting and debugging
- Simplifies the seeding process for developers
- Enables consistent behavior across environments
- Reduces troubleshooting time for common issues

**Implementation**:
- Created `/scripts/seed-with-env.js` with explicit environment handling
- Updated package.json scripts to use the new approach
- Added detailed documentation in `DATABASE_SETUP.md`
- Implemented proper error handling and reporting

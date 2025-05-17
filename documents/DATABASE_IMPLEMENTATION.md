# Database Implementation Guide

This document outlines the database implementation for the Buildappswith platform, including setup instructions, schema details, and API endpoint information.

## Overview

The Buildappswith platform uses [Prisma ORM](https://www.prisma.io/) with a PostgreSQL database (hosted on Neon) for data persistence. This implementation replaces the previous in-memory and mock data approaches with a robust, scalable database solution.

## Getting Started

### Prerequisites

- Node.js 16+
- PostgreSQL database connection (we use Neon PostgreSQL)
- Environment variables set up properly

### Setup Steps

1. Install dependencies:
   ```bash
   npm install
   # or
   pnpm install
   ```

2. Set up your environment variables:
   ```
   DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require
   ```

3. Generate Prisma client:
   ```bash
   npm run prisma:generate
   # or
   pnpm prisma:generate
   ```

4. Run migrations:
   ```bash
   npm run prisma:migrate:dev
   # or
   pnpm prisma:migrate:dev
   ```

5. Seed the database:
   ```bash
   npm run db:seed
   # or
   pnpm db:seed
   ```

## Database Schema

The database schema is defined in `/prisma/schema.prisma` and includes the following main models:

### User Models
- `User`: Core user entity with authentication details
- `Account`: OAuth accounts for NextAuth.js
- `Session`: User sessions for authentication
- `VerificationToken`: Email verification tokens

### Profile Models
- `BuilderProfile`: Extended profile for builders with validation details
- `ClientProfile`: Extended profile for clients with project preferences

### Skills Models
- `Skill`: Defined skills in the platform's skill tree
- `BuilderSkill`: Association between builders and their skills
- `SkillResource`: Learning resources for specific skills

### Marketplace Models
- `Project`: Client projects with requirements and milestones
- `ProjectMilestone`: Project milestones and deliverables
- `Booking`: Session bookings between clients and builders

### Timeline Models
- `AICapability`: Entries for the "What AI Can/Can't Do" timeline
- `CapabilityExample`: Examples of AI capability implementations
- `CapabilityLimitation`: Limitations of specific AI capabilities
- `CapabilityRequirement`: Technical requirements for AI capabilities

## API Implementation

The database is accessed through API endpoints located in `/app/api/` following Next.js App Router conventions:

### Timeline Endpoints
- `GET /api/timeline/capabilities`: Fetch AI capabilities with filtering and pagination
- `GET /api/timeline/domains`: Get all available domains for filtering
- `GET /api/timeline/range`: Get the full timeline date range

### Authentication
Authentication is handled by NextAuth.js with the Prisma adapter for database persistence.

## Data Services

The database is accessed through service layers:

- `/lib/timeline/real-data/timeline-service.ts`: Service for timeline-related data access
- `/lib/db.ts`: Central database connection utility

## Error Handling

All database operations include proper error handling:

1. Try/catch blocks for all database operations
2. Specific error messages for different failure scenarios
3. HTTP status codes for API responses
4. Client-side error handling with retry mechanisms

## Future Improvements

The following improvements are planned for the database implementation:

1. Add remaining API endpoints for Marketplace components
2. Implement API endpoints for Booking/Scheduling components
3. Add database migrations for schema updates
4. Implement proper database indexing for performance
5. Add caching layer for frequently accessed data
6. Implement more sophisticated error handling and logging

## Troubleshooting

### Common Issues

- **Database Connection Errors**: Check your DATABASE_URL environment variable
- **Migration Errors**: Run `prisma:migrate:reset` to reset the database
- **Seeding Errors**: Check that mock data is properly formatted

### Resources

- [Prisma Documentation](https://www.prisma.io/docs/)
- [NextAuth.js with Prisma](https://authjs.dev/reference/adapter/prisma)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
# Admin Domain

This directory contains the business logic for the administrative functions of the Buildappswith platform.

## Purpose

The admin domain handles system-wide administrative functions, including:

- User management
- Builder verification and approval
- Session type management
- System settings and configuration
- Administrative dashboards

## Directory Structure

```
/admin
├── actions.ts       # Server-side administrative actions
├── api.ts           # Client-side API functions for admin operations
├── schemas.ts       # Zod validation schemas for admin data
├── types.ts         # TypeScript type definitions for admin entities
├── utils.ts         # Utility functions specific to administration
└── index.ts         # Barrel exports for simplified imports
```

## Integration Points

The admin domain integrates with:

- **Auth Domain**: For user management and permissions
- **Profile Domain**: For managing builder profiles
- **Scheduling Domain**: For managing session types
- **Marketplace Domain**: For marketplace configuration

## Usage

Import admin domain utilities and types:

```typescript
import { verifyBuilder, updateSystemSettings } from "@/lib/admin";
import type { BuilderVerificationParams, SystemSettings } from "@/lib/admin/types";
```

## Server Actions

The `actions.ts` file contains server-side functions for administrative operations:

- `verifyBuilder`: Verify and approve a builder
- `manageSessionTypes`: Create, update, or delete session types
- `updateSystemSettings`: Modify system-wide settings
- `manageUserRoles`: Assign or remove user roles

## API Functions

The `api.ts` file contains client-side functions for interacting with admin APIs:

- `fetchAdminDashboard`: Get administrative dashboard data
- `getSystemSettings`: Retrieve current system settings
- `getVerificationQueue`: Retrieve pending builder verifications
- `updateBuilderStatus`: Update a builder's verification status

## Validation

The `schemas.ts` file contains Zod validation schemas for admin data:

- `builderVerificationSchema`: Validates builder verification parameters
- `sessionTypeSchema`: Validates session type creation/updates
- `systemSettingsSchema`: Validates system settings updates
- `userRoleSchema`: Validates user role assignments

## Types

The `types.ts` file defines TypeScript types for admin entities:

- `BuilderVerificationParams`: Parameters for verifying a builder
- `VerificationStatus`: Enum for verification statuses
- `SystemSettings`: System-wide settings configuration
- `AdminDashboardData`: Structure for admin dashboard data

## Utilities

The `utils.ts` file contains utility functions for administrative tasks:

- `formatVerificationData`: Format builder verification data for display
- `calculateApprovalMetrics`: Calculate approval metrics for reporting
- `validateSessionTypeConfig`: Perform advanced validation on session types
- `generateAdminReport`: Generate administrative reports
